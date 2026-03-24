import { RELAY_URL } from '../config'
import type {
  SwapResponse,
  SwapStatusResponse,
  OfframpResponse,
  OfframpStatusResponse,
  PoolInfoResponse,
  RelayInfoResponse,
  MetricsResponse,
} from '../types'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const resp = await fetch(`${RELAY_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: resp.statusText }))
    throw new Error(err.error || `Request failed: ${resp.status}`)
  }
  return resp.json()
}

// --- Relay Info ---

export function getRelayInfo(): Promise<RelayInfoResponse> {
  return request('/info')
}

// --- Pool ---

export function getPoolInfo(): Promise<PoolInfoResponse> {
  return request('/pool/info')
}

// --- Metrics ---

export function getMetrics(): Promise<MetricsResponse> {
  return request('/metrics')
}

// --- Onramp (BTC → cBTC) ---

export function requestSwap(amount_cbtc: number, cardano_address: string): Promise<SwapResponse> {
  return request('/swap/request', {
    method: 'POST',
    body: JSON.stringify({ amount_cbtc, cardano_address }),
  })
}

export function getSwapStatus(paymentHash: string): Promise<SwapStatusResponse> {
  return request(`/swap/status/${paymentHash}`)
}

export function getSwapHistory(): Promise<SwapStatusResponse[]> {
  return request('/swap/history')
}

// --- Offramp (cBTC → BTC) ---

export function requestOfframp(bolt11: string, amount_cbtc: number, cardano_address: string): Promise<OfframpResponse> {
  return request('/offramp/request', {
    method: 'POST',
    body: JSON.stringify({ bolt11, amount_cbtc, cardano_address }),
  })
}

export function submitOfframpDeposit(offramp_id: number, cbtc_tx_hash: string): Promise<OfframpResponse> {
  return request('/offramp/deposit', {
    method: 'POST',
    body: JSON.stringify({ offramp_id, cbtc_tx_hash }),
  })
}

export function getOfframpStatus(offrampId: number): Promise<OfframpStatusResponse> {
  return request(`/offramp/status/${offrampId}`)
}

export function getOfframpHistory(): Promise<OfframpStatusResponse[]> {
  return request('/offramp/history')
}
