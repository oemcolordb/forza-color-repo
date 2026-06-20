const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/carColors.json');
let colors = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const rareColorsData = [
  // Legendary Chromaflair / Color-Shift
  { name: "Mystichrome", brand: "Ford", type: "Metal Flake", h: 0.75, s: 0.9, b: 0.4 }, // Purple to green shift
  { name: "Python Green Chromaflair", brand: "Porsche", type: "Metal Flake", h: 0.35, s: 0.8, b: 0.6 },
  { name: "Urban Bamboo Chromaflair", brand: "Porsche", type: "Metal Flake", h: 0.25, s: 0.3, b: 0.7 },
  { name: "Explosive Gold Chromaflair", brand: "Porsche", type: "Metal Flake", h: 0.13, s: 0.8, b: 0.8 },
  { name: "Reflex Spice", brand: "TVR", type: "Metal Flake", h: 0.08, s: 0.8, b: 0.6 },
  { name: "Cascade Indigo", brand: "TVR", type: "Metal Flake", h: 0.7, s: 0.9, b: 0.4 },
  { name: "Swordfish", brand: "TVR", type: "Metal Flake", h: 0.55, s: 0.8, b: 0.6 },
  { name: "Cerberus Pearl", brand: "McLaren", type: "Metal Flake", h: 0.05, s: 0.9, b: 0.5 }, // Red/orange/purple shift
  
  // Insanely Expensive / Engineering Marvels
  { name: "Structural Blue", brand: "Lexus", type: "Pearlescent", h: 0.62, s: 1.0, b: 0.8 }, // Zero blue pigment, nano-structure reflection
  { name: "Oro Alba", brand: "Lamborghini", type: "Metallic", h: 0.12, s: 0.4, b: 0.85 }, // $65k option
  { name: "Naked Carbon (KNC)", brand: "Koenigsegg", type: "Matte", h: 0, s: 0, b: 0.15 }, // Pure polished carbon
  { name: "Liquid Silver", brand: "Bugatti", type: "Metallic", h: 0.6, s: 0.02, b: 0.9 }, 
  { name: "Diamond Dust Metallic", brand: "Rolls-Royce", type: "Metal Flake", h: 0, s: 0, b: 0.9 }, // Contains real crushed diamonds
  
  // Rare Historic / Ultra Limited
  { name: "Midnight Purple II", brand: "Nissan", type: "Metal Flake", h: 0.78, s: 0.8, b: 0.3 },
  { name: "Midnight Purple III", brand: "Nissan", type: "Metal Flake", h: 0.82, s: 0.9, b: 0.4 },
  { name: "Millennium Jade", brand: "Nissan", type: "Metallic", h: 0.25, s: 0.2, b: 0.6 },
  { name: "Plum Crazy", brand: "Dodge", type: "Gloss", h: 0.75, s: 0.8, b: 0.5 },
  { name: "Moulin Rouge", brand: "Plymouth", type: "Gloss", h: 0.95, s: 0.7, b: 0.6 },
  { name: "Emerald Metallic Green", brand: "Dodge", type: "Metallic", h: 0.4, s: 0.8, b: 0.3 }, // Extremely rare Viper color
  { name: "Copper Metallic", brand: "Chevrolet", type: "Metallic", h: 0.08, s: 0.7, b: 0.5 }, // 1986 Corvette rare color
  { name: "Rosso Fuoco", brand: "Ferrari", type: "Pearlescent", h: 0.02, s: 0.95, b: 0.7 }, // Triple layer red
  { name: "Verde Abetone", brand: "Ferrari", type: "Gloss", h: 0.4, s: 0.8, b: 0.25 }, // Rare non-metallic green
  { name: "Viola SE30", brand: "Lamborghini", type: "Metallic", h: 0.75, s: 0.6, b: 0.5 }, // Diablo 30th anniversary
  
  // Modern Bespoke / High-End
  { name: "Valencia Red Pearl", brand: "Acura", type: "Pearlescent", h: 0.02, s: 0.9, b: 0.6 }, // NSX $6k option
  { name: "Nouvelle Blue Pearl", brand: "Acura", type: "Pearlescent", h: 0.6, s: 0.9, b: 0.6 },
  { name: "Papaya Spark", brand: "McLaren", type: "Metal Flake", h: 0.08, s: 0.9, b: 0.9 },
  { name: "Lava Orange", brand: "Porsche", type: "Gloss", h: 0.05, s: 0.9, b: 0.8 },
  { name: "Rubystone Red", brand: "Porsche", type: "Gloss", h: 0.95, s: 0.6, b: 0.7 },
  { name: "Oak Green Metallic", brand: "Porsche", type: "Metallic", h: 0.35, s: 0.6, b: 0.3 },
  { name: "Nogaro Blue", brand: "Audi", type: "Pearlescent", h: 0.6, s: 0.8, b: 0.7 },
  { name: "Merlin Purple", brand: "Audi", type: "Pearlescent", h: 0.8, s: 0.7, b: 0.3 },
  { name: "Techno Violet", brand: "BMW", type: "Metallic", h: 0.75, s: 0.6, b: 0.4 },
  { name: "Laguna Seca Blue", brand: "BMW", type: "Gloss", h: 0.55, s: 0.6, b: 0.6 },
  { name: "Tricolore Blue", brand: "Pagani", type: "Matte", h: 0.6, s: 0.8, b: 0.3 }, // Tinted raw carbon
  { name: "Rosso Dubai", brand: "Pagani", type: "Metallic", h: 0.02, s: 0.9, b: 0.5 },
  { name: "Green Hell Magno", brand: "Mercedes-AMG", type: "Matte", h: 0.3, s: 0.9, b: 0.5 },
  { name: "China Blue", brand: "Mercedes-Benz", type: "Gloss", h: 0.58, s: 0.4, b: 0.7 },
  { name: "Saffron Yellow", brand: "Lotus", type: "Metallic", h: 0.15, s: 0.9, b: 0.8 },
  { name: "Krypton Green", brand: "Lotus", type: "Gloss", h: 0.3, s: 0.9, b: 0.7 },
  { name: "Verde Ithaca", brand: "Lamborghini", type: "Pearlescent", h: 0.25, s: 0.9, b: 0.8 },
  { name: "Giallo Orion", brand: "Lamborghini", type: "Pearlescent", h: 0.15, s: 0.9, b: 0.9 },
  { name: "Blu Caelum", brand: "Lamborghini", type: "Metallic", h: 0.6, s: 0.9, b: 0.6 },
  { name: "Azzurro Dino", brand: "Ferrari", type: "Gloss", h: 0.55, s: 0.8, b: 0.7 },
  { name: "Rosso Barchetta", brand: "Ferrari", type: "Gloss", h: 0.02, s: 0.8, b: 0.3 },
  { name: "Candy Apple Red", brand: "Koenigsegg", type: "Metal Flake", h: 0.02, s: 0.95, b: 0.6 },
  { name: "Liquid Copper", brand: "BMW", type: "Metallic", h: 0.08, s: 0.6, b: 0.6 },
  { name: "Satin Martian Colours", brand: "Aston Martin", type: "Matte", h: 0.75, s: 0.8, b: 0.4 },
  { name: "Andromeda Red", brand: "Aston Martin", type: "Metal Flake", h: 0.95, s: 0.9, b: 0.5 }
];

let addedCount = 0;
const existingColors = new Set(colors.map(c => c.colorName.toLowerCase()));

for (const rc of rareColorsData) {
  // Add to the new "Rare Colors" category
  const makeName = "Rare Colors";
  
  const fullColorName = `${rc.name} (${rc.brand})`;
  
  if (!existingColors.has(fullColorName.toLowerCase())) {
    colors.push({
      make: makeName,
      model: rc.brand,
      year: "Special",
      colorName: fullColorName,
      colorType: rc.type,
      color1: { h: rc.h, s: rc.s, b: rc.b },
      color2: { h: rc.h, s: rc.s, b: Math.max(0, rc.b - 0.1) },
      source: "Internet Deep Dive"
    });
    
    existingColors.add(fullColorName.toLowerCase());
    addedCount++;
  }
}

// Sort alphabetically by make and then colorName for cleanliness
colors.sort((a, b) => {
  if (a.make < b.make) return -1;
  if (a.make > b.make) return 1;
  if (a.colorName < b.colorName) return -1;
  if (a.colorName > b.colorName) return 1;
  return 0;
});

fs.writeFileSync(filePath, JSON.stringify(colors, null, 2));

console.log(`Successfully added ${addedCount} legendary/rare colors to the 'Rare Colors' category.`);
