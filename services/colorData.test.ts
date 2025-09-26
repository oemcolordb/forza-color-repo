import { describe, it, expect } from 'vitest';
import colorData from './colorData.ts';
import type { CarColor } from '../types';

describe('colorData', () => {
  it('should be an array of car color objects', () => {
    expect(Array.isArray(colorData)).toBe(true);
    expect(colorData.length).toBeGreaterThan(0);
  });

  it('should have valid properties for each color', () => {
    colorData.slice(0, 10).forEach((color: CarColor) => {
      expect(color).toHaveProperty('make');
      expect(typeof color.make).toBe('string');

      expect(color).toHaveProperty('colorName');
      expect(typeof color.colorName).toBe('string');

      expect(color).toHaveProperty('colorType');
      expect(typeof color.colorType).toBe('string');

      expect(color).toHaveProperty('color1');
      expect(typeof color.color1.h).toBe('number');
      expect(typeof color.color1.s).toBe('number');
      expect(typeof color.color1.b).toBe('number');

      expect(color).toHaveProperty('color2');
      expect(typeof color.color2.h).toBe('number');
      expect(typeof color.color2.s).toBe('number');
      expect(typeof color.color2.b).toBe('number');
    });
  });
});