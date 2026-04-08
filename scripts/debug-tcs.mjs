import https from 'node:https'
import fs from 'node:fs'

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, res => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    }).on('error', reject)
  })
}

const html = await fetchPage('https://www.thecoatingstore.com/color-type/metallic/')

// Find the anchor around "woopack-product"
const idx = html.indexOf('woopack-product')
if (idx < 0) {
  fs.writeFileSync('scripts/_debug.txt', html.slice(0, 3000))
  console.log('NOT FOUND - wrote first 3000 chars to _debug.txt')
} else {
  fs.writeFileSync('scripts/_debug.txt', html.slice(idx, idx + 1200))
  console.log('Found at', idx, '- wrote 1200 chars to _debug.txt')
}
