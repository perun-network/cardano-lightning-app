import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { submitOfframpDeposit } from '../services/api'

export default function OfframpDepositPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const operatorAddress = (() => {
    const state = location.state as { operatorAddress?: string } | null
    if (state?.operatorAddress) return state.operatorAddress
    // Fallback: read from sessionStorage (survives page refresh)
    if (id) {
      try {
        const stored = JSON.parse(sessionStorage.getItem(`offramp:${id}`) || '{}')
        return stored.operatorAddress || ''
      } catch { /* ignore */ }
    }
    return ''
  })()

  const [txHash, setTxHash] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    if (!txHash.trim() || !id) return
    const offrampId = parseInt(id)
    if (Number.isNaN(offrampId)) {
      setError('Invalid offramp ID')
      return
    }
    setError('')
    setLoading(true)
    try {
      await submitOfframpDeposit(offrampId, txHash.trim())
      navigate(`/progress/offramp/${id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Deposit notification failed')
    } finally {
      setLoading(false)
    }
  }

  const [addressCopied, setAddressCopied] = useState(false)

  const copyAddress = async () => {
    if (!operatorAddress) return
    try {
      await navigator.clipboard.writeText(operatorAddress)
      setAddressCopied(true)
      setTimeout(() => setAddressCopied(false), 2000)
    } catch {
      // clipboard not available
    }
  }

  return (
    <main className="pt-32 pb-24 px-4 flex flex-col items-center relative overflow-hidden">
      <div className="w-full max-w-[560px] z-10">
        {/* Heading */}
        <div className="mb-10 text-center md:text-left">
          <span className="font-label text-primary text-sm tracking-[0.2em] uppercase">Offramp — Step 2</span>
          <h1 className="font-headline text-5xl font-extrabold tracking-tighter mb-2 mt-2">
            Send <span className="text-gradient-primary">cBTC</span>
          </h1>
          <p className="text-on-surface-variant font-body text-sm max-w-sm">
            Transfer cBTC to the operator address below, then confirm with the transaction hash.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-[2rem] shadow-2xl space-y-8">
          {/* Operator Address */}
          <div>
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-3">
              Send cBTC to this address
            </p>
            <div
              className="bg-surface-container-lowest p-5 rounded-2xl flex items-center justify-between group cursor-pointer hover:ring-1 ring-primary/30 transition-all"
              onClick={copyAddress}
            >
              <p className="font-label text-sm truncate pr-4 text-on-surface/80">
                {operatorAddress || 'Address unavailable — open this page from the Bridge flow'}
              </p>
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">
                {addressCopied ? 'check' : 'content_copy'}
              </span>
            </div>
          </div>

          {/* TX Hash Input */}
          <div>
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-3">
              Confirm your cBTC transaction hash
            </p>
            <input
              className="w-full bg-surface-container-lowest p-5 rounded-2xl border-none focus:ring-1 ring-outline-variant/20 font-label text-sm text-on-surface placeholder:text-surface-variant focus:outline-none"
              placeholder="Cardano TX hash..."
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-error/10 text-error font-label text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={loading || !txHash.trim() || !operatorAddress}
            className="w-full bg-gradient-to-r from-primary-container to-primary text-on-primary py-5 rounded-2xl font-headline font-extrabold text-lg shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
          >
            {loading ? 'Confirming...' : 'Confirm Deposit'}
          </button>

          {!operatorAddress && (
            <button
              onClick={() => navigate('/')}
              className="w-full mt-4 font-label text-sm text-primary hover:text-white transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Bridge
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
