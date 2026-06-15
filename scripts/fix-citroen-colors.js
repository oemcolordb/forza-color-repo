const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/carColors.json');
const colors = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Forza HSB (Hue 0-1, Saturation 0-1, Brightness 0-1)
const citroenFixes = {
    'Blanc Banquise': { h: 0.0, s: 0.0, b: 0.85, type: 'Gloss' },
    'Blanc Nacre': { h: 0.1, s: 0.05, b: 0.90, type: 'Pearlescent' },
    'Bleu Eclipse': { h: 0.62, s: 0.60, b: 0.25, type: 'Metallic' },
    'Bleu Iceland': { h: 0.58, s: 0.30, b: 0.60, type: 'Metallic' },
    'Gris Acier': { h: 0.60, s: 0.05, b: 0.50, type: 'Metallic' },
    'Gris Amazonite': { h: 0.45, s: 0.15, b: 0.40, type: 'Metallic' },
    'Gris Platinium': { h: 0.60, s: 0.05, b: 0.35, type: 'Metallic' },
    'Kaki Grey': { h: 0.25, s: 0.20, b: 0.40, type: 'Gloss' },
    'Noir Perla Nera': { h: 0.60, s: 0.10, b: 0.15, type: 'Metallic' },
    'Rouge Elixir': { h: 0.98, s: 0.85, b: 0.45, type: 'Metallic' },
    'Rouge Pepper': { h: 0.02, s: 0.90, b: 0.50, type: 'Metallic' },
    'Sable': { h: 0.12, s: 0.25, b: 0.60, type: 'Metallic' },
};

let fixCount = 0;

for (const color of colors) {
    if (color.make?.toLowerCase() === 'citroen' || color.make?.toLowerCase() === 'citroën') {
        const fix = citroenFixes[color.colorName];
        if (fix) {
            color.color1 = { h: fix.h, s: fix.s, b: fix.b };
            
            if (fix.type === 'Pearlescent') {
                color.color2 = { h: fix.h, s: Math.max(0, fix.s - 0.05), b: Math.min(1, fix.b + 0.1) };
            } else if (fix.type === 'Metallic') {
                color.color2 = { h: fix.h, s: fix.s, b: Math.max(0, fix.b - 0.15) };
            } else {
                color.color2 = { h: fix.h, s: fix.s, b: fix.b }; // Gloss fallback
            }

            color.colorType = fix.type;
            fixCount++;
        }
    }
}

fs.writeFileSync(filePath, JSON.stringify(colors, null, 2));

console.log(`Successfully fixed ${fixCount} Citroen colors!`);
