const fs = require('fs')
const path = require('path')

const colorDataPath = path.join(__dirname, '..', 'carColors.json')
const colors = JSON.parse(fs.readFileSync(colorDataPath, 'utf8'))

console.log(`Processing ${colors.length} colors...`)

const fixedColors = colors.map(color => {
  let type = color.colorType

  // Convert all falsy, empty, or N/A values to Normal
  if (
    !type ||
    type.toString().trim() === '' ||
    type === 'N/A' ||
    type === 'null' ||
    type === 'undefined' ||
    type.toLowerCase() === 'n/a'
  ) {
    type = 'Normal'
  } else {
    type = type.toString().trim()
    // Map all variations to standard names
    if (type.toLowerCase() === 'normal') type = 'Normal'
    if (type === 'N/A') type = 'Normal'
  }

  return { ...color, colorType: type }
})

fs.writeFileSync(colorDataPath, JSON.stringify(fixedColors, null, 2))

// Show final types
const finalTypes = {}
fixedColors.forEach(color => {
  const type = color.colorType || 'EMPTY'
  finalTypes[type] = (finalTypes[type] || 0) + 1
})

console.log('\n=== FINAL COLOR TYPES ===')
Object.entries(finalTypes)
  .sort(([, a], [, b]) => b - a)
  .forEach(([type, count]) => {
    console.log(`"${type}": ${count} colors`)
  })

console.log('\n✅ Color types fixed!')
