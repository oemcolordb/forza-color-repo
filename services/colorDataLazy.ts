/**
 * services/colorDataLazy.ts
 *
 * Color data loader. Loads color data from extracted_colors.json.
 *
 * Works on both client (browser) and server (Node.js).
 */

import { CarColor } from '../app/types'

// ─── Normalizer ────────────────────────────────────────────────────────────────
function normalizeEntry(raw: Record<string, unknown>): CarColor | null {
  const make = String(raw.make ?? raw.manufacturer ?? 'Unknown')
  const colorName = String(raw.colorName ?? raw.color_name ?? 'Unnamed')
  const colorType = String(raw.colorType ?? raw.paintType ?? raw.paint_type ?? 'Normal')
  const model = raw.model === null || raw.model === undefined ? '' : String(raw.model)
  const year = raw.year !== null && raw.year !== undefined
    ? typeof raw.year === 'number'
      ? raw.year
      : typeof raw.year === 'string' && raw.year.trim() !== '' && !Number.isNaN(Number(raw.year))
      ? Number(raw.year)
      : null
    : null

  const c1 = raw.color1 as Record<string, number> | null
  const c2 = (raw.color2 ?? raw.color1) as Record<string, number> | null

  if (!c1 || typeof c1.h !== 'number') return null
  if (colorName === '--' || colorName.trim() === '') return null

  return {
    make,
    colorName,
    colorType,
    model,
    year,
    color1: { h: c1.h, s: c1.s, b: c1.b },
    color2: c2 ? { h: c2.h, s: c2.s, b: c2.b } : { h: c1.h, s: c1.s, b: c1.b },
  }
}

// ─── Data Loading ──────────────────────────────────────────────────────────────

/**
 * Deduplicate color entries by make + colorName + year, preferring entries with
 * richer data (e.g. model info) or simply the first seen.
 */
function dedupeColors(colors: CarColor[]): CarColor[] {
  const seen = new Map<string, CarColor>()
  for (const c of colors) {
    const key = `${c.make}||${c.colorName}||${c.year ?? ''}`
    if (!seen.has(key)) {
      seen.set(key, c)
    }
  }
  return Array.from(seen.values())
}

/**
 * Loads color data from all available sources and merges them.
 * Returns a flat array of unique CarColor entries.
 */
export async function getColorData(): Promise<CarColor[]> {
  // ── Client-side (Browser) ──────────────────────────────────────────────────
  if (typeof window !== 'undefined') {
    const allColors: CarColor[] = []

    // Primary source: carColors.json in public/ (22k+ entries)
    try {
      const response = await fetch('/carColors.json')
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          allColors.push(
            ...data.map(entry => normalizeEntry(entry as Record<string, unknown>)).filter((c): c is CarColor => c !== null)
          )
        }
      }
    } catch (error) {
      console.error('Client-side carColors.json fetch failed:', error)
    }

    // Secondary source: extracted_colors.json (may have additional entries)
    try {
      const response = await fetch('/extracted_colors.json')
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          allColors.push(
            ...data.map(entry => normalizeEntry(entry as Record<string, unknown>)).filter((c): c is CarColor => c !== null)
          )
        }
      }
    } catch (error) {
      console.error('Client-side extracted_colors.json fetch failed:', error)
    }

    return dedupeColors(allColors)
  }

  // ── Server-side (Node.js) ──────────────────────────────────────────────────
  try {
    const fs = await import('fs')
    const path = await import('path')

    const allColors: CarColor[] = []

    // Primary source: carColors.json in public/
    const carColorsPath = path.join(process.cwd(), 'public', 'carColors.json')
    if (fs.existsSync(carColorsPath)) {
      try {
        const content = fs.readFileSync(carColorsPath, 'utf8')
        const data = JSON.parse(content)
        if (Array.isArray(data)) {
          allColors.push(
            ...data.map(entry => normalizeEntry(entry)).filter((c): c is CarColor => c !== null)
          )
        }
      } catch (e) {
        console.error(`Failed to parse ${carColorsPath}:`, e)
      }
    }

    // Secondary source: extracted_colors.json at project root
    const extractedPath = path.join(process.cwd(), 'extracted_colors.json')
    if (fs.existsSync(extractedPath)) {
      try {
        const content = fs.readFileSync(extractedPath, 'utf8')
        const data = JSON.parse(content)
        if (Array.isArray(data)) {
          allColors.push(
            ...data.map(entry => normalizeEntry(entry)).filter((c): c is CarColor => c !== null)
          )
        }
      } catch (e) {
        console.error(`Failed to parse ${extractedPath}:`, e)
      }
    }

    return dedupeColors(allColors)
  } catch (error) {
    console.error('Server-side color load failed:', error)
    return []
  }
}
