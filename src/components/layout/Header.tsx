import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useBridgeStore } from '../../stores/bridgeStore'
import { formatCbtc } from '../../utils/format'

const navItems = [
  { to: '/', label: 'Bridge' },
  { to: '/history', label: 'History' },
]

export default function Header() {
  const { poolInfo, poolError, refreshPoolInfo } = useBridgeStore()

  useEffect(() => {
    refreshPoolInfo()
    const interval = setInterval(refreshPoolInfo, 30_000)
    return () => clearInterval(interval)
  }, [refreshPoolInfo])

  return (
    <header className="fixed top-0 w-full flex justify-between items-center px-8 h-20 bg-[#131313]/40 backdrop-blur-xl z-50 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-8">
        <NavLink to="/" className="text-2xl font-black text-[#E2E2E2] tracking-tighter font-headline">
          Cardinal BTC
        </NavLink>
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `font-headline font-bold tracking-tight transition-colors ${
                  isActive
                    ? 'text-[#7BD0FF] border-b-2 border-[#29ABE2] pb-1'
                    : 'text-[#E2E2E2]/60 hover:text-[#E2E2E2]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        {/* Pool Info */}
        <div className="hidden sm:flex bg-surface-container-low p-1.5 px-4 rounded-xl items-center gap-3">
          {poolError ? (
            <span className="font-label text-xs text-on-surface-variant">Pool: offline</span>
          ) : poolInfo ? (
            <>
              <span className="font-label text-xs text-on-surface-variant">
                {formatCbtc(poolInfo.available)} cBTC
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(123,208,255,0.5)]" />
            </>
          ) : (
            <span className="font-label text-xs text-on-surface-variant">Loading...</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            disabled
            aria-label="Connect wallet (coming soon)"
            className="bg-primary-container/50 text-on-primary/60 px-6 py-2.5 rounded-xl font-headline font-bold cursor-not-allowed"
            title="Wallet connection coming soon"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    </header>
  )
}
