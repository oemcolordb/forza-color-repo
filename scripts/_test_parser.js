// Quick parser validation — uses HTML structure captured from live paintref.com
// (The Toyota/Blizzard/Wind Chill rows are representative of real site HTML)
'use strict'

// Paste of the core parsing logic from scrapePaintColors.js
function parseColorPage(html, make, fallbackYear) {
  const results = []
  const seen = new Set()
  const rowRe = /<tr[^>]*class="(?:even|odd)"[^>]*>([\s\S]*?)<\/tr>/gi
  let rowMatch
  while ((rowMatch = rowRe.exec(html)) !== null) {
    const rowHtml = rowMatch[1]
    const snameM = rowHtml.match(/[?&]sname=([^&"'\s><]+)/)
    if (!snameM) continue
    let colorName = decodeURIComponent(snameM[1].replace(/\+/g, ' ')).trim()
    if (!colorName || colorName.length < 2) continue
    if (/^(make|paint|year|image|code|all|search)$/i.test(colorName)) continue
    const syearM = rowHtml.match(/[?&]syear=(\d{4})/)
    const rowYear = syearM ? parseInt(syearM[1], 10) : (fallbackYear || null)
    const pageKey = `${colorName}|${rowYear}`
    if (seen.has(pageKey)) continue
    seen.add(pageKey)
    results.push({ make, model: '', year: rowYear, colorName })
  }
  return results
}

// Minimal representative HTML from paintref.com Toyota 2020 page
const sampleHtml = `
<html><body>
<table>
<tr height=15px  class="even"><!-- (C) 2010-2026 PaintRef.com -->
  <td></td>
  <td><nobr><a href="https://google.com/images?q=Blizzard+2020+Toyota">G</a> <a href="https://www.bing.com/images/search?q=Blizzard+2020+Toyota">B</a></nobr></td>
  <td><a href="/cgi-bin/colorcodedisplay.cgi?color=Blizzard&syear=2020&smake=Toyota&smodel=&sname=Blizzard&rows=50" style="color:#000001;" title="example">X</a></td>
  <td>2020</td>
  <td>Toyota</td>
  <td>Blizzard</td>
  <td>204</td>
  <td><a href="/cgi-bin/colorcodedisplay.cgi?ditzler=6154&rows=50&syear=2020&smanuf=Toyota&smodel=&sname=Blizzard" title="Ditzler PPG 6154">6154</a></td>
  <td>pearl, 4Runner C-HR Corolla</td>
</tr>
<tr height=15px  class="odd"><!-- (C) 2010-2026 PaintRef.com -->
  <td></td>
  <td><nobr><a href="https://google.com/images?q=Wind+Chill+2020+Toyota">G</a></nobr></td>
  <td><a href="/cgi-bin/colorcodedisplay.cgi?color=Wind+Chill&syear=2020&smake=Toyota&sname=Wind+Chill&rows=50">X</a></td>
  <td>2020</td><td>Toyota</td><td>Wind Chill</td><td>089</td>
  <td>metallic, Camry Highlander</td>
</tr>
<tr height=15px  class="even">
  <td></td>
  <td><nobr><a href="https://google.com/images?q=Super+White+2019+Toyota">G</a></nobr></td>
  <td><a href="/cgi-bin/colorcodedisplay.cgi?color=Super+White&syear=2019&smake=Toyota&sname=Super+White&rows=50">X</a></td>
  <td>2019</td><td>Toyota</td><td>Super White</td><td>040</td>
</tr>
</table></body></html>
`

const rows = parseColorPage(sampleHtml, 'Toyota', null)
console.log('Parsed rows:', rows.length)
rows.forEach(r => console.log(' ', JSON.stringify(r)))

if (rows.length === 3 &&
    rows[0].colorName === 'Blizzard' && rows[0].year === 2020 &&
    rows[1].colorName === 'Wind Chill' && rows[1].year === 2020 &&
    rows[2].colorName === 'Super White' && rows[2].year === 2019) {
  console.log('\n✓ Parser validation PASSED')
  process.exit(0)
} else {
  console.error('\n✗ Parser validation FAILED')
  process.exit(1)
}
