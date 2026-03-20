// MapGenie FH5 Location Extractor
// Instructions:
// 1. Go to https://mapgenie.io/forza-horizon-5/maps/mexico
// 2. Enable ALL location categories in the left sidebar
// 3. Wait for all markers to load
// 4. Open DevTools (F12) → Console tab
// 5. Paste this entire script and press Enter
// 6. Data will be copied to clipboard automatically

(async function extractMapGenieData() {
  console.log('🗺️ MapGenie FH5 Data Extractor v2.0');
  console.log('⏳ Extracting location data...\n');

  const locations = [];
  const categories = new Set();
  const types = new Set();

  // Wait for map to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Get map container for coordinate calculations
  const mapContainer = document.querySelector('.leaflet-container');
  if (!mapContainer) {
    console.error('❌ Map container not found. Make sure you are on the MapGenie map page.');
    return;
  }

  const mapBounds = mapContainer.getBoundingClientRect();
  console.log('📐 Map dimensions:', mapBounds.width, 'x', mapBounds.height);

  // Extract all markers
  const markers = document.querySelectorAll('.leaflet-marker-icon');
  console.log(`📍 Found ${markers.length} markers on map\n`);

  markers.forEach((marker, index) => {
    try {
      const rect = marker.getBoundingClientRect();
      
      // Calculate percentage-based coordinates
      const x = ((rect.left + rect.width / 2 - mapBounds.left) / mapBounds.width) * 100;
      const y = ((rect.top + rect.height / 2 - mapBounds.top) / mapBounds.height) * 100;

      // Only include markers within bounds
      if (x < 0 || x > 100 || y < 0 || y > 100) {
        return;
      }

      // Try to get location info from various sources
      const name = marker.getAttribute('alt') || 
                 marker.getAttribute('title') || 
                 marker.querySelector('img')?.alt ||
                 `Location ${index + 1}`;

      // Get category/type from marker classes or data attributes
      let type = 'Unknown';
      let category = 'OTHER';

      const classList = Array.from(marker.classList);
      const dataType = marker.getAttribute('data-type') || 
                       marker.getAttribute('data-category') ||
                       marker.parentElement?.getAttribute('data-type');

      // Try to determine type from classes
      if (classList.some(c => c.includes('barn'))) {
        type = 'Barn Find';
        category = 'COLLECTIBLES';
      } else if (classList.some(c => c.includes('board') && c.includes('fast'))) {
        type = 'Fast Travel Board';
        category = 'COLLECTIBLES';
      } else if (classList.some(c => c.includes('board') || c.includes('xp'))) {
        type = 'XP Board';
        category = 'COLLECTIBLES';
      } else if (classList.some(c => c.includes('treasure'))) {
        type = 'Treasure';
        category = 'COLLECTIBLES';
      } else if (classList.some(c => c.includes('house'))) {
        type = 'Player House';
        category = 'LOCATIONS';
      } else if (classList.some(c => c.includes('festival'))) {
        type = 'Festival Site';
        category = 'LOCATIONS';
      } else if (classList.some(c => c.includes('danger'))) {
        type = 'Danger Sign';
        category = 'PR STUNTS';
      } else if (classList.some(c => c.includes('speed') && c.includes('trap'))) {
        type = 'Speed Trap';
        category = 'PR STUNTS';
      } else if (classList.some(c => c.includes('speed') && c.includes('zone'))) {
        type = 'Speed Zone';
        category = 'PR STUNTS';
      } else if (classList.some(c => c.includes('drift'))) {
        type = 'Drift Zone';
        category = 'PR STUNTS';
      } else if (classList.some(c => c.includes('trail'))) {
        type = 'Trailblazer';
        category = 'PR STUNTS';
      } else if (classList.some(c => c.includes('road') && c.includes('race'))) {
        type = 'Road Racing Event';
        category = 'RACE EVENTS';
      } else if (classList.some(c => c.includes('dirt'))) {
        type = 'Dirt Racing Event';
        category = 'RACE EVENTS';
      } else if (classList.some(c => c.includes('cross'))) {
        type = 'Cross Country Event';
        category = 'RACE EVENTS';
      } else if (classList.some(c => c.includes('street'))) {
        type = 'Street Racing Event';
        category = 'RACE EVENTS';
      } else if (classList.some(c => c.includes('drag'))) {
        type = 'Drag Racing Event';
        category = 'RACE EVENTS';
      }

      // Generate unique ID
      const id = `${type.toLowerCase().replace(/\s+/g, '-')}-${index}`;

      categories.add(category);
      types.add(type);

      locations.push({
        id,
        name: name.trim(),
        type,
        category,
        coordinates: {
          x: parseFloat(x.toFixed(2)),
          y: parseFloat(y.toFixed(2))
        },
        description: `${type} location`,
        source: 'MapGenie'
      });
    } catch (error) {
      console.warn(`⚠️ Failed to process marker ${index}:`, error.message);
    }
  });

  // Create final JSON structure
  const output = {
    metadata: {
      version: '2.0.0',
      source: 'MapGenie.io extraction',
      extractedAt: new Date().toISOString(),
      totalLocations: locations.length,
      categories: Array.from(categories).sort(),
      types: Array.from(types).sort()
    },
    locations: locations.sort((a, b) => a.type.localeCompare(b.type))
  };

  // Statistics
  console.log('✅ Extraction complete!\n');
  console.log('📊 Statistics:');
  console.log(`   Total locations: ${locations.length}`);
  console.log(`   Categories: ${categories.size}`);
  console.log(`   Types: ${types.size}\n`);

  // Count by type
  const typeCounts = {};
  locations.forEach(loc => {
    typeCounts[loc.type] = (typeCounts[loc.type] || 0) + 1;
  });

  console.log('📍 Breakdown by type:');
  Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

  // Copy to clipboard
  const jsonString = JSON.stringify(output, null, 2);
  
  try {
    await navigator.clipboard.writeText(jsonString);
    console.log('\n✅ Data copied to clipboard!');
    console.log('📋 Paste into: /public/data/fh5-locations-mapgenie.json');
  } catch (err) {
    console.error('❌ Failed to copy to clipboard:', err);
    console.log('\n📄 Copy this manually:');
    console.log(jsonString);
  }

  // Also log for manual copy
  console.log('\n🔍 Preview (first 3 locations):');
  console.table(locations.slice(0, 3));

  return output;
})();
