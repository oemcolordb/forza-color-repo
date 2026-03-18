/**
 * Optimized RGB to HSB color conversion with memoization
 * Caches results to avoid redundant calculations
 */

interface HSBColor {
  h: number;
  s: number;
  b: number;
}

// LRU Cache for RGB to HSB conversions
class RGBtoHSBCache {
  private cache = new Map<string, HSBColor>();
  private maxSize: number;

  constructor(maxSize: number = 10000) {
    this.maxSize = maxSize;
  }

  get(r: number, g: number, b: number): HSBColor | undefined {
    const key = `${r}-${g}-${b}`;
    return this.cache.get(key);
  }

  set(r: number, g: number, b: number, hsb: HSBColor): void {
    const key = `${r}-${g}-${b}`;
    
    // LRU eviction: remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, hsb);
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0 // TODO: Track hits/misses for analytics
    };
  }
}

// Singleton cache instance
const conversionCache = new RGBtoHSBCache(10000);

/**
 * Convert RGB to HSB with memoization
 * @param r - Red (0-255)
 * @param g - Green (0-255)
 * @param b - Blue (0-255)
 * @returns HSB color object
 */
export function rgbToHsb(r: number, g: number, b: number): HSBColor {
  // Check cache first
  const cached = conversionCache.get(r, g, b);
  if (cached) {
    return cached;
  }

  // Perform conversion
  const result = rgbToHsbCore(r, g, b);
  
  // Cache result
  conversionCache.set(r, g, b, result);
  
  return result;
}

/**
 * Core RGB to HSB conversion logic
 * @param r - Red (0-255)
 * @param g - Green (0-255)
 * @param b - Blue (0-255)
 * @returns HSB color object
 */
function rgbToHsbCore(r: number, g: number, b: number): HSBColor {
  // Normalize RGB values to 0-1
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const diff = max - min;

  // Calculate hue
  let h = 0;
  if (diff !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / diff) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / diff + 2;
    } else {
      h = (rNorm - gNorm) / diff + 4;
    }
  }
  
  h = Math.round(h * 60);
  if (h < 0) h += 360;

  // Calculate saturation
  const s = max === 0 ? 0 : diff / max;

  // Brightness is just max
  const brightness = max;

  return {
    h: h / 360, // Normalize to 0-1
    s: Math.round(s * 100) / 100,
    b: Math.round(brightness * 100) / 100,
  };
}

/**
 * Batch convert multiple RGB colors to HSB
 * More efficient than individual conversions
 * @param rgbColors - Array of [r, g, b] tuples
 * @returns Array of HSB colors
 */
export function batchRgbToHsb(rgbColors: Array<[number, number, number]>): HSBColor[] {
  return rgbColors.map(([r, g, b]) => rgbToHsb(r, g, b));
}

/**
 * Convert HSB to RGB
 * @param h - Hue (0-1)
 * @param s - Saturation (0-1)
 * @param b - Brightness (0-1)
 * @returns RGB color as [r, g, b] tuple
 */
export function hsbToRgb(h: number, s: number, b: number): [number, number, number] {
  const hDeg = h * 360;
  const c = b * s;
  const x = c * (1 - Math.abs(((hDeg / 60) % 2) - 1));
  const m = b - c;

  let r = 0, g = 0, bl = 0;

  if (hDeg >= 0 && hDeg < 60) {
    r = c; g = x; bl = 0;
  } else if (hDeg >= 60 && hDeg < 120) {
    r = x; g = c; bl = 0;
  } else if (hDeg >= 120 && hDeg < 180) {
    r = 0; g = c; bl = x;
  } else if (hDeg >= 180 && hDeg < 240) {
    r = 0; g = x; bl = c;
  } else if (hDeg >= 240 && hDeg < 300) {
    r = x; g = 0; bl = c;
  } else {
    r = c; g = 0; bl = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((bl + m) * 255)
  ];
}

/**
 * Clear the conversion cache
 * Useful for memory management
 */
export function clearConversionCache(): void {
  conversionCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return conversionCache.getStats();
}

export type { HSBColor };
