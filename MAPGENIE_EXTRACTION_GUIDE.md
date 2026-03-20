# 🗺️ MapGenie Data Extraction & Testing Guide

## Step 1: Extract MapGenie Data

### Instructions:

1. **Open MapGenie**
   - Go to: https://mapgenie.io/forza-horizon-5/maps/mexico
   - Wait for the page to fully load

2. **Enable All Location Types**
   - Click the filter icon in the left sidebar
   - Check ALL location categories:
     - ✅ Barn Finds
     - ✅ Fast Travel Boards
     - ✅ XP Boards
     - ✅ Treasure Chests
     - ✅ Player Houses
     - ✅ Festival Sites
     - ✅ Danger Signs
     - ✅ Speed Traps
     - ✅ Speed Zones
     - ✅ Drift Zones
     - ✅ Trailblazers
     - ✅ All Race Events
     - ✅ Landmarks
     - ✅ Expeditions
     - ✅ Showcases
   - Wait for all markers to appear on the map

3. **Open Browser DevTools**
   - Press `F12` (or `Ctrl+Shift+I` on Windows, `Cmd+Option+I` on Mac)
   - Click the **Console** tab

4. **Run the Extraction Script**
   - Open: `scripts/extract-mapgenie.js`
   - Copy the ENTIRE script
   - Paste into the Console
   - Press `Enter`

5. **Save the Data**
   - The script will automatically copy data to your clipboard
   - Create a new file: `/public/data/fh5-locations-mapgenie.json`
   - Paste the clipboard content
   - Save the file

### Expected Output:

```
🗺️ MapGenie FH5 Data Extractor v2.0
⏳ Extracting location data...

📐 Map dimensions: 1920 x 1080
📍 Found 536 markers on map

✅ Extraction complete!

📊 Statistics:
   Total locations: 536
   Categories: 4
   Types: 24

📍 Breakdown by type:
   XP Board: 200
   Fast Travel Board: 50
   Landmark: 56
   Speed Trap: 31
   ...

✅ Data copied to clipboard!
📋 Paste into: /public/data/fh5-locations-mapgenie.json
```

## Step 2: Test the New Map

### Start Development Server:

```bash
npm run dev
```

### Navigate to Location Finder:

```
http://localhost:3000/location-finder
```

### Test Checklist:

#### ✅ Map Functionality
- [ ] Map loads without errors
- [ ] All markers are visible
- [ ] Clicking markers opens popups
- [ ] Popup shows correct location info
- [ ] Zoom in/out works smoothly
- [ ] Pan/drag works smoothly
- [ ] Map bounds prevent scrolling off-map

#### ✅ Sidebar Functionality
- [ ] Search filters locations correctly
- [ ] Type dropdown filters correctly
- [ ] Location cards display properly
- [ ] Clicking card selects location on map
- [ ] Selected location highlights in sidebar
- [ ] Favorite button works
- [ ] Visited status persists

#### ✅ Mobile Responsiveness
- [ ] Sidebar slides in/out on mobile
- [ ] Touch gestures work (pinch zoom, drag)
- [ ] Markers are tappable
- [ ] Popups display correctly
- [ ] No horizontal scroll
- [ ] Controls are accessible

#### ✅ NFS Theme
- [ ] Theme toggle button works
- [ ] NFS effects apply correctly
- [ ] Neon glow animations work
- [ ] Carbon fiber background visible
- [ ] Gauge cluster displays
- [ ] Heat level updates with progress
- [ ] Theme persists on refresh

#### ✅ Performance
- [ ] Initial load < 3 seconds
- [ ] Smooth 60fps animations
- [ ] No lag when filtering
- [ ] No lag when selecting locations
- [ ] Memory usage stable

## Step 3: Verify Data Accuracy

### Compare with MapGenie:

1. **Pick 5 Random Locations**
   - Open MapGenie in one tab
   - Open your map in another tab
   - Compare marker positions

2. **Check Coordinates**
   - Barn Find #1 should be near Guanajuato
   - Festival Site should be in center
   - Tulum should be on east coast
   - Dunas Blancas should be northwest

3. **Verify Counts**
   ```bash
   node scripts/validate-locations.js
   ```
   
   Expected output:
   ```
   ✅ No duplicate IDs
   ✅ All coordinates valid (0-100 range)
   ✅ All required fields present
   
   📊 Summary:
   Total locations: 536
   
   📍 Locations by type:
     XP Board: 200
     Landmark: 56
     Fast Travel Board: 50
     ...
   ```

## Step 4: Troubleshooting

### Issue: Map doesn't load

**Solution:**
- Check browser console for errors
- Verify `/maps/fh5-mexico.jpg` exists
- Try clearing browser cache
- Restart dev server

### Issue: Markers in wrong positions

**Solution:**
- Re-run extraction script
- Ensure MapGenie was at 100% zoom
- Check coordinate conversion in `ProfessionalMap.tsx`
- Verify bounds: `[0, 0]` to `[2048, 2048]`

### Issue: Missing locations

**Solution:**
- Ensure ALL filters were enabled in MapGenie
- Check extraction script console output
- Verify JSON file is valid
- Look for extraction errors in console

### Issue: NFS theme not working

**Solution:**
- Check `nfs-theme.css` is imported in `globals.css`
- Verify CSS animations are enabled
- Check browser supports CSS animations
- Try disabling browser extensions

### Issue: Performance problems

**Solution:**
- Reduce marker count for testing
- Enable marker clustering (see below)
- Check for memory leaks in DevTools
- Optimize image size

## Step 5: Optional Enhancements

### Add Marker Clustering (for 500+ markers):

```bash
npm install leaflet.markercluster @types/leaflet.markercluster
```

Update `ProfessionalMap.tsx`:
```typescript
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'

// In useEffect:
const markerCluster = L.markerClusterGroup({
  maxClusterRadius: 50,
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
})

// Add markers to cluster instead of map
markerCluster.addLayer(marker)
map.addLayer(markerCluster)
```

### Add Route Planning:

```typescript
// Install routing plugin
npm install leaflet-routing-machine

// Add to map
L.Routing.control({
  waypoints: [
    L.latLng(start.lat, start.lng),
    L.latLng(end.lat, end.lng)
  ]
}).addTo(map)
```

## Step 6: Deployment

### Before Deploying:

1. **Validate Data**
   ```bash
   node scripts/validate-locations.js
   ```

2. **Build Test**
   ```bash
   npm run build
   ```

3. **Check Bundle Size**
   ```bash
   npm run build -- --analyze
   ```

4. **Test Production Build**
   ```bash
   npm run start
   ```

### Deploy to Netlify:

```bash
git add .
git commit -m "feat: professional Leaflet map with MapGenie data"
git push origin main
```

## Success Criteria

✅ **All 536 locations** from MapGenie are displayed  
✅ **Marker positions** match MapGenie exactly  
✅ **Filtering** works for all location types  
✅ **Search** finds locations by name  
✅ **NFS theme** toggles smoothly  
✅ **Mobile** experience is smooth  
✅ **Performance** is 60fps on desktop  
✅ **Data persists** (visited/favorites)  

## Next Steps

1. Add remaining location types (if any missing)
2. Implement marker clustering for better performance
3. Add route planning between locations
4. Create location collection/checklist feature
5. Add export/import for custom location sets
6. Integrate with Forza telemetry API

---

**Need Help?**
- Check browser console for errors
- Review `MAP_SYSTEM.md` for architecture details
- Open GitHub issue with screenshots
- Join Discord for community support
