/** Base-unit multiplier: 1 cBTC = 1_000_000 base units. */
const CBTC_BASE = 1_000_000

/** Convert base units to human-readable cBTC string (e.g. 1500000 → "1.500000"). */
export function formatCbtc(amount: number): string {
  return (amount / CBTC_BASE).toFixed(6)
}

/** Convert human-readable cBTC to base units for the API (e.g. 1.5 → 1500000). */
export function cbtcToBase(cbtc: number): number {
  return Math.round(cbtc * CBTC_BASE)
}
