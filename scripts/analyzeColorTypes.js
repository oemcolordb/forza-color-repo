const fs = require('fs')
const path = require('path')

// Read the color data
const colorDataPath = path.join(__dirname, '..', 'services', 'colorData.ts')
const colorData = fs.readFileSync(colorDataPath, 'utf8')

// Extract the array content - look for the array after the comment
const arrayMatch = colorData.match(/const colorData: CarColor\[\] = \[([\s\S]*?)\];/)
if (!arrayMatch) {
  console.error('Could not find color array in colorData.ts')
  process.exit(1)
}

// Parse the array content as JSON
let colors
try {
  const arrayContent = '[' + arrayMatch[1] + ']'
  colors = JSON.parse(arrayContent)
  console.log('Successfully parsed color data')
} catch (error) {
  console.error('Error parsing color data:', error.message)
  process.exit(1)
}

console.log(`Total colors: ${colors.length}`)

// Count colors by type
const colorTypeCounts = {}
colors.forEach(color => {
  const type = color.colorType || 'Unknown'
  colorTypeCounts[type] = (colorTypeCounts[type] || 0) + 1
})

// Sort by count
const sortedTypes = Object.entries(colorTypeCounts)
  .sort((a, b) => a[1] - b[1])

console.log('\nColor types by count:')
sortedTypes.forEach(([type, count]) => {
  console.log(`${type}: ${count} colors`)
})

// Find types with less than 100 colors
const typesUnder100 = sortedTypes.filter(([type, count]) => count < 100)

console.log(`\nColor types with less than 100 colors: ${typesUnder100.length}`)
typesUnder100.forEach(([type, count]) => {
  console.log(`${type}: ${count} colors (need ${100 - count} more)`)
})

// Export the data for the generation script
const analysisData = {
  totalColors: colors.length,
  colorTypeCounts,
  typesUnder100: typesUnder100.map(([type, count]) => ({
    type,
    currentCount: count,
    needed: 100 - count
  })),
  existingColors: colors
}

fs.writeFileSync(
  path.join(__dirname, 'colorTypeAnalysis.json'),
  JSON.stringify(analysisData, null, 2)
)

console.log('\nAnalysis saved to colorTypeAnalysis.json')