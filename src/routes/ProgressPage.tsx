import { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { getSwapStatus, getOfframpStatus } from '../services/api'
import { usePolling } from '../hooks/usePolling'
import { POLL_INTERVAL_MS } from '../config'
import type { SwapStatusResponse, OfframpStatusResponse } from '../types'
import { buildSwapSteps, buildOfframpSteps } from '../utils/steps'
import ProgressStepper from '../components/progress/ProgressStepper'
import AmountSummary from '../components/progress/AmountSummary'

export default function ProgressPage() {
  const { type, id } = useParams<{ type: string; id: string }>()
  const isSwap = type === 'swap'

  const [swapStatus, setSwapStatus] = useState<SwapStatusResponse | null>(null)
  const [offrampStatus, setOfframpStatus] = useState<OfframpStatusResponse | null>(null)
  const [error, setError] = useState('')

  const offrampId = id && !isSwap ? parseInt(id) : NaN

  const pollFn = useCallback(async () => {
    if (!id) return true
    try {
      if (isSwap) {
        const s = await getSwapStatus(id)
        setSwapStatus(s)
        const st = s.status.toLowerCase()
        return st === 'completed' || st === 'failed' || st === 'expired'
      } else {
        if (Number.isNaN(offrampId)) {
          setError('Invalid offramp ID')
          return true
        }
        const s = await getOfframpStatus(offrampId)
        setOfframpStatus(s)
        const st = s.status.toLowerCase()
        return st === 'completed' || st === 'failed'
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch status')
      return false
    }
  }, [id, isSwap, offrampId])

  // Fetch immediately on mount, then continue polling
  usePolling(pollFn, POLL_INTERVAL_MS, !!id, true)

  const currentStatus = isSwap ? swapStatus?.status : offrampStatus?.status
  const steps = swapStatus ? buildSwapSteps(swapStatus) : offrampStatus ? buildOfframpSteps(offrampStatus) : []

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <span className="font-label text-primary text-sm tracking-[0.2em] uppercase">
              Status: {currentStatus || 'Loading...'}
            </span>
            <h1 className="font-headline text-5xl font-extrabold tracking-tighter leading-tight text-on-background">
              {isSwap ? (
                <>Bridging your <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Satoshi to Cardano</span></>
              ) : (
                <>Offramping <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">cBTC to Lightning</span></>
              )}
            </h1>
            <p className="text-on-surface-variant text-lg max-w-md">
              {currentStatus?.toLowerCase() === 'completed'
                ? 'Transaction complete!'
                : 'Please do not close this window until the process is complete.'}
            </p>
          </div>

          {currentStatus && (
            <AmountSummary status={currentStatus} type={isSwap ? 'swap' : 'offramp'} />
          )}
        </div>

        {/* Right Side */}
        <div className="lg:col-span-7">
          {error && (
            <div className="mb-4 bg-error/10 text-error p-4 rounded-2xl font-label text-sm">{error}</div>
          )}

          {steps.length > 0 && <ProgressStepper steps={steps} />}

          <div className="mt-8 flex justify-center">
            <button className="font-label text-sm text-on-surface-variant hover:text-primary transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">contact_support</span>
              Need help with this transaction?
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
