// Quick test: fetch one page and validate parser patterns
const res = await fetch('https://kudosprime.com/fh5/carlist.php?start=0', {
  headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' },
})
const html = await res.text()

const blocks = html.split(/<div class="car [^"]*"\s+data-carid="\d+"/)
console.log('Total blocks:', blocks.length)

// Test first 3 car blocks
for (let i = 1; i <= Math.min(3, blocks.length - 1); i++) {
  const b = blocks[i]
  const nameM = b.match(/class="name"[^>]*>([^<]+)<m>/)
  const piM = b.match(/class="pi\s+([DCBAS][12]?)"><i>[^<]*<\/i><b>(\d+)<\/b>/)
  const trM = b.match(/class="tr">(FWD|RWD|AWD)</)
  const tpwM = b.match(/([\d,]+)\s*<i>kW<\/i>([\d,]+)\s*<i>Kg<\/i>/)
  const stM = b.match(
    /class="sp">([\d.]+).*?class="ha">([\d.]+).*?class="ac">([\d.]+).*?class="la">([\d.]+).*?class="br">([\d.]+).*?class="or">([\d.]+)/s
  )
  console.log(`\n-- Car ${i} --`)
  console.log('name  :', nameM?.[1] ?? 'MISSING')
  console.log('pi    :', piM?.[1], piM?.[2] ?? 'MISSING')
  console.log('drive :', trM?.[1] ?? 'MISSING')
  console.log('kW/Kg :', tpwM?.[1], tpwM?.[2] ?? 'MISSING')
  console.log('stats :', stM?.slice(1, 7) ?? 'MISSING')
}
