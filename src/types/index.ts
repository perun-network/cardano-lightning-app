export type SwapDirection = 'onramp' | 'offramp'

// --- Onramp (BTC → cBTC) ---

export interface SwapRequest {
  amount_cbtc: number
  cardano_address: string
}

export interface SwapResponse {
  invoice_id: number
  bolt11: string
  payment_hash: string
}

export interface SwapStatusResponse {
  payment_hash: string
  invoice_id: number
  status: string // "Pending" | "Fulfilling" | "Completed" | "Failed" | "Expired"
  cardano_tx_hash: string | null
  create_tx_hash: string | null
}

// --- Offramp (cBTC → BTC) ---

export interface OfframpRequest {
  bolt11: string
  amount_cbtc: number
  cardano_address: string
}

export interface OfframpResponse {
  offramp_id: number
  operator_address: string
  payment_hash: string
  status: string
}

export interface OfframpDepositRequest {
  offramp_id: number
  cbtc_tx_hash: string
}

export interface OfframpStatusResponse {
  offramp_id: number
  payment_hash: string
  amount_cbtc: number
  status: string // "awaiting_deposit" | "pending_verification" | "paying_lightning" | "depositing_to_pool" | "completed" | "failed"
  deposit_tx_hash: string | null
  create_offramp_tx_hash: string | null
  lightning_preimage: string | null
  error_message: string | null
}

// --- Pool & Relay ---

export interface PoolInfoResponse {
  total_liquidity: number
  reserved: number
  available: number
  active_invoices: number
}

export interface RelayInfoResponse {
  operator_address: string
  script_address: string
  cbtc_policy_id: string
  cbtc_asset_name: string
  exchange_rate: number
}

export interface MetricsResponse {
  onramp: StatusCounts
  offramp: StatusCounts
}

export interface StatusCounts {
  completed: number
  pending: number
  failed: number
  total: number
}

// --- Unified history item for UI ---

export interface HistoryItem {
  id: string
  direction: SwapDirection
  amount_cbtc: number | null
  status: string
  payment_hash: string
  cardano_tx_hash: string | null
}
