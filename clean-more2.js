const fs = require('fs');
const path = require('path');

const extraJunk = [
  'COLOR', '\uFEFFCOLOR', 'Denoted', 'Discontinued', 'Light', 'New', 'Classic', 'Art'
];

function cleanFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  let removedCount = 0;

  const filteredData = data.filter(entry => {
    const make = String(entry.make || entry.manufacturer || '').trim();
    if (extraJunk.includes(make)) {
      removedCount++;
      return false;
    }
    return true;
  });

  console.log(`Removed ${removedCount} extra junk entries from ${filePath}`);
  fs.writeFileSync(filePath, JSON.stringify(filteredData, null, 2));
}

cleanFile(path.join(__dirname, 'public', 'carColors.json'));
cleanFile(path.join(__dirname, 'public', 'carColors_fixed.json'));
