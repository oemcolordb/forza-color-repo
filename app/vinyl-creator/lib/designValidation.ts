/**
 * Design Validation Utilities
 * Validates vinyl designs for correctness and completeness
 */

import { VinylDesign, Shape } from '../types/vinyl'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate a complete vinyl design
 */
export function validateDesign(design: VinylDesign): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check basic properties
  if (!design.id) errors.push('Design must have an id')
  if (!design.name) errors.push('Design must have a name')
  if (!design.shapes || design.shapes.length === 0) errors.push('Design must have at least one shape')
  if (!design.buildOrder || design.buildOrder.length === 0) errors.push('Design must have a build order')

  // Check shapes
  if (design.shapes) {
    const shapeIds = new Set(design.shapes.map(s => s.id))
    const buildOrderIds = new Set(design.buildOrder)

    // Check for missing shapes in build order
    shapeIds.forEach(id => {
      if (!buildOrderIds.has(id)) {
        errors.push(`Shape ${id} is not in build order`)
      }
    })

    // Check for unknown shapes in build order
    buildOrderIds.forEach(id => {
      if (!shapeIds.has(id)) {
        errors.push(`Build order contains unknown shape ${id}`)
      }
    })

    // Check for duplicate IDs
    if (new Set(design.shapes.map(s => s.id)).size !== design.shapes.length) {
      errors.push('Duplicate shape IDs found')
    }

    // Validate individual shapes
    design.shapes.forEach(shape => {
      const shapeErrors = validateShape(shape)
      errors.push(...shapeErrors)
    })
  }

  // Check complexity
  if (!['simple', 'medium', 'complex'].includes(design.complexity)) {
    warnings.push(`Unknown complexity level: ${design.complexity}`)
  }

  // Warn about large designs
  if (design.shapes && design.shapes.length > 100) {
    warnings.push(`Design has ${design.shapes.length} shapes, which may impact performance`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validate an individual shape
 */
export function validateShape(shape: Shape): string[] {
  const errors: string[] = []

  if (!shape.id) errors.push('Shape must have an id')
  if (!shape.name) errors.push('Shape must have a name')
  if (!shape.role) errors.push('Shape must have a role')
  if (shape.layer === undefined || shape.layer === null) errors.push('Shape must have a layer')
  if (!shape.color) errors.push('Shape must have a color')
  if (!shape.pathData) errors.push('Shape must have pathData')
  if (!shape.transform) errors.push('Shape must have transform')
  if (shape.opacity === undefined || shape.opacity === null) errors.push('Shape must have opacity')

  // Validate color format
  if (shape.color && !isValidHexColor(shape.color)) {
    errors.push(`Invalid color format: ${shape.color}`)
  }

  // Validate opacity range
  if (shape.opacity !== undefined && (shape.opacity < 0 || shape.opacity > 1)) {
    errors.push(`Opacity must be between 0 and 1, got ${shape.opacity}`)
  }

  // Validate layer is non-negative
  if (shape.layer !== undefined && shape.layer < 0) {
    errors.push(`Layer must be non-negative, got ${shape.layer}`)
  }

  // Validate role
  const validRoles = ['base', 'accent', 'shadow', 'highlight', 'detail']
  if (shape.role && !validRoles.includes(shape.role)) {
    errors.push(`Invalid role: ${shape.role}. Must be one of: ${validRoles.join(', ')}`)
  }

  return errors
}

/**
 * Check if a string is a valid hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color)
}

/**
 * Generate optimal build order based on layers and roles
 */
export function generateOptimalBuildOrder(shapes: Shape[]): string[] {
  const rolePriority: Record<string, number> = {
    base: 0,
    shadow: 1,
    accent: 2,
    detail: 3,
    highlight: 4
  }

  return [...shapes]
    .sort((a, b) => {
      // Sort by layer first
      if (a.layer !== b.layer) {
        return a.layer - b.layer
      }
      // Then by role priority
      const aPriority = rolePriority[a.role] || 5
      const bPriority = rolePriority[b.role] || 5
      return aPriority - bPriority
    })
    .map(shape => shape.id)
}

/**
 * Calculate design statistics
 */
export function getDesignStats(design: VinylDesign) {
  const layers = new Set(design.shapes.map(s => s.layer))
  const roles = new Set(design.shapes.map(s => s.role))
  const colors = new Set(design.shapes.map(s => s.color))

  return {
    totalShapes: design.shapes.length,
    totalLayers: layers.size,
    totalRoles: roles.size,
    totalColors: colors.size,
    estimatedBuildTime: design.shapes.length, // 1 second per shape at 1x speed
    complexity: design.complexity,
    averageOpacity: design.shapes.reduce((sum, s) => sum + s.opacity, 0) / design.shapes.length
  }
}

/**
 * Find shapes by criteria
 */
export function findShapesByRole(shapes: Shape[], role: string): Shape[] {
  return shapes.filter(s => s.role === role)
}

/**
 * Find shapes by layer
 */
export function findShapesByLayer(shapes: Shape[], layer: number): Shape[] {
  return shapes.filter(s => s.layer === layer)
}

/**
 * Find shapes by color
 */
export function findShapesByColor(shapes: Shape[], color: string): Shape[] {
  return shapes.filter(s => s.color === color)
}

/**
 * Get unique values from shapes
 */
export function getUniqueValues(shapes: Shape[], property: keyof Shape): any[] {
  const values = new Set(shapes.map(s => s[property]))
  return Array.from(values).sort()
}
