const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, regex, replacement) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const updated = content.replace(regex, replacement);
  if (content !== updated) {
    fs.writeFileSync(filePath, updated);
    console.log(`Updated ${filePath}`);
  }
}

const filesToUpdate = [
  'app/layout.js',
  'public/manifest.json',
  'public/discord-manifest.json',
  'components/seo/GamingSEO.tsx',
  'components/seo/ForzaColorSheetSEO.tsx',
  'app/about/page.tsx',
  'app/help/page.tsx',
  'components/seo/StructuredData.tsx',
];

for (const file of filesToUpdate) {
  const fullPath = path.join(__dirname, '..', file);
  replaceInFile(fullPath, /(10,000\+|24,000\+|27,000\+|27,175\+)/g, '40,000+');
}
