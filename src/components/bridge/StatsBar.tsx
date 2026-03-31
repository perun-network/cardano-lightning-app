import { useBridgeStore } from '../../stores/bridgeStore'
import { formatCbtc } from '../../utils/format'

export default function StatsBar() {
  const { poolInfo, poolError } = useBridgeStore()

  if (poolError) {
    return (
      <div className="mt-8 bg-surface-container-low/40 p-5 rounded-3xl border border-outline-variant/5 text-center">
        <div className="text-on-surface-variant font-label text-xs">Pool: offline</div>
      </div>
    )
  }

  if (!poolInfo) return null

  return (
    <div className="mt-8 grid grid-cols-2 gap-4">
      <div className="bg-surface-container-low/40 p-5 rounded-3xl border border-outline-variant/5">
        <div className="text-on-surface-variant font-label text-[10px] uppercase tracking-tighter mb-1">Available Liquidity</div>
        <div className="font-headline font-bold text-primary flex items-center gap-2">
          {formatCbtc(poolInfo.available)} <span className="text-xs font-label text-on-surface-variant">cBTC</span>
        </div>
      </div>
      <div className="bg-surface-container-low/40 p-5 rounded-3xl border border-outline-variant/5">
        <div className="text-on-surface-variant font-label text-[10px] uppercase tracking-tighter mb-1">Active Invoices</div>
        <div className="font-headline font-bold text-secondary flex items-center gap-2">
          {poolInfo.active_invoices} <span className="material-symbols-outlined text-sm">schedule</span>
        </div>
      </div>
    </div>
  )
}
