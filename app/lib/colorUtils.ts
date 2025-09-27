// Forza 5 Color Mixing Utilities
// Uses HSB (Hue, Saturation, Brightness) color space exclusively

export interface HSBColor {
  h: number // 0-1
  s: number // 0-1  
  b: number // 0-1
}

/**
 * Convert HSB to CSS HSL for display
 * This matches Forza 5's color rendering system
 */
export function hsbToCSS(hsb: HSBColor): string {
  const h = Math.round(hsb.h * 360)
  const s = Math.round(hsb.s * 100)
  const b = Math.round(hsb.b * 100)
  
  // Convert HSB to HSL for CSS
  const l = b * (1 - s / 200)
  const sl = l === 0 || l === 1 ? 0 : (b - l) / Math.min(l, 1 - l) * 100
  
  return `hsl(${h}, ${Math.round(sl)}%, ${Math.round(l)}%)`
}

/**
 * Forza 5 color mixing algorithm
 * Mixes two HSB colors using Forza's specific blending method
 */
export function mixForzaColors(color1: HSBColor, color2: HSBColor, ratio: number = 0.5): HSBColor {
  // Forza 5 uses weighted average in HSB space with special hue handling
  const hue1 = color1.h * 360
  const hue2 = color2.h * 360
  
  // Handle hue wrapping (shortest path around color wheel)
  let hueDiff = hue2 - hue1
  if (hueDiff > 180) hueDiff -= 360
  if (hueDiff < -180) hueDiff += 360
  
  const mixedHue = (hue1 + hueDiff * ratio) % 360
  const mixedSat = color1.s * (1 - ratio) + color2.s * ratio
  const mixedBright = color1.b * (1 - ratio) + color2.b * ratio
  
  return {
    h: mixedHue / 360,
    s: Math.max(0, Math.min(1, mixedSat)),
    b: Math.max(0, Math.min(1, mixedBright))
  }
}

/**
 * Generate Forza 5 style gradient using proper color mixing
 */
export function createForzaGradient(color1: HSBColor, color2: HSBColor): string {
  // Create multiple color stops for smooth Forza-style blending
  const stops = []
  for (let i = 0; i <= 4; i++) {
    const ratio = i / 4
    const mixedColor = mixForzaColors(color1, color2, ratio)
    stops.push(`${hsbToCSS(mixedColor)} ${ratio * 100}%`)
  }
  
  return `linear-gradient(135deg, ${stops.join(', ')})`
}

/**
 * Get primary display color (Forza 5 uses color1 as primary)
 */
export function getPrimaryColor(color1: HSBColor, color2: HSBColor): string {
  // In Forza 5, if colors are very similar, use color1
  // Otherwise, use a 70/30 mix favoring color1
  const hueDiff = Math.abs(color1.h - color2.h)
  const satDiff = Math.abs(color1.s - color2.s)
  const brightDiff = Math.abs(color1.b - color2.b)
  
  if (hueDiff < 0.05 && satDiff < 0.1 && brightDiff < 0.1) {
    return hsbToCSS(color1)
  }
  
  const primaryMix = mixForzaColors(color1, color2, 0.3)
  return hsbToCSS(primaryMix)
}

/**
 * Format HSB values for display (no RGB conversion)
 */
export function formatHSBValues(hsb: HSBColor): string {
  const h = Math.round(hsb.h * 360)
  const s = Math.round(hsb.s * 100)
  const b = Math.round(hsb.b * 100)
  return `H:${h}° S:${s}% B:${b}%`
}