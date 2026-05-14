/**
 * services/colorDataLazy.ts
 *
 * This service provides a unified way to access the 10,000+ color database
 * across both Client Components (via fetch) and Server Components/Route Handlers (via fs).
 */

import { CarColor } from '../app/types';

/**
 * Loads color data. 
 * On the server: reads from the filesystem.
 * On the client: fetches via the public API.
 */
export async function getColorData(): Promise<CarColor[]> {
  // Check if we are in a browser environment
  if (typeof window !== 'undefined') {
    try {
      const response = await fetch('/data/colors.json');
      if (!response.ok) throw new Error('Failed to fetch colors');
      return await response.json();
    } catch (error) {
      console.error('Client-side color fetch failed:', error);
      return [];
    }
  }

  // Server-side (Node.js)
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const results: CarColor[] = [];

    // 1. Load Main Body Colors
    const bodyPath = path.join(process.cwd(), 'extracted_colors.json');
    if (fs.existsSync(bodyPath)) {
      results.push(...JSON.parse(fs.readFileSync(bodyPath, 'utf8')));
    }
    
    // 2. Load Community Wheel Colors
    const wheelPath = path.join(process.cwd(), 'app', 'data', 'wheel-colors.json');
    if (fs.existsSync(wheelPath)) {
      results.push(...JSON.parse(fs.readFileSync(wheelPath, 'utf8')));
    }

    return results;
  } catch (error) {
    console.error('Server-side color load failed:', error);
    return [];
  }
}
