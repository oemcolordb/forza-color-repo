'use strict'
const https = require('https')
const fs = require('fs')

const get = (url) => new Promise((res, rej) => {
  https.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ForzaColorBot/1.0)' }
  }, r => {
    const chunks = []
    r.on('data', c => chunks.push(c))
    r.on('end', () => res({ status: r.statusCode, body: Buffer.concat(chunks).toString('utf8') }))
  }).on('error', rej)
})

async function main() {
  // Test 1: with rows=10000
  const r1 = await get('https://www.paintref.com/cgi-bin/colorcodedisplay.cgi?manuf=Toyota&make=Toyota&rows=10000')
  const even1 = (r1.body.match(/class="(even|odd)"/g) || []).length
  const sname1 = (r1.body.match(/sname=/g) || []).length
  console.log(`rows=10000 → status=${r1.status} len=${r1.body.length} even/odd=${even1} sname=${sname1}`)

  // Test 2: no rows param
  const r2 = await get('https://www.paintref.com/cgi-bin/colorcodedisplay.cgi?manuf=Toyota&make=Toyota')
  const even2 = (r2.body.match(/class="(even|odd)"/g) || []).length
  const sname2 = (r2.body.match(/sname=/g) || []).length
  console.log(`no rows   → status=${r2.status} len=${r2.body.length} even/odd=${even2} sname=${sname2}`)

  // Test 3: rows=500
  const r3 = await get('https://www.paintref.com/cgi-bin/colorcodedisplay.cgi?manuf=Toyota&make=Toyota&rows=500')
  const even3 = (r3.body.match(/class="(even|odd)"/g) || []).length
  const sname3 = (r3.body.match(/sname=/g) || []).length
  console.log(`rows=500  → status=${r3.status} len=${r3.body.length} even/odd=${even3} sname=${sname3}`)

  // Sample first even row from best result
  const best = even1 > even2 ? r1 : r2
  const idx = best.body.indexOf('class="even"')
  if (idx > -1) {
    console.log('\nFirst even row (800 chars):\n' + best.body.slice(idx - 10, idx + 800))
  } else {
    // Show the middle 2000 chars of response to understand structure
    const mid = Math.floor(best.body.length / 2)
    console.log('\nNo even rows. Body middle 2000 chars:\n' + best.body.slice(mid, mid + 2000))
  }
}
main().catch(e => { console.error('ERROR:', e.message); process.exit(1) })
