'use strict'
const https = require('https')
const get = (url) => new Promise((res, rej) => {
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, r => {
    let d = ''; r.on('data', c => d += c); r.on('end', () => res({ status: r.statusCode, body: d }))
  }).on('error', rej)
})

async function main() {
  // Probe homepage for form actions
  const home = await get('https://www.paintref.com/')
  const forms = (home.body.match(/<form[^>]+>/gi) || []).slice(0, 5)
  const actions = (home.body.match(/action=["'][^"']+["']/gi) || []).slice(0, 5)
  const hrefs = (home.body.match(/href=["'][^"']{5,80}["']/gi) || []).slice(0, 20)
  console.log('FORMS:', JSON.stringify(forms, null, 2))
  console.log('ACTIONS:', JSON.stringify(actions, null, 2))
  console.log('HREFS:', JSON.stringify(hrefs, null, 2))

  // Probe the JS menu file for make list
  const menu = await get('https://www.paintref.com/paintref/paintrefmenu.js')
  // Extract all makes: lines like a['MakeName'] = ...
  const makes = [...menu.body.matchAll(/^a\['([^']+)'\]\s*=/gm)].map(m => m[1]).filter(m => m !== 'All')
  console.log('\nTOTAL MAKES IN MENU JS:', makes.length)
  console.log('FIRST 20:', makes.slice(0, 20))

  // Try a known-pattern URL for Toyota
  for (const url of [
    'https://www.paintref.com/cgi-bin/cvsdb.exe?make=Toyota',
    'https://www.paintref.com/cgi-bin/dbsearch.cgi?make=Toyota',
    'https://www.paintref.com/Toyota.shtml',
    'https://www.paintref.com/makes/Toyota.shtml',
    'https://www.paintref.com/colors/Toyota/',
  ]) {
    const r = await get(url)
    console.log(url, '->', r.status)
  }
}
main().catch(console.error)
