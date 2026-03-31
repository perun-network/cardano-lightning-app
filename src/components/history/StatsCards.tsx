import type { MetricsResponse } from '../../types'

interface Props {
  metrics: MetricsResponse | null
}

export default function StatsCards({ metrics }: Props) {
  if (!metrics) return null

  const totalCompleted = metrics.onramp.completed + metrics.offramp.completed
  const totalAll = metrics.onramp.total + metrics.offramp.total
  const successRate = totalAll > 0 ? ((totalCompleted / totalAll) * 100).toFixed(1) : '0'

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
      <div className="bg-surface-container-low/40 backdrop-blur-md p-6 rounded-3xl border border-outline-variant/5 hover:border-outline-variant/20 transition-all group">
        <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">Total Swaps</span>
        <div className="flex items-baseline gap-2">
          <span className="font-headline text-3xl font-extrabold text-on-surface group-hover:text-primary transition-colors">{totalAll}</span>
          <span className="font-label text-xs text-on-surface-variant font-bold uppercase tracking-tighter">Transactions</span>
        </div>
      </div>
      <div className="bg-surface-container-low/40 backdrop-blur-md p-6 rounded-3xl border border-outline-variant/5 hover:border-outline-variant/20 transition-all group">
        <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">Success Rate</span>
        <div className="flex items-baseline gap-2">
          <span className="font-headline text-3xl font-extrabold text-on-surface group-hover:text-primary transition-colors">{successRate}%</span>
          <span className="font-label text-xs text-primary font-bold uppercase tracking-tighter">Overall</span>
        </div>
      </div>
      <div className="bg-surface-container-low/40 backdrop-blur-md p-6 rounded-3xl border border-outline-variant/5 hover:border-outline-variant/20 transition-all group">
        <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">Pending</span>
        <div className="flex items-baseline gap-2">
          <span className="font-headline text-3xl font-extrabold text-on-surface group-hover:text-primary transition-colors">
            {metrics.onramp.pending + metrics.offramp.pending}
          </span>
          <span className="font-label text-xs text-secondary font-bold uppercase tracking-tighter">In Flight</span>
        </div>
      </div>
    </div>
  )
}
