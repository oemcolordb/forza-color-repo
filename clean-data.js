const fs = require('fs');
const path = require('path');

const junkMakes = [
  'my own custom paints',
  'my own cutom paints',
  'Expensive',
  'Person'
];

function cleanFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  console.log(`Cleaning ${filePath}...`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  let removedCount = 0;
  const filteredData = data.filter(entry => {
    const make = String(entry.make || entry.manufacturer || '').trim();
    if (junkMakes.includes(make)) {
      removedCount++;
      return false;
    }
    return true;
  });

  // Also clean 'Unknown' color types by replacing them or removing them?
  // User pointed to "Unknown" paint type. Let's see if we should remove the whole entry or just change color type. 
  // It's probably better to just change the colorType to 'Normal' if it's 'Unknown' and we want to keep the color, OR maybe remove entries where make=Unknown or colorType=Unknown?
  // Let's first just check what's there.

  console.log(`Removed ${removedCount} entries with junk makes from ${filePath}`);
  
  fs.writeFileSync(filePath, JSON.stringify(filteredData, null, 2));
}

cleanFile(path.join(__dirname, 'public', 'carColors.json'));
cleanFile(path.join(__dirname, 'extracted_colors.json'));

