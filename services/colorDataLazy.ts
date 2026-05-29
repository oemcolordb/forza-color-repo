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
  const model = raw.model != null ? String(raw.model) : ''
  const year = raw.year != null
    ? typeof raw.year === 'number'
      ? raw.year
      : typeof raw.year === 'string' && raw.year.trim() !== '' && !Number.isNaN(Number(raw.year))
      ? Number(raw.year)
      : null
    : null

  let c1 = raw.color1 as Record<string, number> | null
  let c2 = (raw.color2 ?? raw.color1) as Record<string, number> | null

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
 * Loads color data. Returns a flat array of CarColor entries.
 */
export async function getColorData(): Promise<CarColor[]> {
  // ── Client-side (Browser) ──────────────────────────────────────────────────
  if (typeof window !== 'undefined') {
    try {
      // Load from the main extracted_colors.json at root
      const response = await fetch('/extracted_colors.json')
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      return Array.isArray(data)
        ? data.map(entry => normalizeEntry(entry as Record<string, unknown>)).filter((c): c is CarColor => c !== null)
        : []
    } catch (error) {
      console.error('Client-side color fetch failed:', error)
      return []
    }
  }

  // ── Server-side (Node.js) ──────────────────────────────────────────────────
  try {
    const fs = await import('fs')
    const path = await import('path')

    // Load from extracted_colors.json at project root
    const dataPath = path.join(process.cwd(), 'extracted_colors.json')

    if (fs.existsSync(dataPath)) {
      try {
        const content = fs.readFileSync(dataPath, 'utf8')
        const data = JSON.parse(content)
        const entries = Array.isArray(data) ? data : []
        return entries
          .map(entry => normalizeEntry(entry))
          .filter((c): c is CarColor => c !== null)
      } catch (e) {
        console.error(`Failed to parse ${dataPath}:`, e)
      }
    }

    return []
  } catch (error) {
    console.error('Server-side color load failed:', error)
    return []
  }
}
