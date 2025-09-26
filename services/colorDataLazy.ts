import type { CarColor } from '../types';

// Lazy loading wrapper for the large color data
let colorDataCache: CarColor[] | null = null;
let colorDataPromise: Promise<CarColor[]> | null = null;

export const getColorData = (): Promise<CarColor[]> => {
  if (colorDataCache) {
    return Promise.resolve(colorDataCache);
  }

  if (colorDataPromise) {
    return colorDataPromise;
  }

  colorDataPromise = import('./colorData').then(module => {
    colorDataCache = module.default;
    return colorDataCache || [];
  });

  return colorDataPromise;
};

// Get unique makes with caching
let makesCache: string[] | null = null;

export const getMakes = async (): Promise<string[]> => {
  if (makesCache) {
    return makesCache;
  }

  const colors = await getColorData();
  const uniqueMakes = [...new Set(colors.map(color => color.make))];
  makesCache = uniqueMakes.sort();
  return makesCache;
};

// Efficient filtering and pagination
export const getFilteredColors = async (
  searchQuery: string = '',
  selectedMake: string = '',
  page: number = 1,
  pageSize: number = 50
): Promise<{
  colors: CarColor[];
  totalCount: number;
  totalPages: number;
}> => {
  const allColors = await getColorData();
  
  let filteredColors = allColors;
  
  if (searchQuery || selectedMake) {
    const searchLower = searchQuery.toLowerCase();
    filteredColors = allColors.filter(color => {
      const matchesSearch = !searchQuery || 
        color.colorName.toLowerCase().includes(searchLower) ||
        color.make.toLowerCase().includes(searchLower) ||
        color.model.toLowerCase().includes(searchLower) ||
        (color.year && color.year.toString().includes(searchLower)) ||
        (color.colorType && color.colorType.toLowerCase().includes(searchLower));

      const matchesMake = !selectedMake || color.make === selectedMake;

      return matchesSearch && matchesMake;
    });
  }

  const totalCount = filteredColors.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (page - 1) * pageSize;
  const colors = filteredColors.slice(startIndex, startIndex + pageSize);

  return {
    colors,
    totalCount,
    totalPages
  };
};