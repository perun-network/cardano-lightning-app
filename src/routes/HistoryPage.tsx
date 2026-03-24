import { useEffect, useState } from 'react'
import { getSwapHistory, getOfframpHistory, getMetrics } from '../services/api'
import type { HistoryItem, MetricsResponse } from '../types'
import TransactionTable from '../components/history/TransactionTable'
import StatsCards from '../components/history/StatsCards'

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
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
        setError(e instanceof Error ? e.message : 'Failed to load history')
      }
    }
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
      </div>

      {error && (
        <div className="mb-4 bg-error/10 text-error p-4 rounded-2xl font-label text-sm relative z-10">{error}</div>
      )}

      <div className="relative z-10">
        <TransactionTable items={items} />
      </div>
      <StatsCards metrics={metrics} />
    </main>
  )
}
