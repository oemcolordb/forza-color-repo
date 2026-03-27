'use strict'
const https = require('https')
const fs = require('fs')
const path = require('path')

https.get('https://gtacolors.com/include/colors', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = ''
  res.on('data', c => data += c)
  res.on('end', () => {
    const outPath = path.join(__dirname, '_gta_colors_raw.json')
    fs.writeFileSync(outPath, data)
    process.stderr.write(`DONE: status=${res.statusCode} size=${data.length} path=${outPath}\n`)
    process.stderr.write('FIRST 2000:\n' + data.slice(0, 2000) + '\n')
  })
}).on('error', e => process.stderr.write('ERROR: ' + e.message + '\n'))
