# FH5 Interactive Map System

## 🗺️ Overview

The Location Finder now uses a **custom Leaflet-based interactive map** instead of third-party embeds. This gives us:

- ✅ Full control over styling and behavior
- ✅ Custom marker icons by location type
- ✅ Real-time filtering and search
- ✅ Persistent progress tracking (visited/favorites)
- ✅ Mobile-optimized touch controls
- ✅ No external dependencies or rate limits

## 📊 Current Data

**Location Count**: 40+ locations (expandable to 536+)

### Categories Implemented:
- **Collectibles**: Barn Finds (14), Treasure Chests (4)
- **Locations**: Festival Sites (6), Player Houses (7), Landmarks (5)
- **PR Stunts**: Danger Signs, Speed Traps, Speed Zones, Drift Zones, Trailblazers
- **Race Events**: Road, Dirt, Cross Country, Street, Drag

## 🔧 How to Add More Locations

### Method 1: Manual Entry (Recommended for accuracy)

Edit `/public/data/fh5-locations-enhanced.json`:

```json
{
  "id": "unique-id-here",
  "name": "Location Name",
  "type": "Barn Find",
  "category": "COLLECTIBLES",
  "coordinates": { "x": 50.5, "y": 37.2 },
  "description": "Detailed description",
  "reward": "Optional reward text"
}
```

**Coordinate System**:
- `x`: 0 (west) to 100 (east)
- `y`: 0 (north) to 100 (south)
- Percentage-based for easy scaling

### Method 2: Extract from IGN/MapGenie

#### From IGN Maps:

1. Open browser DevTools (F12) on https://www.ign.com/maps/forza-horizon-5/mexico
2. Run this in Console:

```javascript
// Extract all visible markers
const markers = [];
document.querySelectorAll('[data-location-id]').forEach(el => {
  const rect = el.getBoundingClientRect();
  const mapRect = document.querySelector('.map-container').getBoundingClientRect();
  
  markers.push({
    id: el.dataset.locationId,
    name: el.getAttribute('title') || el.textContent.trim(),
    type: el.dataset.locationType,
    x: ((rect.left - mapRect.left) / mapRect.width * 100).toFixed(2),
    y: ((rect.top - mapRect.top) / mapRect.height * 100).toFixed(2)
  });
});

console.table(markers);
copy(JSON.stringify(markers, null, 2));
```

#### From MapGenie:

1. Open https://mapgenie.io/forza-horizon-5/maps/mexico
2. Enable all location types you want
3. Run extraction script (see `MapGenieHelper.tsx` for full script)
4. Coordinates will be copied to clipboard

### Method 3: Community Data Sources

**GitHub Repositories**:
- Search: `forza-horizon-5 locations json`
- Look for repos with `fh5-locations.json` or similar
- Many have complete datasets with 500+ locations

**Reddit/Discord**:
- r/ForzaHorizon - Check pinned posts
- FH5 Discord servers often have shared spreadsheets
- Community-maintained Google Sheets with coordinates

**Game Files** (Advanced):
- FH5 game files contain location data
- Tools like ForzaTech can extract coordinates
- Requires game installation and modding knowledge

## 🎨 Customizing Marker Styles

Edit `LeafletMapClient.tsx` → `createCustomIcon()`:

```typescript
const colors: Record<string, string> = {
  'Barn Find': '#ef4444',  // Red
  'XP Board': '#eab308',   // Yellow
  // Add your custom colors here
}
```

## 📍 Location Types Reference

### Collectibles
- `Barn Find` - Hidden cars in barns (14 total)
- `Fast Travel Board` - Unlock fast travel points (50 total)
- `XP Board` - Skill point boards (200 total)
- `Treasure` - Treasure chests with rewards (4 total)

### Locations
- `Festival Site` - Main festival locations (6 total)
- `Player House` - Purchasable houses (7 total)
- `Landmark` - Notable locations (56 total)
- `Expedition` - Expedition start points (5 total)
- `Showcase` - Showcase events (4 total)

### PR Stunts
- `Danger Sign` - Jump ramps (20 total)
- `Speed Trap` - Speed cameras (31 total)
- `Speed Zone` - Timed speed sections (22 total)
- `Drift Zone` - Drift scoring zones (20 total)
- `Trailblazer` - Off-road time trials (13 total)

### Race Events
- `Road Racing Event` - Paved races (25 total)
- `Dirt Racing Event` - Dirt road races (20 total)
- `Cross Country Event` - Off-road races (20 total)
- `Street Racing Event` - Illegal street races (21 total)
- `Drag Racing Event` - Drag strips (3 total)

## 🚀 Performance Tips

**Current Setup**:
- Leaflet handles 500+ markers efficiently
- Custom icons are lightweight SVG/CSS
- Filtering is client-side (instant)
- Map tiles are cached by browser

**If Adding 1000+ Locations**:
- Consider marker clustering (leaflet.markercluster)
- Implement viewport-based rendering
- Add progressive loading for categories

## 🔄 Syncing with Official Sources

To keep data updated:

1. **Weekly**: Check IGN/MapGenie for new locations (DLC updates)
2. **Monthly**: Verify coordinates against community spreadsheets
3. **After DLC**: Run extraction scripts to capture new content

## 📝 Data Validation

Before committing new locations:

```bash
# Validate JSON structure
node -e "console.log(JSON.parse(require('fs').readFileSync('./public/data/fh5-locations-enhanced.json')))"

# Check for duplicates
node scripts/validate-locations.js
```

## 🎯 Roadmap

- [ ] Add remaining 496 locations (XP Boards, Fast Travel Boards, etc.)
- [ ] Implement marker clustering for dense areas
- [ ] Add route planning between locations
- [ ] Export/import custom location sets
- [ ] Community submission system
- [ ] Integration with Forza telemetry API

## 🤝 Contributing

To add locations:

1. Fork the repo
2. Add locations to `fh5-locations-enhanced.json`
3. Test locally: `npm run dev`
4. Submit PR with location count in title
5. Include source/verification method

## 📚 Resources

- [Leaflet Documentation](https://leafletjs.com/)
- [React-Leaflet Guide](https://react-leaflet.js.org/)
- [FH5 Wiki](https://forza.fandom.com/wiki/Forza_Horizon_5)
- [IGN Interactive Map](https://www.ign.com/maps/forza-horizon-5/mexico)
- [MapGenie FH5](https://mapgenie.io/forza-horizon-5/maps/mexico)

---

**Built with** ❤️ **for the Forza community**
