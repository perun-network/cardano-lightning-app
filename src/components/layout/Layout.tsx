import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="bg-surface text-on-surface font-body min-h-screen selection:bg-primary/30">
      <Header />
      {/* Background Accents */}
      <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[60%] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[30%] h-[50%] bg-secondary/5 blur-[100px] rounded-full pointer-events-none z-0" />
      <Outlet />
      <BottomNav />
    </div>
  )
}
