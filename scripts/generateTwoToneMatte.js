const fs = require('fs');
const path = require('path');

// High contrast color pairs with vibrant, sharp combinations
const colorPairs = [
  // Electric contrasts
  { name: "Electric Lime", h1: 0.22, s1: 1.0, b1: 0.9, h2: 0.83, s2: 1.0, b2: 0.2 }, // Lime + Deep Purple
  { name: "Neon Sunset", h1: 0.08, s1: 1.0, b1: 1.0, h2: 0.75, s2: 1.0, b2: 0.3 }, // Orange + Indigo
  { name: "Cyber Pink", h1: 0.92, s1: 1.0, b1: 0.95, h2: 0.33, s2: 1.0, b2: 0.15 }, // Hot Pink + Dark Green
  { name: "Arctic Fire", h1: 0.0, s1: 1.0, b1: 0.9, h2: 0.55, s2: 1.0, b2: 0.25 }, // Red + Teal
  { name: "Toxic Glow", h1: 0.25, s1: 1.0, b1: 0.85, h2: 0.0, s2: 1.0, b2: 0.2 }, // Yellow + Dark Red
  
  // Metallic contrasts
  { name: "Chrome Thunder", h1: 0.0, s1: 0.0, b1: 0.95, h2: 0.0, s2: 0.0, b2: 0.1 }, // White + Black
  { name: "Gold Rush", h1: 0.13, s1: 0.9, b1: 0.9, h2: 0.63, s2: 1.0, b2: 0.2 }, // Gold + Navy
  { name: "Silver Storm", h1: 0.0, s1: 0.0, b1: 0.8, h2: 0.17, s2: 1.0, b2: 0.3 }, // Silver + Brown
  { name: "Copper Blaze", h1: 0.05, s1: 0.8, b1: 0.7, h2: 0.55, s2: 1.0, b2: 0.15 }, // Copper + Dark Cyan
  
  // Neon combinations
  { name: "Miami Vice", h1: 0.83, s1: 1.0, b1: 0.9, h2: 0.08, s2: 1.0, b2: 0.85 }, // Purple + Orange
  { name: "Laser Show", h1: 0.5, s1: 1.0, b1: 0.95, h2: 0.92, s2: 1.0, b2: 0.9 }, // Cyan + Magenta
  { name: "Rave Night", h1: 0.75, s1: 1.0, b1: 0.8, h2: 0.25, s2: 1.0, b2: 0.9 }, // Blue + Yellow
];

// Generate 300 unique two-tone matte colors
function generateTwoToneMatteColors() {
  const colors = [];
  const makes = ["Ferrari", "Lamborghini", "McLaren", "Bugatti", "Koenigsegg", "Pagani", "Porsche", "BMW", "Mercedes", "Audi"];
  const models = ["Concept", "Special", "Limited", "Edition", "Custom", "Prototype", "Vision", "Future", "Elite", "Ultimate"];
  
  let colorIndex = 0;
  
  for (let i = 0; i < 300; i++) {
    const basePair = colorPairs[colorIndex % colorPairs.length];
    const variation = Math.floor(i / colorPairs.length);
    
    // Create variations by adjusting hue, saturation, and brightness
    const hueShift1 = (variation * 0.05) % 1;
    const hueShift2 = (variation * 0.07) % 1;
    const satAdjust = 0.8 + (variation * 0.02);
    const brightAdjust = 0.7 + (variation * 0.03);
    
    const color1 = {
      h: (basePair.h1 + hueShift1) % 1,
      s: Math.min(basePair.s1 * satAdjust, 1.0),
      b: Math.min(basePair.b1 * brightAdjust, 1.0)
    };
    
    const color2 = {
      h: (basePair.h2 + hueShift2) % 1,
      s: Math.min(basePair.s2 * satAdjust, 1.0),
      b: Math.min(basePair.b2 * brightAdjust, 1.0)
    };
    
    // Generate unique names
    const nameVariations = [
      "Phantom", "Ghost", "Shadow", "Stealth", "Venom", "Fury", "Rage", "Storm", "Thunder", "Lightning",
      "Blaze", "Inferno", "Frost", "Ice", "Crystal", "Diamond", "Titanium", "Carbon", "Plasma", "Laser",
      "Neon", "Electric", "Atomic", "Cosmic", "Galactic", "Stellar", "Solar", "Lunar", "Nova", "Supernova",
      "Quantum", "Matrix", "Digital", "Cyber", "Tech", "Future", "Ultra", "Hyper", "Mega", "Super",
      "Extreme", "Radical", "Intense", "Vivid", "Brilliant", "Dazzling", "Stunning", "Spectacular"
    ];
    
    const colorName = `${basePair.name} ${nameVariations[i % nameVariations.length]} Matte`;
    const make = makes[i % makes.length];
    const model = `${models[i % models.length]} ${2024 + Math.floor(i / 50)}`;
    
    colors.push({
      make: make,
      model: model,
      year: 2024 + Math.floor(i / 50),
      colorName: colorName,
      colorType: "Two-Tone Matte",
      color1: color1,
      color2: color2
    });
    
    colorIndex++;
  }
  
  return colors;
}

// Load existing color data
const colorDataPath = path.join(__dirname, '..', 'services', 'colorData.ts');
let existingData = [];

try {
  const fileContent = fs.readFileSync(colorDataPath, 'utf8');
  const dataMatch = fileContent.match(/const colors: CarColor\[\] = (\[[\s\S]*?\]);/);
  if (dataMatch) {
    existingData = JSON.parse(dataMatch[1]);
  }
} catch (error) {
  console.log('Creating new color data file...');
}

// Generate new colors
const newColors = generateTwoToneMatteColors();

// Combine with existing data
const allColors = [...existingData, ...newColors];

// Write updated color data
const newFileContent = `import type { CarColor } from '../app/types/color'

const colors: CarColor[] = ${JSON.stringify(allColors, null, 2)};

export default colors;
`;

fs.writeFileSync(colorDataPath, newFileContent);

console.log(`✅ Generated ${newColors.length} vibrant two-tone matte colors!`);
console.log(`📊 Total colors in database: ${allColors.length}`);
console.log('🎨 Features:');
console.log('  - High contrast color combinations');
console.log('  - Electric and neon color pairs');
console.log('  - Metallic accent combinations');
console.log('  - Sharp, vibrant contrasts');
console.log('  - Unique naming variations');