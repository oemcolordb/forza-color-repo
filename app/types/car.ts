// Car data types for TuneForge
export interface CarStats {
  speed: number;
  handling: number;
  acceleration: number;
  launch: number;
  braking: number;
  offroad: number;
}

export interface CarPI {
  class: 'D' | 'C' | 'B' | 'A' | 'S1' | 'S2' | 'X';
  value: number;
}

export interface Car {
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

export interface CarDatabase {
  cars: Car[];
  manufacturers: string[];
  models: string[];
  types: string[];
  countries: string[];
}

// Helper types for filtering and searching
export interface CarFilters {
  manufacturer?: string;
  model?: string;
  type?: string;
  country?: string;
  rarity?: Car['rarity'];
  piClass?: CarPI['class'];
  yearRange?: {
    min: number;
    max: number;
  };
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface CarSearchOptions {
  query?: string;
  filters?: CarFilters;
  sortBy?: keyof Car | 'stats.speed' | 'stats.handling' | 'stats.acceleration' | 'stats.launch' | 'stats.braking' | 'stats.offroad' | 'pi.value';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}