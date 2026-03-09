const fs = require('fs')
const path = require('path')

// Read the color data from JSON file
const colorDataPath = path.join(__dirname, '..', 'carColors.json')
const colorDataContent = fs.readFileSync(colorDataPath, 'utf8')
const colorData = JSON.parse(colorDataContent)

console.log(`Loaded ${colorData.length} colors from JSON file`)

// Enhanced color to car model mappings
const colorToModelMappings = {
  // Ferrari colors
  'Rosso Corsa': ['Ferrari F40', 'Ferrari 458', 'Ferrari F12', 'Ferrari LaFerrari'],
  'Rosso Scuderia': ['Ferrari 458', 'Ferrari 488', 'Ferrari F12'],
  'Giallo Modena': ['Ferrari 360', 'Ferrari F430', 'Ferrari 458'],

  // Porsche colors
  'Guards Red': ['Porsche 911', 'Porsche Carrera GT', 'Porsche 918'],
  'Speed Yellow': ['Porsche 911 GT3', 'Porsche Cayman GT4'],
  'Racing Yellow': ['Porsche 911 GT2', 'Porsche 911 GT3'],

  // BMW colors
  'Estoril Blue': ['BMW M3', 'BMW M5', 'BMW Z4 M'],
  'Laguna Seca Blue': ['BMW M3', 'BMW M4'],
  'Phoenix Yellow': ['BMW M3', 'BMW M4'],

  // Add more mappings as needed...
}

// Function to find potential model matches for a color
function findModelMatches(colorName, make) {
  const matches = []

  // Direct color name matches
  if (colorToModelMappings[colorName]) {
    matches.push(...colorToModelMappings[colorName])
  }

  // Pattern-based matching for racing colors
  const lowerColorName = colorName.toLowerCase()
  const lowerMake = make.toLowerCase()

  if (lowerColorName.includes('racing') || lowerColorName.includes('championship')) {
    switch (lowerMake) {
      case 'honda':
      case 'acura':
        matches.push('Honda Civic Type R', 'Acura NSX', 'Honda S2000')
        break
      case 'porsche':
        matches.push('Porsche 911 GT3', 'Porsche 911 GT2')
        break
      case 'bmw':
        matches.push('BMW M3', 'BMW M4')
        break
    }
  }

  return [...new Set(matches)]
}

// Process the color data and add model matches
const processedData = colorData.map(color => {
  const modelMatches = findModelMatches(color.colorName, color.make)

  if (modelMatches.length > 0) {
    return {
      ...color,
      model: modelMatches[0], // Use the first match as the primary model
      suggestedModels: modelMatches,
      matchConfidence: 'high',
    }
  }

  return color
})

// Write the updated data back to the JSON file
fs.writeFileSync(colorDataPath, JSON.stringify(processedData, null, 2))

// Generate summary
const colorsWithMatches = processedData.filter(
  color => color.suggestedModels && color.suggestedModels.length > 0
)

console.log('='.repeat(80))
console.log('COLOR DATA UPDATE COMPLETE')
console.log('='.repeat(80))
console.log(`Total colors: ${colorData.length}`)
console.log(`Colors with model matches: ${colorsWithMatches.length}`)
console.log(`Match rate: ${((colorsWithMatches.length / colorData.length) * 100).toFixed(2)}%`)
console.log('='.repeat(80))

// Show some examples
console.log('\nExamples of matched colors:')
colorsWithMatches.slice(0, 10).forEach(color => {
  console.log(`- ${color.make} ${color.colorName} → ${color.model}`)
})

console.log('\nColor data file updated successfully!')
