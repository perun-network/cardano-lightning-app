/** Base-unit multiplier: 1 cBTC = 1_000_000 base units. */
const CBTC_BASE = 1_000_000

/** Convert base units to human-readable cBTC string (e.g. 1500000 → "1.500000"). */
export function formatCbtc(amount: number): string {
  return (amount / CBTC_BASE).toFixed(6)
}

/** Parse user-entered cBTC/BTC values exactly into cBTC base units. */
export function parseCbtcInputToBase(input: string): number | null {
  const trimmed = input.trim()
  const match = trimmed.match(/^(\d+)(?:\.(\d{0,6}))?$/)
  if (!match) return null

  const whole = Number(match[1])
  const fraction = Number((match[2] ?? '').padEnd(6, '0'))
  const base = whole * CBTC_BASE + fraction

  if (!Number.isSafeInteger(base) || base <= 0) return null
  return base
}
