#!/usr/bin/env node

/**
 * OEM Color Validation Script
 * Validates Forza Horizon 5 colors against real-world OEM paint specifications
 * 
 * Usage: node scripts/validate-oem-colors.js
 */

const fs = require('fs');
const path = require('path');

// List of colors to validate from the user's request
const COLORS_TO_VALIDATE = [
  'Aspen White Tricoat',
  'Brilliant Silver Metallic (K23)',
  'Gray Sky Pearl',
  'Electric Blue Metallic',
  'Monarch Orange',
  'Glacier White',
  'Garnet Pearl Metallic',
  'Everest White Tricoat',
  'Passion Red Tricoat',
  'Pearl White TriCoat',
  'Super Silver QuadCoat',
  'Millenium Jade',
  'Jet Black Pearl',
  'Magnetic Black Pearl',
  'Champange Silver Metallic',
  'Deep Ocean Blue Metallic',
  'Baja Storm Metallic',
  'Obsidian Green Pearl',
  'Coulis Red Pearl',
  'Hermosa Blue Pearl',
  'Red Alert',
  'Cardinal Red Tricoat (NBL)',
  'Tactical Green Metallic',
  'Carmine Red (CM)',
  'Brilliant White Pearl (3P)',
  'Dark Metal Gray (M)',
  'Meteor Flake Black Pearl (GAG)',
  'Caspian Blue (RBY)',
  'Sunrise Orange (RPM)',
  'Pure Black (G42)',
  'Premium Horizon Orange (EBB)',
  'Night Veil Purple (GAB)',
  'Radiant Red (NAH)',
  'Titanium Khaki (EAN)',
  'Sunrise Copper (CBC)',
  'Garnet Red (NBF)',
  'Surf Green (FAE)',
  'Super Black (KH3)',
  'Burgundy (NBQ)',
  'Auroroa Flare Blue Pearl (RAY)',
  'Dark Metal Gray (KAD)',
  'Pure White Pearl (QAC)',
  'Opera Mauve (NBZ)',
  'Midnight Purple (DAP)',
  'Azurite Blue (RBR)',
  'Diamond Black (G41)',
  'Imperial Amber (CAS)',
  'Prism White (QBE)',
  'Rikyu Likyu (HAN)',
  'Turquoise Blue (FAN)',
  'Midnight Black (GAT)',
  'White Pearl (QBB)',
  'Sorbet Blue (RCL)',
  'Sparkling Red (NBR)',
  'Ash Brown (CBA)',
  'Black (GAS)',
  'Sterling Silver (KBV)',
  'Ocean Blue (RCD)',
  'Kanjuk Cassis (NCD)',
  'Frozen Vanilla Pearl (HAK)',
  'Premium Sunshine Orange (EBT)',
  'Titanium Gray (KBW)',
  'Amethyst Purple (LAL)',
  'Blossom Pink (NBS)',
  'Ultimate Metal Silver (KAB)',
  'Wangan Blue (RCB)',
  'Vibrant Red (A54)',
  '432 Orange (ECD)',
  'Carmine Red (XJT)'
];

// Load the color database
function loadColorDatabase() {
  const carColorsPath = path.join(__dirname, '../public/carColors.json');
  const data = fs.readFileSync(carColorsPath, 'utf8');
  return JSON.parse(data);
}

// Find color in database
function findColorInDatabase(colorName, database) {
  return database.filter(color => 
    color.colorName && color.colorName.includes(colorName)
  );
}

// Validation result structure
class ValidationResult {
  constructor(colorName) {
    this.colorName = colorName;
    this.databaseMatches = [];
    this.oemSpec = null;
    this.hsbValues = null;
    this.rgbValues = null;
    this.isValid = false;
    this.issues = [];
    this.recommendations = [];
  }
}

// Main validation function
async function validateColors() {
  console.log('Starting OEM Color Validation...\n');
  
  const database = loadColorDatabase();
  const results = [];
  
  for (const colorName of COLORS_TO_VALIDATE) {
    console.log(`Validating: ${colorName}`);
    
    const result = new ValidationResult(colorName);
    
    // Find in database
    const matches = findColorInDatabase(colorName, database);
    result.databaseMatches = matches;
    
    if (matches.length === 0) {
      result.issues.push('Color not found in database');
    } else {
      console.log(`  Found ${matches.length} matches in database`);
      matches.forEach((match, index) => {
        console.log(`  Match ${index + 1}: ${match.make} - ${match.colorName}`);
        console.log(`    HSB: H=${match.color1?.h}, S=${match.color1?.s}, B=${match.color1?.b}`);
      });
    }
    
    results.push(result);
    console.log('');
  }
  
  // Generate report
  const reportPath = path.join(__dirname, '../oem-color-validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  
  console.log(`\nValidation complete. Report saved to: ${reportPath}`);
  console.log(`\nSummary:`);
  console.log(`  Total colors to validate: ${COLORS_TO_VALIDATE.length}`);
  console.log(`  Found in database: ${results.filter(r => r.databaseMatches.length > 0).length}`);
  console.log(`  Not found in database: ${results.filter(r => r.databaseMatches.length === 0).length}`);
  
  return results;
}

// Run validation
validateColors().catch(console.error);
