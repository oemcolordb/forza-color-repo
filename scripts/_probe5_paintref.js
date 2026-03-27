'use strict'
const https = require('https')
const get = (url) => new Promise((res, rej) => {
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, r => {
    let d = ''; r.on('data', c => d += c); r.on('end', () => res({ status: r.statusCode, body: d }))
  }).on('error', rej)
})

async function main() {
  const r = await get('https://www.paintref.com/cgi-bin/colorcodedisplay.cgi?manuf=Toyota&make=Toyota&year=2020')
  const body = r.body
  // Find rows that contain bgcolor= (color swatches)
  const bgcolorMatches = body.match(/bgcolor=#?[0-9A-Fa-f]{3,6}/g) || []
  console.log('BGCOLOR HITS:', bgcolorMatches.slice(0, 30))
  
  // Look for inline background-color style 
  const styleMatches = body.match(/style="[^"]*background[^"]*"/gi) || []
  console.log('\nSTYLE BG HITS:', styleMatches.slice(0, 20))
  
  // Find the actual color table rows between "main" anchor and footer
  const start = body.indexOf('id="main"')
  const end = body.indexOf('</table>', start + 100)
  if (start > -1) console.log('\nMAIN SECTION:', body.slice(start, start + 3000))
  
  // Also show all table rows containing color name keywords from meta
  const rows = body.match(/<tr[^>]*class="(even|odd)"[^>]*>([\s\S]*?)<\/tr>/gi) || []
  console.log('\nEVEN/ODD ROWS:', rows.slice(0, 5).join('\n---\n'))
}
main().catch(console.error)
