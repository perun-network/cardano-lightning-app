import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SwapCard from './SwapCard'
import { useBridgeStore } from '../../stores/bridgeStore'
import * as api from '../../services/api'

vi.mock('../../services/api', () => ({
  requestSwap: vi.fn(),
  requestOfframp: vi.fn(),
}))

const mockedRequestSwap = vi.mocked(api.requestSwap)
const mockedRequestOfframp = vi.mocked(api.requestOfframp)

function renderSwapCard() {
  return render(
    <MemoryRouter>
      <SwapCard />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useBridgeStore.setState({
    direction: 'onramp',
    amount: '',
    cardanoAddress: '',
    bolt11Invoice: '',
  })
  vi.resetAllMocks()
  sessionStorage.clear()
})

describe('SwapCard — onramp unit conversion', () => {
  it('sends cBTC base units (amount * 100_000_000) to requestSwap, not the raw input', async () => {
    mockedRequestSwap.mockResolvedValue({ invoice_id: 1, bolt11: 'lnbc...', payment_hash: 'ph' })
    const user = userEvent.setup()

    // Pre-fill store with form values
    useBridgeStore.setState({ amount: '1.5', cardanoAddress: 'addr1test' })
    renderSwapCard()

    await user.click(screen.getByText('Initiate Swap'))

    expect(mockedRequestSwap).toHaveBeenCalledOnce()
    expect(mockedRequestSwap).toHaveBeenCalledWith(150_000_000, 'addr1test')
  })

  it('sends whole cBTC correctly', async () => {
    mockedRequestSwap.mockResolvedValue({ invoice_id: 1, bolt11: 'lnbc...', payment_hash: 'ph' })
    const user = userEvent.setup()

    useBridgeStore.setState({ amount: '10', cardanoAddress: 'addr1test' })
    renderSwapCard()

    await user.click(screen.getByText('Initiate Swap'))

    expect(mockedRequestSwap).toHaveBeenCalledWith(1_000_000_000, 'addr1test')
  })
})

describe('SwapCard — offramp unit conversion', () => {
  it('sends base units to requestOfframp', async () => {
    mockedRequestOfframp.mockResolvedValue({ offramp_id: 42, operator_address: 'addr_op', payment_hash: 'ph', status: 'awaiting_deposit' })
    const user = userEvent.setup()

    useBridgeStore.setState({
      direction: 'offramp',
      amount: '2.5',
      bolt11Invoice: 'lnbc_invoice',
      cardanoAddress: 'addr1refund',
    })
    renderSwapCard()

    await user.click(screen.getByText('Request Offramp'))

    expect(mockedRequestOfframp).toHaveBeenCalledOnce()
    expect(mockedRequestOfframp).toHaveBeenCalledWith('lnbc_invoice', 250_000_000, 'addr1refund')
  })
})

describe('SwapCard — validation', () => {
  it('shows error for empty amount', async () => {
    const user = userEvent.setup()
    useBridgeStore.setState({ amount: '', cardanoAddress: 'addr1test' })
    renderSwapCard()

    await user.click(screen.getByText('Initiate Swap'))

    expect(screen.getByText('Enter a valid amount')).toBeInTheDocument()
    expect(mockedRequestSwap).not.toHaveBeenCalled()
  })

  it('shows error for missing address', async () => {
    const user = userEvent.setup()
    useBridgeStore.setState({ amount: '1', cardanoAddress: '' })
    renderSwapCard()

    await user.click(screen.getByText('Initiate Swap'))

    expect(screen.getByText('Enter a Cardano address')).toBeInTheDocument()
    expect(mockedRequestSwap).not.toHaveBeenCalled()
  })

  it('rejects amounts below one cBTC base unit instead of rounding them', async () => {
    const user = userEvent.setup()
    useBridgeStore.setState({ amount: '0.000000001', cardanoAddress: 'addr1test' })
    renderSwapCard()

    await user.click(screen.getByText('Initiate Swap'))

    expect(screen.getByText('Amount must use at most 8 decimals')).toBeInTheDocument()
    expect(mockedRequestSwap).not.toHaveBeenCalled()
  })
})
