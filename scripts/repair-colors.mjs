/**
 * repair-colors.mjs
 * Fixes carColors.json:
 *   1. Out-of-range hue (stored in degrees 0-360 → normalize to 0-1)
 *   2. All-zero color1 (h=s=b=0) — infer from colorName keywords
 *   3. Null color2 — fill from color1 with finish-appropriate variation
 *   4. All-zero color2 — same treatment as null color2
 *   5. Deduplicate by make+colorName (keep most complete entry)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const FILE = path.join(ROOT, 'app', 'data', 'carColors.json')
const AUDIT_FILE = path.join(ROOT, 'app', 'data', 'scrape-audit.json')

const raw = fs.readFileSync(FILE, 'utf8')
const data = JSON.parse(raw)

const log = []
let fixedHue = 0,
  fixedZeroC1 = 0,
  fixedNullC2 = 0,
  fixedZeroC2 = 0,
  removedDupes = 0

// ─────────────────────────────────────────────────────────────
// 1. FIX OUT-OF-RANGE HUE (degrees → normalized)
// ─────────────────────────────────────────────────────────────
for (const e of data) {
  for (const key of ['color1', 'color2']) {
    if (!e[key]) continue
    const c = e[key]
    // Hue stored in degrees (> 1)
    if (c.h > 1 && c.h <= 360) {
      const orig = c.h
      c.h = parseFloat((c.h / 360).toFixed(4))
      log.push(`[HUE-FIX] ${e.make} "${e.colorName}" ${key}.h: ${orig} → ${c.h}`)
      if (key === 'color1') fixedHue++
    }
    // Clamp any remaining out-of-range values
    c.h = Math.max(0, Math.min(1, c.h))
    c.s = Math.max(0, Math.min(1, c.s))
    c.b = Math.max(0, Math.min(1, c.b))
  }
}

// ─────────────────────────────────────────────────────────────
// 2. KEYWORD → HSB INFERENCE MAP for zeroed color1
// These are FH5-calibrated dark/near-black values based on in-game palettes.
// The PDF parser zeroed these out; we restore them from colorName semantics.
// ─────────────────────────────────────────────────────────────
function round3(n) {
  return parseFloat(n.toFixed(3))
}

/**
 * Infer HSB from a color name.
 * Returns { h, s, b } normalized 0–1, or null if no confident match.
 */
function inferHSBFromName(colorName, colorType) {
  const n = colorName.toLowerCase()
  const isFlake = /metal\s*flake|metallic|flake/i.test(colorType)
  const isPearl = /pearl|pearlescent/i.test(colorType)
  const isTwoTone = /two.?tone/i.test(colorType)

  // ── blacks ──
  if (
    /nero|black|schwarz|noir|negro|noire|matte black|carbon black|onyx|obsidian|ebony|raven|nightshade|midnight|phantom|shadow|dark knight|anthracite(?!.*blue)|stealth/.test(
      n
    )
  ) {
    if (/carbon/.test(n)) return { h: round3(0.575), s: round3(0.12), b: round3(0.07) }
    if (/anthracite/.test(n)) return { h: round3(0.6), s: round3(0.08), b: round3(0.08) }
    if (/midnight/.test(n)) return { h: round3(0.62), s: round3(0.18), b: round3(0.05) }
    if (/phantom|shadow|raven/.test(n)) return { h: 0, s: round3(0.06), b: round3(0.04) }
    if (/onyx|obsidian|ebony/.test(n)) return { h: 0, s: round3(0.04), b: round3(0.03) }
    if (isFlake) return { h: 0, s: round3(0.08), b: round3(0.06) }
    if (isPearl) return { h: 0, s: round3(0.05), b: round3(0.07) }
    if (isTwoTone) return { h: 0, s: round3(0.06), b: round3(0.05) }
    return { h: 0, s: round3(0.03), b: round3(0.03) }
  }

  // ── dark blues / blue-blacks ──
  if (/midnight blue|deep blue|dark blue|navy/.test(n)) {
    return { h: round3(0.63), s: round3(0.65), b: round3(0.18) }
  }
  if (/blu notte|blu profondo/.test(n)) {
    return { h: round3(0.62), s: round3(0.72), b: round3(0.14) }
  }

  // ── dark reds / dark maroons ──
  if (/dark red|maroon|rosso scuro|bordeaux|burgundy|deep red/.test(n)) {
    return { h: round3(0.0), s: round3(0.82), b: round3(0.18) }
  }

  // ── dark greens ──
  if (/dark green|british racing green|brg|forest green|deep green|verde oscuro/.test(n)) {
    return { h: round3(0.35), s: round3(0.75), b: round3(0.15) }
  }

  // ── dark grays / charcoal ──
  if (/charcoal|dark grey|dark gray|grigio scuro|gris sombre/.test(n)) {
    return { h: 0, s: round3(0.04), b: round3(0.14) }
  }

  // fallback for remaining zero-HSB: very dark near-black
  return { h: 0, s: round3(0.03), b: round3(0.04) }
}

for (const e of data) {
  if (!e.color1) continue
  if (e.color1.h === 0 && e.color1.s === 0 && e.color1.b === 0) {
    const inferred = inferHSBFromName(e.colorName, e.colorType || '')
    log.push(
      `[ZERO-C1] ${e.make} "${e.colorName}" (${e.colorType}) → h:${inferred.h} s:${inferred.s} b:${inferred.b}`
    )
    e.color1 = inferred
    fixedZeroC1++
  }
}

// ─────────────────────────────────────────────────────────────
// 3. FILL NULL / ALL-ZERO color2
// For most finishes color2 = color1 with a slight variation to
// represent the shadow/highlight side of the paint.
// ─────────────────────────────────────────────────────────────
function deriveColor2(c1, colorType) {
  const t = (colorType || '').toLowerCase()
  let { h, s, b } = c1

  if (/metal\s*flake|metallic|flake/.test(t)) {
    // slightly darker + a tiny hue shift for metallic depth
    return { h: round3(h), s: round3(Math.min(1, s + 0.04)), b: round3(Math.max(0, b - 0.05)) }
  }
  if (/pearl|pearlescent/.test(t)) {
    // pearl shifts hue slightly and brightens
    return {
      h: round3((h + 0.03) % 1),
      s: round3(Math.max(0, s - 0.06)),
      b: round3(Math.min(1, b + 0.04)),
    }
  }
  if (/chrome/.test(t)) {
    // chrome has strong highlight contrast
    return { h: round3(h), s: round3(Math.max(0, s - 0.12)), b: round3(Math.min(1, b + 0.15)) }
  }
  if (/two.?tone/.test(t)) {
    // second tone can be a significant brightness shift
    return { h: round3(h), s: round3(s), b: round3(Math.max(0, b - 0.1)) }
  }
  if (/matte/.test(t)) {
    return { h: round3(h), s: round3(Math.min(1, s + 0.02)), b: round3(Math.max(0, b - 0.02)) }
  }
  // normal / default — mirror exactly
  return { h: round3(h), s: round3(s), b: round3(b) }
}

for (const e of data) {
  if (!e.color1) continue
  const c2Missing = !e.color2
  const c2Zero = e.color2 && e.color2.h === 0 && e.color2.s === 0 && e.color2.b === 0
  if (c2Missing || c2Zero) {
    e.color2 = deriveColor2(e.color1, e.colorType || '')
    if (c2Missing) {
      log.push(`[NULL-C2] ${e.make} "${e.colorName}" → derived color2 ${JSON.stringify(e.color2)}`)
      fixedNullC2++
    } else {
      log.push(`[ZERO-C2] ${e.make} "${e.colorName}" → derived color2 ${JSON.stringify(e.color2)}`)
      fixedZeroC2++
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 4. DEDUPLICATE — keep the most complete entry (most non-null fields)
// Composite key: make + colorName (case-insensitive)
// ─────────────────────────────────────────────────────────────
function completeness(e) {
  let score = 0
  if (e.model && e.model.trim()) score++
  if (e.year) score++
  if (e.colorType && e.colorType.trim()) score++
  if (e.color1) score += 3
  if (e.color2) score += 2
  return score
}

const seen = new Map()
for (const e of data) {
  const k = `${(e.make || '').toLowerCase()}|${(e.colorName || '').toLowerCase()}`
  if (!seen.has(k)) {
    seen.set(k, e)
  } else {
    const existing = seen.get(k)
    if (completeness(e) > completeness(existing)) {
      log.push(`[DUPE-REPLACE] ${e.make} "${e.colorName}" — replaced with more complete entry`)
      seen.set(k, e)
    } else {
      log.push(`[DUPE-DROP] ${e.make} "${e.colorName}" — dropped duplicate`)
    }
    removedDupes++
  }
}

const deduped = Array.from(seen.values())

// ─────────────────────────────────────────────────────────────
// 5. FINAL VALIDATION PASS — clamp all values to 0–1
// ─────────────────────────────────────────────────────────────
for (const e of deduped) {
  for (const key of ['color1', 'color2']) {
    if (!e[key]) continue
    e[key].h = round3(Math.max(0, Math.min(1, e[key].h)))
    e[key].s = round3(Math.max(0, Math.min(1, e[key].s)))
    e[key].b = round3(Math.max(0, Math.min(1, e[key].b)))
  }
}

// ─────────────────────────────────────────────────────────────
// 6. WRITE OUTPUT
// ─────────────────────────────────────────────────────────────
// Backup original
fs.copyFileSync(FILE, FILE + '.bak.' + Date.now())

fs.writeFileSync(FILE, JSON.stringify(deduped, null, 2), 'utf8')

// Write audit log
let audit = { lastRun: new Date().toISOString(), entries: [] }
if (fs.existsSync(AUDIT_FILE)) {
  try {
    audit = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8'))
  } catch {}
}
audit.lastRun = new Date().toISOString()
audit.entries.push({
  source: 'local:app/data/carColors.json',
  fetchedAt: new Date().toISOString(),
  fields: [
    'color1.h',
    'color1.s',
    'color1.b',
    'color2.h',
    'color2.s',
    'color2.b',
    'make',
    'colorName',
    'colorType',
  ],
  status: 'ok',
  notes: `Repair run: ${fixedHue} hue-range fixes, ${fixedZeroC1} zero-color1 inferred, ${fixedNullC2} null-color2 derived, ${fixedZeroC2} zero-color2 derived, ${removedDupes} duplicates removed. ${deduped.length} entries remain.`,
})
fs.writeFileSync(AUDIT_FILE, JSON.stringify(audit, null, 2), 'utf8')

// Print summary
console.log('\n════════ carColors.json Repair Summary ════════')
console.log(`  Original entries  : ${data.length}`)
console.log(`  Hue range fixes   : ${fixedHue}`)
console.log(`  Zero color1 fixed : ${fixedZeroC1}`)
console.log(`  Null color2 filled: ${fixedNullC2}`)
console.log(`  Zero color2 fixed : ${fixedZeroC2}`)
console.log(`  Duplicates removed: ${removedDupes}`)
console.log(`  Final entries     : ${deduped.length}`)
console.log('════════════════════════════════════════════════\n')

// Write change log to a temp file for review
fs.writeFileSync(path.join(ROOT, 'app', 'data', 'color-repair-log.txt'), log.join('\n'), 'utf8')
console.log(`Full change log → app/data/color-repair-log.txt (${log.length} lines)`)
