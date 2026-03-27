'use strict'
const https = require('https')
const get = (url) => new Promise((res, rej) => {
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, r => {
    let d = ''; r.on('data', c => d += c); r.on('end', () => res({ status: r.statusCode, body: d }))
  }).on('error', rej)
})

async function main() {
  const r = await get('https://www.paintref.com/cgi-bin/colorcodedisplay.cgi?manuf=Toyota&make=Toyota&year=2020')
  // Find the main color table
  const tableStart = r.body.indexOf('<a name="main">')
  const section = r.body.slice(tableStart, tableStart + 8000)
  console.log(section)
}
main().catch(console.error)
