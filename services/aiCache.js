// Simple in-memory cache for AI responses
const cache = new Map();
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const cacheTimestamps = new Map();

export const getCachedResponse = (key) => {
  const timestamp = cacheTimestamps.get(key);
  if (timestamp && Date.now() - timestamp > CACHE_EXPIRY) {
    cache.delete(key);
    cacheTimestamps.delete(key);
    return null;
  }
  return cache.get(key) || null;
};

export const setCachedResponse = (key, response) => {
  cache.set(key, response);
  cacheTimestamps.set(key, Date.now());
};

export const generateCacheKey = (make, model, colorName, year) => {
  return `${make}-${model}-${colorName}-${year || 'unknown'}`.toLowerCase();
};