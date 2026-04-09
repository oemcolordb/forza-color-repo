const fs = require('fs')
const path = require('path')

/**
 * Convert cars.json to TypeScript format and create optimized data files
 */
async function convertCarsData() {
  try {
    console.log('Reading cars.json...')
    const carsPath = path.join(__dirname, '..', 'cars.json')
    const carsData = JSON.parse(fs.readFileSync(carsPath, 'utf8'))

    console.log(`Loaded ${carsData.length} cars`)

    // Extract unique values for filters
    const manufacturers = [...new Set(carsData.map(car => car.manufacturer))].sort()
    const models = [...new Set(carsData.map(car => car.model))].sort()
    const types = [...new Set(carsData.map(car => car.type))].sort()
    const countries = [...new Set(carsData.map(car => car.country))].sort()
    const rarities = [...new Set(carsData.map(car => car.rarity))].sort()
    const piClasses = [...new Set(carsData.map(car => car.pi.class))].sort()

    // Create metadata
    const metadata = {
      totalCars: carsData.length,
      manufacturers: manufacturers.length,
      models: models.length,
      types: types.length,
      countries: countries.length,
      rarities: rarities.length,
      piClasses: piClasses.length,
      yearRange: {
        min: Math.min(...carsData.map(car => parseInt(car.year))),
        max: Math.max(...carsData.map(car => parseInt(car.year))),
      },
      priceRange: {
        min: Math.min(...carsData.map(car => car.price)),
        max: Math.max(...carsData.map(car => car.price)),
      },
    }

    // Create optimized data structure
    const optimizedData = {
      cars: carsData,
      metadata,
      filters: {
        manufacturers,
        models,
        types,
        countries,
        rarities,
        piClasses,
      },
    }

    // Write TypeScript interface file
    const interfaceContent = `// Auto-generated car data interfaces
export interface CarMetadata {
  totalCars: number;
  manufacturers: number;
  models: number;
  types: number;
  countries: number;
  rarities: number;
  piClasses: number;
  yearRange: {
    min: number;
    max: number;
  };
  priceRange: {
    min: number;
    max: number;
  };
}

export interface CarFilters {
  manufacturers: string[];
  models: string[];
  types: string[];
  countries: string[];
  rarities: string[];
  piClasses: string[];
}

export interface OptimizedCarData {
  cars: Car[];
  metadata: CarMetadata;
  filters: CarFilters;
}

// Car statistics by manufacturer
export const CAR_STATS = {
  TOTAL_CARS: ${carsData.length},
  MANUFACTURERS: ${manufacturers.length},
  MODELS: ${models.length},
  TYPES: ${types.length},
  COUNTRIES: ${countries.length},
  YEAR_RANGE: { min: ${metadata.yearRange.min}, max: ${metadata.yearRange.max} },
  PRICE_RANGE: { min: ${metadata.priceRange.min}, max: ${metadata.priceRange.max} }
} as const;

// Top manufacturers by car count
export const TOP_MANUFACTURERS = ${JSON.stringify(
      manufacturers
        .map(manufacturer => ({
          name: manufacturer,
          count: carsData.filter(car => car.manufacturer === manufacturer).length,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      null,
      2
    )};

// Car types distribution
export const CAR_TYPES = ${JSON.stringify(
      types
        .map(type => ({
          name: type,
          count: carsData.filter(car => car.type === type).length,
        }))
        .sort((a, b) => b.count - a.count),
      null,
      2
    )};
`

    // Write files
    const outputDir = path.join(__dirname, '..', 'app', 'data')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Write optimized data to app/data/ (for server-side imports)
    fs.writeFileSync(
      path.join(outputDir, 'cars-optimized.json'),
      JSON.stringify(optimizedData, null, 2)
    )

    // Also write to public/data/ so the client fetch at /data/cars-optimized.json works
    const publicDataDir = path.join(__dirname, '..', 'public', 'data')
    if (!fs.existsSync(publicDataDir)) {
      fs.mkdirSync(publicDataDir, { recursive: true })
    }
    fs.writeFileSync(
      path.join(publicDataDir, 'cars-optimized.json'),
      JSON.stringify(optimizedData, null, 2)
    )

    // Write TypeScript constants
    fs.writeFileSync(path.join(outputDir, 'carStats.ts'), interfaceContent)

    // Write individual filter files for better performance
    fs.writeFileSync(
      path.join(outputDir, 'manufacturers.json'),
      JSON.stringify(manufacturers, null, 2)
    )

    fs.writeFileSync(path.join(outputDir, 'car-types.json'), JSON.stringify(types, null, 2))

    // Create a sample cars file for development
    const sampleCars = carsData.slice(0, 100)
    fs.writeFileSync(path.join(outputDir, 'cars-sample.json'), JSON.stringify(sampleCars, null, 2))

    console.log('✅ Conversion completed successfully!')
    console.log(`📊 Statistics:`)
    console.log(`   - Total cars: ${metadata.totalCars}`)
    console.log(`   - Manufacturers: ${metadata.manufacturers}`)
    console.log(`   - Models: ${metadata.models}`)
    console.log(`   - Types: ${metadata.types}`)
    console.log(`   - Countries: ${metadata.countries}`)
    console.log(`   - Year range: ${metadata.yearRange.min} - ${metadata.yearRange.max}`)
    console.log(
      `   - Price range: $${metadata.priceRange.min.toLocaleString()} - $${metadata.priceRange.max.toLocaleString()}`
    )
    console.log(`📁 Files created:`)
    console.log(`   - app/data/cars-optimized.json`)
    console.log(`   - app/data/carStats.ts`)
    console.log(`   - app/data/manufacturers.json`)
    console.log(`   - app/data/car-types.json`)
    console.log(`   - app/data/cars-sample.json`)
  } catch (error) {
    console.error('❌ Error converting cars data:', error)
    process.exit(1)
  }
}

// Run the conversion
if (require.main === module) {
  convertCarsData()
}

module.exports = { convertCarsData }
