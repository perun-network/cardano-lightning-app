const steps = [
  { num: '01', text: 'Assets are locked on the Cardano network via secure smart contracts.' },
  { num: '02', text: 'The Luminous Ledger verifies the cross-chain state in real-time.' },
  { num: '03', text: 'Bitcoin is instantly released to your Lightning invoice.' },
]

export default function HowItWorks() {
  return (
    <div className="bg-surface-container-low/40 p-8 rounded-[2rem] border border-outline-variant/10">
      <h3 className="text-xl font-headline font-extrabold mb-6 tracking-tight">How the Bridge Works</h3>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step) => (
          <div key={step.num} className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-label text-primary font-bold">
              {step.num}
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">{step.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
