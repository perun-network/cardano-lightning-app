import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBridgeStore } from '../../stores/bridgeStore'
import { requestSwap, requestOfframp } from '../../services/api'
import { cbtcToBase } from '../../utils/format'
import SwapInput from './SwapInput'

export default function SwapCard() {
  const navigate = useNavigate()
  const {
    direction, toggleDirection,
    amount, setAmount,
    cardanoAddress, setCardanoAddress,
    bolt11Invoice, setBolt11Invoice,
    poolInfo,
  } = useBridgeStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isOnramp = direction === 'onramp'

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      if (isOnramp) {
        const parsed = parseFloat(amount)
        if (!parsed || parsed <= 0) {
          setError('Enter a valid amount')
          return
        }
        const addr = cardanoAddress.trim()
        if (!addr) {
          setError('Enter a Cardano address')
          return
        }
        if (!addr.startsWith('addr1') && !addr.startsWith('addr_test1')) {
          setError('Invalid Cardano address (must start with addr1 or addr_test1)')
          return
        }
        // Convert human-readable cBTC to base units for the API
        const amountBase = cbtcToBase(parsed)
        if (poolInfo && amountBase > poolInfo.available) {
          setError(`Amount exceeds available liquidity (${(poolInfo.available / 1_000_000).toFixed(6)} cBTC)`)
          return
        }
        const resp = await requestSwap(amountBase, cardanoAddress.trim())
        sessionStorage.setItem(`invoice:${resp.payment_hash}`, JSON.stringify({
          bolt11: resp.bolt11, amount, cardanoAddress: cardanoAddress.trim(),
        }))
        navigate(`/invoice/${resp.payment_hash}`, {
          state: { bolt11: resp.bolt11, amount, cardanoAddress: cardanoAddress.trim() },
        })
      } else {
        const parsed = parseFloat(amount)
        if (!parsed || parsed <= 0) {
          setError('Enter a valid amount')
          return
        }
        const invoice = bolt11Invoice.trim().toLowerCase()
        if (!invoice) {
          setError('Enter a BOLT11 invoice')
          return
        }
        if (!invoice.startsWith('lnbc') && !invoice.startsWith('lntb') && !invoice.startsWith('lntbs')) {
          setError('Invalid BOLT11 invoice (must start with lnbc, lntb, or lntbs)')
          return
        }
        const addr = cardanoAddress.trim()
        if (!addr) {
          setError('Enter a Cardano address')
          return
        }
        if (!addr.startsWith('addr1') && !addr.startsWith('addr_test1')) {
          setError('Invalid Cardano address (must start with addr1 or addr_test1)')
          return
        }
        const amountBase = cbtcToBase(parsed)
        const resp = await requestOfframp(bolt11Invoice.trim(), amountBase, cardanoAddress.trim())
        sessionStorage.setItem(`offramp:${resp.offramp_id}`, JSON.stringify({
          operatorAddress: resp.operator_address,
        }))
        navigate(`/offramp-deposit/${resp.offramp_id}`, {
          state: { operatorAddress: resp.operator_address },
        })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      className="glass-panel p-6 rounded-[2rem] shadow-2xl relative"
      onSubmit={(e) => { e.preventDefault(); handleSubmit() }}
    >
      {/* Top Input */}
      {isOnramp ? (
        <SwapInput
          label="From Lightning"
          value={amount}
          token="BTC"
          tokenIcon="bolt"
          tokenIconFill
          placeholder="0.00"
          inputType="number"
          onChange={setAmount}
        />
      ) : (
        <SwapInput
          label="From Cardano"
          value={amount}
          token="cBTC"
          tokenIcon="circle"
          placeholder="0.00"
          inputType="number"
          onChange={setAmount}
        />
      )}

      {/* Swap Connector */}
      <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <button
          type="button"
          onClick={toggleDirection}
          aria-label="Toggle swap direction"
          className="bg-surface-container-high p-3 rounded-xl shadow-xl border border-outline-variant/10 hover:scale-110 transition-transform cursor-pointer"
        >
          <span className="material-symbols-outlined text-primary block">swap_vert</span>
        </button>
      </div>

      {/* Bottom Input */}
      <div className="mt-4">
        {isOnramp ? (
          <SwapInput
            label="To Cardano — Destination Address"
            value={cardanoAddress}
            placeholder="addr1..."
            inputType="text"
            onChange={setCardanoAddress}
          />
        ) : (
          <>
            <SwapInput
              label="To Lightning — BOLT11 Invoice"
              value={bolt11Invoice}
              placeholder="lnbc..."
              inputType="text"
              onChange={setBolt11Invoice}
            />
            <div className="mt-2">
              <SwapInput
                label="Cardano Refund Address"
                value={cardanoAddress}
                placeholder="addr1..."
                inputType="text"
                onChange={setCardanoAddress}
              />
            </div>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 px-4 py-3 rounded-xl bg-error/10 text-error font-label text-sm">
          {error}
        </div>
      )}

      {/* Action Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-8 bg-gradient-to-r from-primary-container to-primary text-on-primary py-5 rounded-2xl font-headline font-extrabold text-lg shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
      >
        {loading ? 'Processing...' : isOnramp ? 'Initiate Swap' : 'Request Offramp'}
      </button>
    </form>
  )
}
