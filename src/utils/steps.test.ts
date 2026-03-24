import { buildSwapSteps, buildOfframpSteps } from './steps'
import type { SwapStatusResponse, OfframpStatusResponse } from '../types'

function makeSwapStatus(overrides: Partial<SwapStatusResponse> = {}): SwapStatusResponse {
  return {
    payment_hash: 'abc123',
    invoice_id: 1,
    status: 'Pending',
    cardano_tx_hash: null,
    create_tx_hash: null,
    ...overrides,
  }
}

function makeOfframpStatus(overrides: Partial<OfframpStatusResponse> = {}): OfframpStatusResponse {
  return {
    offramp_id: 1,
    payment_hash: 'abc123',
    amount_cbtc: 1_000_000,
    status: 'awaiting_deposit',
    deposit_tx_hash: null,
    create_offramp_tx_hash: null,
    lightning_preimage: null,
    error_message: null,
    ...overrides,
  }
}

describe('buildSwapSteps', () => {
  it('marks first step active when Pending', () => {
    const steps = buildSwapSteps(makeSwapStatus({ status: 'Pending' }))
    expect(steps).toHaveLength(3)
    expect(steps[0].status).toBe('active')
    expect(steps[1].status).toBe('pending')
    expect(steps[2].status).toBe('pending')
  })

  it('marks second step active when Fulfilling', () => {
    const steps = buildSwapSteps(makeSwapStatus({ status: 'Fulfilling' }))
    expect(steps[0].status).toBe('completed')
    expect(steps[1].status).toBe('active')
    expect(steps[2].status).toBe('pending')
  })

  it('marks all completed when Completed', () => {
    const steps = buildSwapSteps(makeSwapStatus({
      status: 'Completed',
      cardano_tx_hash: 'tx_abc',
    }))
    expect(steps[0].status).toBe('completed')
    expect(steps[1].status).toBe('completed')
    expect(steps[2].status).toBe('completed')
    expect(steps[2].txHash).toBe('tx_abc')
    expect(steps[2].description).toContain('Assets sent')
  })

  it('includes create_tx_hash on first step', () => {
    const steps = buildSwapSteps(makeSwapStatus({ create_tx_hash: 'tx_create' }))
    expect(steps[0].txHash).toBe('tx_create')
  })

  it('handles case-insensitive status', () => {
    const steps = buildSwapSteps(makeSwapStatus({ status: 'PENDING' }))
    expect(steps[0].status).toBe('active')
  })
})

describe('buildOfframpSteps', () => {
  it('marks first step active for awaiting_deposit', () => {
    const steps = buildOfframpSteps(makeOfframpStatus({ status: 'awaiting_deposit' }))
    expect(steps).toHaveLength(5)
    expect(steps[0].status).toBe('active')
    expect(steps[1].status).toBe('pending')
    expect(steps[2].status).toBe('pending')
    expect(steps[3].status).toBe('pending')
    expect(steps[4].status).toBe('pending')
  })

  it('marks second step active for pending_verification', () => {
    const steps = buildOfframpSteps(makeOfframpStatus({ status: 'pending_verification' }))
    expect(steps[0].status).toBe('completed')
    expect(steps[1].status).toBe('active')
    expect(steps[2].status).toBe('pending')
  })

  it('marks third step active for paying_lightning', () => {
    const steps = buildOfframpSteps(makeOfframpStatus({ status: 'paying_lightning' }))
    expect(steps[0].status).toBe('completed')
    expect(steps[1].status).toBe('completed')
    expect(steps[2].status).toBe('active')
    expect(steps[3].status).toBe('pending')
  })

  it('marks fourth step active for depositing_to_pool', () => {
    const steps = buildOfframpSteps(makeOfframpStatus({ status: 'depositing_to_pool' }))
    expect(steps[0].status).toBe('completed')
    expect(steps[1].status).toBe('completed')
    expect(steps[2].status).toBe('completed')
    expect(steps[3].status).toBe('active')
    expect(steps[4].status).toBe('pending')
  })

  it('marks all completed for completed status', () => {
    const steps = buildOfframpSteps(makeOfframpStatus({ status: 'completed' }))
    expect(steps[0].status).toBe('completed')
    expect(steps[1].status).toBe('completed')
    expect(steps[2].status).toBe('completed')
    expect(steps[3].status).toBe('completed')
    expect(steps[4].status).toBe('completed')
    expect(steps[4].title).toBe('Completed')
  })

  it('handles failed status — marks first as completed, last as active with error', () => {
    const steps = buildOfframpSteps(makeOfframpStatus({
      status: 'failed',
      error_message: 'Lightning payment timed out',
    }))
    expect(steps[0].status).toBe('completed')
    expect(steps[4].status).toBe('active')
    expect(steps[4].title).toBe('Failed')
    expect(steps[4].description).toBe('Lightning payment timed out')
  })

  it('shows default error message when error_message is null', () => {
    const steps = buildOfframpSteps(makeOfframpStatus({ status: 'failed' }))
    expect(steps[4].description).toBe('Transaction failed')
  })

  it('includes tx hashes and preimage where available', () => {
    const steps = buildOfframpSteps(makeOfframpStatus({
      status: 'completed',
      deposit_tx_hash: 'dep_tx',
      create_offramp_tx_hash: 'offramp_tx',
      lightning_preimage: 'abcdef1234567890abcdef',
    }))
    expect(steps[1].txHash).toBe('dep_tx')
    expect(steps[2].meta).toBe('Preimage: abcdef1234567890...')
    expect(steps[3].txHash).toBe('offramp_tx')
  })

  it('uses snake_case status values from backend', () => {
    // This test verifies the fix for the snake_case bug
    const statuses = ['awaiting_deposit', 'pending_verification', 'paying_lightning', 'depositing_to_pool', 'completed']
    statuses.forEach((status, expectedActiveIdx) => {
      const steps = buildOfframpSteps(makeOfframpStatus({ status }))
      expect(steps[expectedActiveIdx].status).not.toBe('pending')
    })
  })
})
