/**
 * Seed curated legendary community tunes into the Turso database.
 * Run: node scripts/seed-legendary-tunes.js
 * Requires: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in environment (or .env.local)
 */

const { createClient } = require('@libsql/client')
const fs = require('fs')
const path = require('path')

// Load env vars from .env.local if available
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

const TURSO_URL = process.env.TURSO_DATABASE_URL
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN

if (!TURSO_URL || TURSO_URL === 'your_turso_database_url_here') {
  console.error('❌ TURSO_DATABASE_URL not set. Check your .env.local file.')
  process.exit(1)
}

const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN || '' })

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ─── Curated Legendary Community Tunes ────────────────────────────────────────
const legendaryTunes = [
  { make: "Nissan", model: "Skyline GT-R V-Spec 1997", tuneName: "Godzilla Grip", tunerName: "Don Joewon Song", shareCode: "142355684", discipline: "Road", piClass: "S1", piValue: 900 },
  { make: "Porsche", model: "911 GT3 RS 2016", tuneName: "Meta Track Setup", tunerName: "K1Z Suellio", shareCode: "188443992", discipline: "Track", piClass: "S1", piValue: 900 },
  { make: "Mazda", model: "RX-7 Spirit R Type-A 2002", tuneName: "Godlike Drift", tunerName: "KenBlocksSohn", shareCode: "341556712", discipline: "Drift", piClass: "S1", piValue: 900 },
  { make: "Hoonigan", model: "Ford Escort RS1800 1978", tuneName: "Unbeatable Rally", tunerName: "Don Joewon Song", shareCode: "115889214", discipline: "Rally", piClass: "S1", piValue: 900 },
  { make: "Ferrari", model: "599XX Evolution", tuneName: "Max Grip / Top Speed", tunerName: "Nalak28", shareCode: "412112555", discipline: "Track", piClass: "X", piValue: 999 },
  { make: "Lamborghini", model: "Sesto Elemento FE", tuneName: "Goliath Winner", tunerName: "XNDR", shareCode: "891123456", discipline: "Track", piClass: "X", piValue: 999 },
  { make: "Mitsubishi", model: "Lancer Evolution VIII MR", tuneName: "A-Class Road Meta", tunerName: "K1Z Howzer", shareCode: "112554998", discipline: "Road", piClass: "A", piValue: 800 },
  { make: "Toyota", model: "Supra RZ 1998", tuneName: "Purist Grip", tunerName: "Saeesto", shareCode: "184992113", discipline: "Road", piClass: "A", piValue: 800 },
  { make: "Subaru", model: "Impreza WRX STI 2004", tuneName: "Dirt Monster", tunerName: "Rocklxd", shareCode: "772193411", discipline: "Cross-Country", piClass: "A", piValue: 800 },
  { make: "Chevrolet", model: "Corvette C8 Stingray", tuneName: "S1 Grip Meta", tunerName: "Nalak28", shareCode: "228491002", discipline: "Road", piClass: "S1", piValue: 900 },
  { make: "Dodge", model: "Viper SRT10 ACR", tuneName: "Powerbuild RWD", tunerName: "ESV Suimin", shareCode: "551239881", discipline: "Road", piClass: "S1", piValue: 900 },
  { make: "Ford", model: "Supervan 3", tuneName: "Unbeatable Off-Road", tunerName: "Don Joewon Song", shareCode: "331902411", discipline: "Cross-Country", piClass: "S1", piValue: 900 }
]

async function main() {
  console.log(`📂 Seeding ${legendaryTunes.length} legendary community tunes...`)

  // Ensure the table exists
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
      ip_address  TEXT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  let inserted = 0
  let skipped = 0

  for (const tune of legendaryTunes) {
    try {
      const id = slugify(`${tune.make}-${tune.model}-${tune.tuneName}-${tune.shareCode}`)

      // Pack the source note into the tune_data JSON payload
      const tuneData = JSON.stringify({
        source: "Reddit & Forums Deep Dive",
        note: "Highly recommended legendary community setup."
      })

      await client.execute({
        sql: `INSERT OR IGNORE INTO community_tunes
                (id, car_make, car_model, tune_name, tuner_name,
                 share_code, discipline, pi_class, pi_value, tune_data, votes)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [id, tune.make, tune.model, tune.tuneName, tune.tunerName,
               tune.shareCode, tune.discipline, tune.piClass, tune.piValue, tuneData, 100], // Seed with 100 upvotes to pin them near the top!
      })
      inserted++
      console.log(`  🏎️ Added: ${tune.make} ${tune.model} by ${tune.tunerName}`)
    } catch (err) {
      console.warn(`  ⚠ Skip: ${tune.make} ${tune.model} — ${err.message}`)
      skipped++
    }
  }

  console.log(`\n✅ Done — inserted: ${inserted}, skipped: ${skipped}`)
  process.exit(0)
}

main().catch(err => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
