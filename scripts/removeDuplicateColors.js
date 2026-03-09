const fs = require('fs')
const path = require('path')

// Read the color data from JSON file
const colorDataPath = path.join(__dirname, '..', 'carColors.json')
const colorDataContent = fs.readFileSync(colorDataPath, 'utf8')
const colors = JSON.parse(colorDataContent)

console.log(`Original color count: ${colors.length}`)

// Create a Set to track unique colors based on make, model, year, and colorName
const uniqueColors = []
const seen = new Set()

colors.forEach(color => {
  const key = `${color.make}-${color.model}-${color.year}-${color.colorName}`
  if (!seen.has(key)) {
    seen.add(key)
    uniqueColors.push(color)
  }
})

console.log(`Unique color count: ${uniqueColors.length}`)
console.log(`Removed ${colors.length - uniqueColors.length} duplicates`)

// Write the deduplicated data back to the JSON file
fs.writeFileSync(colorDataPath, JSON.stringify(uniqueColors, null, 2))

console.log('✅ Duplicate colors removed successfully!')
