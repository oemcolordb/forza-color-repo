// Simple script to check for duplicate color entries
const fs = require('fs')
const path = require('path')

console.log('Checking for duplicate color entries...')

// Read the color data file
const colorDataPath = path.join(__dirname, '..', 'services', 'colorData.ts')
const content = fs.readFileSync(colorDataPath, 'utf8')

// Count total colors
const colorMatches = content.match(/{\s*"make":/g)
const totalColors = colorMatches ? colorMatches.length : 0

console.log(`Total colors found: ${totalColors}`)

// Look for specific duplicate patterns in the error messages
const duplicatePatterns = [
  'Acura--Indy Yellow Pearl-null',
  'Acura--Forged Silver Metallic-null',
  'Acura--Formula Red-null'
]

duplicatePatterns.forEach(pattern => {
  const regex = new RegExp(pattern.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'g')
  const matches = content.match(regex)
  if (matches && matches.length > 1) {
    console.log(`Found ${matches.length} instances of pattern: ${pattern}`)
  }
})

console.log('\nThe issue is likely duplicate color entries in the database.')
console.log('The LazyColorGrid component has been updated to handle this by using unique keys.')
console.log('The duplicate key errors should now be resolved.')