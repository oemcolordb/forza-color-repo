const fs = require('fs');
const path = require('path');

const junkMakesExact = [
  'Expensive',
  'Person'
];

function cleanFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  console.log(`Cleaning ${filePath}...`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  let removedCount = 0;
  let fixedPaintCount = 0;

  const filteredData = data.filter(entry => {
    const make = String(entry.make || entry.manufacturer || '').trim();
    
    // Check if make starts with "Person" or "Expensive"
    if (make.startsWith('Person Working') || junkMakesExact.includes(make) || make === 'Expensive') {
      removedCount++;
      return false;
    }
    
    // Fix Unknown paint type
    const pType = entry.colorType || entry.paintType || entry.paint_type;
    if (pType === 'Unknown') {
      entry.colorType = 'Normal';
      entry.paintType = 'Normal';
      entry.paint_type = 'Normal';
      fixedPaintCount++;
    }

    // Fix None paint type
    if (pType === 'None' || pType === 'undefined' || pType === '') {
      entry.colorType = 'Normal';
      entry.paintType = 'Normal';
      entry.paint_type = 'Normal';
      fixedPaintCount++;
    }

    return true;
  });

  console.log(`Removed ${removedCount} entries with junk makes from ${filePath}`);
  console.log(`Fixed ${fixedPaintCount} unknown paint types in ${filePath}`);
  
  fs.writeFileSync(filePath, JSON.stringify(filteredData, null, 2));
}

cleanFile(path.join(__dirname, 'public', 'carColors.json'));
cleanFile(path.join(__dirname, 'public', 'carColors_fixed.json'));
cleanFile(path.join(__dirname, 'extracted_colors.json'));
