import type { SwapStatusResponse, OfframpStatusResponse } from '../types'

export interface Step {
  title: string
  description: string
  status: 'completed' | 'active' | 'pending'
  meta?: string
  txHash?: string | null
}

export function buildSwapSteps(status: SwapStatusResponse): Step[] {
  const s = status.status.toLowerCase()
  return [
    {
      title: 'Lightning Invoice Created',
      description: 'Waiting for Lightning payment',
      status: s === 'pending' ? 'active' as const : 'completed' as const,
      txHash: status.create_tx_hash,
    },
    {
      title: 'Payment Received — Fulfilling',
      description: 'Minting cBTC on Cardano',
      status: s === 'fulfilling' ? 'active' as const : s === 'completed' ? 'completed' as const : 'pending' as const,
    },
    {
      title: 'cBTC Delivered',
      description: s === 'completed' ? 'Assets sent to your Cardano wallet' : 'Waiting for completion',
      status: s === 'completed' ? 'completed' as const : 'pending' as const,
      txHash: status.cardano_tx_hash,
    },
  ]
}

const OFFRAMP_ORDER = ['awaiting_deposit', 'pending_verification', 'paying_lightning', 'depositing_to_pool', 'completed']

export function buildOfframpSteps(status: OfframpStatusResponse): Step[] {
  const s = status.status.toLowerCase()
  const idx = OFFRAMP_ORDER.indexOf(s)
  const isFailed = s === 'failed'

  return [
    {
      title: 'Awaiting cBTC Deposit',
      description: 'Send cBTC to operator address',
      status: idx === 0 && !isFailed ? 'active' as const : idx > 0 || isFailed ? 'completed' as const : 'pending' as const,
    },
    {
      title: 'Verifying Deposit',
      description: 'Confirming cBTC receipt on Cardano',
      status: idx === 1 ? 'active' as const : idx > 1 ? 'completed' as const : 'pending' as const,
      txHash: status.deposit_tx_hash,
    },
    {
      title: 'Paying Lightning Invoice',
      description: 'Sending BTC via Lightning Network',
      status: idx === 2 ? 'active' as const : idx > 2 ? 'completed' as const : 'pending' as const,
      meta: status.lightning_preimage ? `Preimage: ${status.lightning_preimage.slice(0, 16)}...` : undefined,
    },
    {
      title: 'Depositing to Pool',
      description: 'Returning cBTC to liquidity pool',
      status: idx === 3 ? 'active' as const : idx > 3 ? 'completed' as const : 'pending' as const,
      txHash: status.create_offramp_tx_hash,
    },
    {
      title: isFailed ? 'Failed' : 'Completed',
      description: isFailed
        ? status.error_message || 'Transaction failed'
        : 'Offramp complete — BTC delivered via Lightning',
      status: s === 'completed' ? 'completed' as const : isFailed ? 'active' as const : 'pending' as const,
    },
  ]
}
