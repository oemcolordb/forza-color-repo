const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/carColors.json');
const colors = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const makeCounts = {};
for (const color of colors) {
    const make = color.make || 'Unknown';
    if (!makeCounts[make]) makeCounts[make] = [];
    makeCounts[make].push(color);
}

const brokenColors = [];

for (const [make, makeColors] of Object.entries(makeCounts)) {
    if (makeColors.length < 20) {
        const bad = makeColors.filter(c => {
            if (!c.color1) return true;
            if (c.color1.h === 0 && c.color1.s === 0 && c.color1.b > 0.28 && c.color1.b < 0.32 && !c.colorName.toLowerCase().includes('black') && !c.colorName.toLowerCase().includes('grey') && !c.colorName.toLowerCase().includes('gray') && !c.colorName.toLowerCase().includes('noir')) {
                return true;
            }
            return false;
        });

        if (bad.length > 0) {
            console.log(`\n${make} (${makeColors.length} total colors) has ${bad.length} broken colors:`);
            for (const c of bad) {
                console.log(`  - ${c.colorName}: ${JSON.stringify(c.color1)}`);
                brokenColors.push(c);
            }
        }
    }
}

console.log(`\nTotal broken colors in <20 color manufacturers: ${brokenColors.length}`);
