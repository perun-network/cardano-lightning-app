import { formatCbtc } from '../../utils/format'

interface Props {
  status: string
  type: 'swap' | 'offramp'
  amountBase?: number | null
}

export default function AmountSummary({ status, type, amountBase }: Props) {
  const isTerminal = ['completed', 'failed', 'expired'].includes(status.toLowerCase())
  const progress = isTerminal
    ? 100
    : status.toLowerCase() === 'fulfilling' || status.toLowerCase() === 'paying_lightning'
    ? 75
    : status.toLowerCase() === 'pending_verification'
    ? 50
    : 25

  return (
    <div className="p-8 rounded-xl bg-surface-container-low border border-outline-variant/10">
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-1">Direction</p>
          <h2 className="font-headline text-2xl font-bold">
            {type === 'swap' ? (
              <>BTC <span className="text-secondary text-lg">→ cBTC</span></>
            ) : (
              <>cBTC <span className="text-primary text-lg">→ BTC</span></>
            )}
          </h2>
          {amountBase != null && (
            <p className="font-label text-sm text-on-surface-variant mt-1">
              {formatCbtc(amountBase)} <span className="text-[10px] uppercase tracking-widest">cBTC</span>
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-1">Status</p>
          <h2 className={`font-headline text-2xl font-bold ${
            status.toLowerCase() === 'completed' ? 'text-primary' :
            status.toLowerCase() === 'failed' || status.toLowerCase() === 'expired' ? 'text-error' :
            'text-secondary'
          }`}>
            {status}
          </h2>
        </div>
      </div>
      <div className="h-[2px] w-full bg-surface-container-highest relative overflow-hidden rounded-full">
        <div
          className="absolute inset-0 progress-line-gradient transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
