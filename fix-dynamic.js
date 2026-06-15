const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') && file.includes('page.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./app');
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('force-dynamic')) {
    fs.writeFileSync(file, content.replace(/export const dynamic = ['"]force-dynamic['"];?\n?/g, ''));
    console.log('Fixed', file);
  }
});
