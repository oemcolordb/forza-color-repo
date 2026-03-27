'use strict'
const https = require('https')
const fs = require('fs')

const get = (url) => new Promise((res, rej) => {
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, r => {
    let d = ''; r.on('data', c => d += c); r.on('end', () => res({ status: r.statusCode, len: d.length, body: d }))
  }).on('error', rej)
})

async function main() {
  const r = await get('https://www.paintref.com/cgi-bin/colorcodedisplay.cgi?manuf=Audi&make=Audi&rows=10000')
  const matches = r.body.match(/class="(even|odd)"/g) || []
  console.log('Status:', r.status, 'Len:', r.len, 'Even/Odd rows:', matches.length)
  const title = (r.body.match(/<title>([^<]+)/) || ['', ''])[1]
  console.log('Title:', title.slice(0, 100))

  // Also test rows=500 without limit
  const r2 = await get('https://www.paintref.com/cgi-bin/colorcodedisplay.cgi?manuf=Audi&make=Audi')
  const m2 = r2.body.match(/class="(even|odd)"/g) || []
  console.log('Rows default - Status:', r2.status, 'Even/Odd rows:', m2.length)

  // Sample first even row
  const idx = r.body.indexOf('class="even"')
  if (idx > -1) {
    console.log('\nFirst even row (500 chars):\n' + r.body.slice(idx - 20, idx + 500))
  } else {
    console.log('\nNO even rows found. Sample body (1000 chars):\n' + r.body.slice(0, 1000))
  }
}
main().catch(e => { console.error('ERROR:', e.message); process.exit(1) })
