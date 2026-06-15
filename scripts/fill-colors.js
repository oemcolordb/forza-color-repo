const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/carColors.json');
const rawData = fs.readFileSync(filePath, 'utf8');
const colors = JSON.parse(rawData);

// Tally colors by manufacturer
const counts = {};
const existingNames = {};

colors.forEach(c => {
  const make = c.make || 'Unknown';
  counts[make] = (counts[make] || 0) + 1;
  
  if (!existingNames[make]) existingNames[make] = new Set();
  if (c.colorName) existingNames[make].add(c.colorName.toLowerCase());
});

// A realistic palette of automotive colors to fill the gaps
const genericPalette = [
  { name: "Onyx Black", type: "Gloss", h: 0, s: 0, b: 0.1 },
  { name: "Arctic White", type: "Gloss", h: 0.6, s: 0.02, b: 0.95 },
  { name: "Liquid Silver", type: "Metal Flake", h: 0.6, s: 0.05, b: 0.8 },
  { name: "Graphite Gray", type: "Metallic", h: 0.6, s: 0.05, b: 0.4 },
  { name: "Racing Red", type: "Gloss", h: 0.02, s: 0.9, b: 0.8 },
  { name: "Midnight Blue", type: "Metallic", h: 0.65, s: 0.8, b: 0.2 },
  { name: "British Racing Green", type: "Gloss", h: 0.35, s: 0.7, b: 0.25 },
  { name: "Sunset Orange", type: "Metallic", h: 0.08, s: 0.85, b: 0.8 },
  { name: "Speed Yellow", type: "Gloss", h: 0.15, s: 0.8, b: 0.9 },
  { name: "Cobalt Blue", type: "Gloss", h: 0.6, s: 0.8, b: 0.7 },
  { name: "Burgundy Pearl", type: "Pearlescent", h: 0.95, s: 0.7, b: 0.4 },
  { name: "Champagne Gold", type: "Metallic", h: 0.12, s: 0.3, b: 0.7 },
  { name: "Titanium", type: "Metal Flake", h: 0.6, s: 0.05, b: 0.6 },
  { name: "Matte Black", type: "Matte", h: 0, s: 0, b: 0.15 },
  { name: "Nardo Gray", type: "Gloss", h: 0.55, s: 0.02, b: 0.6 },
  { name: "Electric Blue", type: "Metallic", h: 0.58, s: 0.9, b: 0.85 },
  { name: "Pearl White", type: "Pearlescent", h: 0.1, s: 0.05, b: 0.92 },
  { name: "Cherry Red", type: "Metallic", h: 0.98, s: 0.85, b: 0.6 }
];

let addedCount = 0;
let affectedMakes = 0;

for (const [make, count] of Object.entries(counts)) {
  if (count < 10 && make !== 'Unknown') {
    affectedMakes++;
    let currentCount = count;
    
    for (const color of genericPalette) {
      if (currentCount >= 10) break;
      
      if (!existingNames[make].has(color.name.toLowerCase())) {
        colors.push({
          make: make,
          model: "",
          year: "2024",
          colorName: color.name,
          colorType: color.type,
          color1: { h: color.h, s: color.s, b: color.b },
          color2: { h: color.h, s: color.s, b: Math.max(0, color.b - 0.1) },
          source: "Generated"
        });
        
        existingNames[make].add(color.name.toLowerCase());
        currentCount++;
        addedCount++;
      }
    }
  }
}

fs.writeFileSync(filePath, JSON.stringify(colors, null, 2));

console.log(`Successfully added ${addedCount} colors across ${affectedMakes} manufacturers.`);
console.log(`All manufacturers now have at least 10 colors in the database.`);
