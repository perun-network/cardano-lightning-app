import type { SwapStatusResponse } from '../../types'

interface Props {
  swapStatus: SwapStatusResponse
  cardanoAddress: string
}

export default function TransactionSummary({ swapStatus, cardanoAddress }: Props) {
  return (
    <div className="glass-panel rounded-[2.5rem] p-8 space-y-8 border border-outline-variant/10">
      <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tighter">
        Transaction <span className="text-gradient-primary">Summary</span>
      </h1>
      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-outline-variant/10 pb-6">
          <div>
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-2">Invoice ID</p>
            <p className="text-3xl font-headline font-bold text-on-surface">#{swapStatus.invoice_id}</p>
          </div>
          <div className="text-right">
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-2">Status</p>
            <p className={`text-2xl font-headline font-bold ${
              swapStatus.status === 'Completed' ? 'text-primary' :
              swapStatus.status === 'Failed' || swapStatus.status === 'Expired' ? 'text-error' :
              'text-secondary'
            }`}>
              {swapStatus.status}
            </p>
          </div>
        </div>
        {cardanoAddress && (
          <div className="pt-4">
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-3">Destination Cardano Address</p>
            <div className="bg-surface-container-lowest p-5 rounded-2xl flex items-center justify-between group cursor-pointer hover:ring-1 ring-primary/30 transition-all"
              onClick={() => navigator.clipboard.writeText(cardanoAddress)}
            >
              <p className="font-label text-sm truncate pr-4 text-on-surface/80">{cardanoAddress}</p>
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">content_copy</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
