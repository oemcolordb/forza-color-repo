import { getMakes, getFilteredColors } from './colorDataLazy';

export { getMakes, getFilteredColors as getPaginatedColorData };

// Re-export for backward compatibility
export const searchColors = async (query, limit = 100) => {
  const result = await getFilteredColors(query, '', 1, limit);
  return result.colors;
};