'use strict'
const https = require('https')
const get = (url) => new Promise((res, rej) => {
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, r => {
    let d = ''; r.on('data', c => d += c); r.on('end', () => res({ status: r.statusCode, body: d }))
  }).on('error', rej)
})

async function main() {
  const r = await get('https://www.paintref.com/cgi-bin/colorcodedisplay.cgi?manuf=Toyota&make=Toyota&year=2020')
  // Show last 6000 chars where the color table should be
  console.log(r.body.slice(-6000))
}
main().catch(console.error)
