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

/**
 * Convert RGB values (0-255) to HSB (0-1, 0-1, 0-1)
 */
export const rgbToHsb = (r: number, g: number, b: number): { h: number; s: number; b: number } => {
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255

  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  const diff = max - min

  let h = 0
  if (diff !== 0) {
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / diff + (gNorm < bNorm ? 6 : 0)
        break
      case gNorm:
        h = (bNorm - rNorm) / diff + 2
        break
      case bNorm:
        h = (rNorm - gNorm) / diff + 4
        break
    }
    h /= 6
  }

  const s = max === 0 ? 0 : diff / max
  const brightness = max

  return { h, s, b: brightness }
}

/**
 * Convert HEX color string to RGB
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Convert HEX color string to HSB
 */
export const hexToHsb = (hex: string): { h: number; s: number; b: number } | null => {
  const rgb = hexToRgb(hex)
  return rgb ? rgbToHsb(rgb.r, rgb.g, rgb.b) : null
}

/**
 * Convert RGB to HEX
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * Validate HSB values are in correct ranges
 */
export const validateHSB = (h: number, s: number, b: number): boolean => {
  return h >= 0 && h <= 1 && s >= 0 && s <= 1 && b >= 0 && b <= 1
}

/**
 * Validate HEX color format
 */
export const validateHex = (hex: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(hex)
}

/**
 * Calculate perceptual color distance between two HSB colors
 * Used for color matching and similarity calculations
 */
export const calculateColorDistance = (
  color1: { h: number; s: number; b: number },
  color2: { h: number; s: number; b: number }
): number => {
  // Hue is circular: distance between 0.02 and 0.98 should be 0.04 not 0.96
  const rawHDiff = Math.abs(color1.h - color2.h)
  const hDiff = Math.min(rawHDiff, 1 - rawHDiff)

  // Weight H more heavily (most perceptually salient), then S, then B
  // At low saturation, hue differences matter less
  const satFactor = (color1.s + color2.s) / 2

  return Math.sqrt(
    Math.pow(hDiff * 2 * satFactor, 2) + Math.pow((color1.s - color2.s) * 1.5, 2) + Math.pow(color1.b - color2.b, 2)
  )
}

/**
 * Clamp HSB values to valid ranges
 */
export const clampHSB = (h: number, s: number, b: number): { h: number; s: number; b: number } => {
  return {
    h: Math.max(0, Math.min(1, h)),
    s: Math.max(0, Math.min(1, s)),
    b: Math.max(0, Math.min(1, b)),
  }
}
