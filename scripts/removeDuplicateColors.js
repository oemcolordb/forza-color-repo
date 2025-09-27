const fs = require('fs')
const path = require('path')

// Read the color data
const colorDataPath = path.join(__dirname, '..', 'services', 'colorData.ts')
const colorData = fs.readFileSync(colorDataPath, 'utf8')

// Extract the array content
const arrayMatch = colorData.match(/const colors: CarColor\[\] = (\[[\s\S]*?\]);/)
if (!arrayMatch) {
  console.error('Could not find color array in colorData.ts')
  process.exit(1)
}

// Parse the array (this is a simplified approach)
const arrayContent = arrayMatch[1]
const colors = eval(arrayContent) // Note: eval is used here for simplicity, not recommended for production

console.log(`Original color count: ${colors.length}`)

// Create unique identifier for each color
const createColorId = (color) => {
  return `${color.make}-${color.model}-${color.colorName}-${color.year || 'unknown'}-${color.colorType || 'unknown'}`
}

// Find duplicates
const seen = new Map()
const duplicates = []
const unique = []

colors.forEach((color, index) => {
  const id = createColorId(color)
  if (seen.has(id)) {
    duplicates.push({ index, id, color })
    console.log(`Duplicate found: ${id}`)
  } else {
    seen.set(id, true)
    unique.push(color)
  }
})

console.log(`Duplicates found: ${duplicates.length}`)
console.log(`Unique colors: ${unique.length}`)

if (duplicates.length > 0) {
  console.log('\nFirst 10 duplicates:')
  duplicates.slice(0, 10).forEach(dup => {
    console.log(`- ${dup.id}`)
  })
  
  // Create backup
  const backupPath = path.join(__dirname, '..', 'services', 'colorData.backup.ts')
  fs.writeFileSync(backupPath, colorData)
  console.log(`\nBackup created: ${backupPath}`)
  
  // Generate new color data without duplicates
  const newColorData = `import type { CarColor } from '../app/types/color'

// @ts-ignore - Large array causes "union type too complex" error
const colors: CarColor[] = ${JSON.stringify(unique, null, 2)}

export default colors
`
  
  fs.writeFileSync(colorDataPath, newColorData)
  console.log(`\nUpdated colorData.ts with ${unique.length} unique colors`)
} else {
  console.log('\nNo duplicates found!')
}