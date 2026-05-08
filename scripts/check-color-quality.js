#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const carColorsPath = path.join(__dirname, '../public/carColors.json');
const data = JSON.parse(fs.readFileSync(carColorsPath, 'utf8'));

// Check for missing HSB data
const missingHSB = data.filter(c => 
  !c.color1 || 
  c.color1.h === undefined || 
  c.color1.s === undefined || 
  c.color1.b === undefined
);

// Check for duplicates by make + colorName + colorType
const colorMap = new Map();
let duplicates = 0;
const duplicateExamples = [];

data.forEach((c, index) => {
  const key = `${c.make}-${c.colorName}-${c.colorType}`;
  if (colorMap.has(key)) {
    duplicates++;
    if (duplicateExamples.length < 10) {
      duplicateExamples.push({
        key,
        indices: [colorMap.get(key), index],
        entries: [data[colorMap.get(key)], c]
      });
    }
  } else {
    colorMap.set(key, index);
  }
});

// Check for colors with same name but different makes
const nameMap = new Map();
let sameNameDiffMake = 0;
data.forEach(c => {
  const nameKey = c.colorName.toLowerCase().trim();
  if (nameMap.has(nameKey)) {
    const existing = nameMap.get(nameKey);
    if (existing.make !== c.make) {
      sameNameDiffMake++;
    }
  } else {
    nameMap.set(nameKey, { make: c.make, colorName: c.colorName });
  }
});

console.log('=== Color Database Quality Report ===\n');
console.log(`Total colors: ${data.length}`);
console.log(`Colors missing HSB data: ${missingHSB.length}`);
console.log(`Duplicate colors (same make+name+type): ${duplicates}`);
console.log(`Unique color combinations: ${colorMap.size}`);
console.log(`Same color name, different make: ${sameNameDiffMake}`);

if (duplicateExamples.length > 0) {
  console.log('\n=== Duplicate Examples ===');
  duplicateExamples.forEach((ex, i) => {
    console.log(`\n${i + 1}. ${ex.key}`);
    console.log(`   Indices: ${ex.indices.join(', ')}`);
  });
}

if (missingHSB.length > 0) {
  console.log('\n=== Colors Missing HSB Data ===');
  missingHSB.slice(0, 10).forEach((c, i) => {
    console.log(`${i + 1}. ${c.make} - ${c.colorName}`);
  });
  if (missingHSB.length > 10) {
    console.log(`... and ${missingHSB.length - 10} more`);
  }
}
