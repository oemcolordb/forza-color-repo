const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/carColors.json');
let colors = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const rareColorsData = [
  // Ferrari
  { name: "Grigio Medio", brand: "Ferrari", type: "Gloss", h: 0.6, s: 0.05, b: 0.4 },
  { name: "Verde Pino", brand: "Ferrari", type: "Gloss", h: 0.35, s: 0.6, b: 0.3 },
  { name: "Viola Hong Kong", brand: "Ferrari", type: "Pearlescent", h: 0.8, s: 0.9, b: 0.4 },
  { name: "Azzurro La Plata", brand: "Ferrari", type: "Gloss", h: 0.55, s: 0.4, b: 0.8 },
  { name: "Verde Jewel", brand: "Ferrari", type: "Pearlescent", h: 0.4, s: 0.8, b: 0.4 },
  { name: "Giallo Triplo Strato", brand: "Ferrari", type: "Pearlescent", h: 0.15, s: 0.9, b: 0.95 },
  
  // Porsche
  { name: "Amethyst Metallic", brand: "Porsche", type: "Metallic", h: 0.85, s: 0.6, b: 0.4 },
  { name: "Viola Metallic", brand: "Porsche", type: "Metallic", h: 0.75, s: 0.7, b: 0.4 },
  { name: "Signal Yellow", brand: "Porsche", type: "Gloss", h: 0.12, s: 0.95, b: 0.95 },
  { name: "Mint Green", brand: "Porsche", type: "Gloss", h: 0.45, s: 0.5, b: 0.8 },
  { name: "Maritime Blue", brand: "Porsche", type: "Gloss", h: 0.6, s: 0.8, b: 0.7 },
  { name: "Acid Green", brand: "Porsche", type: "Pearlescent", h: 0.25, s: 0.9, b: 0.9 },
  { name: "Voodoo Blue", brand: "Porsche", type: "Gloss", h: 0.6, s: 0.85, b: 0.8 },
  { name: "Miami Blue", brand: "Porsche", type: "Gloss", h: 0.55, s: 0.7, b: 0.85 },
  { name: "Brewster Green", brand: "Porsche", type: "Gloss", h: 0.35, s: 0.6, b: 0.2 },
  { name: "Irish Green", brand: "Porsche", type: "Gloss", h: 0.35, s: 0.8, b: 0.35 },
  
  // Lamborghini
  { name: "Verde Draco", brand: "Lamborghini", type: "Matte", h: 0.35, s: 0.6, b: 0.4 },
  { name: "Viola Pasifae", brand: "Lamborghini", type: "Pearlescent", h: 0.78, s: 0.9, b: 0.5 },
  { name: "Rosso Efesto", brand: "Lamborghini", type: "Pearlescent", h: 0.02, s: 0.95, b: 0.5 },
  { name: "Giallo Tenerife", brand: "Lamborghini", type: "Pearlescent", h: 0.15, s: 0.95, b: 0.9 },
  { name: "Arancio Borealis", brand: "Lamborghini", type: "Pearlescent", h: 0.08, s: 0.95, b: 0.85 },
  { name: "Verde Ermes", brand: "Lamborghini", type: "Metallic", h: 0.35, s: 0.7, b: 0.4 },
  
  // McLaren
  { name: "Lantana Purple", brand: "McLaren", type: "Pearlescent", h: 0.8, s: 0.8, b: 0.5 },
  { name: "Volcano Yellow", brand: "McLaren", type: "Pearlescent", h: 0.15, s: 0.95, b: 0.9 },
  { name: "Kyanite Blue", brand: "McLaren", type: "Pearlescent", h: 0.6, s: 0.9, b: 0.8 },
  { name: "Fistral Blue", brand: "McLaren", type: "Gloss", h: 0.55, s: 0.7, b: 0.8 },
  { name: "Amethyst Black", brand: "McLaren", type: "Metallic", h: 0.85, s: 0.6, b: 0.2 },
  { name: "Muriwai White", brand: "McLaren", type: "Pearlescent", h: 0.5, s: 0.05, b: 0.9 },
  
  // Aston Martin
  { name: "Xenon Grey", brand: "Aston Martin", type: "Metallic", h: 0.6, s: 0.1, b: 0.5 },
  { name: "Cosmos Orange", brand: "Aston Martin", type: "Pearlescent", h: 0.08, s: 0.9, b: 0.8 },
  { name: "Diavolo Red", brand: "Aston Martin", type: "Pearlescent", h: 0.02, s: 0.9, b: 0.6 },
  { name: "Ocellus Teal", brand: "Aston Martin", type: "Metallic", h: 0.5, s: 0.8, b: 0.6 },
  { name: "Hyper Red", brand: "Aston Martin", type: "Pearlescent", h: 0.02, s: 0.95, b: 0.7 },
  
  // Rolls-Royce & Bentley
  { name: "Rose Quartz", brand: "Rolls-Royce", type: "Pearlescent", h: 0.95, s: 0.2, b: 0.85 },
  { name: "Fux Fuxia", brand: "Rolls-Royce", type: "Gloss", h: 0.9, s: 0.8, b: 0.7 },
  { name: "Belladonna Purple", brand: "Rolls-Royce", type: "Pearlescent", h: 0.8, s: 0.7, b: 0.3 },
  { name: "Sequin Blue", brand: "Bentley", type: "Metallic", h: 0.62, s: 0.8, b: 0.6 },
  { name: "Apple Green", brand: "Bentley", type: "Metallic", h: 0.3, s: 0.8, b: 0.7 },
  
  // BMW
  { name: "Frozen Portimao Blue", brand: "BMW", type: "Matte", h: 0.6, s: 0.8, b: 0.6 },
  { name: "Frozen Marina Bay Blue", brand: "BMW", type: "Matte", h: 0.62, s: 0.9, b: 0.5 },
  { name: "Fire Orange", brand: "BMW", type: "Gloss", h: 0.08, s: 0.95, b: 0.85 },
  { name: "Austin Yellow", brand: "BMW", type: "Metallic", h: 0.15, s: 0.8, b: 0.8 },
  { name: "Sao Paulo Yellow", brand: "BMW", type: "Gloss", h: 0.18, s: 0.9, b: 0.9 },
  { name: "Twilight Purple", brand: "BMW", type: "Pearlescent", h: 0.8, s: 0.8, b: 0.4 },
  { name: "Java Green", brand: "BMW", type: "Metallic", h: 0.35, s: 0.9, b: 0.6 },
  { name: "Dakar Yellow", brand: "BMW", type: "Gloss", h: 0.15, s: 0.7, b: 0.9 },
  
  // Audi
  { name: "Suzuka Gray", brand: "Audi", type: "Metallic", h: 0.6, s: 0.05, b: 0.85 },
  { name: "Sonoma Green", brand: "Audi", type: "Metallic", h: 0.35, s: 0.7, b: 0.4 },
  { name: "Kemora Gray", brand: "Audi", type: "Metallic", h: 0.6, s: 0.1, b: 0.6 },
  { name: "Vegas Yellow", brand: "Audi", type: "Gloss", h: 0.15, s: 0.9, b: 0.9 },
  
  // Ultra Exotics
  { name: "Centodieci White", brand: "Bugatti", type: "Pearlescent", h: 0.6, s: 0.02, b: 0.95 },
  { name: "Nocturne", brand: "Bugatti", type: "Gloss", h: 0, s: 0, b: 0.1 },
  { name: "French Racing Blue", brand: "Bugatti", type: "Gloss", h: 0.6, s: 0.8, b: 0.7 },
  { name: "Zonda Cinque White", brand: "Pagani", type: "Pearlescent", h: 0.1, s: 0.05, b: 0.95 },
  { name: "Huayra BC Silver", brand: "Pagani", type: "Metallic", h: 0.6, s: 0.05, b: 0.85 },
  { name: "Spectraflair Silver", brand: "TVR", type: "Metal Flake", h: 0.6, s: 0.1, b: 0.8 }, // Prismatic flake
  { name: "Chameleon Blue", brand: "TVR", type: "Metal Flake", h: 0.65, s: 0.9, b: 0.5 },
  { name: "Trevita Diamond Weave", brand: "Koenigsegg", type: "Metal Flake", h: 0.6, s: 0.02, b: 0.9 }, // White carbon with diamonds
  { name: "Jesko White", brand: "Koenigsegg", type: "Pearlescent", h: 0.6, s: 0.02, b: 0.95 },
  
  // Alfa Romeo & Lexus
  { name: "Rosso Competizione", brand: "Alfa Romeo", type: "Pearlescent", h: 0.02, s: 0.95, b: 0.6 },
  { name: "Verde Montreal", brand: "Alfa Romeo", type: "Pearlescent", h: 0.4, s: 0.8, b: 0.5 },
  { name: "Ocra Lipari", brand: "Alfa Romeo", type: "Pearlescent", h: 0.12, s: 0.9, b: 0.8 },
  { name: "Flare Yellow", brand: "Lexus", type: "Pearlescent", h: 0.15, s: 0.95, b: 0.95 },
  { name: "Nori Green Pearl", brand: "Lexus", type: "Pearlescent", h: 0.35, s: 0.6, b: 0.3 },
  { name: "Infrared", brand: "Lexus", type: "Pearlescent", h: 0.02, s: 0.95, b: 0.7 },

  // Legendary Historic & Bespoke
  { name: "Sassy Grass Green", brand: "Plymouth", type: "Gloss", h: 0.3, s: 0.9, b: 0.6 },
  { name: "Panther Pink", brand: "Dodge", type: "Gloss", h: 0.9, s: 0.8, b: 0.8 },
  { name: "Bayside Blue", brand: "Nissan", type: "Pearlescent", h: 0.62, s: 0.9, b: 0.7 },
  { name: "Champion White", brand: "Honda", type: "Gloss", h: 0.15, s: 0.05, b: 0.95 },
  { name: "Phoenix Yellow", brand: "Honda", type: "Gloss", h: 0.15, s: 0.9, b: 0.9 },
  { name: "Spoon Sports Blue", brand: "Honda", type: "Gloss", h: 0.6, s: 0.9, b: 0.8 },
  { name: "Brimstone Yellow", brand: "Dodge", type: "Gloss", h: 0.15, s: 0.9, b: 0.95 }
];

let addedCount = 0;
const existingColors = new Set(colors.map(c => c.colorName.toLowerCase()));

for (const rc of rareColorsData) {
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
      source: "Internet Deep Dive Pt 2"
    });
    
    existingColors.add(fullColorName.toLowerCase());
    addedCount++;
  }
}

colors.sort((a, b) => {
  if (a.make < b.make) return -1;
  if (a.make > b.make) return 1;
  if (a.colorName < b.colorName) return -1;
  if (a.colorName > b.colorName) return 1;
  return 0;
});

fs.writeFileSync(filePath, JSON.stringify(colors, null, 2));

console.log(`Successfully added ${addedCount} more legendary/rare colors to the 'Rare Colors' category.`);
