import kdTree from 'kd-tree-javascript';

interface HSBColor {
  h: number;
  s: number;
  b: number;
}

interface CarColor {
  make: string;
  model: string;
  year: number | null;
  colorName: string;
  colorType: string;
  color1: HSBColor;
  color2: HSBColor;
}

interface ColorNode extends CarColor {
  point: [number, number, number];
}

/**
 * Distance function for KD-Tree
 * Uses weighted Euclidean distance in HSB color space
 */
function colorDistance(a: [number, number, number], b: [number, number, number]): number {
  // Weights for HSB components (hue is circular, so needs special handling)
  const hWeight = 2.0; // Hue is most important
  const sWeight = 1.0; // Saturation
  const bWeight = 1.0; // Brightness

  // Handle hue circularity (0 and 1 are adjacent)
  let hDiff = Math.abs(a[0] - b[0]);
  if (hDiff > 0.5) {
    hDiff = 1 - hDiff;
  }

  const sDiff = a[1] - b[1];
  const bDiff = a[2] - b[2];

  return Math.sqrt(
    hWeight * hDiff * hDiff +
    sWeight * sDiff * sDiff +
    bWeight * bDiff * bDiff
  );
}

/**
 * Color Tree Manager
 * Manages KD-Tree for efficient color matching
 */
class ColorTreeManager {
  private tree: any = null;
  private colors: CarColor[] = [];
  private isBuilt = false;

  /**
   * Build KD-Tree from color array
   * @param colors - Array of car colors
   */
  buildTree(colors: CarColor[]): void {
    if (this.isBuilt && this.colors === colors) {
      return; // Tree already built with same data
    }

    console.time('KD-Tree Build');

    // Convert colors to nodes with 3D points [h, s, b]
    const nodes: ColorNode[] = colors.map(color => ({
      ...color,
      point: [color.color1.h, color.color1.s, color.color1.b]
    }));

    // Create KD-Tree with custom distance function
    this.tree = new kdTree.kdTree(nodes, colorDistance, ['point']);
    this.colors = colors;
    this.isBuilt = true;

    console.timeEnd('KD-Tree Build');
    console.log(`KD-Tree built with ${colors.length} colors`);
  }

  /**
   * Find nearest colors using KD-Tree
   * @param hsb - Target HSB color
   * @param count - Number of matches to return
   * @returns Array of nearest colors with distances
   */
  findNearest(hsb: HSBColor, count: number = 10): Array<{ color: CarColor; distance: number; similarity: number }> {
    if (!this.isBuilt || !this.tree) {
      throw new Error('Color tree not built. Call buildTree() first.');
    }

    const point: [number, number, number] = [hsb.h, hsb.s, hsb.b];
    
    // Find nearest neighbors
    const nearest = this.tree.nearest(point, count);

    // Convert to result format with similarity percentage
    return nearest.map(([node, distance]: [ColorNode, number]) => ({
      color: {
        make: node.make,
        model: node.model,
        year: node.year,
        colorName: node.colorName,
        colorType: node.colorType,
        color1: node.color1,
        color2: node.color2
      },
      distance,
      similarity: Math.max(0, 100 - distance * 50) // Convert distance to similarity %
    }));
  }

  /**
   * Find colors within a specific distance threshold
   * @param hsb - Target HSB color
   * @param maxDistance - Maximum distance threshold
   * @returns Array of colors within threshold
   */
  findWithinRadius(hsb: HSBColor, maxDistance: number = 0.1): Array<{ color: CarColor; distance: number }> {
    if (!this.isBuilt || !this.tree) {
      throw new Error('Color tree not built. Call buildTree() first.');
    }

    const point: [number, number, number] = [hsb.h, hsb.s, hsb.b];
    const results = this.tree.nearest(point, 100); // Get more results to filter

    return results
      .filter(([_, distance]: [ColorNode, number]) => distance <= maxDistance)
      .map(([node, distance]: [ColorNode, number]) => ({
        color: {
          make: node.make,
          model: node.model,
          year: node.year,
          colorName: node.colorName,
          colorType: node.colorType,
          color1: node.color1,
          color2: node.color2
        },
        distance
      }));
  }

  /**
   * Get tree statistics
   */
  getStats(): { colorCount: number; isBuilt: boolean } {
    return {
      colorCount: this.colors.length,
      isBuilt: this.isBuilt
    };
  }

  /**
   * Clear the tree and free memory
   */
  clear(): void {
    this.tree = null;
    this.colors = [];
    this.isBuilt = false;
  }
}

// Singleton instance
let colorTreeInstance: ColorTreeManager | null = null;

/**
 * Get or create color tree instance
 */
export function getColorTree(): ColorTreeManager {
  if (!colorTreeInstance) {
    colorTreeInstance = new ColorTreeManager();
  }
  return colorTreeInstance;
}

/**
 * Initialize color tree with data
 * @param colors - Array of car colors
 */
export function initializeColorTree(colors: CarColor[]): void {
  const tree = getColorTree();
  tree.buildTree(colors);
}

/**
 * Find closest Forza colors using KD-Tree (optimized)
 * @param hsb - Target HSB color
 * @param count - Number of matches to return
 * @returns Array of closest colors
 */
export function findClosestColors(hsb: HSBColor, count: number = 10): Array<{ color: CarColor; distance: number; similarity: number }> {
  const tree = getColorTree();
  return tree.findNearest(hsb, count);
}

/**
 * Batch find closest colors for multiple inputs
 * @param hsbColors - Array of HSB colors
 * @param countPerColor - Number of matches per color
 * @returns Array of results for each input color
 */
export function batchFindClosestColors(
  hsbColors: HSBColor[],
  countPerColor: number = 10
): Array<Array<{ color: CarColor; distance: number; similarity: number }>> {
  const tree = getColorTree();
  return hsbColors.map(hsb => tree.findNearest(hsb, countPerColor));
}

export type { CarColor, HSBColor, ColorNode };
