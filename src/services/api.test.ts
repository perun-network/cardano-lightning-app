import {
  getPoolInfo,
  requestSwap,
  getSwapStatus,
  requestOfframp,
  submitOfframpDeposit,
  getOfframpStatus,
} from './api'

const mockFetch = vi.fn()
beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
  mockFetch.mockReset()
})
afterEach(() => {
  vi.unstubAllGlobals()
})

function jsonResponse(data: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Bad Request',
    json: () => Promise.resolve(data),
  })
}

function networkError() {
  return Promise.reject(new TypeError('fetch failed'))
}

// --- Request building ---

describe('requestSwap', () => {
  it('sends POST with correct body', async () => {
    mockFetch.mockReturnValue(jsonResponse({ invoice_id: 1, bolt11: 'lnbc...', payment_hash: 'abc' }))
    const resp = await requestSwap(1_000_000, 'addr1...')

    expect(mockFetch).toHaveBeenCalledOnce()
    const [url, opts] = mockFetch.mock.calls[0]
    expect(url).toContain('/swap/request')
    expect(opts.method).toBe('POST')
    expect(JSON.parse(opts.body)).toEqual({ amount_cbtc: 1_000_000, cardano_address: 'addr1...' })
    expect(resp.bolt11).toBe('lnbc...')
  })
})

describe('requestOfframp', () => {
  it('sends POST with bolt11, amount, and address', async () => {
    mockFetch.mockReturnValue(jsonResponse({ offramp_id: 42, operator_address: 'addr_op', payment_hash: 'ph', status: 'awaiting_deposit' }))
    const resp = await requestOfframp('lnbc...', 500_000, 'addr_refund')

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body).toEqual({ bolt11: 'lnbc...', amount_cbtc: 500_000, cardano_address: 'addr_refund' })
    expect(resp.offramp_id).toBe(42)
  })
})

describe('submitOfframpDeposit', () => {
  it('sends offramp_id and tx_hash', async () => {
    mockFetch.mockReturnValue(jsonResponse({ offramp_id: 42, operator_address: '', payment_hash: '', status: '' }))
    await submitOfframpDeposit(42, 'tx_hash_123')

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body).toEqual({ offramp_id: 42, cbtc_tx_hash: 'tx_hash_123' })
  })
})

// --- GET endpoints ---

describe('getSwapStatus', () => {
  it('calls correct URL with payment hash', async () => {
    mockFetch.mockReturnValue(jsonResponse({ payment_hash: 'abc', invoice_id: 1, status: 'Pending', cardano_tx_hash: null, create_tx_hash: null }))
    await getSwapStatus('abc')
    expect(mockFetch.mock.calls[0][0]).toContain('/swap/status/abc')
  })
})

describe('getOfframpStatus', () => {
  it('calls correct URL with offramp id', async () => {
    mockFetch.mockReturnValue(jsonResponse({ offramp_id: 5, payment_hash: '', amount_cbtc: 0, status: 'awaiting_deposit', deposit_tx_hash: null, create_offramp_tx_hash: null, lightning_preimage: null, error_message: null }))
    await getOfframpStatus(5)
    expect(mockFetch.mock.calls[0][0]).toContain('/offramp/status/5')
  })
})

describe('getPoolInfo', () => {
  it('returns pool info', async () => {
    const data = { total_liquidity: 10_000_000, reserved: 1_000_000, available: 9_000_000, active_invoices: 2 }
    mockFetch.mockReturnValue(jsonResponse(data))
    const result = await getPoolInfo()
    expect(result).toEqual(data)
  })
})

// --- Error handling ---

describe('error handling', () => {
  it('throws with JSON error message from server', async () => {
    mockFetch.mockReturnValue(jsonResponse({ error: 'insufficient pool liquidity' }, 400))
    await expect(requestSwap(999, 'addr')).rejects.toThrow('insufficient pool liquidity')
  })

  it('falls back to statusText for non-JSON errors', async () => {
    mockFetch.mockReturnValue(Promise.resolve({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      json: () => Promise.reject(new Error('not json')),
    }))
    await expect(getPoolInfo()).rejects.toThrow('Bad Gateway')
  })

  it('propagates network errors', async () => {
    mockFetch.mockReturnValue(networkError())
    await expect(getPoolInfo()).rejects.toThrow('fetch failed')
  })
})
