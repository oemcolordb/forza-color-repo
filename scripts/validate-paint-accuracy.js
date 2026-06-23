const fs = require('fs');
const path = require('path');
const stringSimilarity = require('string-similarity');

const CAR_COLORS_PATH = path.join(__dirname, '../public/carColors.json');
const PAINTLIB_DATA_PATH = path.join(__dirname, '../data/paintlib_data.json');
const REPORT_PATH = path.join(__dirname, '../inaccurate_colors_report.json');

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

function cleanName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
}

function run() {
  console.log("Loading datasets...");
  const colors = JSON.parse(fs.readFileSync(CAR_COLORS_PATH, 'utf8'));
  let paintlibColors = [];
  try {
    paintlibColors = JSON.parse(fs.readFileSync(PAINTLIB_DATA_PATH, 'utf8'));
  } catch (e) {
    console.error("paintlib_data.json not found! Ensure the scraper has run first.");
    process.exit(1);
  }

  const oemColors = colors.filter(c => c.colorType === 'Normal' && c.make !== '3M' && c.make !== 'Custom');
  console.log(`Loaded ${oemColors.length} OEM colors from Forza database.`);
  console.log(`Loaded ${paintlibColors.length} real-world paints from paintlib.`);

  // Group paintlib colors by make for faster lookups
  const paintlibByMake = {};
  for (const pc of paintlibColors) {
    const make = cleanName(pc.make);
    if (!paintlibByMake[make]) paintlibByMake[make] = [];
    paintlibByMake[make].push(pc);
  }

  let results = [];
  let matchCount = 0;

  for (const originalColor of oemColors) {
    const make = cleanName(originalColor.make);
    const availablePaints = paintlibByMake[make] || [];
    
    if (availablePaints.length === 0) continue; // No data for this brand

    // Extract just the names for string-similarity
    const targetName = cleanName(originalColor.colorName.replace(originalColor.make, ''));
    const paintlibNames = availablePaints.map(p => cleanName(p.paintName));

    if (paintlibNames.length === 0) continue;

    const matchResult = stringSimilarity.findBestMatch(targetName, paintlibNames);
    const bestMatch = matchResult.bestMatch;

    if (bestMatch.rating > 0.75) {
      matchCount++;
      const matchedPaint = availablePaints[matchResult.bestMatchIndex];
      const aiHex = matchedPaint.hex;
      const aiHsb = hexToHsb(aiHex);
      
      const dist = colorDistance(originalColor.color1, aiHsb);
      
      if (dist > 0.15) {
        results.push({
          make: originalColor.make,
          colorName: originalColor.colorName,
          matchedPaintlibName: matchedPaint.paintName,
          paintlibCode: matchedPaint.paintCode,
          currentHsb: originalColor.color1,
          trueHex: aiHex,
          trueHsb: aiHsb,
          varianceScore: dist.toFixed(3)
        });
      }
    }
  }

  // Sort by variance
  results.sort((a, b) => parseFloat(b.varianceScore) - parseFloat(a.varianceScore));

  fs.writeFileSync(REPORT_PATH, JSON.stringify(results, null, 2));
  console.log(`Finished validation! Matched ${matchCount} colors.`);
  console.log(`Found ${results.length} highly inaccurate colors.`);
  console.log(`Final report written to ${REPORT_PATH}`);
}

run();
