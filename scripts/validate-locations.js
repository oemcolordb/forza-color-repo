const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../public/data/fh5-locations-enhanced.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('🔍 Validating FH5 Location Data...\n');

// Check for duplicates
const ids = new Set();
const duplicates = [];
data.locations.forEach(loc => {
  if (ids.has(loc.id)) {
    duplicates.push(loc.id);
  }
  ids.add(loc.id);
});

if (duplicates.length > 0) {
  console.error('❌ Duplicate IDs found:', duplicates);
} else {
  console.log('✅ No duplicate IDs');
}

// Validate coordinates
const invalidCoords = data.locations.filter(loc => {
  const { x, y } = loc.coordinates;
  return x < 0 || x > 100 || y < 0 || y > 100;
});

if (invalidCoords.length > 0) {
  console.error('❌ Invalid coordinates:', invalidCoords.map(l => l.id));
} else {
  console.log('✅ All coordinates valid (0-100 range)');
}

// Check required fields
const missingFields = data.locations.filter(loc => {
  return !loc.id || !loc.name || !loc.type || !loc.category || !loc.coordinates;
});

if (missingFields.length > 0) {
  console.error('❌ Missing required fields:', missingFields.map(l => l.id || 'unknown'));
} else {
  console.log('✅ All required fields present');
}

// Summary
console.log('\n📊 Summary:');
console.log(`Total locations: ${data.locations.length}`);
console.log(`Metadata version: ${data.metadata.version}`);
console.log(`Last updated: ${data.metadata.lastUpdated}`);

// Count by type
const typeCount = {};
data.locations.forEach(loc => {
  typeCount[loc.type] = (typeCount[loc.type] || 0) + 1;
});

console.log('\n📍 Locations by type:');
Object.entries(typeCount)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });

console.log('\n✨ Validation complete!');
