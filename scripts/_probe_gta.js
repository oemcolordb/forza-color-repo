'use strict'
const https = require('https')

function get(url) {
  return new Promise((res, rej) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }, (r) => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => res({ status: r.statusCode, body: d }))
    }).on('error', rej).on('timeout', function() { this.destroy(); rej(new Error('timeout')) })
  })
}

async function main() {
  const r = await get('https://gtacolors.com/js/colors.js')
  console.log('STATUS:', r.status, '  SIZE:', r.body.length)
  console.log('FIRST 3000 CHARS:\n', r.body.slice(0, 3000))
  console.log('\nLAST 500 CHARS:\n', r.body.slice(-500))
}
main().catch(console.error)
