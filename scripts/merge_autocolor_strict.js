#!/usr/bin/env node
/**
 * Merge extracted colors from extracted_colors.json into carColors.json
 * Validates HSV values are in 0-1 range and removes duplicates
 * 
 * Usage: node scripts/merge_autocolor_strict.js
 */

const fs = require('fs');
const path = require('path');

const CAR_COLORS_PATH = path.join(__dirname, '..', 'public', 'carColors.json');
const EXTRACTED_PATH = path.join(__dirname, '..', 'extracted_colors.json');

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return null;
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`❌ Error parsing ${filePath}: ${err.message}`);
    return null;
  }
}

function validateHsv(hsv) {
  if (!hsv || typeof hsv !== 'object') return false;
  const { h, s, b } = hsv;
  return (
    typeof h === 'number' && h >= 0 && h <= 1 &&
    typeof s === 'number' && s >= 0 && s <= 1 &&
    typeof b === 'number' && b >= 0 && b <= 1
  );
}

function normalizeColor(color) {
  // Ensure required fields exist
  return {
    make: color.make || 'Unknown',
    model: color.model || '',
    year: color.year || null,
    colorName: color.colorName || 'Unnamed Color',
    colorType: color.colorType || 'Normal',
    color1: color.color1 || { h: 0, s: 0, b: 0 },
    color2: color.color2 || color.color1 || { h: 0, s: 0, b: 0 }
  };
}

function main() {
  console.log('🎨 Merging extracted colors into carColors.json...\n');

  // Load existing colors
  const existingColors = loadJson(CAR_COLORS_PATH);
  if (!existingColors) {
    console.error('Failed to load existing carColors.json');
    process.exit(1);
  }
  console.log(`📊 Existing colors: ${existingColors.length}`);

  // Load extracted colors
  const extractedColors = loadJson(EXTRACTED_PATH);
  if (!extractedColors) {
    console.error('Failed to load extracted_colors.json');
    console.log('Run: python scripts/extract_colors_pdfplumber.py first');
    process.exit(1);
  }
  console.log(`📥 Extracted colors: ${extractedColors.length}`);

  // Validate and filter extracted colors
  const validColors = [];
  const invalidColors = [];

  for (const color of extractedColors) {
    const normalized = normalizeColor(color);
    
    if (validateHsv(normalized.color1) && validateHsv(normalized.color2)) {
      validColors.push(normalized);
    } else {
      invalidColors.push({
        name: normalized.colorName,
        color1: normalized.color1,
        color2: normalized.color2
      });
    }
  }

  console.log(`✅ Valid colors: ${validColors.length}`);
  if (invalidColors.length > 0) {
    console.log(`❌ Invalid colors (skipped): ${invalidColors.length}`);
    invalidColors.slice(0, 5).forEach(c => {
      console.log(`   - ${c.name}: c1=${JSON.stringify(c.color1)}, c2=${JSON.stringify(c.color2)}`);
    });
  }

  // Create a Set of existing color keys for deduplication
  const existingKeys = new Set(
    existingColors.map(c => `${c.make}|${c.model}|${c.colorName}`.toLowerCase())
  );

  // Add only new unique colors
  let addedCount = 0;
  let duplicateCount = 0;

  for (const color of validColors) {
    const key = `${color.make}|${color.model}|${color.colorName}`.toLowerCase();
    
    if (existingKeys.has(key)) {
      duplicateCount++;
    } else {
      existingColors.push(color);
      existingKeys.add(key);
      addedCount++;
    }
  }

  console.log(`\n📈 Results:`);
  console.log(`   - New colors added: ${addedCount}`);
  console.log(`   - Duplicates skipped: ${duplicateCount}`);
  console.log(`   - Total colors now: ${existingColors.length}`);

  // Save updated colors
  fs.writeFileSync(CAR_COLORS_PATH, JSON.stringify(existingColors, null, 2), 'utf8');
  console.log(`\n💾 Saved to: ${CAR_COLORS_PATH}`);

  // Summary by type
  const typeCounts = {};
  for (const color of existingColors) {
    const type = color.colorType || 'Normal';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  }

  console.log(`\n📊 Colors by type:`);
  Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}`);
    });

  console.log('\n✨ Merge complete!');
}

main();
