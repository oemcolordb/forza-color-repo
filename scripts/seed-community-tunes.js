/**
 * Seed community_tunes from the extracted tune database JSON.
 * Run: node scripts/seed-community-tunes.js
 * Requires: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in environment (or .env.local)
 */

const { createClient } = require('@libsql/client')
const fs = require('fs')
const path = require('path')

// Load env vars from .env.local if available (robust multi-line parser)
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    if (key && !process.env[key]) process.env[key] = val
  }
}

const TURSO_URL   = process.env.TURSO_DATABASE_URL
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN

if (!TURSO_URL || TURSO_URL === 'your_turso_database_url_here') {
  console.error('❌ TURSO_DATABASE_URL not set. Check your .env.local file.')
  process.exit(1)
}

const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN || '' })

// Known multi-word manufacturers to correctly split car names
const KNOWN_MAKES = [
  'Alfa Romeo', 'Aston Martin', 'Mercedes-Benz',
  'Land Rover', 'Rolls-Royce', 'Pagani Automobili',
  'Abarth', 'Acura', 'Alpine', 'Apollo', 'Ariel', 'Ascari',
  'Audi', 'BMW', 'Bugatti', 'Buick', 'Cadillac', 'Chevrolet',
  'Citroën', 'Citroen', 'Datsun', 'Dodge', 'Ferrari', 'Fiat',
  'Ford', 'Hennessey', 'Honda', 'Hoonigan', 'Hyundai',
  'Italdesign', 'Jaguar', 'Jeep', 'Koenigsegg', 'KTM',
  'Lamborghini', 'Lancia', 'Lotus', 'Maserati', 'Mazda',
  'McLaren', 'Mercedes', 'Mini', 'Mitsubishi', 'Morris',
  'Mosler', 'Nissan', 'Oldsmobile', 'Peugeot', 'Pontiac',
  'Porsche', 'Renault', 'RUF', 'Saab', 'Shelby', 'Subaru',
  'Toyota', 'Ultima', 'Vauxhall', 'Volkswagen', 'Volvo',
  'BAC', 'SSC', 'Acura', 'Arctic Cat', 'Austin', 'Bentley',
  'Bristol', 'Caterham', 'De Tomaso', 'Ginetta', 'International',
  'Lister', 'MG', 'Morgan', 'Noble', 'Riley', 'Talbot',
  'TVR', 'Westfield', 'Radical'
].sort((a, b) => b.length - a.length) // longest first so multi-word matched first

function parseCarName(carName) {
  // Strip drive/constraint notes in parens like "(FWD, M/C)"
  const clean = carName.replace(/\s*\(.*?\)\s*/g, '').trim()

  for (const make of KNOWN_MAKES) {
    if (clean.toLowerCase().startsWith(make.toLowerCase())) {
      const model = clean.slice(make.length).trim()
      return { make, model: model || clean }
    }
  }
  // Fallback: first word as make
  const parts = clean.split(' ')
  return { make: parts[0], model: parts.slice(1).join(' ') || clean }
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

async function ensureTable() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS community_tunes (
      id          TEXT PRIMARY KEY,
      car_make    TEXT NOT NULL,
      car_model   TEXT NOT NULL,
      tune_name   TEXT NOT NULL,
      tuner_name  TEXT NOT NULL DEFAULT 'Anonymous',
      share_code  TEXT,
      discipline  TEXT NOT NULL DEFAULT 'General',
      pi_class    TEXT,
      pi_value    INTEGER,
      tune_data   TEXT NOT NULL DEFAULT '{}',
      votes       INTEGER NOT NULL DEFAULT 0,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_ct_car ON community_tunes(car_make, car_model)`)
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_ct_votes ON community_tunes(votes DESC)`)
}

async function main() {
  const jsonPath = path.join(__dirname, 'tunes-extracted.json')
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ tunes-extracted.json not found. Run scripts/extract-tunes.ps1 first.')
    process.exit(1)
  }

  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8').replace(/^\uFEFF/, ''))
  console.log(`📂 Loaded ${raw.length} tune entries from JSON`)

  await ensureTable()
  console.log('✅ Table ready')

  let inserted = 0
  let skipped = 0
  const BATCH = 50

  for (let i = 0; i < raw.length; i += BATCH) {
    const batch = raw.slice(i, i + BATCH)
    for (const entry of batch) {
      try {
        const { make, model } = parseCarName(entry.car_name || '')
        const tuneName = (entry.tune_name || 'Community Tune').trim() || 'Community Tune'
        const tunerName = (entry.tuner_name || 'Unknown').trim() || 'Unknown'
        const shareCode = entry.share_code || null
        const piClass = entry.pi_class || null
        const discipline = entry.discipline || 'Road'
        const id = slugify(`${make}-${model}-${tuneName}-${shareCode || i}`)

        await client.execute({
          sql: `INSERT OR IGNORE INTO community_tunes
                  (id, car_make, car_model, tune_name, tuner_name,
                   share_code, discipline, pi_class, tune_data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [id, make, model, tuneName, tunerName,
                 shareCode, discipline, piClass, '{}'],
        })
        inserted++
      } catch (err) {
        console.warn(`  ⚠ Skip: ${entry.car_name} — ${err.message}`)
        skipped++
      }
    }
    process.stdout.write(`\r  Progress: ${Math.min(i + BATCH, raw.length)}/${raw.length}`)
  }

  console.log(`\n✅ Done — inserted: ${inserted}, skipped: ${skipped}`)
  process.exit(0)
}

main().catch(err => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
