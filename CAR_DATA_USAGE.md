# Car Data TypeScript Integration

This document explains how to use the newly converted TypeScript car data system in the Forza Color Universe application.

## Overview

The car data from `cars.json` has been converted to a TypeScript-friendly format with:
- **1,200 cars** from **24 manufacturers**
- **406 unique models** across **12 vehicle types**
- **6 countries** represented
- Year range: **1960-2023**
- Price range: **$15,396 - $5,009,820**

## File Structure

```
app/
├── types/
│   ├── car.ts              # Car data TypeScript interfaces
│   └── index.ts            # Re-exports all types
├── hooks/
│   └── useCars.ts          # React hooks for car data
├── components/
│   ├── CarSelector.tsx     # Cascading car selection component
│   └── CarBrowser.tsx      # Full car browsing interface
└── data/                   # Generated optimized data files
    ├── cars-optimized.json # Full optimized car database
    ├── carStats.ts         # TypeScript constants and statistics
    ├── manufacturers.json  # List of manufacturers
    ├── car-types.json      # List of vehicle types
    └── cars-sample.json    # Sample data for development

services/
└── carDatabase.ts          # Car database service class
```

## TypeScript Interfaces

### Core Car Interface
```typescript
interface Car {
  year: string;
  manufacturer: string;
  model: string;
  type: string;
  price: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  country: string;
  stats: CarStats;
  pi: CarPI;
}

interface CarStats {
  speed: number;
  handling: number;
  acceleration: number;
  launch: number;
  braking: number;
  offroad: number;
}

interface CarPI {
  class: 'D' | 'C' | 'B' | 'A' | 'S1' | 'S2' | 'X';
  value: number;
}
```

## Usage Examples

### 1. Basic Car Data Hook

```typescript
import { useCars } from '../hooks/useCars';

function MyComponent() {
  const { cars, manufacturers, loading, error, searchCars } = useCars();

  // Search for cars
  const handleSearch = async () => {
    await searchCars({
      query: 'Ferrari',
      filters: { type: 'Sports Car' },
      limit: 10
    });
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {cars.map(car => (
        <div key={`${car.manufacturer}-${car.model}-${car.year}`}>
          {car.year} {car.manufacturer} {car.model}
        </div>
      ))}
    </div>
  );
}
```

### 2. Car Selector Component

```typescript
import CarSelector from '../components/CarSelector';
import { Car } from '../types/car';

function TuneForge() {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  return (
    <div>
      <CarSelector
        selectedCar={selectedCar}
        onCarSelect={setSelectedCar}
      />
      
      {selectedCar && (
        <div>
          Selected: {selectedCar.year} {selectedCar.manufacturer} {selectedCar.model}
          PI: {selectedCar.pi.class} {selectedCar.pi.value}
        </div>
      )}
    </div>
  );
}
```

### 3. Advanced Filtering

```typescript
import { carDatabase } from '../services/carDatabase';

// Search with complex filters
const searchResults = await carDatabase.searchCars({
  query: 'BMW',
  filters: {
    type: 'Sports Car',
    piClass: 'A',
    yearRange: { min: 2000, max: 2020 },
    priceRange: { min: 100000, max: 1000000 }
  },
  sortBy: 'pi.value',
  sortOrder: 'desc',
  limit: 20
});

// Get top cars by specific stats
const fastestCars = await carDatabase.getTopCarsByStats('speed', 10);
const bestHandling = await carDatabase.getTopCarsByStats('handling', 10);
```

### 4. Direct Database Access

```typescript
import { carDatabase } from '../services/carDatabase';

// Get all manufacturers
const manufacturers = await carDatabase.getManufacturers();

// Get models for a specific manufacturer
const ferrariModels = await carDatabase.getModels('Ferrari');

// Get a specific car
const car = await carDatabase.getCarById('Ferrari', 'F40', '1987');

// Get random cars
const randomCars = await carDatabase.getRandomCars(5);
```

## Available Hooks

### `useCars()`
Main hook for car data management:
- `cars`: Current car list
- `manufacturers`, `models`, `types`, `countries`: Filter options
- `loading`, `error`: State management
- `searchCars()`: Search with filters
- `getCarsByManufacturer()`: Filter by manufacturer
- `getRandomCars()`: Get random selection

### `useCar(manufacturer, model, year)`
Hook for getting a specific car:
- `car`: The found car or null
- `loading`, `error`: State management

### `useModelsByManufacturer(manufacturer)`
Hook for getting models by manufacturer:
- `models`: Array of model names
- `loading`, `error`: State management

## Search and Filter Options

### Search Options
```typescript
interface CarSearchOptions {
  query?: string;                    // Text search
  filters?: CarFilters;              // Advanced filters
  sortBy?: string;                   // Sort field
  sortOrder?: 'asc' | 'desc';       // Sort direction
  limit?: number;                    // Result limit
  offset?: number;                   // Pagination offset
}
```

### Available Filters
```typescript
interface CarFilters {
  manufacturer?: string;
  model?: string;
  type?: string;
  country?: string;
  rarity?: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  piClass?: 'D' | 'C' | 'B' | 'A' | 'S1' | 'S2' | 'X';
  yearRange?: { min: number; max: number };
  priceRange?: { min: number; max: number };
}
```

## Performance Considerations

1. **Lazy Loading**: Car data is loaded on first access
2. **Optimized Data**: Uses pre-computed filter lists when available
3. **Caching**: Database service caches loaded data
4. **Pagination**: Use `limit` and `offset` for large result sets
5. **Fallback**: Automatically falls back to original `cars.json` if optimized data unavailable

## Integration with TuneForge

The car data system is designed to integrate seamlessly with TuneForge:

```typescript
// In TuneForge component
import CarSelector from '../components/CarSelector';
import { Car } from '../types/car';

function TuneForge() {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  
  const handleCarSelect = (car: Car | null) => {
    setSelectedCar(car);
    // Update tuning calculations based on selected car
    if (car) {
      updateTuningForCar(car);
    }
  };

  return (
    <div className="tuneforge-container">
      <CarSelector
        selectedCar={selectedCar}
        onCarSelect={handleCarSelect}
      />
      
      {selectedCar && (
        <TuningInterface car={selectedCar} />
      )}
    </div>
  );
}
```

## Data Regeneration

To regenerate the optimized data files after updating `cars.json`:

```bash
node scripts/convertCarsData.js
```

This will update all the TypeScript data files and statistics.

## Error Handling

The system includes comprehensive error handling:
- Network failures when loading data
- Invalid car selections
- Missing or corrupted data files
- Graceful fallbacks to ensure functionality

All hooks and services return error states that can be used for user feedback.