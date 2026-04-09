import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { createClient } from '@libsql/client'

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
    // Load full car list from root cars.json for enrichment data
    const filePath = path.join(process.cwd(), 'cars.json')
    const allCars = JSON.parse(fs.readFileSync(filePath, 'utf8'))

    // Build lookup map from cars.json using normalized keys (keep newest year per model)
    const carsMap = new Map()
    for (const car of allCars) {
      const key = norm(car.manufacturer) + '|' + norm(car.model)
      const existing = carsMap.get(key)
      if (!existing || parseInt(car.year) > parseInt(existing.year)) {
        carsMap.set(key, car)
      }
    }

    // Get all distinct make+model combos that have community tunes — this IS the car list
    if (!client) {
      // DB unavailable — fall back to the full cars.json list
      return NextResponse.json(
        allCars.sort((a, b) =>
          a.manufacturer.localeCompare(b.manufacturer) || a.model.localeCompare(b.model)
        )
      )
    }

    // Try DB query but fall back to cars.json if the DB call fails (avoid 500)
    let result
    try {
      result = await client.execute(
        'SELECT DISTINCT car_make, car_model FROM community_tunes ORDER BY car_make, car_model'
      )
    } catch (dbErr) {
      console.warn('Turso query failed; falling back to cars.json:', dbErr)
      return NextResponse.json(
        allCars.sort((a, b) =>
          a.manufacturer.localeCompare(b.manufacturer) || a.model.localeCompare(b.model)
        )
      )
    }

    // Build car list: enrich with cars.json data where available, otherwise use tune DB names
    const cars = result.rows.map(row => {
      const enriched = carsMap.get(norm(row.car_make) + '|' + norm(row.car_model))
      if (enriched) {
        return enriched
      }
      // No cars.json match — create a minimal entry from the tune DB names
      return {
        manufacturer: row.car_make,
        model: row.car_model,
        year: '',
        pi: '',
        division: '',
      }
    })

    return NextResponse.json(cars)
  } catch (error) {
    console.error('Error loading car data:', error)
    return NextResponse.json({ error: 'Failed to load car data' }, { status: 500 })
  }
}



