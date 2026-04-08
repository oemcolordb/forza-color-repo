import { chromium } from 'playwright'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoDir = path.resolve(__dirname, '..')

const products = JSON.parse(fs.readFileSync(path.join(repoDir, 'scripts/tcs-all-products.json'), 'utf8'))

const SAMPLER = `
async function sampleImg(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.width; c.height = img.height
      const ctx = c.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(img, 0, 0)
      const cx = Math.floor(img.width / 2), cy = Math.floor(img.height / 2), sz = 12
      let r=0,g=0,b=0,n=0
      for (let x=Math.max(0,cx-sz);x<Math.min(img.width,cx+sz);x++)
        for (let y=Math.max(0,cy-sz);y<Math.min(img.height,cy+sz);y++) {
          const d=ctx.getImageData(x,y,1,1).data; r+=d[0];g+=d[1];b+=d[2];n++
        }
      resolve({r:Math.round(r/n),g:Math.round(g/n),b:Math.round(b/n)})
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
}
`

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext()
const page = await ctx.newPage()
await page.goto('https://www.thecoatingstore.com/', { waitUntil: 'domcontentloaded' })

const BATCH = 100
const allRgb = []

for (let i = 0; i < products.length; i += BATCH) {
  const batch = products.slice(i, i + BATCH)
  process.stderr.write(`batch ${Math.floor(i/BATCH)+1}/${Math.ceil(products.length/BATCH)} (${i+1}-${Math.min(i+BATCH, products.length)})...\r`)
  
  const results = await page.evaluate(async (items, script) => {
    // eslint-disable-next-line no-eval
    eval(script)
    const out = []
    for (const item of items) {
      const rgb = await sampleImg(item.img)
      out.push({ name: item.name, rgb })
    }
    return out
  }, batch, SAMPLER)
  
  allRgb.push(...results)
}

await browser.close()

// Filter out nulls and white background bleed (r>240 && g>240 && b>240)
const valid = allRgb.filter(item => {
  if (!item.rgb) return false
  const { r, g, b } = item.rgb
  if (r > 240 && g > 240 && b > 240) return false
  return true
})

process.stderr.write(`\nSampled: ${allRgb.length}, valid: ${valid.length}\n`)
fs.writeFileSync(path.join(repoDir, 'scripts/tcs-rgb-sampled.json'), JSON.stringify(valid, null, 2))
process.stderr.write(`Written to scripts/tcs-rgb-sampled.json\n`)
