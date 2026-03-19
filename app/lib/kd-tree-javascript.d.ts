declare module 'kd-tree-javascript' {
  export class kdTree {
    constructor(points: any[], distance: (a: any, b: any) => number, dimensions: string[]);
    nearest(point: any, maxNodes: number, maxDistance?: number): any[];
    insert(point: any): void;
    remove(point: any): void;
    balanceFactor(): number;
  }
}
