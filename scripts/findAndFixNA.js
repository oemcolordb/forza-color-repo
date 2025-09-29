const fs = require('fs');
const path = require('path');

const colorDataPath = path.join(__dirname, '..', 'carColors.json');
const colors = JSON.parse(fs.readFileSync(colorDataPath, 'utf8'));

// Find all colors with N/A type
const naColors = colors.filter(c => !c.colorType || c.colorType === 'N/A' || c.colorType.trim() === '');

console.log(`Found ${naColors.length} colors with N/A or empty colorType:`);
naColors.forEach(c => console.log(`- ${c.colorName} (${c.make})`));

// Fix all N/A colors to Normal
const fixedColors = colors.map(color => {
  if (!color.colorType || color.colorType === 'N/A' || color.colorType.trim() === '') {
    return { ...color, colorType: 'Normal' };
  }
  return color;
});

fs.writeFileSync(colorDataPath, JSON.stringify(fixedColors, null, 2));
console.log(`\n✅ Fixed ${naColors.length} colors to Normal type`);