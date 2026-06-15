import carsData from '@/data/cars-optimized.json'
import { Car } from '@/types/car'

// The JSON file wraps cars in { "cars": [...] }
const rawCars = (carsData as { cars: Record<string, unknown>[] }).cars ?? []

export const carDatabase = {
  getAllCars: async (): Promise<Car[]> => {
    return rawCars.map(c => ({
      year: String(c.year ?? ''),
      manufacturer: String(c.manufacturer ?? 'Unknown'),
      model: String(c.model ?? ''),
      type: String(c.type ?? ''),
      price: Number(c.price ?? 0),
      rarity: (c.rarity as Car['rarity']) ?? 'Common',
      country: String(c.country ?? 'Unknown'),
      stats: {
        speed: Number((c.stats as Record<string, number>)?.speed ?? 0),
        handling: Number((c.stats as Record<string, number>)?.handling ?? 0),
        acceleration: Number((c.stats as Record<string, number>)?.acceleration ?? 0),
        launch: Number((c.stats as Record<string, number>)?.launch ?? 0),
        braking: Number((c.stats as Record<string, number>)?.braking ?? 0),
        offroad: Number((c.stats as Record<string, number>)?.offroad ?? 0),
      },
      pi: {
        class: ((c.pi as Record<string, unknown>)?.class as Car['pi']['class']) ?? 'D',
        value: Number((c.pi as Record<string, unknown>)?.value ?? 0),
      },
    })) as Car[]
  },

  getCarBySlug: async (slug: string): Promise<Car | undefined> => {
    const all = await carDatabase.getAllCars()
    return all.find(c => {
      const carSlug = `${c.manufacturer}-${c.model}`.toLowerCase().replace(/\s+/g, '-')
      return carSlug === slug
    })
  },

  searchCars: async (query: string): Promise<Car[]> => {
    const all = await carDatabase.getAllCars()
    const q = query.toLowerCase()
    return all.filter(
      c =>
        c.manufacturer.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q)
    )
  },
}
