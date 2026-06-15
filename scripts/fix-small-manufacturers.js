const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/carColors.json');
let colors = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Delete garbage entries
const isGarbage = (color) => {
    const make = color.make || '';
    const name = color.colorName || '';
    if (name.includes('--')) return true;
    if (make === 'DODGE/' && name.includes('RAM')) return true;
    if (make === 'Faraday' && name.includes('Future')) return true;
    if (make === 'Japan' && name.includes('Region')) return true;
    if (make === 'Lynk' && name.includes('& Co')) return true;
    if (make === 'Mercedes-AMG/' && name.includes('Mercedes')) return true;
    if (make === 'North' && name.includes('American')) return true;
    if (make === 'Pastello' && name.includes('Italia')) return true;
    if (make === 'Scion' && name.includes('TOYOTA')) return true;
    if (make === 'Autogoody' && name.includes('PREMIUM')) return true;
    if (make === 'Inozetek' && name.includes('Super')) return true;
    if (make === 'VViViD+' && name.includes('Ultra')) return true;
    return false;
};

const initialLength = colors.length;
colors = colors.filter(c => !isGarbage(c));
const deletedCount = initialLength - colors.length;

// Map of valid manufacturer fixes
const fixes = {
    'Alpina': {
        'ALPINA Blau (X1G)': { h: 0.65, s: 0.8, b: 0.4, type: 'Metallic' },
        'ALPINA Grun II (X09)': { h: 0.4, s: 0.8, b: 0.3, type: 'Metallic' },
        'Saphirschwarz (475)': { h: 0.6, s: 0.1, b: 0.1, type: 'Metallic' }
    },
    'Ariel': {
        'Silver': { h: 0, s: 0, b: 0.6, type: 'Metallic' }
    },
    'Cupra': {
        'Azul Petrol Mate From Cupra Formentor VZ5': { h: 0.55, s: 0.5, b: 0.3, type: 'Matte' },
        'Blanco Bila From Cupra Ateca': { h: 0, s: 0, b: 0.8, type: 'Gloss' },
        'Gris Magnetic Mate From Cupra Formentor VZ5': { h: 0.6, s: 0.05, b: 0.3, type: 'Matte' },
        'Gris Quasar From Cupra Born': { h: 0.6, s: 0.05, b: 0.4, type: 'Metallic' },
        'Gris Vapor From Cupra Born': { h: 0.6, s: 0.02, b: 0.6, type: 'Gloss' },
        'Plata Geyser From Cupra Born': { h: 0.6, s: 0.05, b: 0.7, type: 'Metallic' }
    },
    'DS': {
        'Bleu Saphir': { h: 0.65, s: 0.7, b: 0.3, type: 'Metallic' },
        'Cristal Pearl': { h: 0.1, s: 0.1, b: 0.8, type: 'Pearlescent' },
        'Gris Artense': { h: 0.6, s: 0.05, b: 0.55, type: 'Metallic' },
        'Gris Laque': { h: 0.6, s: 0.0, b: 0.5, type: 'Gloss' },
        'Rouge Diva': { h: 0.98, s: 0.9, b: 0.4, type: 'Metallic' },
        'Rouge Velvet': { h: 0.98, s: 0.8, b: 0.3, type: 'Metallic' }
    },
    'MINI': {
        'Melting Silver III (C2K)': { h: 0.1, s: 0.05, b: 0.65, type: 'Metallic' }
    },
    'Mercedes-EQ': {
        'Samtbraun Metallic': { h: 0.05, s: 0.4, b: 0.25, type: 'Metallic' }
    },
    'NIO': {
        'Firstlight Kiss Nio ET5t': { h: 0.9, s: 0.2, b: 0.7, type: 'Metallic' },
        'Galaxy Shadow Nio ES6': { h: 0.6, s: 0.1, b: 0.2, type: 'Metallic' },
        'Southern Star Nio ES6': { h: 0.6, s: 0.7, b: 0.4, type: 'Metallic' },
        'Sunlight Gold Nio ET5t': { h: 0.12, s: 0.6, b: 0.6, type: 'Metallic' }
    },
    'Polestar': {
        'Jupiter': { h: 0.1, s: 0.2, b: 0.6, type: 'Metallic' },
        'Magnesium': { h: 0.6, s: 0.02, b: 0.7, type: 'Metallic' },
        'Midnight': { h: 0.65, s: 0.6, b: 0.2, type: 'Metallic' },
        'Osimium': { h: 0.55, s: 0.1, b: 0.5, type: 'Metallic' },
        'Space': { h: 0.6, s: 0.1, b: 0.1, type: 'Metallic' },
        'Thunder': { h: 0.6, s: 0.05, b: 0.4, type: 'Metallic' }
    },
    'Ram': {
        'Trucks Billet Silver Metallic Clear-Coat': { h: 0.6, s: 0.05, b: 0.6, type: 'Metallic' },
        'Trucks Granite Crystal Metallic Clear-Coat': { h: 0.6, s: 0.05, b: 0.35, type: 'Metallic' },
        'Trucks Harvest Sunrise': { h: 0.05, s: 0.8, b: 0.5, type: 'Metallic' },
        'Trucks Walnut Brown Metallic': { h: 0.08, s: 0.6, b: 0.2, type: 'Metallic' }
    },
    'Rivian': {
        'El Cap Granite': { h: 0.6, s: 0.05, b: 0.3, type: 'Metallic' },
        'LA Silver': { h: 0.6, s: 0.02, b: 0.65, type: 'Metallic' },
        'Limestone': { h: 0.4, s: 0.1, b: 0.5, type: 'Gloss' },
        'Midnight': { h: 0.6, s: 0.05, b: 0.1, type: 'Metallic' }
    },
    'Smart-EQ': {
        'Cool Silver (Metallic)': { h: 0.6, s: 0.05, b: 0.7, type: 'Metallic' },
        'Gold Beige (Metallic)': { h: 0.12, s: 0.4, b: 0.6, type: 'Metallic' }
    }
};

let fixedCount = 0;

for (const color of colors) {
    const make = color.make || '';
    if (fixes[make] && fixes[make][color.colorName]) {
        const f = fixes[make][color.colorName];
        color.color1 = { h: f.h, s: f.s, b: f.b };
        
        if (f.type === 'Pearlescent') {
            color.color2 = { h: f.h, s: Math.max(0, f.s - 0.05), b: Math.min(1, f.b + 0.1) };
        } else if (f.type === 'Metallic') {
            color.color2 = { h: f.h, s: f.s, b: Math.max(0, f.b - 0.15) };
        } else {
            color.color2 = { h: f.h, s: f.s, b: f.b };
        }
        
        color.colorType = f.type;
        fixedCount++;
    }
}

fs.writeFileSync(filePath, JSON.stringify(colors, null, 2));

console.log(`Deleted ${deletedCount} garbage entries.`);
console.log(`Successfully fixed ${fixedCount} valid colors!`);
