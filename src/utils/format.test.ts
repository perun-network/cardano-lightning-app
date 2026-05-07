import { formatCbtc, parseCbtcInputToBase } from './format'

describe('formatCbtc', () => {
  it('converts base units to cBTC string with 8 decimals', () => {
    expect(formatCbtc(150_000_000)).toBe('1.50000000')
  })

  it('handles zero', () => {
    expect(formatCbtc(0)).toBe('0.00000000')
  })

  it('handles sub-unit amounts', () => {
    expect(formatCbtc(1)).toBe('0.00000001')
  })

  it('handles large amounts', () => {
    expect(formatCbtc(10_000_000_000)).toBe('100.00000000')
  })

  it('handles negative amounts', () => {
    expect(formatCbtc(-100_000_000)).toBe('-1.00000000')
  })
})

describe('parseCbtcInputToBase', () => {
  it('parses cBTC input without floating point rounding', () => {
    expect(parseCbtcInputToBase('1.5')).toBe(150_000_000)
    expect(parseCbtcInputToBase('0.00000001')).toBe(1)
  })

  it('rejects inputs below one cBTC base unit instead of rounding them up', () => {
    expect(parseCbtcInputToBase('0.000000001')).toBeNull()
  })
})
