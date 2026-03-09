// Forza 5 Color Mixing Utilities
// Uses HSB (Hue, Saturation, Brightness) color space exclusively

/**
 * Convert HSB to CSS HSL for display
 * This matches Forza 5's color rendering system
 */
export function hsbToCSS(hsb) {
  const h = hsb.h * 360
  const s = hsb.s * 100
  const b = hsb.b * 100

  // Convert HSB to HSL for CSS
  const l = b - (s * b) / 200
  const sl = l === 0 || l === 100 ? 0 : ((b - l) / Math.min(l, 100 - l)) * 100

  return `hsl(${Math.round(h)}, ${Math.round(sl)}%, ${Math.round(l)}%)`
}

/**
 * Simple HSB color mixing - just blend the two colors
 */
export function mixForzaColors(color1, color2, ratio = 0.5) {
  // Simple linear interpolation in HSB space
  const hue1 = color1.h * 360
  const hue2 = color2.h * 360

  // Handle hue wrapping
  let hueDiff = hue2 - hue1
  if (hueDiff > 180) hueDiff -= 360
  if (hueDiff < -180) hueDiff += 360

  const mixedHue = (hue1 + hueDiff * ratio) % 360
  const mixedSat = color1.s * (1 - ratio) + color2.s * ratio
  const mixedBright = color1.b * (1 - ratio) + color2.b * ratio

  return {
    h: (mixedHue < 0 ? mixedHue + 360 : mixedHue) / 360,
    s: Math.max(0, Math.min(1, mixedSat)),
    b: Math.max(0, Math.min(1, mixedBright)),
  }
}

/**
 * Generate gradient or solid color based on color similarity
 */
export function createForzaGradient(color1, color2) {
  // Check if colors are essentially the same (normal color)
  const hueDiff = Math.abs(color1.h - color2.h)
  const satDiff = Math.abs(color1.s - color2.s)
  const brightDiff = Math.abs(color1.b - color2.b)

  // If colors are very similar, show as solid color
  if (hueDiff < 0.01 && satDiff < 0.01 && brightDiff < 0.01) {
    return hsbToCSS(color1)
  }

  // Otherwise create gradient
  return `linear-gradient(135deg, ${hsbToCSS(color1)}, ${hsbToCSS(color2)})`
}

/**
 * Get primary display color (Forza 5 uses color1 as primary)
 */
export function getPrimaryColor(color1, color2) {
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
 * Format HSB values for display (Forza Horizon 5 format)
 * Shows decimal values as stored in the JSON
 */
export function formatHSBValues(hsb) {
  return `${hsb.h.toFixed(2)}, ${hsb.s.toFixed(2)}, ${hsb.b.toFixed(2)}`
}
