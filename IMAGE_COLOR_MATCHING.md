# Image Color Matching Feature

## Overview

The Image Color Matching feature allows users to upload images and automatically find matching automotive paint colors from the Forza Color Universe database.

## How It Works

### 1. Color Extraction

- Analyzes uploaded images using HTML5 Canvas API
- Samples pixels and groups similar colors
- Extracts the 10 most dominant colors from the image
- Converts RGB values to HSL color space for better matching

### 2. Color Matching Algorithm

- Compares extracted colors against 10,000+ car colors in the database
- Uses HSL color distance calculation for accurate matching
- Considers hue, saturation, and lightness differences
- Weights matches by color frequency in the original image
- Returns top 20 best matches sorted by similarity score

### 3. User Interface

- Drag-and-drop or click-to-upload interface
- Real-time processing with loading indicators
- Visual preview of extracted colors
- Matched results displayed in the main color grid
- Clear results button to return to normal browsing

## Technical Implementation

### Components

- `ImageColorExtractor.tsx` - Main upload and processing component
- Integrated into main `page.tsx` with toggle button
- Uses existing `ColorCard` components for displaying results

### Key Functions

```typescript
// Convert RGB to HSL for better color matching
const rgbToHsl = (r: number, g: number, b: number): [number, number, number]

// Extract dominant colors from image data
const extractColorsFromImage = (imageData: ImageData): ExtractedColor[]

// Find matching car colors using distance algorithm
const findMatchingColors = (extractedColors: ExtractedColor[]): CarColor[]
```

### Performance Optimizations

- Images resized to 200px max dimension for faster processing
- Pixel sampling (every 4th pixel) to reduce computation
- Color grouping to reduce noise and improve accuracy
- Efficient HSL distance calculation

## Usage

1. Click the "🎨 Image Match" button in the filter bar
2. Upload an image by clicking "Choose Image" or drag-and-drop
3. Wait for processing (usually 1-2 seconds)
4. View extracted colors and matched automotive paints
5. Click "Clear Results" to return to normal browsing

## Supported Formats

- JPEG, PNG, WebP, and other browser-supported image formats
- Handles transparent images (skips transparent pixels)
- Works best with images containing distinct, solid colors

## Use Cases

- Match car colors from photos
- Find automotive paints for custom projects
- Identify colors from design inspiration images
- Discover similar colors across different manufacturers
