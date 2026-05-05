/**
 * Analyze and fix carColors.json for duplicates and missing values
 */

const fs = require('fs');
const path = require('path');

const COLORS_FILE = path.join(__dirname, '..', 'public', 'carColors.json');

// Read colors file
console.log('Reading carColors.json...');
const rawData = fs.readFileSync(COLORS_FILE, 'utf-8');
const colors = JSON.parse(rawData);

console.log(`Total colors: ${colors.length}`);

// Track issues
const issues = {
  duplicates: [],
  missingMake: [],
  missingColorName: [],
  missingColorType: [],
  missingColor1: [],
  missingColor2: [],
  invalidHSB: []
};

// Check for duplicates
const seen = new Map();
const duplicates = new Set();

colors.forEach((color, index) => {
  const key = `${color.make}|${color.model}|${color.year}|${color.colorName}|${color.colorType}`;
  if (seen.has(key)) {
    duplicates.add(index);
    duplicates.add(seen.get(key));
    issues.duplicates.push({
      index,
      key,
      originalIndex: seen.get(key),
      color
    });
  } else {
    seen.set(key, index);
  }
});

// Check for missing values
colors.forEach((color, index) => {
  // Missing make
  if (!color.make || color.make.trim() === '') {
    issues.missingMake.push({ index, color });
  }
  
  // Missing colorName
  if (!color.colorName || color.colorName.trim() === '') {
    issues.missingColorName.push({ index, color });
  }
  
  // Missing colorType
  if (!color.colorType || color.colorType.trim() === '') {
    issues.missingColorType.push({ index, color });
  }
  
  // Missing color1 (HSB data)
  if (!color.color1 || typeof color.color1 !== 'object') {
    issues.missingColor1.push({ index, color });
  } else {
    // Check for invalid HSB values
    const { h, s, b } = color.color1;
    if (typeof h !== 'number' || h < 0 || h > 1 ||
        typeof s !== 'number' || s < 0 || s > 1 ||
        typeof b !== 'number' || b < 0 || b > 1) {
      issues.invalidHSB.push({ 
        index, 
        color, 
        issue: 'color1 has invalid HSB values',
        values: { h, s, b }
      });
    }
  }
  
  // Missing color2 (optional but check anyway)
  if (!color.color2 || typeof color.color2 !== 'object') {
    issues.missingColor2.push({ index, color });
  } else {
    // Check for invalid HSB values in color2
    const { h, s, b } = color.color2;
    if (typeof h !== 'number' || h < 0 || h > 1 ||
        typeof s !== 'number' || s < 0 || s > 1 ||
        typeof b !== 'number' || b < 0 || b > 1) {
      issues.invalidHSB.push({ 
        index, 
        color, 
        issue: 'color2 has invalid HSB values',
        values: { h, s, b }
      });
    }
  }
});

// Print report
console.log('\n=== ANALYSIS REPORT ===\n');
console.log(`Duplicates found: ${issues.duplicates.length}`);
console.log(`Missing make: ${issues.missingMake.length}`);
console.log(`Missing colorName: ${issues.missingColorName.length}`);
console.log(`Missing colorType: ${issues.missingColorType.length}`);
console.log(`Missing color1 (HSB): ${issues.missingColor1.length}`);
console.log(`Missing color2 (HSB): ${issues.missingColor2.length}`);
console.log(`Invalid HSB values: ${issues.invalidHSB.length}`);

// Fix issues
console.log('\n=== FIXING ISSUES ===\n');

// Remove duplicates (keep first occurrence)
const uniqueColors = [];
const seenKeys = new Set();
let removedCount = 0;

colors.forEach((color) => {
  const key = `${color.make}|${color.model}|${color.year}|${color.colorName}|${color.colorType}`;
  if (!seenKeys.has(key)) {
    seenKeys.add(key);
    uniqueColors.push(color);
  } else {
    removedCount++;
  }
});

console.log(`Removed ${removedCount} duplicates`);

// Fix missing colorType (set to 'Normal' if missing)
let fixedColorType = 0;
uniqueColors.forEach((color) => {
  if (!color.colorType || color.colorType.trim() === '') {
    color.colorType = 'Normal';
    fixedColorType++;
  }
});
console.log(`Fixed ${fixedColorType} missing colorType values`);

// Generate HSB from color name for missing color1
function generateHSBFromColorName(colorName) {
  // Simple hash-based HSB generation
  let hash = 0;
  for (let i = 0; i < colorName.length; i++) {
    hash = colorName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const h = Math.abs((hash % 360) / 360);
  const s = 0.5 + (Math.abs((hash >> 8) % 50) / 100);
  const b = 0.4 + (Math.abs((hash >> 16) % 40) / 100);
  
  return { h, s, b };
}

// Fix missing color1
let fixedColor1 = 0;
uniqueColors.forEach((color) => {
  if (!color.color1 || typeof color.color1 !== 'object') {
    color.color1 = generateHSBFromColorName(color.colorName || 'Unknown');
    fixedColor1++;
  }
});
console.log(`Fixed ${fixedColor1} missing color1 values`);

// Fix missing color2 (copy from color1)
let fixedColor2 = 0;
uniqueColors.forEach((color) => {
  if (!color.color2 || typeof color.color2 !== 'object') {
    color.color2 = { ...color.color1 };
    fixedColor2++;
  }
});
console.log(`Fixed ${fixedColor2} missing color2 values`);

// Fix invalid HSB values
let fixedInvalidHSB = 0;
uniqueColors.forEach((color) => {
  ['color1', 'color2'].forEach((key) => {
    const c = color[key];
    if (c && typeof c === 'object') {
      let fixed = false;
      if (typeof c.h !== 'number' || c.h < 0 || c.h > 1) {
        c.h = 0.5;
        fixed = true;
      }
      if (typeof c.s !== 'number' || c.s < 0 || c.s > 1) {
        c.s = 0.5;
        fixed = true;
      }
      if (typeof c.b !== 'number' || c.b < 0 || c.b > 1) {
        c.b = 0.5;
        fixed = true;
      }
      if (fixed) fixedInvalidHSB++;
    }
  });
});
console.log(`Fixed ${fixedInvalidHSB} invalid HSB values`);

// Save fixed file
console.log(`\nSaving ${uniqueColors.length} unique colors...`);
fs.writeFileSync(COLORS_FILE, JSON.stringify(uniqueColors, null, 2));
console.log('Done!');

// Summary
console.log('\n=== SUMMARY ===');
console.log(`Original: ${colors.length} colors`);
console.log(`After fixes: ${uniqueColors.length} colors`);
console.log(`Removed: ${colors.length - uniqueColors.length} duplicates`);
