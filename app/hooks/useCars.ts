import { useState, useEffect, useCallback } from 'react';
import { Car, CarFilters, CarSearchOptions } from '../types/car';
import { carDatabase } from '../../services/carDatabase';

interface UseCarState {
  cars: Car[];
  manufacturers: string[];
  models: string[];
  types: string[];
  countries: string[];
  loading: boolean;
  error: string | null;
}

interface UseCarActions {
  searchCars: (options?: CarSearchOptions) => Promise<void>;
  getCarsByManufacturer: (manufacturer: string) => Promise<void>;
  getCarsByType: (type: string) => Promise<void>;
  getRandomCars: (count?: number) => Promise<void>;
  getTopCarsByStats: (statName: keyof Car['stats'], limit?: number) => Promise<void>;
  clearCars: () => void;
  refreshData: () => Promise<void>;
}

export function useCars(): UseCarState & UseCarActions {
  const [state, setState] = useState<UseCarState>({
    cars: [],
    manufacturers: [],
    models: [],
    types: [],
    countries: [],
    loading: false,
    error: null
  });

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const setCars = (cars: Car[]) => {
    setState(prev => ({ ...prev, cars }));
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [manufacturers, models, types, countries] = await Promise.all([
          carDatabase.getManufacturers(),
          carDatabase.getModels(),
          carDatabase.getTypes(),
          carDatabase.getCountries()
        ]);

        setState(prev => ({
          ...prev,
          manufacturers,
          models,
          types,
          countries,
          loading: false
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load car data');
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const searchCars = useCallback(async (options: CarSearchOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      const cars = await carDatabase.searchCars(options);
      setCars(cars);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search cars');
    } finally {
      setLoading(false);
    }
  }, []);

  const getCarsByManufacturer = useCallback(async (manufacturer: string) => {
    setLoading(true);
    setError(null);

    try {
      const cars = await carDatabase.getCarsByManufacturer(manufacturer);
      setCars(cars);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get cars by manufacturer');
    } finally {
      setLoading(false);
    }
  }, []);

  const getCarsByType = useCallback(async (type: string) => {
    setLoading(true);
    setError(null);

    try {
      const cars = await carDatabase.getCarsByType(type);
      setCars(cars);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get cars by type');
    } finally {
      setLoading(false);
    }
  }, []);

  const getRandomCars = useCallback(async (count: number = 10) => {
    setLoading(true);
    setError(null);

    try {
      const cars = await carDatabase.getRandomCars(count);
      setCars(cars);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get random cars');
    } finally {
      setLoading(false);
    }
  }, []);

  const getTopCarsByStats = useCallback(async (statName: keyof Car['stats'], limit: number = 10) => {
    setLoading(true);
    setError(null);

    try {
      const cars = await carDatabase.getTopCarsByStats(statName, limit);
      setCars(cars);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get top cars by stats');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCars = useCallback(() => {
    setCars([]);
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [manufacturers, models, types, countries] = await Promise.all([
        carDatabase.getManufacturers(),
        carDatabase.getModels(),
        carDatabase.getTypes(),
        carDatabase.getCountries()
      ]);

      setState(prev => ({
        ...prev,
        manufacturers,
        models,
        types,
        countries,
        loading: false
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
      setLoading(false);
    }
  }, []);

  return {
    ...state,
    searchCars,
    getCarsByManufacturer,
    getCarsByType,
    getRandomCars,
    getTopCarsByStats,
    clearCars,
    refreshData
  };
}

// Hook for getting a specific car
export function useCar(manufacturer?: string, model?: string, year?: string) {
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!manufacturer || !model || !year) {
      setCar(null);
      return;
    }

    const loadCar = async () => {
      setLoading(true);
      setError(null);

      try {
        const foundCar = await carDatabase.getCarById(manufacturer, model, year);
        setCar(foundCar);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load car');
      } finally {
        setLoading(false);
      }
    };

    loadCar();
  }, [manufacturer, model, year]);

  return { car, loading, error };
}

// Hook for getting models by manufacturer
export function useModelsByManufacturer(manufacturer?: string) {
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!manufacturer) {
      setModels([]);
      return;
    }

    const loadModels = async () => {
      setLoading(true);
      setError(null);

      try {
        const manufacturerModels = await carDatabase.getModels(manufacturer);
        setModels(manufacturerModels);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load models');
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, [manufacturer]);

  return { models, loading, error };
}