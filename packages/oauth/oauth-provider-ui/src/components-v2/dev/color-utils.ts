export type RgbColor = { r: number; g: number; b: number }

export function hexToRgb(hex: string): RgbColor | undefined {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return undefined
  const int = parseInt(match[1], 16)
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }
}

export function rgbToHex({ r, g, b }: RgbColor): string {
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

export function rgbToCssVar({ r, g, b }: RgbColor): string {
  return `${r} ${g} ${b}`
}

/** Hue in degrees (0-360), used to drive this color's derived shade scale. */
export function rgbToHue({ r, g, b }: RgbColor): number {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  if (delta === 0) return 0

  let hue: number
  if (max === rn) hue = ((gn - bn) / delta) % 6
  else if (max === gn) hue = (bn - rn) / delta + 2
  else hue = (rn - gn) / delta + 4

  hue *= 60
  return hue < 0 ? hue + 360 : hue
}

/** Simple black/white contrast pick — good enough for a dev preview tool. */
export function rgbToContrast(color: RgbColor): RgbColor {
  const luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b
  return luminance > 140 ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 }
}
