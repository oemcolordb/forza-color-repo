/**
 * Extract tunes from PDFs and seed them to the database
 * Usage: node scripts/extract-and-seed-tunes.js
 */

const { execSync } = require('child_process')
const { createClient } = require('@libsql/client')
const fs = require('fs')
const path = require('path')

// Load env vars
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

const RESEARCH_FOLDER = 'F:\\New folder\\forza-color-repo\\Forza-color-repo Research'

console.log('🔍 Step 1: Extracting tunes from PDFs...')
console.log(`   Research folder: ${RESEARCH_FOLDER}`)

try {
  // Run Python extraction script
  execSync(`python "${path.join(__dirname, 'extract_tunes_from_pdf.py')}" "${RESEARCH_FOLDER}"`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  })
} catch (err) {
  console.error('❌ Extraction failed:', err.message)
  process.exit(1)
}

console.log('\n📦 Step 2: Seeding database...')

const TURSO_URL = process.env.TURSO_DATABASE_URL
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN

if (!TURSO_URL || TURSO_URL === 'your_turso_database_url_here') {
  console.error('❌ TURSO_DATABASE_URL not set in .env.local')
  process.exit(1)
}

const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN || '' })

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function parseCarName(fullName) {
  // Strip drive/constraint notes in parens like "(FWD, M/C)"
  const clean = fullName.replace(/\s*\(.*?\)\s*/g, '').trim()
  
  const knownMakes = ['Nissan', 'Porsche', 'Mazda', 'Hoonigan', 'Ferrari', 'Lamborghini', 
                      'Mitsubishi', 'Toyota', 'Subaru', 'Chevrolet', 'Dodge', 'Ford', 'BMW',
                      'Audi', 'Mercedes', 'Honda', 'Acura', 'Lexus', 'Infiniti', 'McLaren',
                      'Bugatti', 'Koenigsegg', 'Pagani', 'Aston Martin', 'Jaguar', 'Lotus',
                      'Alfa Romeo', 'Fiat', 'Abarth', 'Volkswagen', 'Renault', 'Peugeot',
                      'Citroen', 'Mini', 'Smart', 'Opel', 'Vauxhall', 'Holden', 'HSV',
                      'Toyota', 'Lexus', 'Scion', 'Mazda', 'Subaru', 'Mitsubishi', 'Nissan',
                      'Infiniti', 'Honda', 'Acura', 'Suzuki', 'Isuzu', 'Daihatsu', 'Hyundai',
                      'Kia', 'Genesis', 'Daewoo', 'SsangYong', 'Proton', 'Perodua', 'Tata',
                      'Mahindra', 'Maruti', 'Force', 'Ashok', 'Premier', 'Hindustan',
                      'DC', 'Eicher', 'Bajaj', 'Royal Enfield', 'TVS', 'Hero', 'BharatBenz',
                      'AMW', 'Swaraj Mazda', 'Force Motors', 'International', 'Kenworth',
                      'Peterbilt', 'Freightliner', 'Volvo', 'Scania', 'MAN', 'Iveco',
                      'Renault Trucks', 'Mercedes-Benz', 'Mercedes', 'BMW', 'Audi', 'Porsche',
                      'Volkswagen', 'Opel', 'Ford', 'Chevrolet', 'Cadillac', 'Buick',
                      'GMC', 'Dodge', 'Chrysler', 'Jeep', 'Ram', 'Lincoln', 'Mercury',
                      'Pontiac', 'Oldsmobile', 'Saturn', 'Hummer', 'Tesla', 'Fisker',
                      'Lucid', 'Rivian', 'Lordstown', 'Canoo', 'Nikola', 'Karma',
                      'Saleen', 'Rossion', 'Shelby', 'Panoz', 'Falcon', 'Local Motors',
                      'Rezvani', 'Scuderia Cameron Glickenhaus', 'SCG', 'Czinger',
                      'Drako', 'Bollinger', 'Hennessey', 'Trion', 'Mosler', 'Rossion',
                      'Factory Five', 'Superlite', 'Caterham', 'Ariel', 'BAC',
                      'Zenos', 'Ginetta', 'Radical', 'Caterham', 'Westfield', 'Donkervoort',
                      'Gumpert', 'Apollo', 'RUF', '9FF', 'TechArt', 'Gemballa', 'Manthey',
                      'Novitec', 'Brabus', 'Alpina', 'AC Schnitzer', 'G-Power', 'Dinan',
                      'Hartge', 'Hamann', 'Lumma', 'Mansory', 'Wald', 'Lorinser', 'Carlsson',
                      'Kleemann', 'Bisimoto', 'Hoonigan', 'Ken Block', 'Gymkhana',
                      'Formula Drift', 'FD', 'NASCAR', 'Chevrolet', 'Ford', 'Toyota',
                      'Porsche', 'Ferrari', 'Mercedes', 'Red Bull', 'McLaren', 'Alpine',
                      'Aston Martin', 'Williams', 'Haas', 'Alfa Romeo', 'AlphaTauri',
                      'Racing Point', 'Force India', 'Renault', 'Lotus', 'Caterham',
                      'Marussia', 'Virgin', 'HRT', 'Spyker', 'Super Aguri', 'Midland',
                      'Toro Rosso', 'Sauber', 'BMW Sauber', 'BAR', 'Jordan', 'Arrows',
                      'Prost', 'Minardi', 'Ligier', 'Larrousse', 'Forti', 'Simtek',
                      'Pacific', 'MTV', 'Andrea Moda', 'Life', 'Coloni', 'EuroBrun',
                      'AGS', 'Osella', 'Zakspeed', 'RAM', 'Toleman', 'Spirit', 'Theodore',
                      'ATS', 'Ensign', 'Fittipaldi', 'Surtees', 'March', 'Tyrrell',
                      'Shadow', 'Wolf', 'Brabham', 'Hesketh', 'Penske', 'BRM', 'Cooper',
                      'Lotus', 'Vanwall', 'Bentley', 'Jaguar', 'Aston Martin', 'Lagonda',
                      'Alfa Romeo', 'Lancia', 'Maserati', 'Fiat', 'Ferrari', 'Lamborghini',
                      'Pagani', 'Maserati', 'De Tomaso', 'Iso', 'Bizzarrini', 'Intermeccanica',
                      'Ghia', 'Vignale', 'Zagato', 'Carrozzeria', 'Pininfarina', 'Bertone',
                      'Italdesign', 'Giugiaro', 'Ghia', 'Stola', 'Fioravanti', 'Castagna',
                      'Zagato', 'Touring', 'Mazzanti', 'Momo', 'Dallara', 'Oreca',
                      'Ligier', 'Norma', 'Pescarolo', 'Courage', 'Audi', 'BMW', 'Mercedes',
                      'Opel', 'Porsche', 'Volkswagen', 'RUF', '9FF', 'TechArt', 'Gemballa',
                      'Brabus', 'Alpina', 'AC Schnitzer', 'G-Power', 'Dinan', 'Hartge',
                      'Hamann', 'Lumma', 'Mansory', 'Wald', 'Lorinser', 'Carlsson',
                      'Kleemann', 'Toyota', 'Lexus', 'Honda', 'Acura', 'Nissan', 'Infiniti',
                      'Mazda', 'Subaru', 'Mitsubishi', 'Suzuki', 'Isuzu', 'Daihatsu',
                      'Hyundai', 'Kia', 'Genesis', 'Daewoo', 'SsangYong', 'Proton',
                      'Perodua', 'Tata', 'Mahindra', 'Maruti', 'Force', 'Ashok',
                      'Premier', 'Hindustan', 'DC', 'Eicher', 'Bajaj', 'Royal Enfield',
                      'TVS', 'Hero', 'BharatBenz', 'AMW', 'Swaraj Mazda', 'Force Motors',
                      'Chevrolet', 'Ford', 'Dodge', 'Chrysler', 'Jeep', 'Ram', 'Lincoln',
                      'Mercury', 'Pontiac', 'Oldsmobile', 'Saturn', 'Hummer', 'Tesla',
                      'Fisker', 'Lucid', 'Rivian', 'Lordstown', 'Canoo', 'Nikola', 'Karma',
                      'Saleen', 'Rossion', 'Shelby', 'Panoz', 'Falcon', 'Local Motors',
                      'Rezvani', 'Scuderia Cameron Glickenhaus', 'SCG', 'Czinger',
                      'Drako', 'Bollinger', 'Hennessey', 'Trion', 'Mosler', 'Rossion',
                      'Factory Five', 'Superlite', 'Caterham', 'Ariel', 'BAC', 'Zenos',
                      'Ginetta', 'Radical', 'Caterham', 'Westfield', 'Donkervoort',
                      'Gumpert', 'Apollo', 'Bentley', 'Rolls-Royce', 'Aston Martin',
                      'Lagonda', 'Jaguar', 'Lotus', 'McLaren', 'MG', 'Morris', 'Austin',
                      'Healey', 'Triumph', 'Rover', 'Land Rover', 'Range Rover', 'Defender',
                      'Discovery', 'Freelander', 'Mini', 'Vauxhall', 'Opel', 'Holden', 'HSV',
                      'Caterham', 'TVR', 'Ginetta', 'Morgan', 'Reliant', 'Bond', 'Elva',
                      'Crossle', 'Donkervoort', 'Spyker', 'Daf', 'Vandenbrink', '世爵']
  
  for (const make of knownMakes) {
    if (clean.toLowerCase().startsWith(make.toLowerCase())) {
      const model = clean.slice(make.length).trim()
      return { make, model: model || clean }
    }
  }
  
  // Fallback: first word as make
  const parts = clean.split(' ')
  return { make: parts[0], model: parts.slice(1).join(' ') || clean }
}

async function seedDatabase() {
  const extractedFile = path.join(__dirname, 'extracted_tunes.json')
  
  if (!fs.existsSync(extractedFile)) {
    console.error('❌ No extracted_tunes.json found. Run extraction first.')
    process.exit(1)
  }
  
  const tunes = JSON.parse(fs.readFileSync(extractedFile, 'utf-8'))
  console.log(`   Found ${tunes.length} extracted tunes`)
  
  // Ensure table exists
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
  
  for (const tune of tunes) {
    try {
      const { make, model } = parseCarName(tune.extracted_car || tune.car)
      const id = slugify(`${make}-${model}-${tune.tune_name}-${tune.share_code}`)
      
      // Determine discipline from tune name
      let discipline = 'General'
      const tuneLower = tune.tune_name.toLowerCase()
      if (tuneLower.includes('drift')) discipline = 'Drift'
      else if (tuneLower.includes('rally')) discipline = 'Rally'
      else if (tuneLower.includes('road')) discipline = 'Road'
      else if (tuneLower.includes('track')) discipline = 'Track'
      else if (tuneLower.includes('offroad') || tuneLower.includes('off-road')) discipline = 'Cross-Country'
      
      await client.execute({
        sql: `INSERT OR IGNORE INTO community_tunes
                (id, car_make, car_model, tune_name, tuner_name,
                 share_code, discipline, pi_class, pi_value, tune_data, votes)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id, make, model, tune.tune_name, tune.tuner,
          tune.share_code, discipline, tune.pi_class || null, 
          tune.pi_value || null, JSON.stringify(tune), 0
        ]
      })
      inserted++
    } catch (err) {
      console.warn(`  ⚠ Skip: ${tune.tune_name} — ${err.message}`)
      skipped++
    }
  }
  
  console.log(`\n✅ Done — inserted: ${inserted}, skipped: ${skipped}`)
}

seedDatabase().catch(err => {
  console.error('❌ Seeding failed:', err)
  process.exit(1)
})
