import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { HistoryItem, SwapDirection } from '../../types'
import { formatCbtc } from '../../utils/format'

interface Props {
  items: HistoryItem[]
}

type StatusFilter = 'all' | 'completed' | 'pending' | 'failed'

export default function TransactionTable({ items }: Props) {
  const navigate = useNavigate()
  const [directionFilter, setDirectionFilter] = useState<SwapDirection | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filtered = items.filter((item) => {
    if (directionFilter !== 'all' && item.direction !== directionFilter) return false
    if (statusFilter === 'all') return true
    const s = item.status.toLowerCase()
    if (statusFilter === 'completed') return s === 'completed'
    if (statusFilter === 'failed') return s === 'failed' || s === 'expired'
    // pending = everything else
    return s !== 'completed' && s !== 'failed' && s !== 'expired'
  })

  return (
    <div className="glass-panel rounded-[2rem] overflow-hidden shadow-2xl border border-outline-variant/10">
      {/* Filters */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 px-8 pt-6">
          {/* Direction filter */}
          {(['all', 'onramp', 'offramp'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDirectionFilter(d)}
              aria-label={`Filter by direction: ${d}`}
              aria-pressed={directionFilter === d}
              className={`font-label text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${
                directionFilter === d
                  ? 'bg-primary/20 text-primary font-bold'
                  : 'bg-surface-container-high/30 text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {d === 'all' ? 'All' : d === 'onramp' ? 'BTC → cBTC' : 'cBTC → BTC'}
            </button>
          ))}
          <div className="w-px bg-outline-variant/20 mx-1" />
          {/* Status filter */}
          {(['all', 'completed', 'pending', 'failed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              aria-label={`Filter by status: ${s}`}
              aria-pressed={statusFilter === s}
              className={`font-label text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === s
                  ? 'bg-primary/20 text-primary font-bold'
                  : 'bg-surface-container-high/30 text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high/30 border-b border-outline-variant/10">
              <th className="px-8 py-6 font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Direction</th>
              <th className="px-8 py-6 font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Amount</th>
              <th className="px-8 py-6 font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Status</th>
              <th className="px-8 py-6 font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {filtered.map((item) => (
              <tr key={item.id} className="group hover:bg-surface-container-high/40 transition-all duration-300">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant/20">
                        <span className="material-symbols-outlined text-sm text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant/20">
                        <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>circle</span>
                      </div>
                    </div>
                    <span className="font-headline font-bold text-on-surface">
                      {item.direction === 'onramp' ? 'BTC → cBTC' : 'cBTC → BTC'}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  {item.amount_cbtc != null ? (
                    <>
                      <span className="font-headline font-bold text-lg">{formatCbtc(item.amount_cbtc)}</span>
                      <span className="font-label text-[10px] text-on-surface-variant ml-2">cBTC</span>
                    </>
                  ) : (
                    <span className="font-label text-sm text-on-surface-variant">&mdash;</span>
                  )}
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      item.status.toLowerCase() === 'completed' ? 'bg-primary shadow-[0_0_8px_rgba(123,208,255,0.4)]' :
                      item.status.toLowerCase() === 'failed' || item.status.toLowerCase() === 'expired' ? 'bg-error shadow-[0_0_8px_rgba(255,180,171,0.4)]' :
                      'bg-secondary'
                    }`} />
                    <span className={`font-label text-sm font-bold ${
                      item.status.toLowerCase() === 'completed' ? 'text-primary' :
                      item.status.toLowerCase() === 'failed' || item.status.toLowerCase() === 'expired' ? 'text-error' :
                      'text-secondary'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <button
                    onClick={() => {
                      if (item.direction === 'onramp') {
                        navigate(`/progress/swap/${item.payment_hash}`)
                      } else {
                        navigate(`/progress/offramp/${item.id}`)
                      }
                    }}
                    className="font-label text-[11px] uppercase tracking-widest text-primary hover:text-white flex items-center gap-1 ml-auto group-hover:translate-x-[-4px] transition-all"
                  >
                    View <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-on-surface-variant font-label">
                  {items.length === 0 ? 'No transactions yet' : 'No matching transactions'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
