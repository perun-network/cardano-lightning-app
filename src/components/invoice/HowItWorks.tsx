const steps = [
  { num: '01', text: 'Pay the Lightning invoice to send BTC to the bridge operator.' },
  { num: '02', text: 'The bridge verifies your payment and mints cBTC on Cardano.' },
  { num: '03', text: 'cBTC is delivered to your Cardano wallet address.' },
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
