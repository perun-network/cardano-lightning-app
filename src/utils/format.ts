/** Base-unit multiplier: 1 cBTC = 100_000_000 base units. */
const CBTC_BASE = 100_000_000

/** Convert base units to human-readable cBTC string (e.g. 150000000 → "1.50000000"). */
export function formatCbtc(amount: number): string {
  return (amount / CBTC_BASE).toFixed(8)
}

/** Parse user-entered cBTC/BTC values exactly into cBTC base units. */
export function parseCbtcInputToBase(input: string): number | null {
  const trimmed = input.trim()
  const match = trimmed.match(/^(\d+)(?:\.(\d{0,8}))?$/)
  if (!match) return null

  const whole = Number(match[1])
  const fraction = Number((match[2] ?? '').padEnd(8, '0'))
  const base = whole * CBTC_BASE + fraction

  if (!Number.isSafeInteger(base) || base <= 0) return null
  return base
}
