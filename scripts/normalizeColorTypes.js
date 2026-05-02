const fs = require('fs')
const path = require('path')

// Read the color data from JSON file
const colorDataPath = path.join(__dirname, '..', 'public', 'carColors.json')
const colorDataContent = fs.readFileSync(colorDataPath, 'utf8')
const colors = JSON.parse(colorDataContent)

console.log(`Processing ${colors.length} colors...`)

// Normalize color types
const normalizedColors = colors.map(color => {
  let normalizedType = color.colorType

  // Fix duplicate Normal types and N/A
  if (
    !normalizedType ||
    normalizedType === 'N/A' ||
    normalizedType === 'null' ||
    normalizedType === 'undefined'
  ) {
    normalizedType = 'Normal'
  }

  // Normalize common variations
  normalizedType = normalizedType.trim()

  // Fix common duplicates and variations
  const typeMap = {
    Normal: 'Normal',
    normal: 'Normal',
    NORMAL: 'Normal',
    'Metal Flake': 'Metal Flake',
    'metal flake': 'Metal Flake',
    'METAL FLAKE': 'Metal Flake',
    'Two-Tone': 'Two-Tone',
    'two-tone': 'Two-Tone',
    'TWO-TONE': 'Two-Tone',
    Matte: 'Matte',
    matte: 'Matte',
    MATTE: 'Matte',
    'Carbon Fiber': 'Carbon Fiber',
    'carbon fiber': 'Carbon Fiber',
    'CARBON FIBER': 'Carbon Fiber',
    Pearlescent: 'Pearlescent',
    pearlescent: 'Pearlescent',
    PEARLESCENT: 'Pearlescent',
    Metallic: 'Metallic',
    metallic: 'Metallic',
    METALLIC: 'Metallic',
  }

  return {
    ...color,
    colorType: typeMap[normalizedType] || normalizedType,
  }
})

// Write the normalized data back to the file
fs.writeFileSync(colorDataPath, JSON.stringify(normalizedColors, null, 2))

// Generate summary
const typeCount = {}
normalizedColors.forEach(color => {
  typeCount[color.colorType] = (typeCount[color.colorType] || 0) + 1
})

console.log('\n=== NORMALIZED COLOR TYPES ===')
Object.entries(typeCount)
  .sort(([, a], [, b]) => b - a)
  .forEach(([type, count]) => {
    console.log(`${type}: ${count} colors`)
  })

console.log('\n✅ Color types normalized successfully!')
