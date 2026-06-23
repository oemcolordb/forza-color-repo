const fs = require('fs');
const path = require('path');

const CAR_COLORS_PATH = path.join(__dirname, '../public/carColors.json');
const REPORT_PATH = path.join(__dirname, '../data/paintlib_merge_report.json');

function hexToHsb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  if (diff !== 0) {
    if (max === r) h = (g - b) / diff + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / diff + 2;
    else h = (r - g) / diff + 4;
    h /= 6;
  }
  
  const s = max === 0 ? 0 : diff / max;
  return { h, s, b: max };
}

function colorDistance(c1, c2) {
  let hDiff = Math.abs(c1.h - c2.h);
  if (hDiff > 0.5) hDiff = 1 - hDiff;
  
  const satFactor = (c1.s + c2.s) / 2;
  const brightFactor = (c1.b + c2.b) / 2;
  
  const hDist = hDiff * 2 * satFactor * brightFactor; 
  const sDist = Math.abs(c1.s - c2.s);
  const bDist = Math.abs(c1.b - c2.b);
  
  return Math.sqrt(hDist * hDist + sDist * sDist + bDist * bDist);
}

function run() {
  console.log("Loading datasets...");
  const carColors = JSON.parse(fs.readFileSync(CAR_COLORS_PATH, 'utf8'));
  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));

  let initialCount = carColors.length;
  let updatedCount = 0;

  // 1. Add entirely new colors
  console.log(`Adding ${report.newColors.length} brand new paints...`);
  for (const newColor of report.newColors) {
    carColors.push(newColor);
  }

  // 2. Evaluate duplicates for accuracy updates
  console.log(`Evaluating ${report.duplicates.length} duplicates for improved accuracy...`);
  
  for (const dup of report.duplicates) {
    // Find the exact object in carColors
    const target = carColors.find(c => c.make === dup.make && c.colorName === dup.matchedForzaName);
    if (!target) continue;

    const newHsb = hexToHsb(dup.hex);
    
    // Check distance between existing HSB and new HSB
    // If distance > 0.10, we consider the new Paintlib value to be significantly more accurate
    const dist = colorDistance(target.color1, newHsb);
    
    if (dist > 0.10) {
      target.color1 = newHsb;
      target.color2 = newHsb; // Assuming solid for updates, or at least resetting flake to base
      target.original_hex = dup.hex; // Store so we know it's validated
      updatedCount++;
    }
  }

  // Save the database
  fs.writeFileSync(CAR_COLORS_PATH, JSON.stringify(carColors, null, 2));

  console.log(`\nINTEGRATION COMPLETE!`);
  console.log(`Previous Database Size: ${initialCount}`);
  console.log(`New Database Size:      ${carColors.length}`);
  console.log(`Duplicates Overwritten: ${updatedCount} (values replaced with highly accurate Paintlib HSB)`);
}

run();
