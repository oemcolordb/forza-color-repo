const fs = require('fs');

// Read current data
let content = fs.readFileSync('./services/colorData.ts', 'utf8');
// Remove TypeScript imports
content = content.replace(/import.*?;\n/g, '');
const startIndex = content.indexOf('[');
const endIndex = content.lastIndexOf('];');
const arrayContent = content.substring(startIndex, endIndex + 1);
let colorData = new Function('return ' + arrayContent)();

// Generate 61 new Carbon Fiber Polished colors
const newColors = [
  { name: "Carbon Midnight Blue", h: 0.61, s: 0.85, b: 0.25 },
  { name: "Carbon Deep Purple", h: 0.75, s: 0.80, b: 0.30 },
  { name: "Carbon Forest Green", h: 0.33, s: 0.75, b: 0.28 },
  { name: "Carbon Crimson Red", h: 0.02, s: 0.90, b: 0.35 },
  { name: "Carbon Electric Blue", h: 0.55, s: 0.95, b: 0.40 },
  { name: "Carbon Sunset Orange", h: 0.08, s: 0.85, b: 0.45 },
  { name: "Carbon Violet Storm", h: 0.78, s: 0.70, b: 0.32 },
  { name: "Carbon Emerald Green", h: 0.40, s: 0.88, b: 0.38 },
  { name: "Carbon Ruby Red", h: 0.98, s: 0.82, b: 0.42 },
  { name: "Carbon Ocean Blue", h: 0.58, s: 0.77, b: 0.35 },
  { name: "Carbon Amber Gold", h: 0.12, s: 0.90, b: 0.50 },
  { name: "Carbon Magenta Pink", h: 0.85, s: 0.75, b: 0.40 },
  { name: "Carbon Lime Green", h: 0.25, s: 0.95, b: 0.45 },
  { name: "Carbon Steel Blue", h: 0.60, s: 0.65, b: 0.30 },
  { name: "Carbon Bronze", h: 0.10, s: 0.70, b: 0.35 },
  { name: "Carbon Teal", h: 0.48, s: 0.80, b: 0.38 },
  { name: "Carbon Burgundy", h: 0.95, s: 0.85, b: 0.28 },
  { name: "Carbon Cyan", h: 0.52, s: 0.90, b: 0.42 },
  { name: "Carbon Copper", h: 0.06, s: 0.75, b: 0.40 },
  { name: "Carbon Indigo", h: 0.72, s: 0.88, b: 0.32 },
  { name: "Carbon Chartreuse", h: 0.22, s: 0.85, b: 0.48 },
  { name: "Carbon Navy", h: 0.62, s: 0.95, b: 0.25 },
  { name: "Carbon Maroon", h: 0.00, s: 0.80, b: 0.30 },
  { name: "Carbon Turquoise", h: 0.50, s: 0.85, b: 0.45 },
  { name: "Carbon Olive", h: 0.18, s: 0.70, b: 0.35 },
  { name: "Carbon Plum", h: 0.82, s: 0.75, b: 0.38 },
  { name: "Carbon Coral", h: 0.04, s: 0.80, b: 0.50 },
  { name: "Carbon Slate Blue", h: 0.65, s: 0.60, b: 0.40 },
  { name: "Carbon Khaki", h: 0.15, s: 0.65, b: 0.45 },
  { name: "Carbon Lavender", h: 0.77, s: 0.55, b: 0.48 },
  { name: "Carbon Salmon", h: 0.03, s: 0.70, b: 0.52 },
  { name: "Carbon Periwinkle", h: 0.68, s: 0.65, b: 0.45 },
  { name: "Carbon Mint", h: 0.42, s: 0.60, b: 0.50 },
  { name: "Carbon Rose", h: 0.92, s: 0.75, b: 0.42 },
  { name: "Carbon Aqua", h: 0.45, s: 0.85, b: 0.48 },
  { name: "Carbon Mustard", h: 0.13, s: 0.80, b: 0.40 },
  { name: "Carbon Orchid", h: 0.80, s: 0.70, b: 0.45 },
  { name: "Carbon Sage", h: 0.28, s: 0.55, b: 0.38 },
  { name: "Carbon Crimson", h: 0.01, s: 0.95, b: 0.35 },
  { name: "Carbon Cobalt", h: 0.63, s: 0.90, b: 0.40 },
  { name: "Carbon Tangerine", h: 0.07, s: 0.88, b: 0.48 },
  { name: "Carbon Lilac", h: 0.75, s: 0.60, b: 0.50 },
  { name: "Carbon Pine", h: 0.35, s: 0.80, b: 0.30 },
  { name: "Carbon Scarlet", h: 0.99, s: 0.85, b: 0.45 },
  { name: "Carbon Azure", h: 0.57, s: 0.75, b: 0.42 },
  { name: "Carbon Peach", h: 0.05, s: 0.65, b: 0.55 },
  { name: "Carbon Iris", h: 0.70, s: 0.80, b: 0.38 },
  { name: "Carbon Jade", h: 0.38, s: 0.85, b: 0.40 },
  { name: "Carbon Cherry", h: 0.97, s: 0.90, b: 0.35 },
  { name: "Carbon Sapphire", h: 0.59, s: 0.88, b: 0.32 },
  { name: "Carbon Honey", h: 0.11, s: 0.75, b: 0.48 },
  { name: "Carbon Amethyst", h: 0.83, s: 0.70, b: 0.40 },
  { name: "Carbon Moss", h: 0.30, s: 0.65, b: 0.35 },
  { name: "Carbon Fuchsia", h: 0.88, s: 0.85, b: 0.45 },
  { name: "Carbon Cerulean", h: 0.54, s: 0.80, b: 0.38 },
  { name: "Carbon Sienna", h: 0.09, s: 0.70, b: 0.32 },
  { name: "Carbon Mauve", h: 0.85, s: 0.60, b: 0.42 },
  { name: "Carbon Seafoam", h: 0.43, s: 0.70, b: 0.48 },
  { name: "Carbon Rust", h: 0.04, s: 0.80, b: 0.30 },
  { name: "Carbon Periwinkle Blue", h: 0.67, s: 0.65, b: 0.50 },
  { name: "Carbon Lime", h: 0.24, s: 0.90, b: 0.52 }
];

// Add new colors to dataset
newColors.forEach(color => {
  colorData.push({
    make: "Universal",
    model: "Carbon Fiber",
    year: 2024,
    colorName: color.name,
    colorType: "Carbon Fiber Polished",
    color1: { h: color.h, s: color.s, b: color.b },
    color2: { h: color.h, s: Math.max(0.1, color.s - 0.1), b: Math.max(0.1, color.b - 0.05) }
  });
});

// Write updated data
const updatedContent = `const colorData = ${JSON.stringify(colorData, null, 2)};\n\nexport default colorData;\n`;
fs.writeFileSync('./services/colorData.ts', updatedContent);

console.log(`Added ${newColors.length} new Carbon Fiber Polished colors!`);
console.log(`Total colors now: ${colorData.length}`);