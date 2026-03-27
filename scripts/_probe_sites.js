'use strict'
const https = require('https')
const http = require('http')

function get(url, maxBytes = 80000) {
  return new Promise((res, rej) => {
    const client = url.startsWith('https') ? https : http
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/json,*/*',
      },
      timeout: 15000,
    }, (r) => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
        return get(r.headers.location, maxBytes).then(res).catch(rej)
      }
      let d = Buffer.alloc(0)
      r.on('data', c => { if (d.length < maxBytes) d = Buffer.concat([d, c]) })
      r.on('end', () => res({ status: r.statusCode, headers: r.headers, body: d.toString('utf8') }))
    })
    req.on('error', rej)
    req.on('timeout', () => { req.destroy(); rej(new Error('timeout')) })
  })
}

async function probe(label, url) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`PROBING: ${label}`)
  console.log(`URL: ${url}`)
  console.log('='.repeat(60))
  try {
    const r = await get(url)
    console.log('STATUS:', r.status)
    console.log('CONTENT-TYPE:', r.headers['content-type'])
    // Show robots.txt hint
    const body = r.body

    // Find forms
    const forms = (body.match(/<form[^>]+>/gi) || []).slice(0, 4)
    console.log('FORMS:', forms)

    // Find API-like fetch/XHR patterns
    const apis = (body.match(/(?:fetch|axios|xhr|api)[^\n'"]*(?:url|endpoint|\/api\/)[^\n'"]{3,80}/gi) || []).slice(0, 5)
    console.log('API PATTERNS:', apis)

    // Find JSON data blobs
    const jsonBlobs = (body.match(/window\.\w+\s*=\s*\{[^;]{20,200}/g) || []).slice(0, 3)
    console.log('WINDOW DATA:', jsonBlobs)

    // Find links to data/json/csv
    const dataLinks = (body.match(/href=["'][^"']*(?:\.json|\.csv|\/api\/|\/data\/|\/colors?\/)[^"']{0,80}["']/gi) || []).slice(0, 10)
    console.log('DATA LINKS:', dataLinks)

    // First 2000 chars of body for context
    console.log('\nBODY PREVIEW:\n', body.slice(0, 2000))
  } catch (e) {
    console.error('ERROR:', e.message)
  }
}

async function main() {
  await probe('gtacolors.com', 'https://gtacolors.com/')
  await probe('gtacolors.com /colors', 'https://gtacolors.com/colors')
  await probe('eastwood OEM search', 'https://www.eastwood.com/oempaint/search')
  await probe('eastwood robots', 'https://www.eastwood.com/robots.txt')
}
main().catch(console.error)
