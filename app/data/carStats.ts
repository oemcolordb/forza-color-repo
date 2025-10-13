// Auto-generated car data interfaces
import { Car } from '../types/car';

export interface CarMetadata {
  totalCars: number;
  manufacturers: number;
  models: number;
  types: number;
  countries: number;
  rarities: number;
  piClasses: number;
  yearRange: {
    min: number;
    max: number;
  };
  priceRange: {
    min: number;
    max: number;
  };
}

export interface CarFilters {
  manufacturers: string[];
  models: string[];
  types: string[];
  countries: string[];
  rarities: string[];
  piClasses: string[];
}

export interface OptimizedCarData {
  cars: Car[];
  metadata: CarMetadata;
  filters: CarFilters;
}

// Car statistics by manufacturer
export const CAR_STATS = {
  TOTAL_CARS: 1200,
  MANUFACTURERS: 24,
  MODELS: 406,
  TYPES: 12,
  COUNTRIES: 6,
  YEAR_RANGE: { min: 1960, max: 2023 },
  PRICE_RANGE: { min: 15396, max: 5009820 }
} as const;

// Top manufacturers by car count
export const TOP_MANUFACTURERS = [
  {
    "name": "Ford",
    "count": 187
  },
  {
    "name": "Porsche",
    "count": 129
  },
  {
    "name": "Ferrari",
    "count": 124
  },
  {
    "name": "Lamborghini",
    "count": 93
  },
  {
    "name": "Nissan",
    "count": 91
  },
  {
    "name": "BMW",
    "count": 74
  },
  {
    "name": "Chevrolet",
    "count": 67
  },
  {
    "name": "Mercedes-Benz",
    "count": 61
  },
  {
    "name": "Audi",
    "count": 54
  },
  {
    "name": "McLaren",
    "count": 52
  }
];

// Car types distribution
export const CAR_TYPES = [
  {
    "name": "Sports Car",
    "count": 412
  },
  {
    "name": "Classic",
    "count": 288
  },
  {
    "name": "Rally Car",
    "count": 261
  },
  {
    "name": "Coupe",
    "count": 88
  },
  {
    "name": "Supercar",
    "count": 37
  },
  {
    "name": "Truck",
    "count": 32
  },
  {
    "name": "Hypercar",
    "count": 28
  },
  {
    "name": "Wagon",
    "count": 26
  },
  {
    "name": "Convertible",
    "count": 14
  },
  {
    "name": "Sedan",
    "count": 8
  },
  {
    "name": "SUV",
    "count": 4
  },
  {
    "name": "Track Car",
    "count": 2
  }
];
