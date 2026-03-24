import { useBridgeStore } from '../stores/bridgeStore'
import SwapCard from '../components/bridge/SwapCard'
import StatsBar from '../components/bridge/StatsBar'

export default function BridgePage() {
  const { direction } = useBridgeStore()

  return (
    <main className="pt-32 pb-24 px-4 flex flex-col items-center relative overflow-hidden">
      <div className="w-full max-w-[480px] z-10">
        {/* Heading */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="font-headline text-5xl font-extrabold tracking-tighter mb-2">
            {direction === 'onramp' ? (
              <>Liquid <span className="text-gradient-primary">Bridge</span></>
            ) : (
              <>Off<span className="text-gradient-primary">ramp</span></>
            )}
          </h1>
          <p className="text-on-surface-variant font-body text-sm max-w-sm">
            {direction === 'onramp'
              ? 'Send BTC via Lightning Network and receive cBTC on Cardano.'
              : 'Send cBTC on Cardano and receive BTC via Lightning Network.'}
          </p>
        </div>

        <SwapCard />
        <StatsBar />
      </div>
    </main>
  )
}
