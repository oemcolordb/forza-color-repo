// Convert HSB to RGB (proper conversion)
export const hsbToRgb = (h: number, s: number, b: number): { r: number; g: number; b: number } => {
  const c = b * s
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
  const m = b - c

  let r = 0,
    g = 0,
    bl = 0

  if (h >= 0 && h < 1 / 6) {
    r = c
    g = x
    bl = 0
  } else if (h >= 1 / 6 && h < 2 / 6) {
    r = x
    g = c
    bl = 0
  } else if (h >= 2 / 6 && h < 3 / 6) {
    r = 0
    g = c
    bl = x
  } else if (h >= 3 / 6 && h < 4 / 6) {
    r = 0
    g = x
    bl = c
  } else if (h >= 4 / 6 && h < 5 / 6) {
    r = x
    g = 0
    bl = c
  } else if (h >= 5 / 6 && h < 1) {
    r = c
    g = 0
    bl = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((bl + m) * 255),
  }
}

export const createForzaGradient = (
  color1: { h: number; s: number; b: number },
  color2: { h: number; s: number; b: number }
): string => {
  const rgb1 = hsbToRgb(color1.h, color1.s, color1.b)
  const rgb2 = hsbToRgb(color2.h, color2.s, color2.b)
  const css1 = `rgb(${rgb1.r}, ${rgb1.g}, ${rgb1.b})`
  const css2 = `rgb(${rgb2.r}, ${rgb2.g}, ${rgb2.b})`
  return `linear-gradient(135deg, ${css1} 0%, ${css2} 100%)`
}

export const hsbToCSS = (color: { h: number; s: number; b: number }): string => {
  const rgb = hsbToRgb(color.h, color.s, color.b)
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
}

export const hsbToHex = (h: number, s: number, b: number): string => {
  const rgb = hsbToRgb(h, s, b)
  return `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`
}

export const formatHSBValues = (color: { h: number; s: number; b: number }): string => {
  return `H:${Math.round(color.h * 360)} S:${Math.round(color.s * 100)} B:${Math.round(color.b * 100)}`
}
