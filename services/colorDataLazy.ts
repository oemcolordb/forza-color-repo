/**
 * services/colorDataLazy.ts
 *
 * This service provides a unified way to access the color databases
 * across both Client Components (via fetch) and Server Components (via fs).
 */

import { CarColor } from '../app/types';

/**
 * Loads color data from all available database sources.
 */
export async function getColorData(): Promise<CarColor[]> {
  // Client-side (Browser)
  if (typeof window !== 'undefined') {
    try {
      // In a real app, we might have an API endpoint that aggregates these,
      // but for now, we'll fetch them individually if they are in public/
      const sources = ['/data/colors.json', '/data/wheel-colors.json', '/data/manufacturer-colors.json'];
      const results = await Promise.all(
        sources.map(src => fetch(src).then(res => res.ok ? res.json() : []).catch(() => []))
      );
      return results.flat();
    } catch (error) {
      console.error('Client-side color fetch failed:', error);
      return [];
    }
  }

  // Server-side (Node.js)
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const dataFiles = [
      path.join(process.cwd(), 'extracted_colors.json'),
      path.join(process.cwd(), 'app/data/wheel-colors.json'),
      path.join(process.cwd(), 'app/data/manufacturer-colors.json')
    ];
    
    const results: CarColor[] = [];

    for (const filePath of dataFiles) {
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const data = JSON.parse(content);
          if (Array.isArray(data)) {
            results.push(...data);
          }
        } catch (e) {
          console.error(`Failed to parse ${filePath}:`, e);
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Server-side color load failed:', error);
    return [];
  }
}
