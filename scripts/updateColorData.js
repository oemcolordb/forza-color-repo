import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read the carColors.json file
const colorDataPath = path.join(__dirname, '..', 'public', 'carColors.json')
let colorData

try {
  const colorDataContent = fs.readFileSync(colorDataPath, 'utf8')
  colorData = JSON.parse(colorDataContent)
} catch (error) {
  console.error('Error reading color data:', error.message)
  process.exit(1)
}

console.log(`Loaded ${colorData.length} colors from JSON file`)

// Enhanced color to car model mappings
const colorToModelMappings = {
  // Ferrari colors
  'Rosso Corsa': ['Ferrari F40', 'Ferrari 458', 'Ferrari F12', 'Ferrari LaFerrari'],
  'Rosso Scuderia': ['Ferrari 458', 'Ferrari 488', 'Ferrari F12'],
  'Giallo Modena': ['Ferrari 360', 'Ferrari F430', 'Ferrari 458'],
  'Blu Tour de France': ['Ferrari 250 GTO', 'Ferrari F40'],
  'Nero Daytona': ['Ferrari Daytona', 'Ferrari 365 GTB/4'],
  'Rosso Fiorano': ['Ferrari F430', 'Ferrari 458'],
  'Giallo Fly': ['Ferrari F430', 'Ferrari 458'],
  'Blu Pozzi': ['Ferrari 250 GT', 'Ferrari 275 GTB'],
  'Verde British': ['Ferrari 250 GT', 'Ferrari 275 GTB'],
  'Argento Nürburgring': ['Ferrari 458', 'Ferrari 488'],

  // Porsche colors
  'Guards Red': ['Porsche 911', 'Porsche Carrera GT', 'Porsche 918'],
  'Speed Yellow': ['Porsche 911 GT3', 'Porsche Cayman GT4'],
  'Racing Yellow': ['Porsche 911 GT2', 'Porsche 911 GT3'],
  'GT Silver': ['Porsche 911 GT2', 'Porsche 911 GT3'],
  'Carrera White': ['Porsche 911 Carrera', 'Porsche Boxster'],
  'Arena Red': ['Porsche Macan', 'Porsche Cayenne'],
  'Lava Orange': ['Porsche 911 GT3 RS', 'Porsche 718'],
  'Miami Blue': ['Porsche 911', 'Porsche 718'],
  'Lizard Green': ['Porsche 911 GT3 RS'],
  Ultraviolet: ['Porsche 911 GT3 RS'],
  'Signal Yellow': ['Porsche 911 Turbo', 'Porsche Cayman'],
  'Riviera Blue': ['Porsche 911', 'Porsche Boxster'],

  // BMW colors
  'Estoril Blue': ['BMW M3', 'BMW M5', 'BMW Z4 M'],
  'Laguna Seca Blue': ['BMW M3', 'BMW M4'],
  'Phoenix Yellow': ['BMW M3', 'BMW M4'],
  'Imola Red': ['BMW M3', 'BMW M5'],
  Silverstone: ['BMW M3', 'BMW M5'],
  'Carbon Black': ['BMW M3', 'BMW M4', 'BMW M5'],
  'Alpine White': ['BMW M3', 'BMW M4', 'BMW M5'],
  'Jet Black': ['BMW M3', 'BMW M4', 'BMW M5'],
  'Mineral Grey': ['BMW M3', 'BMW M4'],
  'Space Grey': ['BMW M3', 'BMW M4'],
  'Dakar Yellow': ['BMW M3', 'BMW X3'],
  'Le Mans Blue': ['BMW M3', 'BMW M5'],

  // Mercedes colors
  'AMG Green Hell Magno': ['Mercedes AMG GT', 'Mercedes C63 AMG'],
  'Designo Diamond White': ['Mercedes S-Class', 'Mercedes AMG GT'],
  'Obsidian Black': ['Mercedes AMG GT', 'Mercedes C63 AMG'],
  'Solar Beam': ['Mercedes AMG GT', 'Mercedes C63 AMG'],
  'Magnetite Black': ['Mercedes C-Class', 'Mercedes E-Class'],
  'Polar White': ['Mercedes C-Class', 'Mercedes E-Class'],
  'Fire Opal': ['Mercedes AMG GT', 'Mercedes SLS AMG'],
  'AMG Solarbeam': ['Mercedes AMG GT', 'Mercedes C63 AMG'],

  // Lamborghini colors
  'Arancio Borealis': ['Lamborghini Huracán', 'Lamborghini Aventador'],
  'Verde Mantis': ['Lamborghini Huracán', 'Lamborghini Gallardo'],
  'Giallo Orion': ['Lamborghini Huracán', 'Lamborghini Aventador'],
  'Blu Cepheus': ['Lamborghini Huracán', 'Lamborghini Aventador'],
  'Nero Aldebaran': ['Lamborghini Huracán', 'Lamborghini Aventador'],
  'Bianco Icarus': ['Lamborghini Huracán', 'Lamborghini Aventador'],
  'Rosso Mars': ['Lamborghini Huracán', 'Lamborghini Aventador'],
  'Verde Scandal': ['Lamborghini Huracán', 'Lamborghini Gallardo'],
  'Arancio Atlas': ['Lamborghini Aventador', 'Lamborghini Huracán'],

  // McLaren colors
  'McLaren Orange': ['McLaren 650S', 'McLaren 720S', 'McLaren P1'],
  'Volcano Orange': ['McLaren 650S', 'McLaren 570S'],
  'Silica White': ['McLaren 650S', 'McLaren 720S'],
  'Storm Grey': ['McLaren 650S', 'McLaren 720S'],
  'Carbon Black': ['McLaren 650S', 'McLaren 720S'],
  'Ventura Orange': ['McLaren 570S', 'McLaren 540C'],
  'Curacao Blue': ['McLaren 570S', 'McLaren 720S'],
  'Papaya Spark': ['McLaren 600LT', 'McLaren Senna'],

  // Aston Martin colors
  'Aston Martin Racing Green': ['Aston Martin DB11', 'Aston Martin Vantage', 'Aston Martin DBS'],
  'Lightning Silver': ['Aston Martin DB11', 'Aston Martin Vantage'],
  'Volcano Red': ['Aston Martin DB11', 'Aston Martin DBS'],
  'Magnetic Silver': ['Aston Martin DB9', 'Aston Martin Vanquish'],
  'Mariana Blue': ['Aston Martin DB11', 'Aston Martin Vantage'],
  'British Racing Green': ['Aston Martin DB5', 'Aston Martin V8 Vantage'],
  'Casino Royale': ['Aston Martin DBS', 'Aston Martin DB9'],

  // Ford colors
  'Grabber Blue': ['Ford Mustang Shelby GT500', 'Ford Mustang Boss 302'],
  'Competition Orange': ['Ford Mustang', 'Ford Focus ST'],
  'Race Red': ['Ford Mustang', 'Ford F-150 Raptor'],
  'Triple Yellow': ['Ford Mustang', 'Ford Focus ST'],
  'Deep Impact Blue': ['Ford Mustang', 'Ford Focus RS'],
  'Nitrous Blue': ['Ford Focus RS', 'Ford Fiesta ST'],
  'Stealth Grey': ['Ford Focus RS', 'Ford Mustang'],
  'Oxford White': ['Ford F-150', 'Ford Mustang'],
  Magnetic: ['Ford F-150', 'Ford Mustang'],
  'Grabber Orange': ['Ford Mustang Boss 302', 'Ford Mustang Mach 1'],
  'Wimbledon White': ['Ford GT40', 'Ford Mustang'],
  'Gulf Blue': ['Ford GT', 'Ford GT40'],

  // Chevrolet colors
  'Torch Red': ['Chevrolet Corvette', 'Chevrolet Camaro'],
  'Velocity Yellow': ['Chevrolet Corvette Z06', 'Chevrolet Camaro SS'],
  'Laguna Blue': ['Chevrolet Corvette', 'Chevrolet Camaro'],
  'Arctic White': ['Chevrolet Corvette', 'Chevrolet Camaro'],
  'Blade Silver': ['Chevrolet Corvette', 'Chevrolet Camaro'],
  'Rally Yellow': ['Chevrolet Camaro', 'Chevrolet Corvette'],
  'Cyber Gray': ['Chevrolet Camaro', 'Chevrolet Corvette'],
  'Sebring Orange': ['Chevrolet Corvette Z06', 'Chevrolet Camaro ZL1'],

  // Honda/Acura colors
  'Championship White': ['Honda Civic Type R', 'Acura NSX', 'Honda S2000'],
  'Phoenix Yellow': ['Acura NSX', 'Honda S2000'],
  'Formula Red': ['Acura NSX', 'Honda S2000'],
  'New Formula Red': ['Acura NSX'],
  'Berlina Black': ['Acura NSX', 'Honda S2000'],
  'Silverstone Metallic': ['Acura NSX'],
  'Thermal Orange Pearl': ['Honda Civic Type R'],
  'Indy Yellow Pearl': ['Acura NSX'],
  'Long Beach Blue Pearl': ['Acura NSX'],

  // Alfa Romeo colors
  'Rosso Competizione': ['Alfa Romeo 4C', 'Alfa Romeo Giulia Quadrifoglio'],
  'Bianco Trofeo': ['Alfa Romeo 4C', 'Alfa Romeo Giulia'],
  'Giallo Prototipo': ['Alfa Romeo 4C'],
  'Basalt Grey': ['Alfa Romeo Giulia', 'Alfa Romeo Stelvio'],
  'Rosso Alfa': ['Alfa Romeo 4C', 'Alfa Romeo Giulia'],
  'Verde Visconti': ['Alfa Romeo Giulia Quadrifoglio'],

  // Nissan colors
  'Pearl White': ['Nissan GT-R', 'Nissan 370Z'],
  'Gun Metallic': ['Nissan GT-R', 'Nissan 370Z'],
  'Solid Red': ['Nissan GT-R', 'Nissan 370Z'],
  'Deep Blue Pearl': ['Nissan GT-R', 'Nissan 370Z'],
  'Super Black': ['Nissan GT-R', 'Nissan 370Z'],
  'Vibrant Red': ['Nissan GT-R', 'Nissan 370Z'],

  // Toyota colors
  'Absolute Red': ['Toyota Supra', 'Toyota 86'],
  'Lightning Red': ['Toyota Supra', 'Toyota Camry TRD'],
  'Phantom Matte Gray': ['Toyota Supra'],
  'Nitro Yellow': ['Toyota Supra'],
  'Downshift Blue': ['Toyota Supra'],
  'Tungsten Silver': ['Toyota Supra', 'Toyota 86'],
  'Renaissance Red': ['Toyota Supra', 'Toyota 86'],

  // Subaru colors
  'World Rally Blue': ['Subaru WRX STI', 'Subaru Impreza'],
  'Crystal White Pearl': ['Subaru WRX STI', 'Subaru BRZ'],
  'Pure Red': ['Subaru WRX STI', 'Subaru BRZ'],
  'Dark Gray Metallic': ['Subaru WRX STI', 'Subaru BRZ'],
  'WR Blue Pearl': ['Subaru WRX STI', 'Subaru Impreza'],

  // Mazda colors
  'Soul Red Crystal': ['Mazda MX-5 Miata', 'Mazda RX-7'],
  'Machine Gray': ['Mazda MX-5 Miata', 'Mazda RX-8'],
  'Snowflake White Pearl': ['Mazda MX-5 Miata', 'Mazda RX-7'],
  'Ceramic Metallic': ['Mazda MX-5 Miata'],
  'Winning Blue': ['Mazda RX-7', 'Mazda RX-8'],

  // Jaguar colors
  'British Racing Green': ['Jaguar F-Type', 'Jaguar XK', 'Jaguar E-Type'],
  'Caldera Red': ['Jaguar F-Type', 'Jaguar XF'],
  'Ultimate Black': ['Jaguar F-Type', 'Jaguar XF'],
  'Polaris White': ['Jaguar F-Type', 'Jaguar XF'],
  'Indus Silver': ['Jaguar F-Type', 'Jaguar XF'],
  'Italian Racing Red': ['Jaguar F-Type', 'Jaguar XK'],

  // Lotus colors
  'Chrome Orange': ['Lotus Elise', 'Lotus Exige'],
  'Laser Blue': ['Lotus Elise', 'Lotus Evora'],
  'Solar Yellow': ['Lotus Elise', 'Lotus Exige'],
  'Ardent Red': ['Lotus Elise', 'Lotus Evora'],
  'Storm Titanium': ['Lotus Evora', 'Lotus Exige'],
  'Norfolk Mustard': ['Lotus Elise', 'Lotus Exige'],

  // Dodge colors
  'Plum Crazy': ['Dodge Challenger', 'Dodge Charger'],
  'Go Mango': ['Dodge Challenger', 'Dodge Charger'],
  TorRed: ['Dodge Challenger', 'Dodge Charger'],
  Sublime: ['Dodge Challenger', 'Dodge Charger'],
  'B5 Blue': ['Dodge Challenger', 'Dodge Charger'],
  'Destroyer Grey': ['Dodge Challenger', 'Dodge Charger'],
  'Pitch Black': ['Dodge Challenger', 'Dodge Charger'],
  'In Violet': ['Dodge Challenger', 'Dodge Charger'],

  // Audi colors
  'Nardo Grey': ['Audi RS3', 'Audi RS4', 'Audi RS6'],
  'Sepang Blue': ['Audi RS4', 'Audi RS6'],
  'Nogaro Blue': ['Audi RS2', 'Audi RS4'],
  'Imola Yellow': ['Audi RS4', 'Audi RS6'],
  'Misano Red': ['Audi RS3', 'Audi RS4'],
  'Glacier White': ['Audi RS models'],
  'Mythos Black': ['Audi RS models'],
  'Daytona Grey': ['Audi RS models'],
  'Vegas Yellow': ['Audi RS models'],
  'Suzuka Grey': ['Audi RS models'],
}

// Function to find potential model matches for a color
function findModelMatches(colorName, make) {
  const matches = []

  // Direct color name matches
  if (colorToModelMappings[colorName]) {
    matches.push(...colorToModelMappings[colorName])
  }

  // Pattern-based matching
  const lowerColorName = colorName.toLowerCase()
  const lowerMake = make.toLowerCase()

  // Racing circuit names
  const circuits = [
    'nürburgring',
    'nurburgring',
    'silverstone',
    'monza',
    'spa',
    'le mans',
    'lemans',
    'monaco',
    'brands hatch',
    'goodwood',
    'watkins glen',
    'laguna seca',
    'sebring',
    'daytona',
    'indianapolis',
    'road america',
    'imola',
    'mugello',
    'suzuka',
    'fuji',
    'bathurst',
    'nordschleife',
    'paul ricard',
    'hockenheim',
    'interlagos',
  ]

  circuits.forEach(circuit => {
    if (lowerColorName.includes(circuit)) {
      switch (lowerMake) {
        case 'bmw':
          matches.push('BMW M3', 'BMW M4', 'BMW M5')
          break
        case 'porsche':
          matches.push('Porsche 911 GT3', 'Porsche 911 GT2')
          break
        case 'ferrari':
          matches.push('Ferrari 458', 'Ferrari 488', 'Ferrari F12')
          break
        case 'mclaren':
          matches.push('McLaren 650S', 'McLaren 720S')
          break
        case 'aston martin':
          matches.push('Aston Martin DB11', 'Aston Martin Vantage')
          break
        case 'mercedes':
        case 'mercedes-benz':
          matches.push('Mercedes AMG GT', 'Mercedes C63 AMG')
          break
        case 'audi':
          matches.push('Audi RS4', 'Audi RS6')
          break
      }
    }
  })

  // Championship/Racing colors
  if (lowerColorName.includes('championship') || lowerColorName.includes('racing')) {
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
      case 'aston martin':
        matches.push('Aston Martin DB5', 'Aston Martin V8 Vantage')
        break
    }
  }

  // GT/Performance colors
  if (
    lowerColorName.includes('gt') ||
    lowerColorName.includes('sport') ||
    lowerColorName.includes('performance')
  ) {
    switch (lowerMake) {
      case 'porsche':
        matches.push('Porsche 911 GT3', 'Porsche 911 GT2', 'Porsche Cayman GT4')
        break
      case 'bmw':
        matches.push('BMW M3', 'BMW M4', 'BMW M5')
        break
      case 'mercedes':
      case 'mercedes-benz':
        matches.push('Mercedes AMG GT', 'Mercedes C63 AMG')
        break
      case 'ford':
        matches.push('Ford Mustang GT', 'Ford GT')
        break
    }
  }

  // Special edition indicators
  if (lowerColorName.includes('rs') || lowerColorName.includes('r-s')) {
    switch (lowerMake) {
      case 'porsche':
        matches.push('Porsche 911 GT3 RS', 'Porsche 911 GT2 RS')
        break
      case 'audi':
        matches.push('Audi RS3', 'Audi RS4', 'Audi RS6')
        break
      case 'ford':
        matches.push('Ford Focus RS')
        break
    }
  }

  // Type R colors
  if (
    lowerColorName.includes('type r') ||
    (lowerMake === 'honda' && lowerColorName.includes('championship'))
  ) {
    matches.push('Honda Civic Type R')
  }

  // AMG colors
  if (
    lowerColorName.includes('amg') ||
    (lowerMake === 'mercedes' && lowerColorName.includes('magno'))
  ) {
    matches.push('Mercedes AMG GT', 'Mercedes C63 AMG', 'Mercedes E63 AMG')
  }

  // M colors
  if (
    (lowerMake === 'bmw' && lowerColorName.includes('m ')) ||
    lowerColorName.includes('competition')
  ) {
    matches.push('BMW M3', 'BMW M4', 'BMW M5')
  }

  // Remove duplicates and return
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

// Update the carColors.json file with the new data
const updatedContent = JSON.stringify(processedData, null, 2)

fs.writeFileSync(colorDataPath, updatedContent)

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
