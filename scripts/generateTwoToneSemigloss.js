const fs = require('fs');
const path = require('path');

// Premium semigloss color combinations
const semiglossColorPairs = [
  // Luxury combinations
  { name: "Royal Sapphire", h1: 0.67, s1: 0.9, b1: 0.8, h2: 0.13, s2: 0.8, b2: 0.9 }, // Blue + Gold
  { name: "Emerald Crown", h1: 0.33, s1: 0.85, b1: 0.7, h2: 0.0, s2: 0.0, b2: 0.95 }, // Green + Silver
  { name: "Ruby Platinum", h1: 0.0, s1: 0.9, b1: 0.75, h2: 0.0, s2: 0.0, b2: 0.85 }, // Red + Platinum
  { name: "Amethyst Steel", h1: 0.83, s1: 0.8, b1: 0.7, h2: 0.0, s2: 0.0, b2: 0.6 }, // Purple + Steel
  { name: "Topaz Bronze", h1: 0.17, s1: 0.9, b1: 0.85, h2: 0.08, s2: 0.7, b2: 0.5 }, // Yellow + Bronze
  
  // Sport combinations
  { name: "Racing Stripe", h1: 0.0, s1: 1.0, b1: 0.9, h2: 0.0, s2: 0.0, b2: 0.1 }, // Red + Black
  { name: "Speed Demon", h1: 0.08, s1: 1.0, b1: 0.95, h2: 0.0, s2: 0.0, b2: 0.2 }, // Orange + Charcoal
  { name: "Track Master", h1: 0.25, s1: 0.9, b1: 0.9, h2: 0.67, s2: 0.8, b2: 0.3 }, // Yellow + Navy
  { name: "Velocity Blue", h1: 0.58, s1: 0.95, b1: 0.85, h2: 0.0, s2: 0.0, b2: 0.9 }, // Cyan + White
  { name: "Turbo Green", h1: 0.42, s1: 0.9, b1: 0.8, h2: 0.0, s2: 0.0, b2: 0.15 }, // Teal + Black
  
  // Sunset combinations
  { name: "Sunset Blaze", h1: 0.05, s1: 0.95, b1: 0.9, h2: 0.92, s2: 0.8, b2: 0.7 }, // Orange + Pink
  { name: "Dawn Horizon", h1: 0.15, s1: 0.8, b1: 0.85, h2: 0.75, s2: 0.6, b2: 0.5 }, // Gold + Purple
  { name: "Twilight Glow", h1: 0.83, s1: 0.7, b1: 0.6, h2: 0.08, s2: 0.9, b2: 0.8 }, // Purple + Orange
  
  // Ocean combinations
  { name: "Deep Ocean", h1: 0.58, s1: 0.9, b1: 0.4, h2: 0.5, s2: 0.7, b2: 0.8 }, // Dark Cyan + Aqua
  { name: "Coral Reef", h1: 0.03, s1: 0.8, b1: 0.85, h2: 0.5, s2: 0.6, b2: 0.7 }, // Coral + Turquoise
  { name: "Pearl Dive", h1: 0.0, s1: 0.0, b1: 0.9, h2: 0.55, s2: 0.8, b2: 0.6 }, // Pearl + Teal
];

function generateTwoToneSemiglossColors() {
  const colors = [];
  const makes = ["Aston Martin", "Bentley", "Rolls-Royce", "Maserati", "Alfa Romeo", "Jaguar", "Lexus", "Acura", "Infiniti", "Genesis"];
  const models = ["GT", "Sport", "Luxury", "Premium", "Elite", "Signature", "Executive", "Performance", "Touring", "Grand"];
  
  let colorIndex = 0;
  
  for (let i = 0; i < 250; i++) {
    const basePair = semiglossColorPairs[colorIndex % semiglossColorPairs.length];
    const variation = Math.floor(i / semiglossColorPairs.length);
    
    // Create subtle variations for semigloss finish
    const hueShift1 = (variation * 0.03) % 1;
    const hueShift2 = (variation * 0.04) % 1;
    const satAdjust = 0.85 + (variation * 0.015);
    const brightAdjust = 0.75 + (variation * 0.025);
    
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
    
    // Luxury semigloss naming
    const nameVariations = [
      "Prestige", "Elite", "Signature", "Executive", "Premier", "Luxury", "Grand", "Noble", "Regal", "Imperial",
      "Sovereign", "Majestic", "Supreme", "Ultimate", "Pinnacle", "Apex", "Crown", "Dynasty", "Heritage", "Legacy",
      "Platinum", "Diamond", "Crystal", "Pearl", "Opal", "Onyx", "Marble", "Granite", "Silk", "Velvet",
      "Satin", "Gloss", "Sheen", "Luster", "Radiance", "Brilliance", "Gleam", "Shimmer", "Sparkle", "Dazzle"
    ];
    
    const colorName = `${basePair.name} ${nameVariations[i % nameVariations.length]} Semigloss`;
    const make = makes[i % makes.length];
    const model = `${models[i % models.length]} ${2025 + Math.floor(i / 25)}`;
    
    colors.push({
      make: make,
      model: model,
      year: 2025 + Math.floor(i / 25),
      colorName: colorName,
      colorType: "Two-Tone Semigloss",
      color1: color1,
      color2: color2
    });
    
    colorIndex++;
  }
  
  return colors;
}

// Load existing color data and preserve it
const colorDataPath = path.join(__dirname, '..', 'services', 'colorData.ts');
let existingColors = [];

try {
  const fileContent = fs.readFileSync(colorDataPath, 'utf8');
  const dataMatch = fileContent.match(/const colors: CarColor\[\] = (\[[\s\S]*?\]);/);
  if (dataMatch) {
    existingColors = JSON.parse(dataMatch[1]);
    console.log(`📊 Found ${existingColors.length} existing colors`);
  }
} catch (error) {
  console.log('No existing color data found, starting fresh...');
}

// Generate new semigloss colors
const newSemiglossColors = generateTwoToneSemiglossColors();

// Append to existing colors (preserving all existing data)
const allColors = [...existingColors, ...newSemiglossColors];

// Write updated color data
const newFileContent = `import type { CarColor } from '../app/types/color'

const colors: CarColor[] = ${JSON.stringify(allColors, null, 2)};

export default colors;
`;

fs.writeFileSync(colorDataPath, newFileContent);

console.log(`✅ Generated ${newSemiglossColors.length} luxury two-tone semigloss colors!`);
console.log(`📊 Total colors in database: ${allColors.length}`);
console.log(`🔒 Preserved ${existingColors.length} existing colors`);
console.log('🎨 New Semigloss Features:');
console.log('  - Luxury finish combinations');
console.log('  - Premium automotive brands');
console.log('  - Sophisticated color pairings');
console.log('  - Executive naming themes');
console.log('  - Subtle semigloss variations');