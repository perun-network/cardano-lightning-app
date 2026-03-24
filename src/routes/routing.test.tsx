import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from '../App'

// Mock API calls to prevent network requests
vi.mock('../services/api', () => ({
  getPoolInfo: vi.fn().mockResolvedValue({ total_liquidity: 10_000_000, reserved: 0, available: 10_000_000, active_invoices: 0 }),
  getSwapStatus: vi.fn().mockResolvedValue({ payment_hash: 'h', invoice_id: 1, status: 'Pending', cardano_tx_hash: null, create_tx_hash: null }),
  getSwapHistory: vi.fn().mockResolvedValue([]),
  getOfframpHistory: vi.fn().mockResolvedValue([]),
  getOfframpStatus: vi.fn().mockResolvedValue({ offramp_id: 1, payment_hash: '', amount_cbtc: 0, status: 'awaiting_deposit', deposit_tx_hash: null, create_offramp_tx_hash: null, lightning_preimage: null, error_message: null }),
  getMetrics: vi.fn().mockResolvedValue({ onramp: { completed: 0, pending: 0, failed: 0, total: 0 }, offramp: { completed: 0, pending: 0, failed: 0, total: 0 } }),
  requestSwap: vi.fn(),
  requestOfframp: vi.fn(),
  submitOfframpDeposit: vi.fn(),
}))

vi.mock('../components/invoice/LightningQR', () => ({
  default: () => <div data-testid="qr">QR</div>,
}))

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

describe('routing integration (real AppRoutes)', () => {
  it('renders BridgePage at /', () => {
    renderAt('/')
    expect(screen.getByText(/Initiate Swap/)).toBeInTheDocument()
  })

  it('renders HistoryPage at /history', () => {
    renderAt('/history')
    expect(screen.getByText(/Loading transactions/)).toBeInTheDocument()
  })

  it('renders ProgressPage for swap at /progress/swap/:id', () => {
    renderAt('/progress/swap/test_hash')
    expect(screen.getByText(/Bridging your/)).toBeInTheDocument()
  })

  it('renders ProgressPage for offramp at /progress/offramp/:id', () => {
    renderAt('/progress/offramp/1')
    expect(screen.getByText(/Offramping/)).toBeInTheDocument()
  })

  it('renders InvoicePage at /invoice/:paymentHash', () => {
    renderAt('/invoice/abc123')
    expect(screen.getByText(/Waiting for payment/)).toBeInTheDocument()
  })

  it('renders OfframpDepositPage at /offramp-deposit/:id', () => {
    renderAt('/offramp-deposit/42')
    expect(screen.getByText(/Send cBTC/i)).toBeInTheDocument()
  })

  it('renders header nav on all routes', () => {
    renderAt('/')
    expect(screen.getByText('Cardinal BTC')).toBeInTheDocument()
    const navLinks = screen.getAllByRole('link')
    const navTexts = navLinks.map((l) => l.textContent)
    expect(navTexts).toContain('Bridge')
    expect(navTexts).toContain('History')
  })
})
