import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import BridgePage from './routes/BridgePage'
import InvoicePage from './routes/InvoicePage'
import ProgressPage from './routes/ProgressPage'
import HistoryPage from './routes/HistoryPage'
import OfframpDepositPage from './routes/OfframpDepositPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<BridgePage />} />
        <Route path="/invoice/:paymentHash" element={<InvoicePage />} />
        <Route path="/progress/:type/:id" element={<ProgressPage />} />
        <Route path="/offramp-deposit/:id" element={<OfframpDepositPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
