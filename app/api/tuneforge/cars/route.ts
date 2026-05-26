import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { enrichCarWithSpecs } from '../../../lib/car-specs'

interface RawCar {
  manufacturer: string
  model: string
  year?: string | number
  [key: string]: unknown
}

export async function GET() {
  try {
    // Load the full 1200-car database from the optimized dataset
    const filePath = path.join(process.cwd(), 'app', 'data', 'cars-optimized.json')
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    // The file wraps cars in { cars: [...] }
    const allCars: RawCar[] = Array.isArray(raw) ? raw : (raw.cars ?? [])

    // Always return all cars sorted alphabetically — community tune status is fetched
    // per-car separately and should never gate which cars appear in the list
    const enrichedCars = allCars.map((car) => enrichCarWithSpecs(car))

    return NextResponse.json(
      enrichedCars.sort((a, b) =>
        a.manufacturer.localeCompare(b.manufacturer) ||
        a.model.localeCompare(b.model) ||
        (parseInt(String(a.year ?? '0')) || 0) - (parseInt(String(b.year ?? '0')) || 0)
      )
    )
  } catch (error) {
    console.error('Error loading car data:', error)
    return NextResponse.json({ error: 'Failed to load car data' }, { status: 500 })
  }
}



