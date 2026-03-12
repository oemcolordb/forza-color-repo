# Forza Horizon 5 Map Image Setup

This directory should contain the high-resolution map image for Forza Horizon 5's Mexico setting.

## Required File

**Filename**: `fh5-mexico.webp`  
**Location**: `public/maps/fh5-mexico.webp`  
**Recommended Resolution**: 2000x2000px or higher  
**Format**: WebP (or PNG/JPG - will be converted)

## How to Obtain the Map Image

### Option 1: Community High-Resolution Maps (Recommended)

1. Visit the Reddit thread with high-res FH5 maps:
   - https://www.reddit.com/r/ForzaHorizon/comments/s3qfp5/here_is_the_highres_fh5_map_for_route_planning/
   - https://www.reddit.com/r/ForzaHorizon/comments/qrh58z/this_is_the_full_map_of_forza_horizon_5_in_summer/

2. Download the highest resolution version available

3. Save as `fh5-mexico.webp` in this directory

### Option 2: Official Press Materials

1. Search for official Forza Horizon 5 press kit images
2. Look for the full Mexico map reveal image from Playground Games
3. Download and save as `fh5-mexico.webp`

### Option 3: In-Game Screenshot Composite

If you have access to Forza Horizon 5:
1. Take high-resolution screenshots of the in-game map
2. Use photo editing software to stitch them together
3. Export as high-quality WebP or PNG
4. Save as `fh5-mexico.webp`

## Image Requirements

- **Aspect Ratio**: Should match the game's map (roughly square or 16:10)
- **Quality**: High resolution for clear pin placement
- **Format**: WebP preferred for smaller file size, PNG/JPG acceptable
- **Content**: Should show the full Mexico map with clear landmarks visible

## Converting to WebP

If you have a PNG or JPG file, convert it to WebP:

### Using Online Tools
- https://cloudconvert.com/png-to-webp
- https://convertio.co/png-webp/

### Using Command Line (ImageMagick)
```bash
magick convert fh5-mexico.png fh5-mexico.webp
```

### Using Command Line (cwebp)
```bash
cwebp -q 90 fh5-mexico.png -o fh5-mexico.webp
```

## Fallback Behavior

If the map image is not found, the application will display:
- An error message indicating the file is missing
- Instructions to add the map image
- The path where the file should be placed

The location pins and filter functionality will still work once the image is added.

## Attribution

When using community-created maps, please ensure proper attribution is given. See `ATTRIBUTIONS.md` in the project root for details.

## Troubleshooting

**Map image not loading?**
- Verify the file is named exactly `fh5-mexico.webp`
- Check the file is in `public/maps/` directory
- Ensure the file format is valid (WebP, PNG, or JPG)
- Try refreshing the browser cache (Ctrl+Shift+R)

**Map looks distorted?**
- Check the aspect ratio matches the original game map
- Ensure the image resolution is high enough (minimum 1500x1500px)

**Pins not aligning correctly?**
- The coordinate system uses percentages (0-100 for x and y)
- Coordinates are calibrated for the standard FH5 Mexico map layout
- If using a custom map, coordinates may need adjustment
