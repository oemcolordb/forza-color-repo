const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/carColors.json');
const colors = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const citroenColors = colors.filter(c => c.make?.toLowerCase() === 'citroen' || c.make?.toLowerCase() === 'citroën');

console.log(`Found ${citroenColors.length} Citroen colors.`);

const names = [
    'Blanc Banquise',
    'Blanc Nacre',
    'Bleu Eclipse',
    'Bleu Iceland',
    'Gris Acier',
    'Gris Amazonite',
    'Gris Platinium',
    'Kaki Grey',
    'Noir Perla Nera',
    'Rouge Elixir',
    'Rouge Pepper',
    'Sable',
    'Spring Blue',
    'Voltaic Blue'
];

for (const name of names) {
    const found = citroenColors.find(c => c.colorName === name);
    if (found) {
        console.log(`- ${name}: ${JSON.stringify(found.color1)}`);
    } else {
        console.log(`- ${name}: NOT FOUND`);
    }
}
