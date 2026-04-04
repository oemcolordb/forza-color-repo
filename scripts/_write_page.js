const fs = require('fs');
const path = require('path');
const target = path.join(__dirname, '../app/tuneforge/page.tsx');
fs.writeFileSync(target, require('./page-content.js'), 'utf8');
console.log('Written', fs.statSync(target).size, 'bytes');
