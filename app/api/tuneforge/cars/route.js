import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { createClient } from '@libsql/client'
import { enrichCarWithSpecs } from '../../../lib/car-specs'

const client =
  process.env.TURSO_DATABASE_URL &&
  process.env.TURSO_DATABASE_URL !== 'your_turso_database_url_here'
    ? createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN || '',
      })
    : null

// Aggressive normalization: only alphanumeric lowercase for fuzzy matching
const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '')

export async function GET() {
  try {
    // Load the full 1200-car database from the optimized dataset
    const filePath = path.join(process.cwd(), 'app', 'data', 'cars-optimized.json')
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    // The file wraps cars in { cars: [...] }
    const allCars = Array.isArray(raw) ? raw : (raw.cars ?? [])

    // Always return all cars sorted alphabetically — community tune status is fetched
    // per-car separately and should never gate which cars appear in the list
    const enrichedCars = allCars.map(car => enrichCarWithSpecs(car))

    return NextResponse.json(
      enrichedCars.sort((a, b) =>
        a.manufacturer.localeCompare(b.manufacturer) ||
        a.model.localeCompare(b.model) ||
        (parseInt(a.year) || 0) - (parseInt(b.year) || 0)
      )
    )
  } catch (error) {
    console.error('Error loading car data:', error)
    return NextResponse.json({ error: 'Failed to load car data' }, { status: 500 })
  }
}



