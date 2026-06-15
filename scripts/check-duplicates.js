const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/carColors.json');
const colors = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log(`Checking ${colors.length} total colors for duplicates...`);

// Group by a unique key: we'll use lowercase colorName and make
const seen = new Map();
const duplicates = [];

for (const color of colors) {
  // If the colorName already includes the brand like "Mystichrome (Ford)", just use that
  const key = `${color.make?.toLowerCase()}_${color.colorName?.toLowerCase()}`;
  
  if (seen.has(key)) {
    duplicates.push(color);
  } else {
    seen.set(key, color);
  }
}

if (duplicates.length > 0) {
  console.log(`\nFound ${duplicates.length} EXACT duplicates (same Make & Color Name):`);
  const groupedDuplicates = {};
  for(const dup of duplicates) {
      if(!groupedDuplicates[dup.make]) groupedDuplicates[dup.make] = [];
      groupedDuplicates[dup.make].push(dup.colorName);
  }
  for (const [make, names] of Object.entries(groupedDuplicates)) {
      console.log(`- ${make}: ${names.length} duplicates`);
      // print first few examples
      console.log(`   Examples: ${names.slice(0, 3).join(', ')}`);
  }
  
  console.log('\nTo remove these, we can filter out the seen keys and overwrite the JSON.');
} else {
  console.log('\nNo exact duplicates found based on Make and Color Name!');
}

// Let's also check for name collisions across different makes (e.g. same exact colorName)
const nameMap = new Map();
let crossMakeDupes = 0;
for (const color of colors) {
    const name = color.colorName?.toLowerCase();
    if (nameMap.has(name)) {
        const existing = nameMap.get(name);
        if (existing.make !== color.make) {
            crossMakeDupes++;
        }
    } else {
        nameMap.set(name, color);
    }
}
console.log(`\nFound ${crossMakeDupes} colors with the exact same name but under different Makes (these are usually valid, like 'Black' or 'White').`);
