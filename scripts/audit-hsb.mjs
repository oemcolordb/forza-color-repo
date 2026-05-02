import { readFileSync } from 'fs'

const data = JSON.parse(readFileSync('carColors.json', 'utf8'))
console.log(`Total entries: ${data.length}\n`)

const issues = {
  rangeViolations: [],
  grayscaleHighSat: [],
  pureBlackZeroBrightness: [],
  pureWhiteLowBrightness: [],
  formattingErrors: [],
  duplicateHSB: [],
  neonOutliers: [],
  allZeroColor1: [],
}

const hsbMap = new Map()

const GRAYSCALE_KEYWORDS =
  /\b(white|grey|gray|black|silver|platinum|chalk|cream|ivory|frost|snow)\b/i
const BLACK_KEYWORDS = /\b(black|noir|nero|schwarz|negro)\b/i
const WHITE_KEYWORDS =
  /\b(white|blanc|bianco|weiss|blanco|diamond white|polar white|arctic white|chalk white|pure white|crystal white|glacier white|silica white|alpine white)\b/i

data.forEach((entry, i) => {
  const name = entry.colorName || ''
  const c1 = entry.color1

  if (!entry.make || !entry.colorName) {
    issues.formattingErrors.push({
      index: i,
      issue: 'Missing make or colorName',
      raw: JSON.stringify(entry).slice(0, 80),
    })
  }

  if (!c1 || typeof c1 !== 'object') {
    issues.formattingErrors.push({ index: i, name, issue: 'Missing color1 object' })
    return
  }

  const { h, s, b } = c1

  if (typeof h !== 'number' || typeof s !== 'number' || typeof b !== 'number') {
    issues.formattingErrors.push({
      index: i,
      name,
      make: entry.make,
      issue: 'color1 h/s/b not numbers',
    })
    return
  }

  if (h < 0 || h > 1 || s < 0 || s > 1 || b < 0 || b > 1) {
    issues.rangeViolations.push({ index: i, name, make: entry.make, h, s, b })
  }

  if (h === 0 && s === 0 && b === 0) {
    issues.allZeroColor1.push({ index: i, name, make: entry.make })
  }

  if (GRAYSCALE_KEYWORDS.test(name) && s > 0.05) {
    issues.grayscaleHighSat.push({
      index: i,
      name,
      make: entry.make,
      h: h.toFixed(3),
      s: s.toFixed(3),
      b: b.toFixed(3),
    })
  }

  if (BLACK_KEYWORDS.test(name) && b === 0) {
    issues.pureBlackZeroBrightness.push({ index: i, name, make: entry.make, h, s, b })
  }

  if (WHITE_KEYWORDS.test(name) && b < 0.95) {
    issues.pureWhiteLowBrightness.push({
      index: i,
      name,
      make: entry.make,
      h: h.toFixed(3),
      s: s.toFixed(3),
      b: b.toFixed(3),
    })
  }

  if (s >= 1.0 && b >= 1.0) {
    issues.neonOutliers.push({
      index: i,
      name,
      make: entry.make,
      h: h.toFixed(3),
      s: s.toFixed(3),
      b: b.toFixed(3),
    })
  }

  const key = `${h.toFixed(3)}_${s.toFixed(3)}_${b.toFixed(3)}`
  if (hsbMap.has(key)) {
    hsbMap.get(key).push({ name, make: entry.make })
  } else {
    hsbMap.set(key, [{ name, make: entry.make }])
  }
})

for (const [key, entries] of hsbMap.entries()) {
  if (entries.length > 1) {
    const uniqueNames = new Set(entries.map(e => e.name))
    if (uniqueNames.size > 1) {
      issues.duplicateHSB.push({ hsb: key, entries })
    }
  }
}

console.log('=== RANGE VIOLATIONS (h/s/b outside 0–1) ===')
if (issues.rangeViolations.length === 0) {
  console.log('  None found.')
}
issues.rangeViolations
  .slice(0, 20)
  .forEach(e => console.log(`  [${e.index}] "${e.name}" (${e.make}) — h:${e.h} s:${e.s} b:${e.b}`))
if (issues.rangeViolations.length > 20)
  console.log(`  ...and ${issues.rangeViolations.length - 20} more`)

console.log('\n=== ALL-ZERO color1 (h=0, s=0, b=0) ===')
if (issues.allZeroColor1.length === 0) {
  console.log('  None found.')
} else {
  console.log(`  ${issues.allZeroColor1.length} entries`)
}
issues.allZeroColor1
  .slice(0, 20)
  .forEach(e => console.log(`  [${e.index}] "${e.name}" (${e.make})`))
if (issues.allZeroColor1.length > 20)
  console.log(`  ...and ${issues.allZeroColor1.length - 20} more`)

console.log('\n=== GRAYSCALE WITH HIGH SATURATION (s > 0.05) ===')
if (issues.grayscaleHighSat.length === 0) {
  console.log('  None found.')
}
issues.grayscaleHighSat
  .slice(0, 30)
  .forEach(e => console.log(`  [${e.index}] "${e.name}" (${e.make}) — h:${e.h} s:${e.s} b:${e.b}`))
if (issues.grayscaleHighSat.length > 30)
  console.log(`  ...and ${issues.grayscaleHighSat.length - 30} more`)

console.log('\n=== PURE BLACK WITH ZERO BRIGHTNESS ===')
if (issues.pureBlackZeroBrightness.length === 0) {
  console.log('  None found.')
}
issues.pureBlackZeroBrightness
  .slice(0, 20)
  .forEach(e => console.log(`  [${e.index}] "${e.name}" (${e.make}) — b:${e.b}`))
if (issues.pureBlackZeroBrightness.length > 20)
  console.log(`  ...and ${issues.pureBlackZeroBrightness.length - 20} more`)

console.log('\n=== WHITE COLORS WITH BRIGHTNESS < 0.95 ===')
if (issues.pureWhiteLowBrightness.length === 0) {
  console.log('  None found.')
}
issues.pureWhiteLowBrightness
  .slice(0, 30)
  .forEach(e => console.log(`  [${e.index}] "${e.name}" (${e.make}) — h:${e.h} s:${e.s} b:${e.b}`))
if (issues.pureWhiteLowBrightness.length > 30)
  console.log(`  ...and ${issues.pureWhiteLowBrightness.length - 30} more`)

console.log('\n=== NEON OUTLIERS (s=1.00 AND b=1.00) ===')
if (issues.neonOutliers.length === 0) {
  console.log('  None found.')
}
issues.neonOutliers
  .slice(0, 30)
  .forEach(e => console.log(`  [${e.index}] "${e.name}" (${e.make}) — h:${e.h} s:${e.s} b:${e.b}`))
if (issues.neonOutliers.length > 30) console.log(`  ...and ${issues.neonOutliers.length - 30} more`)

console.log('\n=== DUPLICATE HSB VALUES (different names, same H/S/B ±0.001) ===')
if (issues.duplicateHSB.length === 0) {
  console.log('  None found.')
} else {
  console.log(`  ${issues.duplicateHSB.length} groups`)
}
issues.duplicateHSB.slice(0, 25).forEach(g => {
  console.log(`  HSB(${g.hsb}): ${g.entries.map(e => `"${e.name}" [${e.make}]`).join(' | ')}`)
})
if (issues.duplicateHSB.length > 25)
  console.log(`  ...and ${issues.duplicateHSB.length - 25} more groups`)

console.log('\n=== FORMATTING ERRORS ===')
if (issues.formattingErrors.length === 0) {
  console.log('  None found.')
}
issues.formattingErrors.forEach(e =>
  console.log(`  [${e.index}] ${e.issue}: ${e.raw || e.name || ''}`)
)

console.log('\n=== SUMMARY ===')
console.log(`Range violations:          ${issues.rangeViolations.length}`)
console.log(`All-zero color1:           ${issues.allZeroColor1.length}`)
console.log(`Grayscale high saturation: ${issues.grayscaleHighSat.length}`)
console.log(`Pure black zero-B:         ${issues.pureBlackZeroBrightness.length}`)
console.log(`White low-B (<0.95):       ${issues.pureWhiteLowBrightness.length}`)
console.log(`Neon outliers (S=B=1.0):   ${issues.neonOutliers.length}`)
console.log(`Duplicate HSB groups:      ${issues.duplicateHSB.length}`)
console.log(`Formatting errors:         ${issues.formattingErrors.length}`)
