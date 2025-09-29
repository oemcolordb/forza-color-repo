// Simple in-memory cache for AI responses
const cache = new Map<string, string>();
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const cacheTimestamps = new Map<string, number>();

export const getCachedResponse = (key: string): string | null => {
  const timestamp = cacheTimestamps.get(key);
  if (timestamp && Date.now() - timestamp > CACHE_EXPIRY) {
    cache.delete(key);
    cacheTimestamps.delete(key);
    return null;
  }
  return cache.get(key) || null;
};

export const setCachedResponse = (key: string, response: string): void => {
  cache.set(key, response);
  cacheTimestamps.set(key, Date.now());
};

export const generateCacheKey = (make: string, model: string, colorName: string, year?: number): string => {
  return `${make}-${model}-${colorName}-${year || 'unknown'}`.toLowerCase();
};