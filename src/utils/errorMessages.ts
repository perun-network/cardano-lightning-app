/**
 * Translate raw API/backend error messages into user-friendly text.
 * Keeps known validation errors readable, replaces internal details with generic messages.
 */
export function toUserError(raw: string): string {
  const lower = raw.toLowerCase()

  // Pass through known user-facing validation errors
  if (lower.includes('insufficient pool liquidity')) return 'Not enough liquidity in the pool for this amount.'
  if (lower.includes('amount must be between')) return raw
  if (lower.includes('invalid cardano address') || lower.includes('invalid bech32')) return 'Invalid Cardano address.'
  if (lower.includes('invalid bolt11') || lower.includes('invalid invoice')) return 'Invalid Lightning invoice.'
  if (lower.includes('does not match')) return 'Invoice amount does not match the requested amount.'
  if (lower.includes('already used')) return 'This invoice has already been used.'
  if (lower.includes('rate limit')) return 'Too many requests. Please try again in a moment.'
  if (lower.includes('too many active')) return 'The bridge is at capacity. Please try again later.'
  if (lower.includes('not found')) return 'Transaction or swap not found.'
  if (lower.includes('invalid offramp')) return 'Invalid offramp ID.'
  if (lower.includes('not received')) return 'cBTC deposit not yet confirmed on-chain. Please wait and try again.'

  // Generic fallback for internal/unexpected errors
  return 'Something went wrong. Please try again or contact support.'
}
