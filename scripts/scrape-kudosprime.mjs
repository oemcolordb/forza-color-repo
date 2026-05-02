/**
 * scrape-kudosprime.mjs
 * Scrapes the full FH5 car list from KudosPrime across all pages.
 * Writes real FH5 in-game data to:
 *   app/data/cars.json
 *   public/data/cars-optimized.json  (wrapped with filters)
 *
 * Source: https://kudosprime.com/fh5/carlist.php
 * Data fields: year, manufacturer, model, division (type), price, drivetrain,
 *              PI class/value, HP, weight (lbs), stats (speed/handling/accel/launch/brake/offroad)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_APP = path.join(ROOT, 'app', 'data', 'cars.json')
const OUT_PUB = path.join(ROOT, 'public', 'data', 'cars-optimized.json')
const AUDIT = path.join(ROOT, 'app', 'data', 'scrape-audit.json')

const BASE_URL = 'https://kudosprime.com/fh5/carlist.php'
const PAGE_SIZE = 50
const DELAY_MS = 1200 // polite delay between requests

// ── Manufacturer → Country lookup ──────────────────────────────────────────
const COUNTRY_MAP = {
  Abarth: 'Italy',
  Acura: 'USA',
  'Alfa Romeo': 'Italy',
  Alpine: 'France',
  'Alumi Craft': 'USA',
  AMC: 'USA',
  'AMG TRANSPORT DYNAMICS': 'USA',
  Apollo: 'Germany',
  Ariel: 'UK',
  Ascari: 'UK',
  'Aston Martin': 'UK',
  ATS: 'Germany',
  Audi: 'Germany',
  BAC: 'UK',
  Bentley: 'UK',
  BMW: 'Germany',
  Brabham: 'Australia',
  Bristol: 'UK',
  Bugatti: 'France',
  Buick: 'USA',
  Cadillac: 'USA',
  'Can-Am': 'Canada',
  Caterham: 'UK',
  Chevrolet: 'USA',
  Chrysler: 'USA',
  Citroën: 'France',
  Cobra: 'USA',
  Cosworth: 'UK',
  Datsun: 'Japan',
  'De Tomaso': 'Italy',
  Dodge: 'USA',
  Eagle: 'USA',
  Ferrari: 'Italy',
  FIAT: 'Italy',
  Ford: 'USA',
  Formula: 'International',
  'Funco Motorsports': 'USA',
  GMC: 'USA',
  GreenPower: 'USA',
  Hennessey: 'USA',
  Honda: 'Japan',
  Hoonigan: 'USA',
  HUMMER: 'USA',
  Hyundai: 'South Korea',
  Infiniti: 'Japan',
  International: 'USA',
  Italdesign: 'Italy',
  Jaguar: 'UK',
  Jeep: 'USA',
  Kia: 'South Korea',
  Koenigsegg: 'Sweden',
  KTM: 'Austria',
  Lamborghini: 'Italy',
  Lancia: 'Italy',
  'Land Rover': 'UK',
  Lexus: 'Japan',
  'Local Motors': 'USA',
  Lola: 'UK',
  Lotus: 'UK',
  Maserati: 'Italy',
  Mazda: 'Japan',
  McLaren: 'UK',
  'Mercedes-AMG': 'Germany',
  'Mercedes-Benz': 'Germany',
  MINI: 'UK',
  Mitsubishi: 'Japan',
  Morgan: 'UK',
  Mosler: 'USA',
  Napier: 'UK',
  Nissan: 'Japan',
  Noble: 'UK',
  Oldsmobile: 'USA',
  Opel: 'Germany',
  Pagani: 'Italy',
  Peel: 'UK',
  Peugeot: 'France',
  Plymouth: 'USA',
  Polaris: 'USA',
  Pontiac: 'USA',
  Porsche: 'Germany',
  Ram: 'USA',
  Renault: 'France',
  Rimac: 'Croatia',
  'Rolls-Royce': 'UK',
  SAAB: 'Sweden',
  Senna: 'Brazil',
  SEAT: 'Spain',
  Shelby: 'USA',
  Smart: 'Germany',
  SUBARU: 'Japan',
  Toyota: 'Japan',
  TVR: 'UK',
  Ultima: 'UK',
  Vauxhall: 'UK',
  Volkswagen: 'Germany',
  Volvo: 'Sweden',
  Vuhl: 'Mexico',
  Willys: 'USA',
  Zenvo: 'Denmark',
}

// ── Division → Type ─────────────────────────────────────────────────────────
// Maps KudosPrime division text to the game's displayed car type
const TYPE_MAP = {
  'CULT CARS': 'Cult Cars',
  'CLASSIC RALLY': 'Classic Rally',
  'RALLY MONSTERS': 'Rally Monsters',
  'HOT HATCH': 'Hot Hatch',
  'RETRO HOT HATCH': 'Retro Hot Hatch',
  'MODERN SPORTS CARS': 'Modern Sports Cars',
  'RETRO SPORTS CARS': 'Retro Sports Cars',
  'EXTREME TRACK TOYS': 'Extreme Track Toys',
  'TRACK TOYS': 'Track Toys',
  'GT CARS': 'GT Cars',
  'SUPER GT': 'Super GT',
  'CLASSIC RACERS': 'Classic Racers',
  'RETRO RACERS': 'Retro Racers',
  'MODERN SUPERCARS': 'Modern Supercars',
  'RETRO SUPERCARS': 'Retro Supercars',
  HYPERCARS: 'Hypercars',
  'SUPER SALOONS': 'Super Saloons',
  'RETRO SALOONS': 'Retro Saloons',
  'CLASSIC MUSCLE': 'Classic Muscle',
  'RETRO MUSCLE': 'Retro Muscle',
  'MODERN MUSCLE': 'Modern Muscle',
  'CLASSIC SPORTS CARS': 'Classic Sports Cars',
  'SPORTS UTILITY HEROES': 'Sports Utility Heroes',
  OFFROAD: 'Off-Road',
  'UNLIMITED OFFROAD': 'Unlimited Off-Road',
  'UNLIMITED BUGGIES': 'Unlimited Buggies',
  'OFFROAD BUGGIES': 'Off-Road Buggies',
  TRUCKS: 'Trucks',
  'TROPHY TRUCKS': 'Trophy Trucks',
  'DRIFT CARS': 'Drift Cars',
  'STREET SCENE': 'Street Scene',
  'RODS AND CUSTOMS': 'Rods and Customs',
  'VANS AND UTILITY': 'Vans and Utility',
  'MINIVANS AND VANS': 'Minivans and Vans',
  'PICKUP TRUCKS': 'Pickup Trucks',
  'SUPER TRUCKS': 'Super Trucks',
  'ELECTRIC CARS': 'Electric Cars',
  'FORMULA DRIFT': 'Formula Drift',
  'FORMULA E': 'Formula E',
  VIP: 'VIP',
  'CARS OF FORZA': 'Cars of Forza',
  'BARN FINDS': 'Barn Finds',
  'FORZA EDITION': 'Forza Edition',
}

// ── Rarity from source text ─────────────────────────────────────────────────
function inferRarity(sourceText, price) {
  const s = (sourceText || '').toLowerCase()
  if (s.includes('backstage pass') || (s.includes('festival playlist') && price >= 1000000))
    return 'Legendary'
  if (price >= 4000000) return 'Legendary'
  if (price >= 1000000) return 'Epic'
  if (price >= 200000) return 'Rare'
  return 'Common'
}

// ── HTML decode helper ───────────────────────────────────────────────────────
function decodeHtml(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

// ── Parse a single page of HTML ─────────────────────────────────────────────
// Verified HTML structure (KudosPrime, April 2026):
//   <div class="car q1 " data-carid="732">
//     <a class="name" href="car_sheet.php?id=732">1968 Abarth 595 Esseesse<m>stars</m>
//     <div class="cty" data-cty="10">CULT CARS</div>
//     <div class="price"><b>35,000</b> Cr</div>
//     <div class='car_source'><b>Autoshow &amp; Wheelspin</b></div>
//     <span class="pi D"><i>D</i><b>100</b></span>
//     <span class="tr">RWD</span>
//     <div class="tpw">21 <i>kW</i>570 <i>Kg</i></div>
//     <span class="stats">
//       <b class="sp">2.6</b> <b class="ha">3.7</b> <b class="ac">1.7</b>
//       <b class="la">2.6</b> <b class="br">2.0</b> <b class="or">5.1</b>
//     </span>
//   Note: power = kW (×1.34102 → HP), weight = Kg directly
function parsePage(html) {
  const cars = []

  // Split on opening car divs — each entry contains one car's data
  const blocks = html.split(/<div class="car [^"]*"\s+data-carid="\d+"/)
  // blocks[0] is preamble, blocks[1..n] are car entries

  for (let i = 1; i < blocks.length; i++) {
    const b = blocks[i]
    try {
      // Car name: class="name" ...>1968 Abarth 595 Esseesse<m>
      const nameM = b.match(/class="name"[^>]*>([^<]+)<m>/)
      if (!nameM) continue
      const fullName = decodeHtml(nameM[1].trim())

      const yearM = fullName.match(/^(\d{4})\s+(.+)/)
      if (!yearM) continue
      const year = yearM[1]
      const makeModel = yearM[2].trim()

      // Division: class="cty" ...>CULT CARS<
      const divM = b.match(/class="cty"[^>]*>([^<]+)</)
      const division = divM ? divM[1].trim() : 'Unknown'

      // Price: class="price"><b>35,000<
      const priceM = b.match(/class="price"[^>]*>\s*<b>\s*([\d,]+)\s*</)
      const price = priceM ? parseInt(priceM[1].replace(/,/g, ''), 10) : 0

      // Source: car_source ...><b>Autoshow & Wheelspin<
      const srcM = b.match(/car_source'?[^>]*>\s*<b>([^<]+)</)
      const source = srcM ? decodeHtml(srcM[1].trim()) : ''

      // PI class + value: class="pi D"><i>D</i><b>100</b>
      const piM = b.match(/class="pi\s+([DCBAS][12]?)"><i>[^<]*<\/i><b>(\d+)<\/b>/)
      if (!piM) continue
      const piClass = piM[1]
      const piValue = parseInt(piM[2], 10)

      // Drivetrain: class="tr">RWD<
      const trM = b.match(/class="tr">(FWD|RWD|AWD)</)
      const drivetrain = trM ? trM[1] : 'RWD'

      // Power (kW) + weight (Kg): 21 <i>kW</i>570 <i>Kg</i>
      const tpwM = b.match(/([\d,]+)\s*<i>kW<\/i>([\d,]+)\s*<i>Kg<\/i>/)
      const kw = tpwM ? parseInt(tpwM[1].replace(/,/g, ''), 10) : 0
      const hp = Math.round(kw * 1.34102)
      const weight_kg = tpwM ? parseInt(tpwM[2].replace(/,/g, ''), 10) : 0

      // Stats: <b class="sp">2.6</b> etc (use /s flag for multiline match)
      const stM = b.match(
        /class="sp">([\d.]+).*?class="ha">([\d.]+).*?class="ac">([\d.]+).*?class="la">([\d.]+).*?class="br">([\d.]+).*?class="or">([\d.]+)/s
      )
      if (!stM) continue
      const [, speed, handling, acceleration, launch, braking, offroad] = stM.map(Number)

      // Infer manufacturer (try 3-word, 2-word, then 1-word against COUNTRY_MAP)
      const words = makeModel.split(' ')
      let manufacturer = words[0]
      for (let w = Math.min(words.length - 1, 3); w >= 1; w--) {
        const candidate = words.slice(0, w).join(' ')
        if (COUNTRY_MAP[candidate]) {
          manufacturer = candidate
          break
        }
      }
      const model = makeModel.slice(manufacturer.length).trim() || makeModel
      const country = COUNTRY_MAP[manufacturer] || 'Unknown'
      const type = TYPE_MAP[division.toUpperCase().trim()] || division
      const rarity = inferRarity(source, price)

      cars.push({
        year,
        manufacturer,
        model,
        type,
        price,
        rarity,
        country,
        drivetrain,
        hp,
        weight_kg,
        stats: {
          speed: +parseFloat(speed).toFixed(1),
          handling: +parseFloat(handling).toFixed(1),
          acceleration: +parseFloat(acceleration).toFixed(1),
          launch: +parseFloat(launch).toFixed(1),
          braking: +parseFloat(braking).toFixed(1),
          offroad: +parseFloat(offroad).toFixed(1),
        },
        pi: { class: piClass, value: piValue },
      })
    } catch {
      /* skip malformed */
    }
  }

  return cars
}

// ── Fetch a single page ─────────────────────────────────────────────────────
async function fetchPage(start) {
  const url = `${BASE_URL}?start=${start}`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ForzaColorBot/1.0; data research)',
      Accept: 'text/html',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

// ── Sleep helper ─────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms))

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║  KudosPrime FH5 Car Scraper              ║')
  console.log('╚══════════════════════════════════════════╝')

  // First pass: fetch page 1 and attempt to read total
  console.log('\n📡 Fetching page 1...')
  const firstHtml = await fetchPage(0)

  // KudosPrime shows total like: "903 car(s)" or "903 model(s)" or similar.
  // Try several patterns; fall back to auto-discovery (scrape until empty).
  const totalMatch =
    firstHtml.match(/(\d{3,4})\s+(?:car|model|result)\(s\)/i) ||
    firstHtml.match(/showing\s+\d+[–-]\d+\s+of\s+(\d+)/i) ||
    firstHtml.match(/>(\d{3,4})\s+cars?</i)
  const totalCars = totalMatch ? parseInt(totalMatch[1], 10) : 0
  // If we couldn't parse a total, probe until a page returns 0 cars (max 25 pages × 50 = 1250)
  const totalPages = totalCars > 0 ? Math.ceil(totalCars / PAGE_SIZE) : 25
  console.log(
    totalCars
      ? `   KudosPrime reports: ${totalCars} cars → ${totalPages} pages`
      : `   (Could not parse total — will scan up to ${totalPages} pages and stop when empty)`
  )

  const allCars = []

  // Parse page 1
  const firstBatch = parsePage(firstHtml)
  allCars.push(...firstBatch)
  console.log(`   Page  1: ${firstBatch.length} cars  (total: ${allCars.length})`)

  // Remaining pages — stop early if a page returns 0 cars (past the end)
  for (let page = 1; page < totalPages; page++) {
    await sleep(DELAY_MS)
    const start = page * PAGE_SIZE
    try {
      const html = await fetchPage(start)
      const batch = parsePage(html)
      if (batch.length === 0) {
        console.log(`   Page ${page + 1}: 0 cars — stopping (reached end of list)`)
        break
      }
      allCars.push(...batch)
      console.log(
        `   Page ${String(page + 1).padStart(2)}: ${batch.length} cars  (total: ${allCars.length})`
      )
    } catch (err) {
      console.error(`   ✗ Page ${page + 1} failed: ${err.message}`)
    }
  }

  console.log(`\n✓ Raw scraped: ${allCars.length} cars`)

  // ── Dedup by year+manufacturer+model ──────────────────────────────────────
  const seen = new Map()
  let dupes = 0
  for (const car of allCars) {
    const key = `${car.year}|${car.manufacturer}|${car.model}`.toLowerCase()
    if (!seen.has(key)) {
      seen.set(key, car)
    } else {
      dupes++
    }
  }
  const deduped = Array.from(seen.values())
  console.log(`✓ After dedup: ${deduped.length} cars (removed ${dupes} dupes)`)

  // ── Sort: manufacturer A–Z, then year asc ─────────────────────────────────
  deduped.sort((a, b) => {
    if (a.manufacturer < b.manufacturer) return -1
    if (a.manufacturer > b.manufacturer) return 1
    return parseInt(a.year) - parseInt(b.year)
  })

  // ── Write app/data/cars.json ───────────────────────────────────────────────
  // Backup existing if non-empty
  if (fs.existsSync(OUT_APP) && fs.statSync(OUT_APP).size > 10) {
    fs.copyFileSync(OUT_APP, OUT_APP + '.bak.' + Date.now())
  }
  fs.writeFileSync(OUT_APP, JSON.stringify(deduped, null, 2), 'utf8')
  console.log(`\n💾 Written: app/data/cars.json (${deduped.length} entries)`)

  // ── Write public/data/cars-optimized.json (with filter index) ─────────────
  const manufacturers = [...new Set(deduped.map(c => c.manufacturer))].sort()
  const types = [...new Set(deduped.map(c => c.type))].sort()
  const countries = [...new Set(deduped.map(c => c.country))].sort()
  const classes = [...new Set(deduped.map(c => c.pi.class))].sort()

  const optimized = {
    meta: {
      source: 'KudosPrime FH5',
      scrapedAt: new Date().toISOString(),
      totalCars: deduped.length,
    },
    filters: { manufacturers, types, countries, classes },
    cars: deduped,
  }

  if (fs.existsSync(OUT_PUB)) {
    fs.copyFileSync(OUT_PUB, OUT_PUB + '.bak.' + Date.now())
  }
  fs.writeFileSync(OUT_PUB, JSON.stringify(optimized, null, 2), 'utf8')
  console.log(`💾 Written: public/data/cars-optimized.json`)

  // ── Update scrape-audit.json ───────────────────────────────────────────────
  let audit = { lastRun: '', entries: [] }
  if (fs.existsSync(AUDIT)) {
    try {
      audit = JSON.parse(fs.readFileSync(AUDIT, 'utf8'))
    } catch {}
  }
  audit.lastRun = new Date().toISOString()
  audit.entries.push({
    source: BASE_URL,
    fetchedAt: new Date().toISOString(),
    fields: [
      'year',
      'manufacturer',
      'model',
      'type',
      'price',
      'rarity',
      'country',
      'drivetrain',
      'hp',
      'weight_kg',
      'stats',
      'pi',
    ],
    status: 'ok',
    notes: `Scraped ${totalCars} listed, parsed ${allCars.length} raw, ${deduped.length} after dedup.`,
  })
  fs.writeFileSync(AUDIT, JSON.stringify(audit, null, 2), 'utf8')

  // ── Summary by class ──────────────────────────────────────────────────────
  const byClass = {}
  deduped.forEach(c => {
    byClass[c.pi.class] = (byClass[c.pi.class] || 0) + 1
  })
  console.log('\n📊 Cars by PI class:')
  Object.entries(byClass)
    .sort()
    .forEach(([k, v]) => console.log(`   ${k}: ${v}`))

  const byMfr = {}
  deduped.forEach(c => {
    byMfr[c.manufacturer] = (byMfr[c.manufacturer] || 0) + 1
  })
  const top10 = Object.entries(byMfr)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
  console.log('\n📊 Top 10 manufacturers:')
  top10.forEach(([m, c]) => console.log(`   ${m}: ${c}`))

  console.log('\n✅ Done.')
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
