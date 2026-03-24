import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import OfframpDepositPage from './OfframpDepositPage'

vi.mock('../services/api', () => ({
  submitOfframpDeposit: vi.fn(),
}))

function renderPage(opts: { state?: Record<string, string> | null; id?: string } = {}) {
  const { state = null, id = '42' } = opts
  return render(
    <MemoryRouter initialEntries={[{ pathname: `/offramp-deposit/${id}`, state }]}>
      <Routes>
        <Route path="/offramp-deposit/:id" element={<OfframpDepositPage />} />
        <Route path="/" element={<div>Bridge Page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

afterEach(() => {
  sessionStorage.clear()
})

describe('OfframpDepositPage', () => {
  it('shows operator address from location.state', () => {
    renderPage({ state: { operatorAddress: 'addr_operator_123' } })
    expect(screen.getByText('addr_operator_123')).toBeInTheDocument()
    expect(screen.queryByText(/Back to Bridge/)).not.toBeInTheDocument()
  })

  it('shows operator address from sessionStorage', () => {
    sessionStorage.setItem('offramp:42', JSON.stringify({ operatorAddress: 'addr_from_storage' }))
    renderPage()
    expect(screen.getByText('addr_from_storage')).toBeInTheDocument()
  })

  it('shows fallback when no operator address (deep-link)', () => {
    renderPage()
    expect(screen.getByText(/Address unavailable/)).toBeInTheDocument()
    expect(screen.getByText(/Back to Bridge/)).toBeInTheDocument()
  })

  it('disables confirm button when operator address is missing', () => {
    renderPage()
    const button = screen.getByRole('button', { name: /Confirm Deposit/ })
    expect(button).toBeDisabled()
  })

  it('shows confirm button enabled when address exists and tx hash entered', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    renderPage({ state: { operatorAddress: 'addr_op' } })

    const input = screen.getByPlaceholderText(/Cardano TX hash/)
    await user.type(input, 'some_tx_hash')

    const button = screen.getByRole('button', { name: /Confirm Deposit/ })
    expect(button).toBeEnabled()
  })
})
