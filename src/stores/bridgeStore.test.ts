import { useBridgeStore } from './bridgeStore'
import * as api from '../services/api'

vi.mock('../services/api')
const mockedGetPoolInfo = vi.mocked(api.getPoolInfo)

beforeEach(() => {
  // Reset store to initial state
  useBridgeStore.setState({
    direction: 'onramp',
    amount: '',
    cardanoAddress: '',
    bolt11Invoice: '',
    poolInfo: null,
    poolError: false,
  })
  vi.resetAllMocks()
})

describe('direction toggle', () => {
  it('starts as onramp', () => {
    expect(useBridgeStore.getState().direction).toBe('onramp')
  })

  it('toggles to offramp', () => {
    useBridgeStore.getState().toggleDirection()
    expect(useBridgeStore.getState().direction).toBe('offramp')
  })

  it('toggles back to onramp', () => {
    useBridgeStore.getState().toggleDirection()
    useBridgeStore.getState().toggleDirection()
    expect(useBridgeStore.getState().direction).toBe('onramp')
  })

  it('clears form fields on toggle', () => {
    useBridgeStore.setState({ amount: '1.5', cardanoAddress: 'addr1...', bolt11Invoice: 'lnbc...' })
    useBridgeStore.getState().toggleDirection()

    const state = useBridgeStore.getState()
    expect(state.amount).toBe('')
    expect(state.cardanoAddress).toBe('')
    expect(state.bolt11Invoice).toBe('')
  })
})

describe('form field setters', () => {
  it('setAmount updates amount', () => {
    useBridgeStore.getState().setAmount('42')
    expect(useBridgeStore.getState().amount).toBe('42')
  })

  it('setCardanoAddress updates address', () => {
    useBridgeStore.getState().setCardanoAddress('addr1abc')
    expect(useBridgeStore.getState().cardanoAddress).toBe('addr1abc')
  })

  it('setBolt11Invoice updates invoice', () => {
    useBridgeStore.getState().setBolt11Invoice('lnbc1...')
    expect(useBridgeStore.getState().bolt11Invoice).toBe('lnbc1...')
  })
})

describe('refreshPoolInfo', () => {
  it('sets poolInfo on success', async () => {
    const poolData = { total_liquidity: 10_000_000, reserved: 1_000_000, available: 9_000_000, active_invoices: 2 }
    mockedGetPoolInfo.mockResolvedValue(poolData)

    await useBridgeStore.getState().refreshPoolInfo()

    const state = useBridgeStore.getState()
    expect(state.poolInfo).toEqual(poolData)
    expect(state.poolError).toBe(false)
  })

  it('sets poolError on failure', async () => {
    mockedGetPoolInfo.mockRejectedValue(new Error('network error'))

    await useBridgeStore.getState().refreshPoolInfo()

    const state = useBridgeStore.getState()
    expect(state.poolError).toBe(true)
  })

  it('clears poolError after successful refresh', async () => {
    useBridgeStore.setState({ poolError: true })
    const poolData = { total_liquidity: 5_000_000, reserved: 0, available: 5_000_000, active_invoices: 0 }
    mockedGetPoolInfo.mockResolvedValue(poolData)

    await useBridgeStore.getState().refreshPoolInfo()

    expect(useBridgeStore.getState().poolError).toBe(false)
  })
})
