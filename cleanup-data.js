const fs = require('fs');

// Read the colorData.ts file
let content = fs.readFileSync('./services/colorData.ts', 'utf8');

// Fix data quality issues
const fixes = [
  ['"colorType": "Normal "', '"colorType": "Normal"'],
  ['"colorType": "N/A"', '"colorType": "Normal"'],
  ['"colorType": "Carbon Fibre Polished"', '"colorType": "Carbon Fiber Polished"']
];

fixes.forEach(([from, to]) => {
  const count = (content.match(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  if (count > 0) {
    content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
    console.log(`Fixed ${count} instances: ${from} → ${to}`);
  }
});

// Write back the cleaned data
fs.writeFileSync('./services/colorData.ts', content);
console.log('Data cleanup complete!');