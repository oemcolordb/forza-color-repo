# TuneForge Integration

This document describes the TuneForge modules that have been converted from TypeScript to JavaScript and integrated into the Forza Color Universe website.

## Converted Files

### Core Modules (`/app/lib/tuneforge/`)

1. **types.js** - Type definitions and constants
   - FORZA_LIMITS: Min/max values for all tuning parameters
   - CAR_TYPE_DEFAULTS: Default tune settings by car type
   - DRIVETRAIN_MODIFIERS: Adjustments based on drivetrain
   - PI_CLASS_MODIFIERS: Performance Index class modifiers
   - GEAR_RATIO_BLUEPRINTS: Gear ratio templates
   - Validation functions

2. **tuning-algorithms.js** - Advanced tuning calculations
   - TuningAlgorithms class with static methods
   - calculateBaseTune(): Intelligent base tune generation
   - getMetaTune(): Template-based tuning (Speed, Grip, Drift, etc.)
   - getMetaTemplate(): Meta templates (S2-Meta, A-Class-Meta, etc.)
   - Car-specific calculations based on weight, power, handling

3. **car-data.js** - Car database management
   - CarDataManager class with utility methods
   - SAMPLE_CARS: Expanded car database (10 cars)
   - Car type detection, drivetrain assignment
   - Weight and engine spec calculations
   - Price calculation based on PI class and rarity
   - Sorting and filtering utilities

4. **tuneforge-app.js** - Main application class
   - ForzaTunerApp class for state management
   - Integration with all other modules
   - Save/load functionality
   - Favorites management
   - Export/import capabilities

5. **index.js** - Module exports
   - Central export file for all TuneForge modules

### React Components

6. **CarStatsRadarChart.js** - Converted from TypeScript
   - Canvas-based radar chart for car statistics
   - Shows speed, handling, acceleration, launch, braking, offroad
   - Responsive sizing and dark mode support

### Data Files

7. **tuneforge-cars.json** - Extended car database
   - 10 high-quality car entries with complete data
   - Includes supercars, sports cars, and performance vehicles
   - Realistic stats, pricing, and specifications

### API Routes

8. **api/tuneforge/cars/route.js** - Car data API endpoint
   - Serves car data from JSON file
   - Fallback to sample data if file unavailable

## Integration Points

### TuneForge Page Updates
- Updated `/app/tuneforge/page.tsx` to use new modules
- Added CarStatsRadarChart component integration
- Enhanced car loading with JSON data source
- Improved error handling and fallback mechanisms

### Key Features Preserved
- Advanced base tune calculation based on car characteristics
- Template system (Speed, Grip, Drift, Drag, Offroad)
- Meta templates for competitive tuning
- Complete Forza parameter validation
- Save/load tune functionality
- Car statistics visualization

## Usage Examples

```javascript
// Import modules
import { TuningAlgorithms, CarDataManager, FORZA_LIMITS } from '../lib/tuneforge';

// Calculate base tune
const baseTune = TuningAlgorithms.calculateBaseTune(selectedCar);

// Apply template
const gripTune = TuningAlgorithms.getMetaTune('Grip', selectedCar);

// Load cars
const cars = await CarDataManager.loadCars();

// Validate tune
const validation = validateTuneData(tuneData);
```

## File Structure
```
app/
├── lib/tuneforge/
│   ├── types.js
│   ├── tuning-algorithms.js
│   ├── car-data.js
│   ├── tuneforge-app.js
│   └── index.js
├── components/
│   └── CarStatsRadarChart.js
├── api/tuneforge/cars/
│   └── route.js
└── tuneforge/
    └── page.tsx (updated)

public/
└── tuneforge-cars.json
```

## Benefits of JavaScript Conversion
- No TypeScript compilation required
- Direct integration with existing React components
- Maintained all original functionality
- Improved error handling
- Modular architecture for easy maintenance
- Compatible with Next.js static export

All original TuneForge functionality has been preserved while making it compatible with the existing Forza Color Universe codebase.