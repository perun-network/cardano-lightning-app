import { formatCbtc, cbtcToBase } from './format'

describe('formatCbtc', () => {
  it('converts base units to cBTC string with 6 decimals', () => {
    expect(formatCbtc(1_500_000)).toBe('1.500000')
  })

  it('handles zero', () => {
    expect(formatCbtc(0)).toBe('0.000000')
  })

  it('handles sub-unit amounts', () => {
    expect(formatCbtc(1)).toBe('0.000001')
  })

  it('handles large amounts', () => {
    expect(formatCbtc(10_000_000_000)).toBe('10000.000000')
  })

  it('handles negative amounts', () => {
    expect(formatCbtc(-1_000_000)).toBe('-1.000000')
  })
})

describe('cbtcToBase', () => {
  it('converts cBTC to base units', () => {
    expect(cbtcToBase(1.5)).toBe(1_500_000)
  })

  it('handles zero', () => {
    expect(cbtcToBase(0)).toBe(0)
  })

  it('rounds fractional base units', () => {
    // 0.0000001 cBTC = 0.1 base units → rounds to 0
    expect(cbtcToBase(0.0000001)).toBe(0)
  })

  it('is the inverse of formatCbtc', () => {
    const original = 1_234_567
    expect(cbtcToBase(parseFloat(formatCbtc(original)))).toBe(original)
  })

  it('handles whole numbers', () => {
    expect(cbtcToBase(1)).toBe(1_000_000)
    expect(cbtcToBase(100)).toBe(100_000_000)
  })
})
