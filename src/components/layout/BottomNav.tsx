import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', icon: 'swap_calls', label: 'Bridge', disabled: false },
  { to: '/history', icon: 'history', label: 'History', disabled: false },
  { to: '#', icon: 'hub', label: 'Nodes', disabled: true },
  { to: '#', icon: 'contact_support', label: 'Support', disabled: true },
]

export default function BottomNav() {
  return (
    <footer className="fixed bottom-0 w-full flex justify-around items-center h-20 px-6 pb-safe md:hidden bg-[#131313]/80 backdrop-blur-lg z-50 border-t border-[#3E484F]/20">
      {items.map((item) =>
        item.disabled ? (
          <span
            key={item.label}
            className="flex flex-col items-center justify-center text-[#E2E2E2]/20 cursor-not-allowed"
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-label text-[10px] uppercase tracking-widest mt-1">{item.label}</span>
          </span>
        ) : (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center transition-all ${
                isActive
                  ? 'text-[#7BD0FF] bg-[#29ABE2]/10 rounded-xl px-4 py-1'
                  : 'text-[#E2E2E2]/40 hover:text-[#7BD0FF]'
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-label text-[10px] uppercase tracking-widest mt-1">{item.label}</span>
          </NavLink>
        )
      )}
    </footer>
  )
}
