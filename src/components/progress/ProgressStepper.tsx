import { EXPLORER_BASE } from '../../config'
import type { Step } from '../../utils/steps'

interface Props {
  steps: Step[]
}

export default function ProgressStepper({ steps }: Props) {
  return (
    <div className="glass-panel-strong p-10 rounded-[2rem] border border-outline-variant/10 space-y-12 relative overflow-hidden">
      {/* Subtle Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />

      <div className="relative space-y-10">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1
          const isCompleted = step.status === 'completed'
          const isActive = step.status === 'active'
          const isPending = step.status === 'pending'

          return (
            <div key={i} className={`flex gap-6 relative ${isPending ? 'opacity-40' : ''}`}>
              {/* Connecting Line */}
              {!isLast && (
                <div
                  className={`absolute left-[15px] top-[40px] bottom-[-40px] w-[2px] ${
                    isCompleted ? 'bg-primary' : 'border-l-2 border-dashed border-outline-variant/40'
                  }`}
                />
              )}

              {/* Step Icon */}
              {isCompleted ? (
                <div className="relative z-10 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'wght' 600" }}>check</span>
                </div>
              ) : isActive ? (
                <div className="relative z-10 w-8 h-8 rounded-full bg-surface-container-highest border-2 border-primary step-active-glow flex items-center justify-center text-primary flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
              ) : (
                <div className="relative z-10 w-8 h-8 rounded-full bg-surface-container-highest border-2 border-outline-variant/30 flex items-center justify-center text-on-surface-variant flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]">hourglass_empty</span>
                </div>
              )}

              {/* Step Content */}
              <div className="space-y-1 min-w-0">
                <h3 className={`font-headline font-bold text-xl ${isActive ? 'text-primary' : 'text-on-surface'}`}>
                  {step.title}
                </h3>
                <p className="font-body text-sm text-on-surface-variant">{step.description}</p>

                {step.meta && (
                  <span className="inline-block font-label text-[10px] bg-surface-container-highest px-2 py-0.5 rounded text-primary mt-2">
                    {step.meta}
                  </span>
                )}

                {step.txHash && (
                  <div className="mt-4 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/10">
                    <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">Transaction</p>
                    <div className="flex items-center justify-between">
                      <span className="font-label text-sm text-primary-fixed-dim truncate mr-4">{step.txHash}</span>
                      <a
                        href={`${EXPLORER_BASE}${step.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 text-primary hover:text-primary-fixed-dim transition-colors"
                      >
                        <span className="material-symbols-outlined">open_in_new</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
