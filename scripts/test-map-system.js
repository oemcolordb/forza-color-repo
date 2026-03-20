#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 FH5 Location Finder - System Test\n');

// Test 1: Check if location data files exist
console.log('📁 Test 1: Checking data files...');
const dataFiles = [
  'public/data/fh5-locations.json',
  'public/data/fh5-locations-enhanced.json',
  'public/data/fh5-locations-mapgenie.json'
];

let dataFileFound = false;
dataFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ Found: ${file}`);
    dataFileFound = true;
    
    // Validate JSON
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`     Locations: ${data.locations?.length || 0}`);
    } catch (err) {
      console.log(`     ❌ Invalid JSON: ${err.message}`);
    }
  } else {
    console.log(`  ⚠️  Missing: ${file}`);
  }
});

if (!dataFileFound) {
  console.log('  ❌ No location data files found!');
  console.log('  📝 Run MapGenie extraction script first.');
  process.exit(1);
}

// Test 2: Check if map image exists
console.log('\n🖼️  Test 2: Checking map image...');
const mapImages = [
  'public/maps/fh5-mexico.jpg',
  'public/maps/fh5-mexico.png',
  'public/maps/fh5-mexico.webp'
];

let mapImageFound = false;
mapImages.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`  ✅ Found: ${file} (${sizeMB} MB)`);
    mapImageFound = true;
  }
});

if (!mapImageFound) {
  console.log('  ⚠️  No map image found!');
  console.log('  📝 Add FH5 Mexico map image to /public/maps/');
  console.log('  💡 You can use a screenshot from MapGenie or IGN');
}

// Test 3: Check if required components exist
console.log('\n🧩 Test 3: Checking components...');
const components = [
  'app/location-finder/page.tsx',
  'app/location-finder/ProfessionalMap.tsx',
  'app/location-finder/LocationCard.tsx',
  'app/location-finder/types.ts',
  'app/components/NFSThemeWrapper.tsx'
];

let allComponentsExist = true;
components.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ Missing: ${file}`);
    allComponentsExist = false;
  }
});

// Test 4: Check if Leaflet is installed
console.log('\n📦 Test 4: Checking dependencies...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = ['leaflet', 'react-leaflet', '@types/leaflet'];
  requiredDeps.forEach(dep => {
    if (deps[dep]) {
      console.log(`  ✅ ${dep}: ${deps[dep]}`);
    } else {
      console.log(`  ❌ Missing: ${dep}`);
      console.log(`     Run: npm install ${dep}`);
    }
  });
}

// Test 5: Check if NFS theme CSS exists
console.log('\n🎨 Test 5: Checking NFS theme...');
const nfsThemePath = path.join(process.cwd(), 'app/nfs-theme.css');
if (fs.existsSync(nfsThemePath)) {
  const content = fs.readFileSync(nfsThemePath, 'utf8');
  const animationCount = (content.match(/@keyframes/g) || []).length;
  console.log(`  ✅ NFS theme CSS found`);
  console.log(`     Animations: ${animationCount}`);
} else {
  console.log(`  ❌ NFS theme CSS missing`);
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Test Summary\n');

if (dataFileFound && allComponentsExist) {
  console.log('✅ All critical components are in place!');
  console.log('\n🚀 Next steps:');
  console.log('   1. Extract MapGenie data (see MAPGENIE_EXTRACTION_GUIDE.md)');
  console.log('   2. Add map image to /public/maps/fh5-mexico.jpg');
  console.log('   3. Run: npm run dev');
  console.log('   4. Visit: http://localhost:3000/location-finder');
  console.log('   5. Test all features (see checklist in guide)');
} else {
  console.log('❌ Some components are missing!');
  console.log('\n📝 Action required:');
  console.log('   - Review the errors above');
  console.log('   - Install missing dependencies');
  console.log('   - Create missing files');
}

console.log('\n' + '='.repeat(50));
