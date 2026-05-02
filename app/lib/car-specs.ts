/**
 * app/lib/car-specs.ts
 *
 * Lookup real FH5 car physical specs from master_database.json.
 * Used by the TuneForge API to enrich car objects with accurate
 * weight, drivetrain, and horsepower so tuning calculations are
 * per-car accurate instead of falling back to 1500 kg / RWD defaults.
 */

import fs from 'fs'
import path from 'path'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CarSpec {
  manufacturer: string
  model: string
  year?: string | number
  horsepower: number
  weightLbs: number
  weightKg: number
  frontPct: number   // front axle weight % (e.g. 43 means 43F/57R)
  rearPct: number
  drivetrain: 'RWD' | 'FWD' | 'AWD'
  engine: string
  division: string
  hpPerLb: number
  hpPerKg: number
  specSource: string
}

interface MasterDatabase {
  version: string
  generated: string
  totalCars: number
  totalMatched: number
  cars: CarSpec[]
}

// ---------------------------------------------------------------------------
// Module-level caches so we only read the file once per process
// ---------------------------------------------------------------------------
let _yearMap: Map<string, CarSpec> | null = null  // year|manufacturer|model
let _nameMap: Map<string, CarSpec> | null = null  // manufacturer|model (exact + fuzzy)

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function getMaps(): { yearMap: Map<string, CarSpec>; nameMap: Map<string, CarSpec> } {
  if (_yearMap && _nameMap) return { yearMap: _yearMap, nameMap: _nameMap }

  _yearMap = new Map<string, CarSpec>()
  _nameMap = new Map<string, CarSpec>()

  try {
    const filePath = path.join(process.cwd(), 'app', 'data', 'master_database.json')
    const raw: MasterDatabase = JSON.parse(fs.readFileSync(filePath, 'utf8'))

    for (const spec of raw.cars) {
      // Year+make+model key (most specific)
      if (spec.year) {
        _yearMap.set(`${spec.year}|${spec.manufacturer}|${spec.model}`, spec)
      }
      // Exact make+model key (fallback, first entry wins)
      const exactKey = `${spec.manufacturer}|${spec.model}`
      if (!_nameMap.has(exactKey)) _nameMap.set(exactKey, spec)
      // Fuzzy make+model key
      const fuzzyKey = normalize(spec.manufacturer) + '|' + normalize(spec.model)
      if (!_nameMap.has(fuzzyKey)) _nameMap.set(fuzzyKey, spec)
    }
  } catch (err) {
    console.error('[car-specs] Failed to load master_database.json:', err)
  }

  return { yearMap: _yearMap, nameMap: _nameMap }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Look up spec data by year + manufacturer + model (year optional).
 * Falls back to name-only match if year is not provided or not found.
 * Returns null if the car has no spec entry (specSource === 'missing').
 */
export function getCarSpec(
  manufacturer: string,
  model: string,
  year?: string | number
): CarSpec | null {
  const { yearMap, nameMap } = getMaps()

  // 1. Year-specific exact match (most precise)
  if (year !== undefined && year !== null) {
    const byYear = yearMap.get(`${year}|${manufacturer}|${model}`)
    if (byYear && byYear.specSource !== 'missing') return byYear
  }

  // 2. Exact name match
  const exact = nameMap.get(`${manufacturer}|${model}`)
  if (exact && exact.specSource !== 'missing') return exact

  // 3. Fuzzy name match
  const fuzzy = nameMap.get(normalize(manufacturer) + '|' + normalize(model))
  if (fuzzy && fuzzy.specSource !== 'missing') return fuzzy

  return null
}

/**
 * Enrich a raw car object (from cars-optimized.json) with physical spec
 * fields needed by TuningCalculator.  Non-destructive — only adds fields
 * that don't already exist on the object.
 */
export function enrichCarWithSpecs<T extends { manufacturer: string; model: string; year?: string | number }>(
  car: T
): T & {
  weight?: number
  weightLbs?: number
  frontPct?: number
  drivetrain?: string
  horsepower?: number
  engine?: string
  division?: string
} {
  const spec = getCarSpec(car.manufacturer, car.model, car.year)
  if (!spec) return car

  return {
    ...car,
    weight:     spec.weightKg,
    weightLbs:  spec.weightLbs,
    frontPct:   spec.frontPct,
    drivetrain: spec.drivetrain,
    horsepower: spec.horsepower,
    engine:     spec.engine,
    division:   spec.division,
  }
}

/** Return all specs (for tools / debug endpoints) */
export function getAllSpecs(): CarSpec[] {
  const { yearMap } = getMaps()
  // Return unique entries via yearMap (one per year+make+model)
  return [...yearMap.values()]
}
