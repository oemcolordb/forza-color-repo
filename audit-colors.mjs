import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'carColors.json');
const raw = fs.readFileSync(dataPath, 'utf8');
const colors = JSON.parse(raw);

console.log('Total colors:', colors.length);

const badColors = colors.filter(c => {
  return (
    !c.make || 
    !c.model ||
    c.make.length < 2 || 
    c.make.toLowerCase() === 'ai' ||
    c.model.length < 2 ||
    c.colorName.toLowerCase().includes('null') ||
    c.colorName.toLowerCase().includes('undefined') ||
    c.colorType.toLowerCase().includes('undefined')
  );
});

console.log(`Found ${badColors.length} potentially bad colors:`);
for (const [i, c] of badColors.entries()) {
  console.log(`\n--- Bad Entry ${i + 1} ---`);
  console.log(`ID: ${c.id}`);
  console.log(`Make: "${c.make}"`);
  console.log(`Model: "${c.model}"`);
  console.log(`Color Name: "${c.colorName}"`);
}
