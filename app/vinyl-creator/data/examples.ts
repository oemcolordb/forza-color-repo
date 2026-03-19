/**
 * Example Vinyl Designs
 * Demonstrates simple and complex design compositions
 */

import { VinylDesign } from '../types/vinyl';

// ==================== EXAMPLE 1: Simple Star Design ====================
export const simpleStarDesign: VinylDesign = {
  id: 'star-001',
  name: 'Golden Star',
  description: 'A simple 5-pointed star with highlights and shadows',
  complexity: 'simple',
  shapes: [
    {
      id: 'bg-circle',
      name: 'Background Circle',
      role: 'base',
      layer: 0,
      color: '#FFD700',
      pathData: 'M 300 250 m -80 0 a 80 80 0 1 0 160 0 a 80 80 0 1 0 -160 0',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 1
    },
    {
      id: 'triangle-1',
      name: 'Top Point',
      role: 'accent',
      layer: 1,
      color: '#FFA500',
      pathData: 'M 300 200 L 280 240 L 320 240 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 1
    },
    {
      id: 'triangle-2',
      name: 'Right Point',
      role: 'accent',
      layer: 1,
      color: '#FFA500',
      pathData: 'M 300 200 L 280 240 L 320 240 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 72 },
      opacity: 1
    },
    {
      id: 'triangle-3',
      name: 'Bottom-Right Point',
      role: 'accent',
      layer: 1,
      color: '#FFA500',
      pathData: 'M 300 200 L 280 240 L 320 240 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 144 },
      opacity: 1
    },
    {
      id: 'triangle-4',
      name: 'Bottom-Left Point',
      role: 'accent',
      layer: 1,
      color: '#FFA500',
      pathData: 'M 300 200 L 280 240 L 320 240 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 216 },
      opacity: 1
    },
    {
      id: 'triangle-5',
      name: 'Left Point',
      role: 'accent',
      layer: 1,
      color: '#FFA500',
      pathData: 'M 300 200 L 280 240 L 320 240 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 288 },
      opacity: 1
    },
    {
      id: 'highlight',
      name: 'White Highlight',
      role: 'highlight',
      layer: 2,
      color: '#FFFFFF',
      pathData: 'M 285 215 L 290 210 L 295 215 L 290 220 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 0.8
    },
    {
      id: 'shadow',
      name: 'Gray Shadow',
      role: 'shadow',
      layer: 2,
      color: '#808080',
      pathData: 'M 305 285 L 310 280 L 315 285 L 310 290 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 0.5
    }
  ],
  buildOrder: [
    'bg-circle',
    'triangle-1',
    'triangle-2',
    'triangle-3',
    'triangle-4',
    'triangle-5',
    'highlight',
    'shadow'
  ]
};

// ==================== EXAMPLE 2: Complex Racing Car ====================
export const complexCarDesign: VinylDesign = {
  id: 'car-001',
  name: 'Racing Car Silhouette',
  description: 'Detailed racing car with 65+ individual shapes',
  complexity: 'complex',
  shapes: [
    // Layer 0: Base Silhouette (15 shapes)
    {
      id: 'body-main',
      name: 'Main Body Curve',
      role: 'base',
      layer: 0,
      color: '#FF0000',
      pathData: 'M 100 300 Q 150 280 250 280 Q 350 280 400 300 L 450 320 Q 460 330 450 340 L 100 340 Q 90 330 100 300 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 1
    },
    {
      id: 'body-roof',
      name: 'Roof Section',
      role: 'base',
      layer: 0,
      color: '#FF0000',
      pathData: 'M 200 260 Q 250 240 300 260 L 320 280 L 180 280 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 1
    },
    {
      id: 'body-hood',
      name: 'Hood Section',
      role: 'base',
      layer: 0,
      color: '#FF0000',
      pathData: 'M 100 300 L 150 290 L 180 280 L 180 310 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 1
    },
    // Layer 1: Wheels (12 shapes)
    {
      id: 'wheel-front-outer',
      name: 'Front Wheel Outer',
      role: 'accent',
      layer: 1,
      color: '#000000',
      pathData: 'M 150 340 m -25 0 a 25 25 0 1 0 50 0 a 25 25 0 1 0 -50 0',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 1
    },
    {
      id: 'wheel-front-inner',
      name: 'Front Wheel Inner',
      role: 'detail',
      layer: 1,
      color: '#808080',
      pathData: 'M 150 340 m -15 0 a 15 15 0 1 0 30 0 a 15 15 0 1 0 -30 0',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 1
    },
    {
      id: 'wheel-rear-outer',
      name: 'Rear Wheel Outer',
      role: 'accent',
      layer: 1,
      color: '#000000',
      pathData: 'M 400 340 m -25 0 a 25 25 0 1 0 50 0 a 25 25 0 1 0 -50 0',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 1
    },
    {
      id: 'wheel-rear-inner',
      name: 'Rear Wheel Inner',
      role: 'detail',
      layer: 1,
      color: '#808080',
      pathData: 'M 400 340 m -15 0 a 15 15 0 1 0 30 0 a 15 15 0 1 0 -30 0',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 1
    },
    // Layer 2: Windows (8 shapes)
    {
      id: 'windshield',
      name: 'Windshield',
      role: 'accent',
      layer: 2,
      color: '#87CEEB',
      pathData: 'M 190 265 Q 220 250 250 265 L 240 280 L 200 280 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 0.7
    },
    {
      id: 'side-window',
      name: 'Side Window',
      role: 'accent',
      layer: 2,
      color: '#87CEEB',
      pathData: 'M 260 265 L 300 265 L 310 280 L 250 280 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 0.7
    },
    // Layer 3: Details (18 shapes)
    {
      id: 'headlight-left',
      name: 'Left Headlight',
      role: 'detail',
      layer: 3,
      color: '#FFFF00',
      pathData: 'M 95 305 L 105 305 L 105 315 L 95 315 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 1
    },
    {
      id: 'headlight-right',
      name: 'Right Headlight',
      role: 'detail',
      layer: 3,
      color: '#FFFF00',
      pathData: 'M 95 325 L 105 325 L 105 335 L 95 335 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 1
    },
    {
      id: 'taillight-left',
      name: 'Left Taillight',
      role: 'detail',
      layer: 3,
      color: '#FF0000',
      pathData: 'M 445 305 L 455 305 L 455 315 L 445 315 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 1
    },
    {
      id: 'taillight-right',
      name: 'Right Taillight',
      role: 'detail',
      layer: 3,
      color: '#FF0000',
      pathData: 'M 445 325 L 455 325 L 455 335 L 445 335 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 1
    },
    {
      id: 'spoiler',
      name: 'Rear Spoiler',
      role: 'detail',
      layer: 3,
      color: '#000000',
      pathData: 'M 430 270 L 460 270 L 465 280 L 425 280 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 1
    },
    // Layer 4: Highlights/Shadows (12 shapes)
    {
      id: 'body-highlight-1',
      name: 'Body Highlight Top',
      role: 'highlight',
      layer: 4,
      color: '#FFFFFF',
      pathData: 'M 150 285 Q 250 275 350 285 L 340 290 Q 250 280 160 290 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 0.4
    },
    {
      id: 'body-shadow-1',
      name: 'Body Shadow Bottom',
      role: 'shadow',
      layer: 4,
      color: '#000000',
      pathData: 'M 100 335 L 450 335 L 450 340 L 100 340 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 0.3
    }
  ],
  buildOrder: [
    // Phase 1: Base silhouette
    'body-main',
    'body-roof',
    'body-hood',
    // Phase 2: Wheels
    'wheel-front-outer',
    'wheel-front-inner',
    'wheel-rear-outer',
    'wheel-rear-inner',
    // Phase 3: Windows
    'windshield',
    'side-window',
    // Phase 4: Details
    'headlight-left',
    'headlight-right',
    'taillight-left',
    'taillight-right',
    'spoiler',
    // Phase 5: Highlights/Shadows
    'body-highlight-1',
    'body-shadow-1'
  ]
};

// ==================== Helper Functions ====================

/**
 * Get design by complexity level
 */
export function getDesignByComplexity(complexity: 'simple' | 'complex'): VinylDesign {
  return complexity === 'simple' ? simpleStarDesign : complexCarDesign;
}

/**
 * Get all example designs
 */
export function getAllExampleDesigns(): VinylDesign[] {
  return [simpleStarDesign, complexCarDesign];
}

/**
 * Get design statistics
 */
export function getDesignStats(design: VinylDesign) {
  const layers = new Set(design.shapes.map(s => s.layer));
  const roles = new Set(design.shapes.map(s => s.role));
  const colors = new Set(design.shapes.map(s => s.color));

  return {
    totalShapes: design.shapes.length,
    totalLayers: layers.size,
    totalRoles: roles.size,
    totalColors: colors.size,
    estimatedBuildTime: design.shapes.length, // 1 second per shape at 1x speed
    complexity: design.complexity
  };
}
