const fs = require('fs');
const path = require('path');

// Read the color data from JSON file
const colorDataPath = path.join(__dirname, '..', 'carColors.json');
const colorDataContent = fs.readFileSync(colorDataPath, 'utf8');
const colors = JSON.parse(colorDataContent);

console.log('Successfully parsed color data');
console.log(`Total colors: ${colors.length}`);

// Analyze color types
const colorTypes = {};
const makes = {};
const years = {};

colors.forEach(color => {
  // Count color types
  if (colorTypes[color.colorType]) {
    colorTypes[color.colorType]++;
  } else {
    colorTypes[color.colorType] = 1;
  }

  // Count makes
  if (makes[color.make]) {
    makes[color.make]++;
  } else {
    makes[color.make] = 1;
  }

  // Count years
  if (color.year) {
    if (years[color.year]) {
      years[color.year]++;
    } else {
      years[color.year] = 1;
    }
  }
});

console.log('\n=== COLOR TYPE ANALYSIS ===');
Object.entries(colorTypes)
  .sort(([,a], [,b]) => b - a)
  .forEach(([type, count]) => {
    console.log(`${type}: ${count} colors`);
  });

console.log('\n=== TOP 10 MAKES ===');
Object.entries(makes)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 10)
  .forEach(([make, count]) => {
    console.log(`${make}: ${count} colors`);
  });

console.log('\n=== YEAR DISTRIBUTION ===');
Object.entries(years)
  .sort(([a,], [b,]) => parseInt(b) - parseInt(a))
  .slice(0, 10)
  .forEach(([year, count]) => {
    console.log(`${year}: ${count} colors`);
  });

console.log('\n✅ Color analysis complete!');