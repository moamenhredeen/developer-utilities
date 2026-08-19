import { describe, it, expect } from 'vitest'
import {
  hexToRgb,
  hslToRgb,
  hsvToRgb,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
} from '../utils/color'

describe('color conversions', () => {
  it('parses hex (long and short form)', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 })
    expect(hexToRgb('000000')).toEqual({ r: 0, g: 0, b: 0 })
    expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('rejects invalid hex', () => {
    expect(hexToRgb('#12')).toBeNull()
    expect(hexToRgb('nope')).toBeNull()
  })

  it('rgb -> hex round-trips', () => {
    expect(rgbToHex({ r: 99, g: 102, b: 241 })).toBe('#6366f1')
    const rgb = { r: 12, g: 200, b: 87 }
    expect(hexToRgb(rgbToHex(rgb))).toEqual(rgb)
  })

  it('converts known HSL values', () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 })
    expect(hslToRgb({ h: 0, s: 100, l: 50 })).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('converts known HSV values', () => {
    expect(rgbToHsv({ r: 0, g: 0, b: 255 })).toEqual({ h: 240, s: 100, v: 100 })
    expect(hsvToRgb({ h: 240, s: 100, v: 100 })).toEqual({ r: 0, g: 0, b: 255 })
  })

  it('hex -> hsl -> rgb stays within rounding tolerance', () => {
    // HSL channels are rounded to integers, so the round-trip drifts by a few
    // levels — assert closeness rather than exact equality.
    const rgb = hexToRgb('#6366f1')!
    const back = hslToRgb(rgbToHsl(rgb))
    expect(Math.abs(back.r - rgb.r)).toBeLessThanOrEqual(3)
    expect(Math.abs(back.g - rgb.g)).toBeLessThanOrEqual(3)
    expect(Math.abs(back.b - rgb.b)).toBeLessThanOrEqual(3)
  })

  it('handles grayscale (hue undefined -> 0)', () => {
    expect(rgbToHsl({ r: 128, g: 128, b: 128 })).toEqual({ h: 0, s: 0, l: 50 })
    expect(rgbToHsv({ r: 128, g: 128, b: 128 }).s).toBe(0)
  })
})
