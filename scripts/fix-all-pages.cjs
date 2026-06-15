const fs = require('fs');
const path = require('path');

function walk(dir) {
  const results = [];
  try {
    for (const f of fs.readdirSync(dir)) {
      if (f === 'node_modules' || f === '.next' || f === '.git') continue;
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) results.push(...walk(full));
      else if (f === 'page.tsx' || f === 'page.js' || f === 'page.ts') results.push(full);
    }
  } catch(e) {}
  return results;
}

const pages = walk('app');
let fixed = 0, skipped = 0;

for (const p of pages) {
  let src = fs.readFileSync(p, 'utf8');
  const isClient = src.includes("'use client'") || src.includes('"use client"');
  const hasFD = src.includes('force-dynamic');
  
  if (!isClient) { continue; }
  if (hasFD) { skipped++; continue; }

  // Insert after the 'use client' line (handle both CRLF and LF)
  let inserted = false;
  if (src.includes("'use client'\r\n")) {
    src = src.replace("'use client'\r\n", "'use client'\r\nexport const dynamic = 'force-dynamic'\r\n");
    inserted = true;
  } else if (src.includes("'use client'\n")) {
    src = src.replace("'use client'\n", "'use client'\nexport const dynamic = 'force-dynamic'\n");
    inserted = true;
  } else if (src.includes('"use client"\r\n')) {
    src = src.replace('"use client"\r\n', '"use client"\r\nexport const dynamic = \'force-dynamic\'\r\n');
    inserted = true;
  } else if (src.includes('"use client"\n')) {
    src = src.replace('"use client"\n', '"use client"\nexport const dynamic = \'force-dynamic\'\n');
    inserted = true;
  }
  
  if (!inserted) {
    console.log('WARN: could not insert into', p);
    continue;
  }
  
  // Rename conflicting 'import dynamic' if present
  if (src.includes("import dynamic from 'next/dynamic'")) {
    src = src.replace("import dynamic from 'next/dynamic'", "import nextDynamic from 'next/dynamic'");
    src = src.replace(/const (\w+) = dynamic\(/g, 'const $1 = nextDynamic(');
    console.log('RENAMED nextDynamic in', path.basename(path.dirname(p)));
  }
  
  fs.writeFileSync(p, src, 'utf8');
  console.log('FIXED:', path.relative('app', p));
  fixed++;
}

console.log('\nDone. Fixed:', fixed, '| Already had force-dynamic:', skipped);
