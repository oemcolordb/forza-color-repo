import { readFileSync, writeFileSync } from 'fs'

const all = JSON.parse(readFileSync('all_extracted_colors.json', 'utf8'))
const existing = JSON.parse(readFileSync('carColors.json', 'utf8'))

// Build key set from carColors
const existingKeys = new Set(
  existing.map(c => (c.make || '').toLowerCase() + '|||' + (c.colorName || '').toLowerCase())
)

// Find entries in all_extracted that are NOT in carColors
const missing = all.filter(c => {
  const key = (c.make || '').toLowerCase() + '|||' + (c.colorName || '').toLowerCase()
  return !existingKeys.has(key)
})

console.log('Entries in all_extracted_colors.json:', all.length)
console.log('Entries in carColors.json:           ', existing.length)
console.log('Missing from carColors.json:         ', missing.length)

// Show breakdown by make
const byMake = {}
missing.forEach(c => {
  byMake[c.make] = (byMake[c.make] || 0) + 1
})
const sorted = Object.entries(byMake)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 25)
console.log('\nTop makes with missing colors:')
sorted.forEach(([make, count]) => console.log(`  ${make}: ${count}`))

// Validate missing entries have valid HSB
const validMissing = missing.filter(c => {
  const c1 = c.color1
  if (!c1 || typeof c1 !== 'object') return false
  const { h, s, b } = c1
  return (
    typeof h === 'number' &&
    h >= 0 &&
    h <= 1 &&
    typeof s === 'number' &&
    s >= 0 &&
    s <= 1 &&
    typeof b === 'number' &&
    b >= 0 &&
    b <= 1
  )
})

const invalidMissing = missing.length - validMissing.length
console.log('\nValid HSB in missing entries:', validMissing.length)
console.log('Invalid HSB in missing entries:', invalidMissing)

// Check what's in carColors but NOT in all_extracted (orphaned)
const allKeys = new Set(
  all.map(c => (c.make || '').toLowerCase() + '|||' + (c.colorName || '').toLowerCase())
)
const orphaned = existing.filter(c => {
  const key = (c.make || '').toLowerCase() + '|||' + (c.colorName || '').toLowerCase()
  return !allKeys.has(key)
})
console.log('\nEntries in carColors.json not in all_extracted (orphaned):', orphaned.length)

// Merge valid missing entries into carColors.json
const merged = [...existing, ...validMissing]
writeFileSync('carColors.json', JSON.stringify(merged, null, 2), 'utf8')
console.log(
  `\nMerge complete. carColors.json now has ${merged.length} entries (+${validMissing.length} added)`
)
