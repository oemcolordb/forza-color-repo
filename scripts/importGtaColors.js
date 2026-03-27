'use strict'
/**
 * importGtaColors.js
 * Fetches color data from gtacolors.com/include/colors (free JSON API),
 * converts hex → HSB, maps to carColors.json schema, deduplicates, and writes.
 *
 * Usage:
 *   node scripts/importGtaColors.js           # live run
 *   node scripts/importGtaColors.js --dry-run # preview only, no file write
 *   node scripts/importGtaColors.js --local   # use cached _gta_colors_raw.json
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

const COLORS_ENDPOINT = 'https://gtacolors.com/include/colors'
const CAR_COLORS_PATH = path.join(__dirname, '..', 'carColors.json')
const LOCAL_CACHE = path.join(__dirname, '_gta_colors_raw.json')

const DRY_RUN = process.argv.includes('--dry-run')
const USE_LOCAL = process.argv.includes('--local')

// ── Hex → HSB conversion ────────────────────────────────────────────────────
function hexToHsb(hex) {
  hex = hex.replace('#', '')
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
  const r = parseInt(hex.slice(0, 2), 16) / 255
  const g = parseInt(hex.slice(2, 4), 16) / 255
  const b = parseInt(hex.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min

  let h = 0
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h = Math.round(h * 60)
    if (h < 0) h += 360
  }

  const s = max === 0 ? 0 : Math.round((d / max) * 100)
  const v = Math.round(max * 100)
  return { h, s, b: v }
}

// ── Guess color type from name/pearlescent ──────────────────────────────────
function guessColorType(colorName, pearlescent) {
  const name = (colorName + ' ' + pearlescent).toLowerCase()
  if (name.includes('pearl') || (pearlescent && pearlescent.trim() !== '')) return 'Pearl'
  if (name.includes('metallic') || name.includes('metal')) return 'Metallic'
  if (name.includes('matte') || name.includes('flat ') || name.includes(' flat')) return 'Matte'
  if (name.includes('chrome') || name.includes('satin') || name.includes('special')) return 'Special'
  return 'Normal'
}

// ── Normalise manufacturer name ─────────────────────────────────────────────
function normaliseMake(raw) {
  return raw.trim()
}

// ── Fetch JSON from API ─────────────────────────────────────────────────────
function fetchColors() {
  return new Promise((resolve, reject) => {
    https.get(
      COLORS_ENDPOINT,
      { headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' } },
      (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} from ${COLORS_ENDPOINT}`))
          res.resume()
          return
        }
        let body = ''
        res.on('data', c => (body += c))
        res.on('end', () => {
          try {
            resolve(JSON.parse(body))
          } catch (e) {
            reject(new Error('Failed to parse JSON: ' + e.message))
          }
        })
      }
    ).on('error', reject)
  })
}

// ── Build dedup key ─────────────────────────────────────────────────────────
function dedupKey(entry) {
  return `${entry.make}|${entry.colorName}`.toLowerCase()
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  // 1. Load existing colors
  const existing = JSON.parse(fs.readFileSync(CAR_COLORS_PATH, 'utf8'))
  const existingKeys = new Set(existing.map(dedupKey))
  console.log(`Existing colors: ${existing.length}`)

  // 2. Fetch / load GTA colors
  let gtaRaw
  if (USE_LOCAL && fs.existsSync(LOCAL_CACHE)) {
    console.log('Using local cache:', LOCAL_CACHE)
    gtaRaw = JSON.parse(fs.readFileSync(LOCAL_CACHE, 'utf8'))
  } else {
    console.log('Fetching from', COLORS_ENDPOINT, '...')
    gtaRaw = await fetchColors()
    // Cache for re-runs
    fs.writeFileSync(LOCAL_CACHE, JSON.stringify(gtaRaw, null, 2))
    console.log(`Downloaded ${gtaRaw.length} colors (cached to ${LOCAL_CACHE})`)
  }

  console.log(`GTA source colors: ${gtaRaw.length}`)

  // 3. Convert & deduplicate
  const newEntries = []
  let skipped = 0

  for (const item of gtaRaw) {
    if (!item.hex || !item.hex.startsWith('#')) {
      skipped++
      continue
    }

    const make = normaliseMake(item.manufacturer || 'Unknown')
    const colorName = (item.color || '').trim()
    const pearlescent = (item.pearlescent || '').trim()

    if (!colorName) { skipped++; continue }

    const colorType = guessColorType(colorName, pearlescent)
    const hsb1 = hexToHsb(item.hex)

    // color2 = pearlescent hex if present, else same as color1
    let hsb2 = { ...hsb1 }
    // pearlescent on gtacolors is a name, not a hex — use same hsb with slight brightness bump
    // (accurate hex for pearl layer is not available; this is cosmetic)
    if (pearlescent && colorType === 'Pearl') {
      hsb2 = { h: hsb1.h, s: Math.max(0, hsb1.s - 10), b: Math.min(100, hsb1.b + 5) }
    }

    const entry = {
      make,
      model: 'All Models',
      year: null,
      colorName,
      colorType,
      color1: hsb1,
      color2: hsb2,
    }

    const key = dedupKey(entry)
    if (existingKeys.has(key)) {
      skipped++
    } else {
      newEntries.push(entry)
      existingKeys.add(key)
    }
  }

  console.log(`\nNew colors to add:  ${newEntries.length}`)
  console.log(`Skipped (dup/invalid): ${skipped}`)

  // 4. Preview sample
  console.log('\nSample (first 5 new):')
  newEntries.slice(0, 5).forEach(e =>
    console.log(`  [${e.make}] ${e.colorName} (${e.colorType}) → HSB(${e.color1.h},${e.color1.s},${e.color1.b})`)
  )

  if (DRY_RUN) {
    console.log('\n[DRY-RUN] No changes written.')
    return
  }

  // 5. Write merged file
  const merged = [...existing, ...newEntries]
  fs.writeFileSync(CAR_COLORS_PATH, JSON.stringify(merged, null, 2))
  console.log(`\nWrote ${merged.length} entries to carColors.json (+${newEntries.length} new)`)
}

main().catch(e => { console.error(e); process.exit(1) })
