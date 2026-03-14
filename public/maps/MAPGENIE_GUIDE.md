# Using MapGenie as Reference for Calibration

MapGenie (https://mapgenie.io/forza-horizon-5/maps/mexico) is an excellent reference source for Forza Horizon 5 locations.

## Quick Calibration Method

### Step 1: Capture a Reference Screenshot

1. Visit https://mapgenie.io/forza-horizon-5/maps/mexico
2. **Enable all location categories** you want to calibrate (use the filters on the left sidebar)
3. **Zoom to fit the entire Mexico map** in your browser window
4. Take a screenshot (Windows: `Win + Shift + S`, or use browser screenshot tools)
5. Save the screenshot as a PNG or JPG file

### Step 2: Use the Calibration Tool

1. In your Forza Color Repo app, go to the **Location Finder** page
2. Click the **"🎯 Calibrate"** button in the map controls
3. Upload the MapGenie screenshot you just captured
4. The system will automatically:
   - Detect all the colored pins on the MapGenie map
   - Match them to your location data
   - Calculate the transformation needed
   - Show you the match count

5. If you get **3+ matches**, click **"Apply Calibration"**

## Tips for Best Results

### Screenshot Quality
- **Full screen** the MapGenie map before capturing
- **Disable browser UI** (press F11 for fullscreen mode)
- **High resolution** - zoom your browser to 100% or use a high-DPI display
- **Clear pins** - make sure the location markers are visible and not overlapping too much

### MapGenie Settings
- **Show all categories** that match your location data
- **Use the same map style** consistently (don't switch between light/dark themes)
- **Zoom level** - capture the entire Mexico map boundary, not zoomed in on a region

### Filter Matching
- Enable the same location types in both MapGenie and your app
- Common categories:
  - Barn Finds (red pins)
  - Fast Travel Boards (blue pins)
  - XP Boards (yellow pins)
  - Danger Signs (red with icon)
  - Speed Traps/Zones (blue with icon)
  - Player Houses (cyan/teal)
  - Showcases (orange)

## Alternative: Manual Coordinate Extraction

If the auto-calibration doesn't work well, you can manually extract coordinates from MapGenie:

### Browser Console Method

1. Open MapGenie in your browser
2. Open Developer Tools (F12)
3. Go to the Console tab
4. Run this script to extract visible marker positions:

```javascript
// Extract all visible map markers
const markers = [];
document.querySelectorAll('.leaflet-marker-icon').forEach((marker, index) => {
  const rect = marker.getBoundingClientRect();
  const mapRect = document.querySelector('.leaflet-container').getBoundingClientRect();
  
  // Calculate percentage position relative to map container
  const x = ((rect.left + rect.width/2 - mapRect.left) / mapRect.width) * 100;
  const y = ((rect.top + rect.height/2 - mapRect.top) / mapRect.height) * 100;
  
  // Get marker title/name if available
  const title = marker.getAttribute('alt') || marker.getAttribute('title') || `Location ${index}`;
  
  markers.push({
    name: title,
    x: x.toFixed(2),
    y: y.toFixed(2)
  });
});

console.table(markers);
copy(JSON.stringify(markers, null, 2));
```

This will copy the coordinates to your clipboard in JSON format.

## Troubleshooting

### "Not enough matches found"
- Try a clearer screenshot with less overlapping pins
- Make sure you're showing the full map, not zoomed in
- Enable more location categories to get more reference points

### "Pins still misaligned after calibration"
- The MapGenie map might use a different projection or aspect ratio
- Try adjusting the manual offset/scale values
- Consider using a different reference map source

### "Detection found too many/few pins"
- Adjust the brightness threshold in the calibration code
- Use a screenshot with higher contrast
- Make sure the background isn't too busy

## Map Image Source

If you want to use the same base map as MapGenie:

1. MapGenie uses Leaflet.js with custom tile layers
2. You can inspect their tile URLs in the Network tab
3. Or use a similar high-res FH5 Mexico map from:
   - Reddit community maps
   - Official Forza press materials
   - In-game screenshot composites

## Coordinate System Notes

- MapGenie uses **Leaflet coordinates** (lat/lng based)
- Your app uses **percentage coordinates** (0-100 for x and y)
- The calibration system handles this conversion automatically
- Saved transformations persist in localStorage

## Need Help?

If auto-calibration isn't working:
1. Check the browser console for errors
2. Verify your screenshot shows clear, distinct pins
3. Try manually adjusting offset values in the calibration UI
4. Consider using a different reference source temporarily
