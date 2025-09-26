export { getMakes, getFilteredColors as getPaginatedColorData } from './colorDataLazy';

// Re-export for backward compatibility
export const searchColors = async (
  query: string,
  limit: number = 100
) => {
  const result = await getFilteredColors(query, '', 1, limit);
  return result.colors;
};

// Import the efficient functions
import { getFilteredColors } from './colorDataLazy';