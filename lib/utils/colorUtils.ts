import { getMaterialModel, isDualTonePaint } from './materialModels'
import { blendDualToneFH6, getBlendedHSB } from './colorBlending'

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
  } else if (h >= 5 / 6 && h <= 1) {
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

/**
 * Create a CSS gradient that visualizes the Forza dual-tone effect.
 *
 * Uses the FH6 blending engine to compute the blended mid-point color,
 * creating a three-stop gradient: base → blended → highlight.
 *
 * For single-color paints, falls back to the original simple gradient.
 */
export const createForzaGradient = (
  color1: { h: number; s: number; b: number },
  color2: { h: number; s: number; b: number },
  colorType?: string
): string => {
  const rgb1 = hsbToRgb(color1.h, color1.s, color1.b)
  const rgb2 = hsbToRgb(color2.h, color2.s, color2.b)
  const css1 = `rgb(${rgb1.r}, ${rgb1.g}, ${rgb1.b})`
  const css2 = `rgb(${rgb2.r}, ${rgb2.g}, ${rgb2.b})`

  // If it's a dual-tone paint, add the FH6 blended mid-point
  if (colorType && isDualTonePaint(colorType)) {
    const model = getMaterialModel(colorType)
    const blendResult = blendDualToneFH6(color1, color2, model.blendMode)
    const blendedRgb = hsbToRgb(blendResult.blended.h, blendResult.blended.s, blendResult.blended.b)
    const cssMid = `rgb(${blendedRgb.r}, ${blendedRgb.g}, ${blendedRgb.b})`
    return `linear-gradient(135deg in oklab, ${css1} 0%, ${cssMid} 50%, ${css2} 100%)`
  }

  // Simple two-stop gradient for non-dual-tone
  return `linear-gradient(135deg in oklab, ${css1} 0%, ${css2} 100%)`
}

export const hsbToCSS = (color: { h: number; s: number; b: number }): string => {
  const rgb = hsbToRgb(color.h, color.s, color.b)
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
}

export const hsbToHex = (h: number, s: number, b: number): string => {
  const rgb = hsbToRgb(h, s, b)
  return `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`
}

/**
 * Normalizes variations in color/paint type strings (e.g. space/hyphen differences,
 * spelling differences like fibre vs fiber, and unrecognized casing).
 */
export const normalizeColorType = (type?: string): string => {
  if (!type) return 'normal'
  let t = type.toLowerCase().trim()

  // Normalize spelling: fibre -> fiber
  t = t.replace(/fibre/g, 'fiber')

  // Normalize space/hyphen/separators for two-tone
  t = t.replace(/two\s+tone/g, 'two-tone')
  t = t.replace(/two-tone\s+/g, 'two-tone-') // e.g. "two-tone polished"

  // Normalize semi-gloss
  t = t.replace(/semi\s+gloss/g, 'semigloss')
  t = t.replace(/semi-gloss/g, 'semigloss')

  // Normalize brushed/brushed aluminum
  if (t.includes('brushed') || t.includes('aluminum')) {
    if (t.includes('matte')) return 'matte'
    if (t.includes('semigloss')) return 'semigloss'
    return 'metallic'
  }

  return t
}

export const getAdvancedMaterialStyle = (
  color1: { h: number; s: number; b: number },
  color2?: { h: number; s: number; b: number } | null,
  colorType?: string
): { backgroundColor: string; backgroundImage: string } => {
  const c1 = color1 || { h: 0, s: 0, b: 0 }
  const hex1 = hsbToHex(c1.h, c1.s, c1.b)

  let hex2 = hex1
  if (color2) {
    hex2 = hsbToHex(color2.h, color2.s, color2.b)
  }

  const type = normalizeColorType(colorType)

  // 1. MATTE & TWO-TONE MATTE
  if (type.includes('matte')) {
    return {
      backgroundColor: hex1,
      backgroundImage: `radial-gradient(circle at 50% 30%, ${hex2} 0%, transparent 75%), linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.3) 100%)`,
    }
  }

  // 2. WEAVES & PATTERNS: CARBON FIBER & KEVLAR
  else if (type.includes('carbon') || type.includes('kevlar')) {
    const isGlossy = type.includes('polished') || !type.includes('matte')
    const highlight = isGlossy ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.05)'
    return {
      backgroundColor: hex1,
      backgroundImage: `radial-gradient(circle at 40% 30%, ${highlight} 0%, transparent 70%), repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.4) 3px, rgba(0,0,0,0.4) 6px), repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(0,0,0,0.4) 3px, rgba(0,0,0,0.4) 6px)`,
    }
  }

  // 3. STRUCTURED PATTERNS: DAMASCUS STEEL
  else if (type.includes('damascus')) {
    return {
      backgroundColor: hex1,
      backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 80%), repeating-linear-gradient(135deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px, transparent 4px, transparent 8px), repeating-linear-gradient(45deg, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 2px, transparent 2px, transparent 6px)`,
    }
  }

  // 4. DUAL-TONE: METAL FLAKE, TWO-TONE, PEARLESCENT — Uses FH6 saturation-driven blending
  else if (isDualTonePaint(colorType)) {
    const model = getMaterialModel(colorType)
    const blendResult = blendDualToneFH6(c1, color2 || c1, model.blendMode)
    const blendedHex = hsbToHex(blendResult.blended.h, blendResult.blended.s, blendResult.blended.b)

    // Specular highlight intensity based on saturation dominance
    const specIntensity = blendResult.specularIntensity
    const specColor = specIntensity > 0.5
      ? `rgba(255,255,255,${0.3 + specIntensity * 0.5}) 0%, rgba(255,255,255,${0.05 + specIntensity * 0.1}) 12%, transparent 20%`
      : `rgba(255,255,255,${0.2}) 0%, rgba(255,255,255,0.05) 12%, transparent 20%`

    return {
      backgroundColor: blendedHex,
      backgroundImage: `radial-gradient(ellipse at 40% 35%, ${hex2} 0%, transparent 65%), linear-gradient(105deg, ${specColor}), radial-gradient(circle at 50% 150%, rgba(0,0,0,0.8) 0%, transparent 80%)`,
    }
  }

  // 5. METALLIC, CHROME, SEMIGLOSS, POLISHED (may also be matched by isDualTonePaint, but catch non-dual-tone variants)
  else if (
    type.includes('chrome') ||
    type.includes('metallic') ||
    type.includes('semigloss') ||
    type.includes('polished')
  ) {
    const isChrome = type.includes('chrome')
    const specularHighlight = isChrome ? 'rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.2) 8%, transparent 15%' : 'rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 12%, transparent 20%'
    return {
      backgroundColor: hex1,
      backgroundImage: `radial-gradient(ellipse at 40% 35%, ${hex2} 0%, transparent 65%), linear-gradient(105deg, ${specularHighlight}), radial-gradient(circle at 50% 150%, rgba(0,0,0,0.8) 0%, transparent 80%)`,
    }
  }

  // 5. NORMAL (Standard Gloss)
  else {
    return {
      backgroundColor: hex1,
      backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 15%, transparent 22%), linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.5) 100%)`,
    }
  }
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
