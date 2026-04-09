#!/usr/bin/env node
// scripts/scrape-tcs-categories.mjs
// Scrapes Candy, Pearl, and Solid paint colors from The Coating Store,
// samples thumbnail images to extract RGB, converts to HSB, and merges
// new entries into carColors.json.
//
// Usage: node scripts/scrape-tcs-categories.mjs
// Skips Chameleon and Neon (per user request).

import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoDir = path.resolve(__dirname, '..')

// ── Utility ─────────────────────────────────────────────────────────────────

function rgbToHsb(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  let h = 0
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6
    else if (max === g) h = (b - r) / delta + 2
    else h = (r - g) / delta + 4
    h = h * 60
    if (h < 0) h += 360
  }
  return {
    h: Number((h / 360).toFixed(4)),
    s: Number((max === 0 ? 0 : delta / max).toFixed(4)),
    b: Number(max.toFixed(4)),
  }
}

// Clean up long product titles to a concise color name
function extractColorName(title) {
  return title
    .replace(/\s+Basecoat\s*[/\-]?\s*Clearcoat\s+Auto\s+Paint\s+Kit\s+Options?/gi, '')
    .replace(/\s+2K\s+Urethane\s+Candy\s+Auto\s+Paint\s+Kit\s+Options?/gi, '')
    .replace(/\s+\d\s+Stage\s+(?:White\s+)?.*?Auto\s+Paint\s+Kit\s+Options?/gi, '')
    .replace(/\s+Tri\s+Coat\s+Auto\s+Paint\s+Kit\s+Options?/gi, '')
    .replace(/\s+Auto\s+Paint\s+Kit\s+Options?/gi, '')
    .replace(/\s+Automotive\s+Paint\s*$/gi, '')
    .replace(/\s+Paint\s+Kit\s+Options?/gi, '')
    .replace(/\s+Car\s+Paint\s+Kit\s*$/gi, '')
    .trim()
}

// ── Image sampler (runs inside Playwright evaluate) ──────────────────────────

const SAMPLER_SCRIPT = `
async function sampleImg(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.width; c.height = img.height
      const ctx = c.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(img, 0, 0)
      const cx = Math.floor(img.width / 2)
      const cy = Math.floor(img.height / 2)
      const sz = 10
      let r = 0, g = 0, b = 0, n = 0
      for (let x = Math.max(0, cx - sz); x < Math.min(img.width, cx + sz); x++) {
        for (let y = Math.max(0, cy - sz); y < Math.min(img.height, cy + sz); y++) {
          const d = ctx.getImageData(x, y, 1, 1).data
          r += d[0]; g += d[1]; b += d[2]; n++
        }
      }
      resolve({ r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) })
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
}
`

// ── Scrape one category page (paginated) ─────────────────────────────────────

async function scrapeAllProducts(page, baseUrl) {
  const products = []
  let pageNum = 1

  while (true) {
    const url = pageNum === 1 ? baseUrl : `${baseUrl}page/${pageNum}/`
    process.stderr.write(`  Page ${pageNum}: ${url}\n`)

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
      // Wait for the woopack product grid to render
      await page.waitForSelector('li.product', { timeout: 12000 }).catch(() => null)
      await page.waitForTimeout(1500)
    } catch {
      process.stderr.write(`  Timeout/error on page ${pageNum}, stopping pagination.\n`)
      break
    }

    const items = await page.evaluate(() => {
      const out = []
      document.querySelectorAll('li.product').forEach(el => {
        // Woopack theme uses .woopack-product-title for the product title
        const nameEl = el.querySelector('.woopack-product-title, .woocommerce-loop-product__title, h2, h3')
        const imgEl = el.querySelector('img')
        if (!nameEl || !imgEl) return
        const name = nameEl.textContent.trim()
        // src is directly available (not lazy-loaded)
        const img = imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || ''
        if (!img.includes('wp-content/uploads')) return
        out.push({ name, img })
      })
      return out
    })

    if (items.length === 0) {
      process.stderr.write(`  No products found on page ${pageNum}.\n`)
      break
    }

    products.push(...items)
    process.stderr.write(`  Found ${items.length} products (total so far: ${products.length})\n`)

    // Check for next page link (standard WordPress page-numbers)
    const nextHref = await page.evaluate(() => {
      const el = document.querySelector('a.next.page-numbers, .page-numbers a.next')
      return el ? el.href : null
    })

    if (!nextHref) break
    pageNum++
  }

  return products
}

// ── Sample RGB from images in batches ────────────────────────────────────────

async function sampleColors(page, products) {
  const BATCH = 50
  const results = []

  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH)
    const batchEnd = Math.min(i + BATCH, products.length)
    process.stderr.write(`  Sampling ${i + 1}–${batchEnd}/${products.length}...\r`)

    const sampled = await page.evaluate(
      async ({ items, script }) => {
         
        eval(script)
        const out = []
        for (const item of items) {
          const rgb = await sampleImg(item.img)
          out.push({ name: item.name, img: item.img, rgb })
        }
        return out
      },
      { items: batch, script: SAMPLER_SCRIPT }
    )

    results.push(...sampled)
  }

  process.stderr.write('\n')
  return results
}

// ── Categories (no Chameleon, no Neon) ───────────────────────────────────────

const CATEGORIES = [
  {
    slug: 'candy',
    url: 'https://www.thecoatingstore.com/color-type/candy/',
    colorType: 'Candy',
  },
  {
    slug: 'pearl',
    url: 'https://www.thecoatingstore.com/color-type/pearl/',
    colorType: 'Pearl',
  },
  {
    slug: 'solid',
    url: 'https://www.thecoatingstore.com/color-type/solid/',
    colorType: 'Solid',
  },
]

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const colorsPath = path.resolve(repoDir, 'carColors.json')
  const existing = JSON.parse(fs.readFileSync(colorsPath, 'utf8'))

  // Build dedup key set
  const existingKeys = new Set(
    existing.map(c => `${(c.make || '').toLowerCase()}|${(c.colorName || '').toLowerCase()}`)
  )
  process.stdout.write(`Loaded ${existing.length} existing colors.\n`)

  const browser = await chromium.launch({ headless: true })

  // Two contexts: one for scraping product pages, one for image sampling
  const scrapeCtx = await browser.newContext({ userAgent: 'Mozilla/5.0 (compatible; ForzaColorBot/1.0)' })
  const sampleCtx = await browser.newContext()

  const scrapePage = await scrapeCtx.newPage()
  const samplePage = await sampleCtx.newPage()

  // Navigate sample page to TCS origin first (avoids CORS on image sampling)
  await samplePage.goto('https://www.thecoatingstore.com/', { waitUntil: 'domcontentloaded' })

  const allNew = []

  for (const cat of CATEGORIES) {
    process.stdout.write(`\n── Category: ${cat.slug} (${cat.url}) ──\n`)

    const products = await scrapeAllProducts(scrapePage, cat.url)
    process.stdout.write(`Scraped ${products.length} products from ${cat.slug}.\n`)

    // Deduplicate against existing
    const novel = products.filter(p => {
      const name = extractColorName(p.name).toLowerCase()
      return !existingKeys.has(`the coating store|${name}`)
    })
    process.stdout.write(`${novel.length} are new (not in carColors.json).\n`)

    if (novel.length === 0) continue

    const sampled = await sampleColors(samplePage, novel)

    let addedCount = 0
    for (const item of sampled) {
      if (!item.rgb) continue

      const { r, g, b } = item.rgb

      // Skip near-white (background bleed)
      if (r > 235 && g > 235 && b > 235) continue
      // Skip near-black thumbnails that are clearly void/placeholder
      if (r < 8 && g < 8 && b < 8) continue

      const colorName = extractColorName(item.name)
      if (!colorName) continue

      const color1 = rgbToHsb(r, g, b)

      // For Pearl and Candy, generate a subtle color2 (the flake/candy sheen highlight)
      let color2 = null
      if (cat.slug === 'pearl') {
        color2 = {
          h: color1.h,
          s: Number(Math.max(0, color1.s - 0.18).toFixed(4)),
          b: Number(Math.min(1, color1.b + 0.18).toFixed(4)),
        }
      } else if (cat.slug === 'candy') {
        color2 = {
          h: color1.h,
          s: Number(Math.max(0, color1.s - 0.22).toFixed(4)),
          b: Number(Math.min(1, color1.b + 0.22).toFixed(4)),
        }
      }

      const entry = {
        make: 'The Coating Store',
        model: '',
        year: null,
        colorName,
        colorType: cat.colorType,
        color1,
        color2,
      }

      allNew.push(entry)
      existingKeys.add(`the coating store|${colorName.toLowerCase()}`)
      addedCount++
    }

    process.stdout.write(`Added ${addedCount} valid new entries from ${cat.slug}.\n`)
  }

  await browser.close()

  if (allNew.length === 0) {
    process.stdout.write('\nNo new colors to add.\n')
    return
  }

  // Write new colors to temp file for inspection
  const newColorsPath = path.resolve(repoDir, 'scripts/tcs-new-categories.json')
  fs.writeFileSync(newColorsPath, JSON.stringify(allNew, null, 2))
  process.stdout.write(`\nWrote ${allNew.length} new entries to scripts/tcs-new-categories.json\n`)

  // Back up current carColors.json
  const ts = new Date()
    .toISOString()
    .replace(/[-:T]/g, '')
    .slice(0, 14)
  const bakPath = path.resolve(repoDir, `carColors.json.bak.${ts}`)
  fs.copyFileSync(colorsPath, bakPath)
  process.stdout.write(`Backed up carColors.json → ${path.basename(bakPath)}\n`)

  // Merge into carColors.json
  const merged = [...existing, ...allNew]
  fs.writeFileSync(colorsPath, JSON.stringify(merged, null, 2))
  process.stdout.write(`Updated carColors.json: ${merged.length} total (added ${allNew.length})\n`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
