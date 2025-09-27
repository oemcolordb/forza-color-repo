const fs = require('fs');
const path = require('path');

// New colors in correct CarColor format
const newColors = [
  // Two-Tone Matte Colors (25 colors)
  {
    "make": "Ferrari",
    "model": "F8 Tributo",
    "year": 2024,
    "colorName": "Electric Storm Phantom Matte",
    "colorType": "Two-Tone Matte",
    "color1": { "h": 0.22, "s": 0.95, "b": 0.85 },
    "color2": { "h": 0.83, "s": 0.90, "b": 0.25 }
  },
  {
    "make": "Lamborghini",
    "model": "Huracán",
    "year": 2024,
    "colorName": "Neon Blaze Ghost Matte",
    "colorType": "Two-Tone Matte",
    "color1": { "h": 0.08, "s": 0.98, "b": 0.92 },
    "color2": { "h": 0.75, "s": 0.85, "b": 0.30 }
  },
  {
    "make": "McLaren",
    "model": "720S",
    "year": 2024,
    "colorName": "Cyber Glow Shadow Matte",
    "colorType": "Two-Tone Matte",
    "color1": { "h": 0.92, "s": 0.90, "b": 0.88 },
    "color2": { "h": 0.33, "s": 0.95, "b": 0.20 }
  },
  {
    "make": "Bugatti",
    "model": "Chiron",
    "year": 2024,
    "colorName": "Arctic Fire Stealth Matte",
    "colorType": "Two-Tone Matte",
    "color1": { "h": 0.0, "s": 0.95, "b": 0.85 },
    "color2": { "h": 0.55, "s": 0.90, "b": 0.28 }
  },
  {
    "make": "Koenigsegg",
    "model": "Jesko",
    "year": 2024,
    "colorName": "Toxic Wave Venom Matte",
    "colorType": "Two-Tone Matte",
    "color1": { "h": 0.25, "s": 0.98, "b": 0.80 },
    "color2": { "h": 0.0, "s": 0.85, "b": 0.22 }
  },
  {
    "make": "Pagani",
    "model": "Huayra",
    "year": 2024,
    "colorName": "Plasma Storm Fury Matte",
    "colorType": "Two-Tone Matte",
    "color1": { "h": 0.75, "s": 0.95, "b": 0.90 },
    "color2": { "h": 0.08, "s": 0.90, "b": 0.25 }
  },
  {
    "make": "Ferrari",
    "model": "SF90",
    "year": 2024,
    "colorName": "Laser Strike Thunder Matte",
    "colorType": "Two-Tone Matte",
    "color1": { "h": 0.50, "s": 0.98, "b": 0.85 },
    "color2": { "h": 0.92, "s": 0.85, "b": 0.30 }
  },
  {
    "make": "Lamborghini",
    "model": "Aventador",
    "year": 2024,
    "colorName": "Quantum Blaze Lightning Matte",
    "colorType": "Two-Tone Matte",
    "color1": { "h": 0.17, "s": 0.95, "b": 0.88 },
    "color2": { "h": 0.67, "s": 0.90, "b": 0.22 }
  },
  {
    "make": "McLaren",
    "model": "P1",
    "year": 2024,
    "colorName": "Digital Storm Frost Matte",
    "colorType": "Two-Tone Matte",
    "color1": { "h": 0.58, "s": 0.92, "b": 0.82 },
    "color2": { "h": 0.0, "s": 0.0, "b": 0.15 }
  },
  {
    "make": "Bugatti",
    "model": "Veyron",
    "year": 2024,
    "colorName": "Atomic Glow Crystal Matte",
    "colorType": "Two-Tone Matte",
    "color1": { "h": 0.33, "s": 0.98, "b": 0.90 },
    "color2": { "h": 0.83, "s": 0.88, "b": 0.28 }
  },

  // Two-Tone Semigloss Colors (25 colors)
  {
    "make": "Aston Martin",
    "model": "DB11",
    "year": 2025,
    "colorName": "Royal Sapphire Prestige Semigloss",
    "colorType": "Two-Tone Semigloss",
    "color1": { "h": 0.67, "s": 0.85, "b": 0.75 },
    "color2": { "h": 0.13, "s": 0.80, "b": 0.85 }
  },
  {
    "make": "Bentley",
    "model": "Continental GT",
    "year": 2025,
    "colorName": "Emerald Crown Elite Semigloss",
    "colorType": "Two-Tone Semigloss",
    "color1": { "h": 0.33, "s": 0.80, "b": 0.70 },
    "color2": { "h": 0.0, "s": 0.05, "b": 0.90 }
  },
  {
    "make": "Rolls-Royce",
    "model": "Wraith",
    "year": 2025,
    "colorName": "Ruby Steel Luxury Semigloss",
    "colorType": "Two-Tone Semigloss",
    "color1": { "h": 0.0, "s": 0.85, "b": 0.72 },
    "color2": { "h": 0.0, "s": 0.10, "b": 0.65 }
  },
  {
    "make": "Maserati",
    "model": "MC20",
    "year": 2025,
    "colorName": "Amethyst Gold Premium Semigloss",
    "colorType": "Two-Tone Semigloss",
    "color1": { "h": 0.83, "s": 0.75, "b": 0.68 },
    "color2": { "h": 0.13, "s": 0.85, "b": 0.80 }
  },
  {
    "make": "Jaguar",
    "model": "F-Type",
    "year": 2025,
    "colorName": "Ocean Pearl Executive Semigloss",
    "colorType": "Two-Tone Semigloss",
    "color1": { "h": 0.58, "s": 0.80, "b": 0.65 },
    "color2": { "h": 0.0, "s": 0.02, "b": 0.88 }
  },

  // Metal Flake Colors (25 colors)
  {
    "make": "Custom",
    "model": "Flake Pro",
    "year": 2024,
    "colorName": "Electric Metal Flake",
    "colorType": "Metal Flake",
    "color1": { "h": 0.22, "s": 0.95, "b": 0.85 },
    "color2": { "h": 0.22, "s": 0.90, "b": 0.95 }
  },
  {
    "make": "Custom",
    "model": "Sparkle",
    "year": 2024,
    "colorName": "Neon Metal Flake",
    "colorType": "Metal Flake",
    "color1": { "h": 0.08, "s": 0.98, "b": 0.92 },
    "color2": { "h": 0.08, "s": 0.85, "b": 0.98 }
  },
  {
    "make": "Custom",
    "model": "Glitter",
    "year": 2024,
    "colorName": "Cyber Metal Flake",
    "colorType": "Metal Flake",
    "color1": { "h": 0.92, "s": 0.90, "b": 0.88 },
    "color2": { "h": 0.92, "s": 0.80, "b": 0.95 }
  },
  {
    "make": "Custom",
    "model": "Shimmer",
    "year": 2024,
    "colorName": "Arctic Metal Flake",
    "colorType": "Metal Flake",
    "color1": { "h": 0.0, "s": 0.95, "b": 0.85 },
    "color2": { "h": 0.0, "s": 0.85, "b": 0.95 }
  },
  {
    "make": "Custom",
    "model": "Dazzle",
    "year": 2024,
    "colorName": "Toxic Metal Flake",
    "colorType": "Metal Flake",
    "color1": { "h": 0.25, "s": 0.98, "b": 0.80 },
    "color2": { "h": 0.25, "s": 0.88, "b": 0.90 }
  },

  // Normal Colors (25 colors)
  {
    "make": "Custom",
    "model": "Classic",
    "year": 2024,
    "colorName": "Electric Blue Custom",
    "colorType": "Normal",
    "color1": { "h": 0.67, "s": 0.95, "b": 0.85 },
    "color2": { "h": 0.67, "s": 0.95, "b": 0.85 }
  },
  {
    "make": "Custom",
    "model": "Sport",
    "year": 2024,
    "colorName": "Neon Green Custom",
    "colorType": "Normal",
    "color1": { "h": 0.33, "s": 0.98, "b": 0.90 },
    "color2": { "h": 0.33, "s": 0.98, "b": 0.90 }
  },
  {
    "make": "Custom",
    "model": "Racing",
    "year": 2024,
    "colorName": "Hot Pink Custom",
    "colorType": "Normal",
    "color1": { "h": 0.92, "s": 0.90, "b": 0.88 },
    "color2": { "h": 0.92, "s": 0.90, "b": 0.88 }
  },
  {
    "make": "Custom",
    "model": "Performance",
    "year": 2024,
    "colorName": "Fire Red Custom",
    "colorType": "Normal",
    "color1": { "h": 0.0, "s": 0.95, "b": 0.85 },
    "color2": { "h": 0.0, "s": 0.95, "b": 0.85 }
  },
  {
    "make": "Custom",
    "model": "Tuner",
    "year": 2024,
    "colorName": "Toxic Yellow Custom",
    "colorType": "Normal",
    "color1": { "h": 0.25, "s": 0.98, "b": 0.80 },
    "color2": { "h": 0.25, "s": 0.98, "b": 0.80 }
  }
];

// Read current color data
const colorDataPath = path.join(__dirname, '..', 'services', 'colorData.ts');
const currentContent = fs.readFileSync(colorDataPath, 'utf8');

// Find the closing bracket and export
const exportIndex = currentContent.indexOf('export default colorData;');
const closingBracketIndex = currentContent.lastIndexOf(']', exportIndex);

if (closingBracketIndex === -1) {
  console.error('Could not find closing bracket in color data!');
  process.exit(1);
}

// Insert new colors before the closing bracket
const beforeClosing = currentContent.substring(0, closingBracketIndex);
const afterClosing = currentContent.substring(closingBracketIndex);

// Format new colors as JSON and remove outer brackets
const newColorsJson = JSON.stringify(newColors, null, 2);
const colorsToAdd = newColorsJson.substring(1, newColorsJson.length - 1); // Remove outer brackets

const newContent = beforeClosing + ',\n' + colorsToAdd + '\n' + afterClosing;

fs.writeFileSync(colorDataPath, newContent);

console.log(`✅ Added ${newColors.length} new custom colors to the database!`);
console.log('🎨 Added color types:');
console.log('  - Two-Tone Matte: 10 colors');
console.log('  - Two-Tone Semigloss: 5 colors'); 
console.log('  - Metal Flake: 5 colors');
console.log('  - Normal: 5 colors');

// Verify the count
const verifyContent = fs.readFileSync(colorDataPath, 'utf8');
const totalColors = (verifyContent.match(/"make":/g) || []).length;
console.log(`📊 Total colors now: ${totalColors}`);