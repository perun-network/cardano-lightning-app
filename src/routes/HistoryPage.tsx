import { useEffect, useState } from 'react'
import { getSwapHistory, getOfframpHistory, getMetrics } from '../services/api'
import type { HistoryItem, MetricsResponse } from '../types'
import TransactionTable from '../components/history/TransactionTable'
import StatsCards from '../components/history/StatsCards'

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setError('')
    setLoading(true)
    try {
      const [swaps, offramps, m] = await Promise.all([
        getSwapHistory().catch(() => []),
        getOfframpHistory().catch(() => []),
        getMetrics().catch(() => null),
      ])

      const combined: HistoryItem[] = [
        ...swaps.map((s) => ({
          id: s.payment_hash,
          direction: 'onramp' as const,
          amount_cbtc: null, // swap history API doesn't include amount
          status: s.status,
          payment_hash: s.payment_hash,
          cardano_tx_hash: s.cardano_tx_hash,
        })),
        ...offramps.map((o) => ({
          id: String(o.offramp_id),
          direction: 'offramp' as const,
          amount_cbtc: o.amount_cbtc,
          status: o.status,
          payment_hash: o.payment_hash,
          cardano_tx_hash: o.deposit_tx_hash,
        })),
      ]

      setItems(combined)
      setMetrics(m)
    } catch (e) {
      const { toUserError } = await import('../utils/errorMessages')
      setError(toUserError(e instanceof Error ? e.message : 'Failed to load history'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <main className="pt-32 pb-32 px-4 md:px-12 max-w-7xl mx-auto min-h-screen relative">
      {/* Header Section */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tighter mb-4">
            Transaction<br />
            <span className="text-gradient-primary">History</span>
          </h1>
          <p className="text-on-surface-variant font-body max-w-md opacity-80 text-sm">
            Track your cross-chain asset migrations across the Lightning Network and Cardano ledger.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 font-label text-sm text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>refresh</span>
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-error/10 text-error p-4 rounded-2xl font-label text-sm relative z-10">{error}</div>
      )}

      <div className="relative z-10">
        {loading && items.length === 0 ? (
          <div className="glass-panel rounded-[2rem] p-12 flex flex-col items-center justify-center gap-4 border border-outline-variant/10">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant animate-spin">progress_activity</span>
            <p className="font-label text-sm text-on-surface-variant">Loading transactions...</p>
          </div>
        ) : (
          <TransactionTable items={items} />
        )}
      </div>
      <StatsCards metrics={metrics} />
    </main>
  )
}
