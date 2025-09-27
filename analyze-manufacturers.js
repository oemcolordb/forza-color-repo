const fs = require('fs');

const content = fs.readFileSync('./services/colorData.ts', 'utf8');

// Extract makes
const makeMatches = content.match(/"make":\s*"([^"]+)"/g);

if (makeMatches) {
  const makes = makeMatches.map(match => {
    const result = match.match(/"make":\s*"([^"]+)"/);
    return result ? result[1] : null;
  }).filter(Boolean);

  const makeCounts = {};
  makes.forEach(make => {
    makeCounts[make] = (makeCounts[make] || 0) + 1;
  });

  const sortedMakes = Object.entries(makeCounts)
    .sort(([,a], [,b]) => b - a);

  console.log(`Total manufacturers: ${sortedMakes.length}`);
  console.log(`Total colors: ${makes.length}\n`);
  
  console.log('Top 20 manufacturers by color count:');
  sortedMakes.slice(0, 20).forEach(([make, count]) => {
    console.log(`${make}: ${count}`);
  });

  console.log(`\nManufacturers with 1-5 colors: ${sortedMakes.filter(([,count]) => count <= 5).length}`);
}