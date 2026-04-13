import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getSwapStatus } from '../services/api'
import { usePolling } from '../hooks/usePolling'
import { POLL_INTERVAL_MS } from '../config'
import type { SwapStatusResponse } from '../types'
import TransactionSummary from '../components/invoice/TransactionSummary'
import LightningQR from '../components/invoice/LightningQR'
import HowItWorks from '../components/invoice/HowItWorks'

export default function InvoicePage() {
  const { paymentHash } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [swapStatus, setSwapStatus] = useState<SwapStatusResponse | null>(null)
  const [error, setError] = useState('')

  // Resolve bolt11, amount, and cardanoAddress from location.state or sessionStorage
  const { bolt11, amountLabel, cardanoAddress } = useMemo(() => {
    const empty = { bolt11: '', amountLabel: '', cardanoAddress: '' }

    // Type guard for location.state
    const state = location.state as Record<string, unknown> | null
    if (state && typeof state.bolt11 === 'string' && state.bolt11) {
      return {
        bolt11: state.bolt11,
        amountLabel: typeof state.amount === 'string' ? state.amount : '',
        cardanoAddress: typeof state.cardanoAddress === 'string' ? state.cardanoAddress : '',
      }
    }

    // Fallback: read from sessionStorage with validation
    if (paymentHash) {
      try {
        const raw = sessionStorage.getItem(`invoice:${paymentHash}`)
        if (raw) {
          const stored = JSON.parse(raw)
          if (stored && typeof stored === 'object' && typeof stored.bolt11 === 'string') {
            return {
              bolt11: stored.bolt11,
              amountLabel: typeof stored.amount === 'string' ? stored.amount : '',
              cardanoAddress: typeof stored.cardanoAddress === 'string' ? stored.cardanoAddress : '',
            }
          }
        }
      } catch { /* corrupted sessionStorage — fall through */ }
    }
    return empty
  }, [location.state, paymentHash])

  // Initial fetch
  useEffect(() => {
    if (!paymentHash) return
    getSwapStatus(paymentHash)
      .then(setSwapStatus)
      .catch((e) => setError(e.message))
  }, [paymentHash])

  // Poll for status updates
  usePolling(
    async () => {
      if (!paymentHash) return true
      try {
        const status = await getSwapStatus(paymentHash)
        setSwapStatus(status)
        const s = status.status.toLowerCase()
        if (s === 'fulfilling' || s === 'completed') {
          navigate(`/progress/swap/${paymentHash}`, { replace: true })
          return true
        }
        if (s === 'failed' || s === 'expired') return true
      } catch {
        // retry
      }
      return false
    },
    POLL_INTERVAL_MS,
    !!paymentHash,
  )

  if (error) {
    return (
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <div className="bg-error/10 text-error p-6 rounded-2xl font-label">{error}</div>
      </main>
    )
  }

  return (
    <main className="flex-grow pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto w-full relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Status Indicator */}
          {(() => {
            const s = swapStatus?.status?.toLowerCase()
            const isFailed = s === 'failed' || s === 'expired'
            return (
              <div className={`flex items-center gap-4 backdrop-blur-md p-4 rounded-2xl border border-outline-variant/10 ${
                isFailed ? 'bg-error/10' : 'bg-surface-container-low/50'
              }`}>
                <div className={`w-3 h-3 rounded-full ${isFailed ? 'bg-error' : 'bg-primary status-pulse'}`} />
                <p className={`font-label text-sm uppercase tracking-widest font-bold ${
                  isFailed ? 'text-error' : 'text-primary'
                }`}>
                  {isFailed ? `Invoice ${swapStatus?.status}` : 'Waiting for payment...'}
                </p>
              </div>
            )
          })()}

          {swapStatus && (
            <TransactionSummary
              swapStatus={swapStatus}
              cardanoAddress={cardanoAddress}
            />
          )}

          <HowItWorks />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 lg:sticky lg:top-32">
          {bolt11 ? (
            <LightningQR
              bolt11={bolt11}
              amount={amountLabel}
            />
          ) : (
            <div className="bg-surface-container-low rounded-[2.5rem] p-10 flex flex-col items-center justify-center min-h-[400px] gap-4">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">link_off</span>
              <p className="font-label text-on-surface-variant text-sm text-center">
                Invoice data is not available.<br />
                This can happen when opening a link in a new tab.
              </p>
              {swapStatus && (
                <p className="font-label text-xs text-on-surface-variant">
                  Current status: <span className="text-primary font-bold">{swapStatus.status}</span>
                </p>
              )}
              <button
                onClick={() => navigate('/')}
                className="mt-2 font-label text-sm text-primary hover:text-white transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Bridge
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
