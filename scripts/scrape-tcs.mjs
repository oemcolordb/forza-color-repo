import https from 'node:https'
import fs from 'node:fs'

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = ''
      res.on('data', c => (data += c))
      res.on('end', () => resolve(data))
    }).on('error', reject)
  })
}

// These filenames are generic kit-shot placeholders with no real color info
const SKIP_FRAGMENTS = [
  'UreChem-Base-Clear-Car-Kit-Shot',
  'UreChem20Base',
  'urechemcarpaintkit_3b22ee29',
  'Untitled-1-150x150',
  'Coming-Soon',
]

function isPlaceholder(imgUrl) {
  return SKIP_FRAGMENTS.some(f => imgUrl.includes(f))
}

async function scrapePage(num) {
  const url =
    num === 1
      ? 'https://www.thecoatingstore.com/color-type/metallic/'
      : `https://www.thecoatingstore.com/color-type/metallic/page/${num}/`
  const html = await fetchPage(url)
  const results = []

  // Extract product id blocks — each product is in its own id="woopack-product-NNN" div
  const blocks = html.split(/id="woopack-product-\d+"/)
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].slice(0, 2000)

    // Name from woocommerce-loop-product__title
    const nameMatch = block.match(/woocommerce-loop-product__title">([\s\S]*?)<\/h2>/)
    if (!nameMatch) continue
    let name = nameMatch[1].replace(/<[^>]+>/g, '').trim()
    name = name
      .replace(/ Basecoat Clearcoat Auto Paint Kit Options?$/i, '')
      .replace(/ Basecoat Clearcoat Car Paint.*$/i, '')
      .replace(/ Base Coat Clear Coat.*$/i, '')
      .replace(/ Auto Paint Kit.*$/i, '')
      .trim()

    // Image src — prefer data-lazy-src, then data-src, then src
    const imgMatch =
      block.match(/data-lazy-src="([^"]+150x150[^"]*)"/) ||
      block.match(/data-src="([^"]+150x150[^"]*)"/) ||
      block.match(/src="([^"]+150x150[^"]*)"/)
    if (!imgMatch) continue
    const img = imgMatch[1]
    if (isPlaceholder(img)) continue

    results.push({ name, img })
  }
  return results
}

;(async () => {
  const all = []
  for (let p = 1; p <= 58; p++) {
    process.stderr.write(`page ${p}/58\r`)
    try {
      const items = await scrapePage(p)
      all.push(...items)
    } catch (e) {
      process.stderr.write(`\nERR page ${p}: ${e.message}\n`)
    }
    // polite delay
    await new Promise(r => setTimeout(r, 150))
  }

  // Deduplicate by img URL
  const seen = new Set()
  const deduped = all.filter(item => {
    if (seen.has(item.img)) return false
    seen.add(item.img)
    return true
  })
  process.stderr.write(`\nTotal with real images: ${deduped.length}\n`)
  fs.writeFileSync('scripts/tcs-all-products.json', JSON.stringify(deduped, null, 2))
  process.stderr.write('Written to scripts/tcs-all-products.json\n')
})()
