/**
 * lib/utils/colorBlending.ts
 *
 * FH6 Dual-Tone Color Blending Engine
 *
 * Based on Forza Horizon's layered BRDF approach and community research:
 * - Base Color = absorptive/lowlight layer (visible in shadows/ambient)
 * - Highlight Color = specular/flake layer (visible in direct light/glance angles)
 *
 * Saturation of each color determines blend coefficients and visual outcome:
 * - Higher saturation → more "weight" in the blend
 * - Low-saturation colors act as tints on high-saturation colors
 * - When both are low-saturation, the result is brightness-driven
 *
 * PBR Energy Conservation Rule (from Forza skill docs):
 *   Highlight brightness should generally be ≤ base brightness.
 *   Driving highlight saturation+brightness to 1.0 violates energy conservation.
 */

export type BlendMode =
  | 'metal-flake'
  | 'two-tone-polished'
  | 'two-tone-semigloss'
  | 'two-tone-matte'
  | 'pearlescent'
  | 'candy'
  | 'normal'

export interface ColorLayer {
  h: number
  s: number
  b: number
}

export interface BlendResult {
  /** Saturation-driven weight of the base color (0-1) */
  baseWeight: number
  /** Saturation-driven weight of the highlight color (0-1) */
  highlightWeight: number
  /** The final visually blended HSB color */
  blended: ColorLayer
  /** Per-channel dominance indicator */
  hueDominant: 'base' | 'highlight' | 'blend'
  satDominant: 'base' | 'highlight' | 'blend'
  briDominant: 'base' | 'highlight' | 'blend'
  /** Recommended material properties for this blend */
  roughness: number
  metalness: number
  clearcoat: number
  specularIntensity: number
}

/**
 * Linear interpolation
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/**
 * Circular linear interpolation for hue (handles 0↔1 wrap-around)
 */
function circularLerp(a: number, b: number, t: number): number {
  let diff = b - a
  if (diff > 0.5) diff -= 1
  if (diff < -0.5) diff += 1
  let result = a + diff * t
  if (result < 0) result += 1
  if (result > 1) result -= 1
  return result
}

/**
 * Calculate the shortest circular distance between two hue values [0, 1]
 */
export function hueDistance(a: number, b: number): number {
  const raw = Math.abs(a - b)
  return Math.min(raw, 1 - raw)
}

/**
 * Determine which color dominates the blend based on saturation.
 *
 * Core FH6 principle:
 * - Saturation = "chromatic confidence"
 * - A color with higher saturation retains its hue more strongly
 * - A color with very low saturation acts as a desaturating influence
 */
export function calculateBlendCoefficients(
  base: ColorLayer,
  highlight: ColorLayer
): { baseWeight: number; highlightWeight: number } {
  const totalSat = base.s + highlight.s

  // If both saturations are essentially zero, blend is 50/50
  if (totalSat < 0.001) {
    return { baseWeight: 0.5, highlightWeight: 0.5 }
  }

  // Saturation-weighted dominance
  let baseWeight = base.s / totalSat
  let highlightWeight = highlight.s / totalSat

  // Refinement: if one saturation is more than 3x the other,
  // the lower-sat color contributes minimally to hue
  if (base.s > highlight.s * 3 && base.s > 0.3) {
    baseWeight = Math.min(1, baseWeight + 0.15)
    highlightWeight = 1 - baseWeight
  } else if (highlight.s > base.s * 3 && highlight.s > 0.3) {
    highlightWeight = Math.min(1, highlightWeight + 0.15)
    baseWeight = 1 - highlightWeight
  }

  return { baseWeight, highlightWeight }
}

/**
 * Blend hue using saturation-weighted circular interpolation.
 *
 * When one color has dominant saturation, its hue pulls the result.
 */
export function blendHue(
  base: ColorLayer,
  highlight: ColorLayer,
  baseWeight: number,
  highlightWeight: number
): { hue: number; dominant: 'base' | 'highlight' | 'blend' } {
  // Check for saturation dominance
  if (base.s > highlight.s * 2 && base.s > 0.3) {
    return { hue: base.h, dominant: 'base' }
  }
  if (highlight.s > base.s * 2 && highlight.s > 0.3) {
    return { hue: highlight.h, dominant: 'highlight' }
  }

  // Circular weighted blend
  const hue = circularLerp(base.h, highlight.h, highlightWeight)
  return { hue, dominant: 'blend' }
}

/**
 * Blend saturation.
 *
 * FH6 behavior:
 * - The more saturated color pulls the result toward its saturation
 * - If either color is highly saturated (>0.7), the result is biased upward
 */
export function blendSaturation(
  base: ColorLayer,
  highlight: ColorLayer,
  baseWeight: number,
  highlightWeight: number
): { saturation: number; dominant: 'base' | 'highlight' | 'blend' } {
  let saturation = lerp(base.s, highlight.s, highlightWeight)

  // "Max boost": if either color is highly saturated, bias upward
  if (base.s > 0.7 || highlight.s > 0.7) {
    const maxSat = Math.max(base.s, highlight.s)
    saturation = Math.max(saturation, maxSat * 0.85)
  }

  // Clamp
  saturation = Math.max(0, Math.min(1, saturation))

  const dominant =
    base.s > highlight.s * 1.2 ? 'base' : highlight.s > base.s * 1.2 ? 'highlight' : 'blend'

  return { saturation, dominant }
}

/**
 * Blend brightness based on the material type / blend mode.
 *
 * FH6 behavior differs per paint type:
 * - Metal Flake: brightness pulled toward highlight (sparkle)
 * - Two-Tone Polished: weighted average with highlight boost
 * - Two-Tone Matte: stays close to base
 * - Pearlescent: subtle brightness shift
 * - Candy: deep base, bright highlight
 */
export function blendBrightness(
  base: ColorLayer,
  highlight: ColorLayer,
  baseWeight: number,
  highlightWeight: number,
  mode: BlendMode
): { brightness: number; dominant: 'base' | 'highlight' | 'blend' } {
  let brightness: number

  switch (mode) {
    case 'metal-flake':
      // Flake sparkle pulls brightness up significantly
      brightness = lerp(base.b, highlight.b, 0.6 + highlightWeight * 0.3)
      break

    case 'two-tone-polished':
      // Glossy two-tone: weighted average, highlight has moderate pull
      brightness = lerp(base.b, highlight.b, highlightWeight * 0.7)
      break

    case 'two-tone-semigloss':
      // Semigloss: more subtle highlight contribution
      brightness = lerp(base.b, highlight.b, highlightWeight * 0.5)
      break

    case 'two-tone-matte':
      // Matte: highlight barely affects brightness
      brightness = lerp(base.b, highlight.b, highlightWeight * 0.3)
      break

    case 'pearlescent':
      // Pearlescent: subtle shift
      brightness = lerp(base.b, highlight.b, highlightWeight * 0.4)
      break

    case 'candy':
      // Candy: deep base with bright highlight reflection
      brightness = lerp(base.b, highlight.b, 0.5 + highlightWeight * 0.4)
      break

    case 'normal':
    default:
      // Standard: weighted average
      brightness = lerp(base.b, highlight.b, highlightWeight)
      break
  }

  // Clamp
  brightness = Math.max(0, Math.min(1, brightness))

  const dominant =
    base.b > highlight.b * 1.15 ? 'base' : highlight.b > base.b * 1.15 ? 'highlight' : 'blend'

  return { brightness, dominant }
}

/**
 * Get material properties appropriate for the blend mode and colors.
 */
export function getBlendMaterialProps(
  mode: BlendMode,
  base: ColorLayer,
  highlight: ColorLayer
): {
  roughness: number
  metalness: number
  clearcoat: number
  specularIntensity: number
} {
  // Base material properties by mode
  const baseProps: Record<BlendMode, { roughness: number; metalness: number; clearcoat: number }> = {
    'metal-flake': { roughness: 0.25, metalness: 0.1, clearcoat: 1.0 },
    'two-tone-polished': { roughness: 0.08, metalness: 0.05, clearcoat: 1.0 },
    'two-tone-semigloss': { roughness: 0.40, metalness: 0.05, clearcoat: 0.1 },
    'two-tone-matte': { roughness: 0.90, metalness: 0.0, clearcoat: 0.0 },
    pearlescent: { roughness: 0.10, metalness: 0.05, clearcoat: 1.0 },
    candy: { roughness: 0.05, metalness: 0.1, clearcoat: 1.0 },
    normal: { roughness: 0.15, metalness: 0.0, clearcoat: 1.0 },
  }

  const baseP = baseProps[mode]

  // Specular intensity: driven by combined saturation
  const avgSat = (base.s + highlight.s) / 2
  const specularIntensity =
    avgSat > 0.7 ? 1.0 : avgSat > 0.4 ? 0.6 : avgSat > 0.2 ? 0.3 : 0.1

  return {
    roughness: baseP.roughness,
    metalness: baseP.metalness,
    clearcoat: baseP.clearcoat,
    specularIntensity,
  }
}

/**
 * Main FH6 dual-tone blending function.
 *
 * Takes two Forza HSB colors (base + highlight) and a blend mode,
 * and returns the saturation-driven blended result with material properties.
 */
export function blendDualToneFH6(
  base: ColorLayer,
  highlight: ColorLayer,
  mode: BlendMode = 'metal-flake'
): BlendResult {
  // Step 1: Calculate saturation-driven blend coefficients
  const { baseWeight, highlightWeight } = calculateBlendCoefficients(base, highlight)

  // Step 2: Blend hue
  const { hue, dominant: hueDominant } = blendHue(base, highlight, baseWeight, highlightWeight)

  // Step 3: Blend saturation
  const { saturation, dominant: satDominant } = blendSaturation(base, highlight, baseWeight, highlightWeight)

  // Step 4: Blend brightness (mode-dependent)
  const { brightness, dominant: briDominant } = blendBrightness(base, highlight, baseWeight, highlightWeight, mode)

  // Step 5: Get material properties
  const materialProps = getBlendMaterialProps(mode, base, highlight)

  return {
    baseWeight,
    highlightWeight,
    blended: {
      h: hue,
      s: saturation,
      b: brightness,
    },
    hueDominant,
    satDominant,
    briDominant,
    ...materialProps,
  }
}

/**
 * Convenience function: blend and get just the resulting HSB color.
 */
export function getBlendedHSB(
  base: ColorLayer,
  highlight: ColorLayer,
  mode: BlendMode = 'metal-flake'
): ColorLayer {
  return blendDualToneFH6(base, highlight, mode).blended
}

/**
 * For single-color paints (solid, matte, chrome, etc.), return the color directly
 * with appropriate material properties.
 */
export function getSingleColorProps(
  color: ColorLayer,
  roughness: number = 0.15,
  metalness: number = 0.0,
  clearcoat: number = 1.0
): {
  color: ColorLayer
  roughness: number
  metalness: number
  clearcoat: number
  specularIntensity: number
} {
  return {
    color,
    roughness,
    metalness,
    clearcoat,
    specularIntensity: color.s > 0.7 ? 1.0 : color.s > 0.4 ? 0.6 : color.s > 0.2 ? 0.3 : 0.1,
  }
}
