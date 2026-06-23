const fs = require('fs');
const path = require('path');
const stringSimilarity = require('string-similarity');

const CAR_COLORS_PATH = path.join(__dirname, '../public/carColors.json');
const PAINTLIB_DATA_PATH = path.join(__dirname, '../data/paintlib_data.json');
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

function cleanName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
}

function run() {
  console.log("Loading datasets for integration check...");
  const carColors = JSON.parse(fs.readFileSync(CAR_COLORS_PATH, 'utf8'));
  const paintlibColors = JSON.parse(fs.readFileSync(PAINTLIB_DATA_PATH, 'utf8'));

  // Group existing carColors by make for fast lookup
  const existingByMake = {};
  for (const c of carColors) {
    const make = cleanName(c.make);
    if (!existingByMake[make]) existingByMake[make] = [];
    existingByMake[make].push(c);
  }

  const report = {
    totalScraped: paintlibColors.length,
    newColorsCount: 0,
    duplicatesCount: 0,
    newColors: [],
    duplicates: []
  };

  console.log("Cross-referencing colors... This might take a minute.");

  let i = 0;
  for (const newColor of paintlibColors) {
    i++;
    if (i % 2000 === 0) console.log(`Processed ${i} / ${paintlibColors.length} colors...`);

    const make = cleanName(newColor.make);
    const existingPaints = existingByMake[make] || [];

    const targetName = cleanName(newColor.paintName);
    
    let isDuplicate = false;
    let matchedExistingName = null;

    if (existingPaints.length > 0) {
      // Map names
      const existingNames = existingPaints.map(p => cleanName(p.colorName.replace(p.make, '')));
      
      const matchResult = stringSimilarity.findBestMatch(targetName, existingNames);
      
      if (matchResult.bestMatch.rating > 0.75) {
        isDuplicate = true;
        matchedExistingName = existingPaints[matchResult.bestMatchIndex].colorName;
      }
    }

    if (isDuplicate) {
      report.duplicates.push({
        make: newColor.make,
        paintlibName: newColor.paintName,
        matchedForzaName: matchedExistingName,
        hex: newColor.hex
      });
      report.duplicatesCount++;
    } else {
      // It's a new color! Convert hex to Forza HSB format
      const hsb = hexToHsb(newColor.hex);
      report.newColors.push({
        make: newColor.make,
        colorName: `${newColor.make} ${newColor.paintName}`,
        colorType: "Normal", // Default for OEM paints
        model: newColor.paintCode || "", // Store the paint code in the model field or we can just leave it
        year: null,
        color1: hsb, // Base color
        color2: hsb,
        original_hex: newColor.hex
      });
      report.newColorsCount++;
    }
  }

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`\nIntegration Check Complete!`);
  console.log(`New Colors to Add: ${report.newColorsCount}`);
  console.log(`Duplicates Found: ${report.duplicatesCount}`);
  console.log(`Report written to ${REPORT_PATH}`);
}

run();
