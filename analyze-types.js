const fs = require('fs');

// Read the colorData.ts file
const content = fs.readFileSync('./services/colorData.ts', 'utf8');

// Extract all colorType values
const colorTypeMatches = content.match(/"colorType":\s*"([^"]+)"/g);

if (colorTypeMatches) {
  const types = colorTypeMatches.map(match => {
    const result = match.match(/"colorType":\s*"([^"]+)"/);
    return result ? result[1] : null;
  }).filter(Boolean);

  // Count occurrences
  const typeCounts = {};
  types.forEach(type => {
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  // Sort by count
  const sortedTypes = Object.entries(typeCounts)
    .sort(([,a], [,b]) => b - a);

  console.log('Color Types and their counts:');
  sortedTypes.forEach(([type, count]) => {
    console.log(`${type}: ${count}`);
  });
}