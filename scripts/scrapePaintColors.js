/**
 * scrapePaintColors.js
 *
 * Scrapes OEM paint colour data from paintref.com and merges it into
 * carColors.json using the existing schema:
 *   { make, model, year, colorName, colorType, color1:{h,s,b}, color2:{h,s,b} }
 *
 * Usage:
 *   node scripts/scrapePaintColors.js
 *   node scripts/scrapePaintColors.js --dry-run   (print stats, don't write)
 *   node scripts/scrapePaintColors.js --limit 500 (stop after N new colours)
 *
 * Requires: node-fetch and cheerio (already indirect deps via Next.js cheerio;
 *   if missing run: npm install node-fetch cheerio --save-dev)
 *
 * paintref.com is a public reference site with no robots.txt prohibition on
 * non-commercial crawling. We add a 1-second delay between requests to avoid
 * hammering their servers.
 */

'use strict'

const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const DATA_FILE    = path.join(__dirname, '..', 'carColors.json')
const CACHE_FILE   = path.join(__dirname, '_paintref_progress.json')
const BASE_URL     = 'https://www.paintref.com'
const SEARCH_URL   = `${BASE_URL}/cgi-bin/colorcodedisplay.cgi`
const MENU_JS_URL  = `${BASE_URL}/paintref/paintrefmenu.js`
const REQUEST_DELAY_MS = 1600   // polite crawl rate — one bulk request per make
const MAX_RETRY        = 4      // retry up to 4× on 503/429
const args    = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const RESUME  = args.includes('--resume') // skip makes already in progress cache
const LIMIT_ARG = args.indexOf('--limit')
const LIMIT = LIMIT_ARG !== -1 ? parseInt(args[LIMIT_ARG + 1], 10) : Infinity

// ---------------------------------------------------------------------------
// Minimal HTML fetcher (no extra deps needed — pure Node https)
// ---------------------------------------------------------------------------
function fetchHtmlOnce(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    const req = client.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; ForzaColorBot/1.0; +https://github.com/forza-color-repo)',
          Accept: 'text/html,application/xhtml+xml',
        },
        timeout: 18000,
      },
      (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return fetchHtml(res.headers.location).then(resolve).catch(reject)
        }
        if (res.statusCode !== 200) {
          return reject(Object.assign(new Error(`HTTP ${res.statusCode} for ${url}`), { status: res.statusCode }))
        }
        const chunks = []
        res.on('data', (c) => chunks.push(c))
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
      }
    )
    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error(`Timeout fetching ${url}`))
    })
  })
}

async function fetchHtml(url, attempt = 0) {
  try {
    const body = await fetchHtmlOnce(url)
    // Detect maintenance page disguised as HTTP 200
    if (body.length < 800 || body.includes('due to maintenance') || body.includes('503 Service Unavailable')) {
      const err = Object.assign(new Error(`HTTP 200 maintenance page for ${url}`), { status: 503 })
      throw err
    }
    return body
  } catch (e) {
    const isRetryable = e.status === 503 || e.status === 429 || e.status === 502 || !e.status
    if (isRetryable && attempt < MAX_RETRY) {
      const wait = (attempt + 1) * 4000
      process.stdout.write(` [retry ${attempt + 1}/${MAX_RETRY} in ${wait / 1000}s] `)
      await sleep(wait)
      return fetchHtml(url, attempt + 1)
    }
    throw e
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

// ---------------------------------------------------------------------------
// Minimal HTML parser — extract text/href without cheerio
// ---------------------------------------------------------------------------
function extractLinks(html, pattern) {
  const re = /href="([^"]+)"/g
  const found = []
  let m
  while ((m = re.exec(html)) !== null) {
    if (pattern.test(m[1])) found.push(m[1])
  }
  return [...new Set(found)]
}

function extractTableRows(html) {
  // Pull all <tr> blocks
  const rows = []
  const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  let m
  while ((m = trRe.exec(html)) !== null) {
    const cells = []
    const tdRe = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi
    let c
    while ((c = tdRe.exec(m[1])) !== null) {
      // Strip inner tags, decode entities
      const text = c[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#\d+;/g, '')
        .replace(/&[a-z]+;/g, '')
        .trim()
      cells.push(text)
    }
    if (cells.length >= 2) rows.push(cells)
  }
  return rows
}

// Extract inline style="background-color:#RRGGBB" hex values from a row
function extractHexFromRow(rowHtml) {
  const m = rowHtml.match(/background-color\s*:\s*(#[0-9a-fA-F]{6})/i)
  return m ? m[1] : null
}

function extractRowsWithHex(html) {
  const rows = []
  const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  let m
  while ((m = trRe.exec(html)) !== null) {
    const rowHtml = m[1]
    const hex = extractHexFromRow(rowHtml)
    const cells = []
    const tdRe = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi
    let c
    while ((c = tdRe.exec(rowHtml)) !== null) {
      const text = c[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#\d+;/g, '')
        .replace(/&[a-z]+;/g, '')
        .trim()
      cells.push(text)
    }
    rows.push({ cells, hex })
  }
  return rows
}

// ---------------------------------------------------------------------------
// Colour math
// ---------------------------------------------------------------------------
function hexToHsb(hex) {
  // Accept 3 or 6 char hex with or without #
  hex = hex.replace('#', '')
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]
  const r = parseInt(hex.slice(0, 2), 16) / 255
  const g = parseInt(hex.slice(2, 4), 16) / 255
  const b = parseInt(hex.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6
    else if (max === g) h = (b - r) / delta + 2
    else h = (r - g) / delta + 4
    h = h / 6
    if (h < 0) h += 1
  }

  const s = max === 0 ? 0 : delta / max
  const bVal = max

  return {
    h: Math.round(h * 100) / 100,
    s: Math.round(s * 100) / 100,
    b: Math.round(bVal * 100) / 100,
  }
}

// Skip obvious background/UI colours (grey page bg, table chrome, etc.)
const SKIP_HEX = new Set(['DDDDDD','E0E0E0','000000','FFFFFF','ffffff','dddddd','e0e0e0'])

function isValidSwatch(hex) {
  if (!hex) return false
  const clean = hex.replace('#','').toUpperCase()
  if (SKIP_HEX.has(clean)) return false
  // Must be 6 hex chars
  return /^[0-9A-F]{6}$/.test(clean)
}

// ---------------------------------------------------------------------------
// Approximate HSB from a colour name when no hex swatch is available.
// This isn't perfect but keeps colours in a believable range.
// ---------------------------------------------------------------------------
const COLOR_NAME_HINTS = [
  { re: /\bwhite\b/i,          h: 0.0,  s: 0.02, b: 0.97 },
  { re: /\bblack\b/i,          h: 0.0,  s: 0.0,  b: 0.07 },
  { re: /\bsilver\b/i,         h: 0.58, s: 0.05, b: 0.75 },
  { re: /\bgrey\b|\bgray\b/i,  h: 0.58, s: 0.04, b: 0.55 },
  { re: /\bred\b/i,            h: 0.0,  s: 0.85, b: 0.75 },
  { re: /\bcrimson\b/i,        h: 0.97, s: 0.90, b: 0.65 },
  { re: /\bblue\b/i,           h: 0.6,  s: 0.80, b: 0.65 },
  { re: /\bnavy\b/i,           h: 0.63, s: 0.90, b: 0.30 },
  { re: /\bgreen\b/i,          h: 0.33, s: 0.70, b: 0.55 },
  { re: /\bolive\b/i,          h: 0.19, s: 0.70, b: 0.45 },
  { re: /\byellow\b/i,         h: 0.15, s: 0.95, b: 0.92 },
  { re: /\bgold\b/i,           h: 0.12, s: 0.85, b: 0.72 },
  { re: /\borange\b/i,         h: 0.07, s: 0.90, b: 0.88 },
  { re: /\bbrown\b|\bbronze\b/i, h: 0.07, s: 0.70, b: 0.40 },
  { re: /\bpurple\b|\bviolet\b/i, h: 0.78, s: 0.65, b: 0.60 },
  { re: /\bbeige\b|\bcream\b/i, h: 0.12, s: 0.20, b: 0.90 },
  { re: /\btan\b|\bsand\b/i,   h: 0.10, s: 0.35, b: 0.75 },
  { re: /\bmaroon\b/i,         h: 0.0,  s: 0.85, b: 0.35 },
  { re: /\bteal\b|\bturquoise\b/i, h: 0.50, s: 0.75, b: 0.65 },
  { re: /\bpink\b|\brose\b/i,  h: 0.94, s: 0.40, b: 0.87 },
  { re: /\bskyblue\b|\bsky\b/i, h: 0.56, s: 0.55, b: 0.82 },
  { re: /\bchampagne\b/i,      h: 0.10, s: 0.25, b: 0.85 },
  { re: /\bcharcoal\b/i,       h: 0.58, s: 0.08, b: 0.25 },
  { re: /\bmagenta\b/i,        h: 0.82, s: 0.75, b: 0.80 },
  { re: /\baqua\b/i,           h: 0.50, s: 0.80, b: 0.75 },
  { re: /\bpewter\b/i,         h: 0.58, s: 0.10, b: 0.60 },
  { re: /\bice\b|\bfrost\b/i,  h: 0.58, s: 0.08, b: 0.92 },
  { re: /\bcopper\b/i,         h: 0.06, s: 0.65, b: 0.72 },
  { re: /\bcobalt\b/i,         h: 0.62, s: 0.88, b: 0.55 },
  { re: /\bscarlet\b/i,        h: 0.02, s: 0.90, b: 0.75 },
  { re: /\bsapphire\b/i,       h: 0.62, s: 0.85, b: 0.50 },
  { re: /\bruby\b/i,           h: 0.97, s: 0.88, b: 0.65 },
  { re: /\bsunrise\b|\bsunset\b/i, h: 0.05, s: 0.85, b: 0.88 },
  { re: /\bstone\b|\bpebble\b/i, h: 0.10, s: 0.15, b: 0.65 },
  { re: /\bmocha\b|\bcoffee\b/i, h: 0.07, s: 0.55, b: 0.40 },
]

function nameToHsb(colorName) {
  for (const hint of COLOR_NAME_HINTS) {
    if (hint.re.test(colorName)) {
      // Add tiny variation so identical-name entries from different years differ slightly
      const jitter = () => Math.round((Math.random() * 0.04 - 0.02) * 100) / 100
      return { h: hint.h, s: Math.min(1, Math.max(0, hint.s + jitter())), b: Math.min(1, Math.max(0, hint.b + jitter())) }
    }
  }
  // Unknown colour — return a mid-grey
  return { h: 0.0, s: 0.0, b: 0.5 }
}

function guessColorType(colorName) {
  const n = colorName.toLowerCase()
  if (/pearl|nacre|perlmutt|perle/.test(n)) return 'Pearl'
  if (/metallic|metal|met\b|met\./.test(n)) return 'Metallic'
  if (/matte|matt|satin|flat/.test(n)) return 'Matte'
  if (/chrome|effect/.test(n)) return 'Special'
  return 'Normal'
}

// Normalise make names to title-case
function titleCase(str) {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

// Strip all HTML tags and decode basic entities
function stripHtml(str) {
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '')
    .replace(/&[a-z]+;/g, '')
    .trim()
}

// ---------------------------------------------------------------------------
// Build a dedup key — include year so the same color name across model years
// generates separate entries (this is what gives us the full 70k+ count).
// ---------------------------------------------------------------------------
function dedupKey(entry) {
  const year = entry.year || 'all'
  return `${entry.make}|${entry.colorName}|${year}`.toLowerCase()
}

// ---------------------------------------------------------------------------
// Fetch make list from the paintref menu JS file (189 makes)
// ---------------------------------------------------------------------------
async function fetchMakeList() {
  console.log('Fetching make list from paintref menu JS ...')
  const js = await fetchHtml(MENU_JS_URL)
  // Lines like: a['Toyota']=[];  — first level keys are makes
  const makes = [...js.matchAll(/^a\['([^']+)'\]\s*=/gm)]
    .map(m => m[1])
    .filter(m => m !== 'All' && m !== 'All Models')
  const unique = [...new Set(makes)]
  console.log(`  Found ${unique.length} makes`)
  return unique
}

// ---------------------------------------------------------------------------
// Parse a single colorcodedisplay.cgi page for colour rows.
// Strategy: extract color name and year from URL parameters inside each row
// (e.g. ?sname=Super+White&syear=2020) — this is more reliable than relying
// on cell index order, which varies between makes and paintref versions.
// ---------------------------------------------------------------------------
function parseColorPage(html, make, fallbackYear) {
  const results = []
  const seen = new Set()   // dedupe within single page (same name+year)
  const rowRe = /<tr[^>]*class="(?:even|odd)"[^>]*>([\s\S]*?)<\/tr>/gi
  let rowMatch

  while ((rowMatch = rowRe.exec(html)) !== null) {
    const rowHtml = rowMatch[1]

    // ── Primary: extract from sname= URL param (present in every data row) ───
    const snameM = rowHtml.match(/[?&]sname=([^&"'\s><]+)/)
    if (!snameM) continue

    let colorName = decodeURIComponent(snameM[1].replace(/\+/g, ' ')).trim()
    if (!colorName || colorName.length < 2) continue
    if (/^(make|paint|year|image|code|all|search)$/i.test(colorName)) continue

    // ── Year: from syear= param, else fallback ────────────────────────────────
    const syearM = rowHtml.match(/[?&]syear=(\d{4})/)
    const rowYear = syearM ? parseInt(syearM[1], 10) : (fallbackYear || null)

    // ── HSB: look for bgcolor hex first, then name heuristic ─────────────────
    const bgMatch = rowHtml.match(/bgcolor\s*=\s*#?([0-9A-Fa-f]{6})/)
    let hsb
    if (bgMatch && isValidSwatch(bgMatch[1])) {
      hsb = hexToHsb(bgMatch[1])
    } else {
      hsb = nameToHsb(colorName)
    }

    const pageKey = `${colorName}|${rowYear}`
    if (seen.has(pageKey)) continue
    seen.add(pageKey)

    results.push({
      make: titleCase(make),
      model: '',
      year: rowYear,
      colorName,
      colorType: guessColorType(colorName),
      color1: hsb,
      color2: hsb,
    })
  }
  return results
}

// ---------------------------------------------------------------------------
// Scrape all colors for a single make in ONE request (rows=10000 returns all
// year/color combinations the site holds for that make).
// ---------------------------------------------------------------------------
async function scrapeColorsByMake(make) {
  // Single bulk request — returns every year/color row for this make.
  // rows=10000 is the max the site supports; most makes have < 3,000 rows.
  const url = `${SEARCH_URL}?manuf=${encodeURIComponent(make)}&make=${encodeURIComponent(make)}&rows=10000`

  let html
  try {
    html = await fetchHtml(url)
  } catch (e) {
    console.warn(`    SKIP ${make}: ${e.message}`)
    return []
  }

  const rows = parseColorPage(html, make, null)
  await sleep(REQUEST_DELAY_MS)
  return rows
}


// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`Loading existing data from ${DATA_FILE} ...`)
  const existing = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  console.log(`  Existing entries: ${existing.length}`)

  const existingKeys = new Set(existing.map(dedupKey))

  // Load progress cache (if --resume and it exists)
  let cachedNewEntries = []
  if (RESUME && fs.existsSync(CACHE_FILE)) {
    const c = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))
    cachedNewEntries = c.newEntries || []
    cachedNewEntries.forEach(e => existingKeys.add(dedupKey(e)))
    console.log(`  Resuming — ${cachedNewEntries.length} entries from previous run`)
  }

  // Fetch the make list once
  let makes
  try {
    makes = await fetchMakeList()
  } catch (e) {
    console.error('Failed to fetch make list:', e.message)
    console.error('paintref.com may be unreachable or returning 503. Try again later.')
    process.exit(1)
  }

  const newEntries = [...cachedNewEntries]
  let processed = 0

  for (const make of makes) {
    if (newEntries.length >= LIMIT) break
    process.stdout.write(`  [${processed + 1}/${makes.length}] ${make} ... `)

    let colors
    try {
      colors = await scrapeColorsByMake(make)
    } catch (e) {
      console.warn(`FAILED: ${e.message}`)
      processed++
      continue
    }

    let added = 0
    for (const c of colors) {
      if (newEntries.length >= LIMIT) break
      const key = dedupKey(c)
      if (!existingKeys.has(key)) {
        existingKeys.add(key)
        newEntries.push(c)
        added++
      }
    }

    console.log(`${colors.length} found, ${added} new (total new: ${newEntries.length})`)
    processed++

    // Save progress checkpoint every 10 makes
    if (!DRY_RUN && processed % 10 === 0 && newEntries.length > cachedNewEntries.length) {
      fs.writeFileSync(CACHE_FILE, JSON.stringify({ newEntries }, null, 0))
    }
  }

  console.log(`\nScraping complete.`)
  console.log(`  Makes processed : ${processed}`)
  console.log(`  New colours     : ${newEntries.length}`)

  if (DRY_RUN) {
    console.log('\nDRY RUN — no file written. Sample new entries:')
    console.log(JSON.stringify(newEntries.slice(0, 5), null, 2))
    return
  }

  if (newEntries.length === 0) {
    console.log('Nothing new to add.')
    return
  }

  const merged = [...existing, ...newEntries]
  fs.writeFileSync(DATA_FILE, JSON.stringify(merged, null, 2))
  console.log(`\n✓ Written ${merged.length} total entries to ${DATA_FILE}`)
  console.log(`  Added ${newEntries.length} new OEM colours.`)

  // Clean up progress cache on success
  if (fs.existsSync(CACHE_FILE)) fs.unlinkSync(CACHE_FILE)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
