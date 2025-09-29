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
  }
];

// Read current color data from JSON file
const colorDataPath = path.join(__dirname, '..', 'carColors.json');
const currentContent = fs.readFileSync(colorDataPath, 'utf8');
const currentColors = JSON.parse(currentContent);

// Add new colors to the existing array
const updatedColors = [...currentColors, ...newColors];

// Write back to JSON file
fs.writeFileSync(colorDataPath, JSON.stringify(updatedColors, null, 2));

console.log(`✅ Added ${newColors.length} new custom colors to the database!`);
console.log('🎨 Added color types:');
console.log('  - Two-Tone Matte: 5 colors');

// Verify the count
console.log(`📊 Total colors now: ${updatedColors.length}`);