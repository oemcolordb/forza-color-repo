const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/carColors.json', 'utf8'));

const types = {};
data.forEach(entry => {
  const t = entry.colorType || entry.paintType || entry.paint_type || 'undefined';
  types[t] = (types[t] || 0) + 1;
});

console.log("Paint Types found:");
console.log(types);

const makes = {};
data.forEach(entry => {
  const m = entry.make || entry.manufacturer || 'undefined';
  makes[m] = (makes[m] || 0) + 1;
});

console.log("\nTop 10 Makes found:");
console.log(Object.entries(makes).sort((a,b) => b[1] - a[1]).slice(0, 10));

const junkMakes = Object.entries(makes).filter(([m, c]) => c < 3).sort((a,b) => a[1] - b[1]);
console.log("\nMakes with very few entries:");
console.log(junkMakes);
