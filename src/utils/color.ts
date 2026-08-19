// Pure color conversion helpers. All channels use these ranges:
//   RGB: r,g,b in [0,255]
//   HSL: h in [0,360), s,l in [0,100]
//   HSV: h in [0,360), s,v in [0,100]

export interface RGB {
  r: number
  g: number
  b: number
}
export interface HSL {
  h: number
  s: number
  l: number
}
export interface HSV {
  h: number
  s: number
  v: number
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
const round = (n: number) => Math.round(n)

/** Parse `#rgb`, `#rrggbb` (with or without `#`) into RGB. Returns null if invalid. */
export function hexToRgb(hex: string): RGB | null {
  let h = hex.trim().replace(/^#/, '')
  if (h.length === 3) {
    h = h.replace(/./g, (c) => c + c)
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

/** RGB → `#rrggbb` (lowercase). Channels are clamped and rounded. */
export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) => clamp(round(n), 0, 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const d = max - min
  const l = (max + min) / 2

  let h = 0
  let s = 0
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0)
        break
      case gn:
        h = (bn - rn) / d + 2
        break
      default:
        h = (rn - gn) / d + 4
    }
    h *= 60
  }
  return { h: round(h), s: round(s * 100), l: round(l * 100) }
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const hn = ((h % 360) + 360) % 360
  const sn = clamp(s, 0, 100) / 100
  const ln = clamp(l, 0, 100) / 100

  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const x = c * (1 - Math.abs(((hn / 60) % 2) - 1))
  const m = ln - c / 2

  let rp = 0
  let gp = 0
  let bp = 0
  if (hn < 60) [rp, gp, bp] = [c, x, 0]
  else if (hn < 120) [rp, gp, bp] = [x, c, 0]
  else if (hn < 180) [rp, gp, bp] = [0, c, x]
  else if (hn < 240) [rp, gp, bp] = [0, x, c]
  else if (hn < 300) [rp, gp, bp] = [x, 0, c]
  else [rp, gp, bp] = [c, 0, x]

  return {
    r: round((rp + m) * 255),
    g: round((gp + m) * 255),
    b: round((bp + m) * 255),
  }
}

export function rgbToHsv({ r, g, b }: RGB): HSV {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const d = max - min

  let h = 0
  if (d !== 0) {
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0)
        break
      case gn:
        h = (bn - rn) / d + 2
        break
      default:
        h = (rn - gn) / d + 4
    }
    h *= 60
  }
  const s = max === 0 ? 0 : d / max
  return { h: round(h), s: round(s * 100), v: round(max * 100) }
}

export function hsvToRgb({ h, s, v }: HSV): RGB {
  const hn = ((h % 360) + 360) % 360
  const sn = clamp(s, 0, 100) / 100
  const vn = clamp(v, 0, 100) / 100

  const c = vn * sn
  const x = c * (1 - Math.abs(((hn / 60) % 2) - 1))
  const m = vn - c

  let rp = 0
  let gp = 0
  let bp = 0
  if (hn < 60) [rp, gp, bp] = [c, x, 0]
  else if (hn < 120) [rp, gp, bp] = [x, c, 0]
  else if (hn < 180) [rp, gp, bp] = [0, c, x]
  else if (hn < 240) [rp, gp, bp] = [0, x, c]
  else if (hn < 300) [rp, gp, bp] = [x, 0, c]
  else [rp, gp, bp] = [c, 0, x]

  return {
    r: round((rp + m) * 255),
    g: round((gp + m) * 255),
    b: round((bp + m) * 255),
  }
}
