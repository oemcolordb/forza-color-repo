const fs = require('fs')
const path = require('path')

const colorDataPath = path.join(__dirname, '..', 'carColors.json')
const colors = JSON.parse(fs.readFileSync(colorDataPath, 'utf8'))

console.log(`Processing ${colors.length} colors...`)

const fixedColors = colors.map(color => {
  // Fix specific Liquid Kinetic Grey colors
  if (color.colorName === 'Liquid Kinetic Grey (layers)' && color.make === 'Nissan') {
    return { ...color, colorType: 'Normal' }
  }
  return color
})

fs.writeFileSync(colorDataPath, JSON.stringify(fixedColors, null, 2))

const fixed = fixedColors.filter(
  c => c.colorName === 'Liquid Kinetic Grey (layers)' && c.make === 'Nissan'
)
console.log(`Fixed ${fixed.length} Liquid Kinetic Grey colors to Normal type`)
console.log('✅ Specific colors fixed!')
