const fs = require('fs');
const path = require('path');

const pages = [
  'app/contact/page.tsx',
  'app/about/page.tsx',
  'app/forza-color-sheet/page.tsx',
  'app/help/page.tsx',
  'app/how-to-use/page.tsx',
  'app/privacy/page.tsx',
  'app/terms/page.tsx',
  'app/ui-showcase/page.tsx',
];

for (const p of pages) {
  const full = path.join(process.cwd(), p);
  if (!fs.existsSync(full)) {
    console.log('SKIP (not found):', p);
    continue;
  }
  let content = fs.readFileSync(full, 'utf8');
  if (content.includes('force-dynamic')) {
    console.log('SKIP (already has):', p);
    continue;
  }
  // Insert after first 'use client' line
  content = content.replace(
    /(['"]use client['"](\r?\n))/,
    "$1\nexport const dynamic = 'force-dynamic';\n"
  );
  fs.writeFileSync(full, content, 'utf8');
  console.log('PATCHED:', p);
}
console.log('Done.');
