import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import InvoicePage from './InvoicePage'

vi.mock('../services/api', () => ({
  getSwapStatus: vi.fn().mockResolvedValue({
    payment_hash: 'test_hash',
    invoice_id: 1,
    status: 'Pending',
    cardano_tx_hash: null,
    create_tx_hash: null,
  }),
}))

// Mock LightningQR to avoid qrcode.react dependency in tests
vi.mock('../components/invoice/LightningQR', () => ({
  default: ({ bolt11 }: { bolt11: string }) => <div data-testid="qr">{bolt11}</div>,
}))

function renderInvoicePage(opts: { state?: Record<string, string> | null; hash?: string } = {}) {
  const { state = null, hash = 'test_hash' } = opts
  return render(
    <MemoryRouter initialEntries={[{ pathname: `/invoice/${hash}`, state }]}>
      <Routes>
        <Route path="/invoice/:paymentHash" element={<InvoicePage />} />
        <Route path="/" element={<div>Bridge Page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

afterEach(() => {
  sessionStorage.clear()
})

describe('InvoicePage', () => {
  it('shows QR code when bolt11 is in location.state', () => {
    renderInvoicePage({ state: { bolt11: 'lnbc_test_invoice', amount: '1.5' } })
    expect(screen.getByTestId('qr')).toHaveTextContent('lnbc_test_invoice')
  })

  it('shows QR code when bolt11 is in sessionStorage', () => {
    sessionStorage.setItem('invoice:test_hash', JSON.stringify({ bolt11: 'lnbc_from_storage', amount: '2.0' }))
    renderInvoicePage()
    expect(screen.getByTestId('qr')).toHaveTextContent('lnbc_from_storage')
  })

  it('shows fallback when no bolt11 available (deep-link)', () => {
    renderInvoicePage()
    expect(screen.getByText(/Invoice data is not available/)).toBeInTheDocument()
    expect(screen.getByText(/Back to Bridge/)).toBeInTheDocument()
  })

  it('shows "Waiting for payment" status indicator', () => {
    renderInvoicePage({ state: { bolt11: 'lnbc_test' } })
    expect(screen.getByText(/Waiting for payment/)).toBeInTheDocument()
  })

  // --- cardanoAddress restoration ---

  it('renders cardanoAddress from location.state in TransactionSummary', async () => {
    renderInvoicePage({ state: { bolt11: 'lnbc_test', cardanoAddress: 'addr1_from_state' } })
    // TransactionSummary renders after getSwapStatus resolves
    await waitFor(() => {
      expect(screen.getByText('Destination Cardano Address')).toBeInTheDocument()
    })
    expect(screen.getByText('addr1_from_state')).toBeInTheDocument()
  })

  it('renders cardanoAddress from sessionStorage in TransactionSummary', async () => {
    sessionStorage.setItem('invoice:test_hash', JSON.stringify({
      bolt11: 'lnbc_stored',
      amount: '1',
      cardanoAddress: 'addr1_from_session',
    }))
    renderInvoicePage()
    await waitFor(() => {
      expect(screen.getByText('Destination Cardano Address')).toBeInTheDocument()
    })
    expect(screen.getByText('addr1_from_session')).toBeInTheDocument()
  })

  it('does not render address section when cardanoAddress is empty', async () => {
    renderInvoicePage({ state: { bolt11: 'lnbc_test' } })
    // Wait for TransactionSummary to render (after getSwapStatus resolves)
    await waitFor(() => {
      expect(screen.getByText('Invoice ID')).toBeInTheDocument()
    })
    expect(screen.queryByText('Destination Cardano Address')).not.toBeInTheDocument()
  })
})
