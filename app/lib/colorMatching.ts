import { CarColor } from '../types'

/**
 * Calculate color distance using Delta E (CIE76) formula
 */
function colorDistance(color1: { h: number; s: number; b: number }, color2: { h: number; s: number; b: number }): number {
  const h1 = color1.h * 360
  const h2 = color2.h * 360
  const hDiff = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2))
  
  return Math.sqrt(
    Math.pow(hDiff / 360, 2) +
    Math.pow(color1.s - color2.s, 2) +
    Math.pow(color1.b - color2.b, 2)
  )
}

/**
 * Find closest matching colors from database
 */
export function findClosestColors(
  targetColor: { h: number; s: number; b: number },
  colors: CarColor[],
  limit: number = 5
): Array<{ color: CarColor; distance: number; similarity: number }> {
  const matches = colors.map(color => ({
    color,
    distance: colorDistance(targetColor, color.color1),
    similarity: 0
  }))

  matches.sort((a, b) => a.distance - b.distance)
  
  const closest = matches.slice(0, limit)
  const maxDistance = closest[closest.length - 1]?.distance || 1
  
  return closest.map(match => ({
    ...match,
    similarity: Math.round((1 - match.distance / maxDistance) * 100)
  }))
}

/**
 * Generate color difference preview data
 */
export function generateColorDiff(
  original: { h: number; s: number; b: number },
  matched: { h: number; s: number; b: number }
): {
  hDiff: number
  sDiff: number
  bDiff: number
  totalDiff: number
} {
  return {
    hDiff: Math.abs(original.h - matched.h) * 360,
    sDiff: Math.abs(original.s - matched.s) * 100,
    bDiff: Math.abs(original.b - matched.b) * 100,
    totalDiff: colorDistance(original, matched)
  }
}
