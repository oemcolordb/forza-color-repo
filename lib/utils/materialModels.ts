/**
 * lib/utils/materialModels.ts
 *
 * Material Model Definitions for Forza Horizon Paint Types
 *
 * Each model defines:
 * - Physical rendering parameters (roughness, metalness, clearcoat)
 * - How dual colors (base + highlight) map to the BRDF layers
 * - Special effects (flakes, weave, anisotropy)
 * - The appropriate FH6 blend mode for dual-tone colors
 *
 * Reference: Forza Horizon 5 Color Math Skill documentation
 */

import { BlendMode } from './colorBlending'

/**
 * Paint category classification
 */
export type PaintCategory =
  | 'solid'
  | 'gloss'
  | 'matte'
  | 'semigloss'
  | 'metallic'
  | 'metal-flake'
  | 'two-tone'
  | 'pearlescent'
  | 'chrome'
  | 'candy'
  | 'carbon-fiber'
  | 'kevlar'
  | 'damascus'
  | 'polished'
  | 'brushed'
  | 'special'

/**
 * How dual colors map to the material's BRDF layers
 */
export interface DualColorMapping {
  /** Which color feeds the specular reflection */
  specularFrom: 'base' | 'highlight' | 'blended'
  /** Which color feeds the sheen layer */
  sheenFrom: 'base' | 'highlight' | 'blended'
  /** Whether clearcoat gets a tint from a color */
  clearcoatTint: 'base' | 'highlight' | 'none'
}

/**
 * Full material model definition
 */
export interface MaterialModel {
  /** Unique identifier */
  id: string
  /** Human-readable name */
  name: string
  /** Category grouping */
  category: PaintCategory
  /** FH6 blend mode for dual-tone rendering */
  blendMode: BlendMode
  /** Whether this material always uses dual-color blending */
  isDualTone: boolean
  /** Base physical parameters */
  baseRoughness: number
  baseMetalness: number
  baseClearcoat: number
  baseClearcoatRoughness: number
  /** How dual colors map to BRDF layers */
  dualColorMapping: DualColorMapping
  /** Special effects */
  hasFlakes: boolean
  hasWeave: boolean
  isAnisotropic: boolean
  /** Optional: CSS gradient hint for 2D swatch rendering */
  cssHint?: 'metallic' | 'matte' | 'gloss' | 'chrome' | 'carbon' | 'damascus'
}

/**
 * All Forza paint material models.
 *
 * Each model is derived from:
 * 1. Forza Horizon 5 game behavior (observed)
 * 2. PBR energy conservation rules (from skill docs)
 * 3. Real-world paint physics
 */
export const MATERIAL_MODELS: Record<string, MaterialModel> = {
  'solid': {
    id: 'solid',
    name: 'Solid',
    category: 'solid',
    blendMode: 'normal',
    isDualTone: false,
    baseRoughness: 0.15,
    baseMetalness: 0.0,
    baseClearcoat: 1.0,
    baseClearcoatRoughness: 0.05,
    dualColorMapping: { specularFrom: 'base', sheenFrom: 'base', clearcoatTint: 'none' },
    hasFlakes: false,
    hasWeave: false,
    isAnisotropic: false,
    cssHint: 'gloss',
  },
  'gloss': {
    id: 'gloss',
    name: 'Gloss',
    category: 'gloss',
    blendMode: 'normal',
    isDualTone: false,
    baseRoughness: 0.05,
    baseMetalness: 0.1,
    baseClearcoat: 1.0,
    baseClearcoatRoughness: 0.02,
    dualColorMapping: { specularFrom: 'base', sheenFrom: 'base', clearcoatTint: 'none' },
    hasFlakes: false,
    hasWeave: false,
    isAnisotropic: false,
    cssHint: 'gloss',
  },
  'matte': {
    id: 'matte',
    name: 'Matte',
    category: 'matte',
    blendMode: 'normal',
    isDualTone: false,
    baseRoughness: 0.95,
    baseMetalness: 0.0,
    baseClearcoat: 0.0,
    baseClearcoatRoughness: 1.0,
    dualColorMapping: { specularFrom: 'base', sheenFrom: 'base', clearcoatTint: 'none' },
    hasFlakes: false,
    hasWeave: false,
    isAnisotropic: false,
    cssHint: 'matte',
  },
  'semigloss': {
    id: 'semigloss',
    name: 'Semigloss',
    category: 'semigloss',
    blendMode: 'two-tone-semigloss',
    isDualTone: false,
    baseRoughness: 0.45,
    baseMetalness: 0.0,
    baseClearcoat: 0.1,
    baseClearcoatRoughness: 0.3,
    dualColorMapping: { specularFrom: 'base', sheenFrom: 'base', clearcoatTint: 'none' },
    hasFlakes: false,
    hasWeave: false,
    isAnisotropic: false,
    cssHint: 'gloss',
  },
  'metallic': {
    id: 'metallic',
    name: 'Metallic',
    category: 'metallic',
    blendMode: 'two-tone-polished',
    isDualTone: true,
    baseRoughness: 0.20,
    baseMetalness: 0.65,
    baseClearcoat: 1.0,
    baseClearcoatRoughness: 0.05,
    dualColorMapping: { specularFrom: 'highlight', sheenFrom: 'highlight', clearcoatTint: 'none' },
    hasFlakes: true,
    hasWeave: false,
    isAnisotropic: false,
    cssHint: 'metallic',
  },
  'metal-flake': {
    id: 'metal-flake',
    name: 'Metal Flake',
    category: 'metal-flake',
    blendMode: 'metal-flake',
    isDualTone: true,
    baseRoughness: 0.25,
    baseMetalness: 0.1,
    baseClearcoat: 1.0,
    baseClearcoatRoughness: 0.15,
    dualColorMapping: { specularFrom: 'highlight', sheenFrom: 'highlight', clearcoatTint: 'base' },
    hasFlakes: true,
    hasWeave: false,
    isAnisotropic: false,
    cssHint: 'metallic',
  },
  'two-tone-polished': {
    id: 'two-tone-polished',
    name: 'Two-Tone Polished',
    category: 'two-tone',
    blendMode: 'two-tone-polished',
    isDualTone: true,
    baseRoughness: 0.08,
    baseMetalness: 0.05,
    baseClearcoat: 1.0,
    baseClearcoatRoughness: 0.0,
    dualColorMapping: { specularFrom: 'highlight', sheenFrom: 'highlight', clearcoatTint: 'none' },
    hasFlakes: false,
    hasWeave: false,
    isAnisotropic: false,
    cssHint: 'metallic',
  },
  'two-tone-semigloss': {
    id: 'two-tone-semigloss',
    name: 'Two-Tone Semigloss',
    category: 'two-tone',
    blendMode: 'two-tone-semigloss',
    isDualTone: true,
    baseRoughness: 0.40,
    baseMetalness: 0.05,
    baseClearcoat: 0.1,
    baseClearcoatRoughness: 0.2,
    dualColorMapping: { specularFrom: 'highlight', sheenFrom: 'highlight', clearcoatTint: 'none' },
    hasFlakes: false,
    hasWeave: false,
    isAnisotropic: false,
    cssHint: 'metallic',
  },
  'two-tone-matte': {
    id: 'two-tone-matte',
    name: 'Two-Tone Matte',
    category: 'two-tone',
    blendMode: 'two-tone-matte',
    isDualTone: true,
    baseRoughness: 0.90,
    baseMetalness: 0.0,
    baseClearcoat: 0.0,
    baseClearcoatRoughness: 1.0,
    dualColorMapping: { specularFrom: 'highlight', sheenFrom: 'base', clearcoatTint: 'none' },
    hasFlakes: false,
    hasWeave: false,
    isAnisotropic: false,
    cssHint: 'matte',
  },
  'pearlescent': {
    id: 'pearlescent',
    name: 'Pearlescent',
    category: 'pearlescent',
    blendMode: 'pearlescent',
    isDualTone: true,
    baseRoughness: 0.10,
    baseMetalness: 0.05,
    baseClearcoat: 1.0,
    baseClearcoatRoughness: 0.05,
    dualColorMapping: { specularFrom: 'highlight', sheenFrom: 'highlight', clearcoatTint: 'base' },
    hasFlakes: false,
    hasWeave: false,
    isAnisotropic: false,
    cssHint: 'metallic',
  },
  'chrome': {
    id: 'chrome',
    name: 'Chrome',
    category: 'chrome',
    blendMode: 'normal',
    isDualTone: false,
    baseRoughness: 0.0,
    baseMetalness: 1.0,
    baseClearcoat: 0.0,
    baseClearcoatRoughness: 0.0,
    dualColorMapping: { specularFrom: 'base', sheenFrom: 'base', clearcoatTint: 'none' },
    hasFlakes: false,
    hasWeave: false,
    isAnisotropic: false,
    cssHint: 'chrome',
  },
  'candy': {
    id: 'candy',
    name: 'Candy',
    category: 'candy',
    blendMode: 'candy',
    isDualTone: true,
    baseRoughness: 0.05,
    baseMetalness: 0.1,
    baseClearcoat: 1.0,
    baseClearcoatRoughness: 0.0,
    dualColorMapping: { specularFrom: 'highlight', sheenFrom: 'highlight', clearcoatTint: 'base' },
    hasFlakes: true,
    hasWeave: false,
    isAnisotropic: false,
    cssHint: 'metallic',
  },
  'carbon-fiber': {
    id: 'carbon-fiber',
    name: 'Carbon Fiber',
    category: 'carbon-fiber',
    blendMode: 'normal',
    isDualTone: false,
    baseRoughness: 0.6,
    baseMetalness: 0.2,
    baseClearcoat: 1.0,
    baseClearcoatRoughness: 0.1,
    dualColorMapping: { specularFrom: 'base', sheenFrom: 'base', clearcoatTint: 'none' },
    hasFlakes: false,
    hasWeave: true,
    isAnisotropic: false,
    cssHint: 'carbon',
  },
  'kevlar': {
    id: 'kevlar',
    name: 'Kevlar',
    category: 'kevlar',
    blendMode: 'normal',
    isDualTone: false,
    baseRoughness: 0.65,
    baseMetalness: 0.15,
    baseClearcoat: 0.8,
    baseClearcoatRoughness: 0.2,
    dualColorMapping: { specularFrom: 'base', sheenFrom: 'base', clearcoatTint: 'none' },
    hasFlakes: false,
    hasWeave: true,
    isAnisotropic: false,
    cssHint: 'carbon',
  },
  'damascus': {
    id: 'damascus',
    name: 'Damascus Steel',
    category: 'damascus',
    blendMode: 'normal',
    isDualTone: false,
    baseRoughness: 0.4,
    baseMetalness: 0.8,
    baseClearcoat: 0.5,
    baseClearcoatRoughness: 0.1,
    dualColorMapping: { specularFrom: 'base', sheenFrom: 'base', clearcoatTint: 'none' },
    hasFlakes: false,
    hasWeave: false,
    isAnisotropic: false,
    cssHint: 'damascus',
  },
  'polished': {
    id: 'polished',
    name: 'Polished',
    category: 'polished',
    blendMode: 'normal',
    isDualTone: false,
    baseRoughness: 0.08,
    baseMetalness: 0.9,
    baseClearcoat: 1.0,
    baseClearcoatRoughness: 0.0,
    dualColorMapping: { specularFrom: 'base', sheenFrom: 'base', clearcoatTint: 'none' },
    hasFlakes: false,
    hasWeave: false,
    isAnisotropic: false,
    cssHint: 'chrome',
  },
  'brushed': {
    id: 'brushed',
    name: 'Brushed',
    category: 'brushed',
    blendMode: 'normal',
    isDualTone: false,
    baseRoughness: 0.35,
    baseMetalness: 1.0,
    baseClearcoat: 0.0,
    baseClearcoatRoughness: 0.0,
    dualColorMapping: { specularFrom: 'base', sheenFrom: 'base', clearcoatTint: 'none' },
    hasFlakes: false,
    hasWeave: false,
    isAnisotropic: true,
    cssHint: 'chrome',
  },
}

/**
 * Normalize a color type string to a material model ID.
 *
 * Handles variations in spelling, casing, and formatting.
 */
export function normalizeToModelId(type?: string): string {
  if (!type) return 'solid'

  let t = type.toLowerCase().trim()

  // Normalize common variations
  t = t.replace(/fibre/g, 'fiber')
  t = t.replace(/two\s+tone/g, 'two-tone')
  t = t.replace(/semi\s+gloss/g, 'semigloss')
  t = t.replace(/semi-gloss/g, 'semigloss')

  // Map normalized strings to model IDs
  if (t.includes('two-tone') && t.includes('matte')) return 'two-tone-matte'
  if (t.includes('two-tone') && t.includes('semigloss') || t.includes('semi')) return 'two-tone-semigloss'
  if (t.includes('two-tone') && t.includes('polished')) return 'two-tone-polished'
  if (t.includes('two-tone')) return 'two-tone-polished'
  if (t.includes('metal flake') || t.includes('metal-flake')) return 'metal-flake'
  if (t.includes('carbon fiber') || t.includes('carbon-fiber') || t.includes('carbon')) return 'carbon-fiber'
  if (t.includes('kevlar')) return 'kevlar'
  if (t.includes('damascus')) return 'damascus'
  if (t.includes('pearl')) return 'pearlescent'
  if (t.includes('candy')) return 'candy'
  if (t.includes('chrome')) return 'chrome'
  if (t.includes('polished')) return 'polished'
  if (t.includes('brushed')) return 'brushed'
  if (t.includes('metallic')) return 'metallic'
  if (t.includes('gloss')) return 'gloss'
  if (t.includes('semigloss')) return 'semigloss'
  if (t.includes('matte')) return 'matte'

  return 'solid'
}

/**
 * Get the material model for a given color type string.
 *
 * @param colorType - The Forza color type (e.g., "Two-Tone Polished", "Metal Flake")
 * @returns The matching MaterialModel
 */
export function getMaterialModel(colorType?: string): MaterialModel {
  const modelId = normalizeToModelId(colorType)
  return MATERIAL_MODELS[modelId] || MATERIAL_MODELS['solid']
}

/**
 * Determine the paint finish category from a color type string.
 */
export function getPaintCategory(colorType?: string): PaintCategory {
  return getMaterialModel(colorType).category
}

/**
 * Check if a color type uses dual-tone blending.
 */
export function isDualTonePaint(colorType?: string): boolean {
  return getMaterialModel(colorType).isDualTone
}
