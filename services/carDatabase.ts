import { Car, CarDatabase, CarFilters, CarSearchOptions } from '../app/types/car'

class CarDatabaseService {
  private cars: Car[] = []
  private manufacturers: string[] = []
  private models: string[] = []
  private types: string[] = []
  private countries: string[] = []
  private isLoaded = false

  async loadCars(): Promise<void> {
    if (this.isLoaded) return

    try {
      // Load the full 1200-car optimized dataset (public/data/cars-optimized.json)
      const response = await fetch('/data/cars-optimized.json')
      if (!response.ok) {
        throw new Error(`Failed to fetch car data: ${response.status}`)
      }
      const optimizedData = await response.json()
      const carsData: Car[] = optimizedData.cars

      // Use pre-computed unique values if available
      if (optimizedData.filters) {
        this.manufacturers = optimizedData.filters.manufacturers
        this.models = optimizedData.filters.models
        this.types = optimizedData.filters.types
        this.countries = optimizedData.filters.countries
      }
      console.log(`Loaded ${carsData.length} cars from optimized data`)

      this.cars = carsData
      if (!this.manufacturers.length) {
        this.extractUniqueValues()
      }
      this.isLoaded = true
    } catch (error) {
      console.error('Failed to load car database:', error)
      throw new Error('Failed to load car database')
    }
  }

  private extractUniqueValues(): void {
    const manufacturerSet = new Set<string>()
    const modelSet = new Set<string>()
    const typeSet = new Set<string>()
    const countrySet = new Set<string>()

    this.cars.forEach(car => {
      manufacturerSet.add(car.manufacturer)
      modelSet.add(car.model)
      typeSet.add(car.type)
      countrySet.add(car.country)
    })

    this.manufacturers = Array.from(manufacturerSet).sort()
    this.models = Array.from(modelSet).sort()
    this.types = Array.from(typeSet).sort()
    this.countries = Array.from(countrySet).sort()
  }

  async getAllCars(): Promise<Car[]> {
    await this.loadCars()
    return [...this.cars]
  }

  async getManufacturers(): Promise<string[]> {
    await this.loadCars()
    return [...this.manufacturers]
  }

  async getModels(manufacturer?: string): Promise<string[]> {
    await this.loadCars()
    if (manufacturer) {
      const manufacturerModels = this.cars
        .filter(car => car.manufacturer === manufacturer)
        .map(car => car.model)
      return Array.from(new Set(manufacturerModels)).sort()
    }
    return [...this.models]
  }

  async getTypes(): Promise<string[]> {
    await this.loadCars()
    return [...this.types]
  }

  async getCountries(): Promise<string[]> {
    await this.loadCars()
    return [...this.countries]
  }

  async searchCars(options: CarSearchOptions = {}): Promise<Car[]> {
    await this.loadCars()

    let filteredCars = [...this.cars]

    // Apply text search
    if (options.query) {
      const query = options.query.toLowerCase()
      filteredCars = filteredCars.filter(
        car =>
          car.manufacturer.toLowerCase().includes(query) ||
          car.model.toLowerCase().includes(query) ||
          car.type.toLowerCase().includes(query) ||
          car.year.includes(query)
      )
    }

    // Apply filters
    if (options.filters) {
      filteredCars = this.applyFilters(filteredCars, options.filters)
    }

    // Apply sorting
    if (options.sortBy) {
      filteredCars = this.sortCars(filteredCars, options.sortBy, options.sortOrder || 'asc')
    }

    // Apply pagination
    if (options.offset !== undefined || options.limit !== undefined) {
      const start = options.offset || 0
      const end = options.limit ? start + options.limit : undefined
      filteredCars = filteredCars.slice(start, end)
    }

    return filteredCars
  }

  private applyFilters(cars: Car[], filters: CarFilters): Car[] {
    return cars.filter(car => {
      if (filters.manufacturer && car.manufacturer !== filters.manufacturer) return false
      if (filters.model && car.model !== filters.model) return false
      if (filters.type && car.type !== filters.type) return false
      if (filters.country && car.country !== filters.country) return false
      if (filters.rarity && car.rarity !== filters.rarity) return false
      if (filters.piClass && car.pi.class !== filters.piClass) return false

      if (filters.yearRange) {
        const year = parseInt(car.year)
        if (year < filters.yearRange.min || year > filters.yearRange.max) return false
      }

      if (filters.priceRange) {
        if (car.price < filters.priceRange.min || car.price > filters.priceRange.max) return false
      }

      return true
    })
  }

  private sortCars(cars: Car[], sortBy: string, sortOrder: 'asc' | 'desc'): Car[] {
    return cars.sort((a, b) => {
      let valueA: any
      let valueB: any

      // Handle nested properties
      if (sortBy.includes('.')) {
        const [parent, child] = sortBy.split('.')
        valueA = (a as any)[parent][child]
        valueB = (b as any)[parent][child]
      } else {
        valueA = (a as any)[sortBy]
        valueB = (b as any)[sortBy]
      }

      // Handle different data types
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase()
        valueB = valueB.toLowerCase()
      }

      if (typeof valueA === 'number') {
        return sortOrder === 'asc' ? valueA - valueB : valueB - valueA
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }

  async getCarById(manufacturer: string, model: string, year: string): Promise<Car | null> {
    await this.loadCars()
    return (
      this.cars.find(
        car => car.manufacturer === manufacturer && car.model === model && car.year === year
      ) || null
    )
  }

  async getRandomCars(count: number = 10): Promise<Car[]> {
    await this.loadCars()
    const shuffled = [...this.cars].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  async getCarsByManufacturer(manufacturer: string): Promise<Car[]> {
    await this.loadCars()
    return this.cars.filter(car => car.manufacturer === manufacturer)
  }

  async getCarsByType(type: string): Promise<Car[]> {
    await this.loadCars()
    return this.cars.filter(car => car.type === type)
  }

  async getCarsByPIClass(piClass: string): Promise<Car[]> {
    await this.loadCars()
    return this.cars.filter(car => car.pi.class === piClass)
  }

  async getTopCarsByStats(statName: keyof Car['stats'], limit: number = 10): Promise<Car[]> {
    await this.loadCars()
    return [...this.cars].sort((a, b) => b.stats[statName] - a.stats[statName]).slice(0, limit)
  }

  getDatabase(): CarDatabase {
    return {
      cars: [...this.cars],
      manufacturers: [...this.manufacturers],
      models: [...this.models],
      types: [...this.types],
      countries: [...this.countries],
    }
  }
}

// Export singleton instance
export const carDatabase = new CarDatabaseService()
export default carDatabase
