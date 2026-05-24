/**
 * services/colorDataLazy.ts
 *
 * Unified color data aggregator. Merges body colors, wheel colors,
 * and manufacturer colors from the app/data directory.
 *
 * Works on both client (browser) and server (Node.js).
 */

import { CarColor } from '../app/types';

// ─── Normalizer ────────────────────────────────────────────────────────────────
// Manufacturer-colors.json uses a different schema ({ make, colorName, paintType, color1, color2 })
// vs the main extracted colors ({ make, colorName, colorType, color1, color2 }).
// This normalizes both into the CarColor shape.
function normalizeEntry(raw: Record<string, unknown>): CarColor | null {
  const make = String(raw.make ?? raw.manufacturer ?? 'Unknown')
  const colorName = String(raw.colorName ?? raw.color_name ?? 'Unnamed')
  const colorType = String(raw.colorType ?? raw.paintType ?? raw.paint_type ?? 'Normal')
  const model = raw.model != null ? String(raw.model) : ''
  const year = raw.year != null ? Number(raw.year) : null

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
 * Loads and merges color data from all JSON databases.
 * Returns a flat array of CarColor entries.
 */
export async function getColorData(): Promise<CarColor[]> {
  // ── Client-side (Browser) ──────────────────────────────────────────────────
  if (typeof window !== 'undefined') {
    try {
      // Dynamic import so these don't get bundled into every page
      const [extracted, wheels, mfr] = await Promise.all([
        import('../app/data/master_database.json').then(m => m.default).catch(() => []),
        import('../app/data/wheel-colors.json').then(m => m.default).catch(() => []),
        import('../app/data/manufacturer-colors.json').then(m => m.default).catch(() => []),
      ])

      const all = [
        ...(Array.isArray(extracted) ? extracted : []),
        ...(Array.isArray(wheels) ? wheels : []),
        ...(Array.isArray(mfr) ? mfr : []),
      ]

      return all
        .map(entry => normalizeEntry(entry as Record<string, unknown>))
        .filter((c): c is CarColor => c !== null)
    } catch (error) {
      console.error('Client-side color fetch failed:', error)
      return []
    }
  }

  // ── Server-side (Node.js) ──────────────────────────────────────────────────
  try {
    const fs = await import('fs')
    const path = await import('path')

    const dataDir = path.join(process.cwd(), 'app', 'data')
    const fileNames = ['master_database.json', 'wheel-colors.json', 'manufacturer-colors.json']

    // Also check for extracted_colors.json at the project root (legacy location)
    const legacyPath = path.join(process.cwd(), 'extracted_colors.json')

    const results: CarColor[] = []

    for (const fileName of fileNames) {
      const filePath = path.join(dataDir, fileName)
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8')
          const data = JSON.parse(content)
          const entries = Array.isArray(data) ? data : []
          for (const entry of entries) {
            const normalized = normalizeEntry(entry)
            if (normalized) results.push(normalized)
          }
        } catch (e) {
          console.error(`Failed to parse ${filePath}:`, e)
        }
      }
    }

    // Legacy extracted_colors.json at root
    if (fs.existsSync(legacyPath)) {
      try {
        const content = fs.readFileSync(legacyPath, 'utf8')
        const data = JSON.parse(content)
        const entries = Array.isArray(data) ? data : []
        for (const entry of entries) {
          const normalized = normalizeEntry(entry)
          if (normalized) results.push(normalized)
        }
      } catch (e) {
        console.error(`Failed to parse ${legacyPath}:`, e)
      }
    }

    return results
  } catch (error) {
    console.error('Server-side color load failed:', error)
    return []
  }
}
