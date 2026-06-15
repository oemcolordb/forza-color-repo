const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/carColors.json');
const colors = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const seen = new Map();
const uniqueColors = [];
let removedCount = 0;

for (const color of colors) {
  const key = `${color.make?.toLowerCase()}_${color.colorName?.toLowerCase()}`;
  
  if (seen.has(key)) {
    removedCount++;
  } else {
    seen.set(key, true);
    uniqueColors.push(color);
  }
}

fs.writeFileSync(filePath, JSON.stringify(uniqueColors, null, 2));

console.log(`Successfully removed ${removedCount} exact duplicates. Database now has ${uniqueColors.length} colors.`);
