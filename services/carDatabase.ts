import cars from '../app/data/cars-optimized.json'
import { Car } from '../app/types/car'

export const carDatabase = {
  getAllCars: async (): Promise<Car[]> => {
    // Return the cars from the JSON file
    // In a real app, this might be a fetch or DB query
    return (cars as any[]).map(c => ({
      ...c,
      pi: c.pi || { class: '?', value: 0 },
      stats: c.stats || { speed: 0, handling: 0, acceleration: 0, braking: 0 },
      price: c.price || 0
    })) as Car[]
  },

  getCarBySlug: async (slug: string): Promise<Car | undefined> => {
    const all = await carDatabase.getAllCars()
    return all.find(c => {
      const carSlug = `${c.manufacturer}-${c.model}`.toLowerCase().replace(/\s+/g, '-')
      return carSlug === slug
    })
  }
}
