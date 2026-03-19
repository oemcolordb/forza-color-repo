/**
 * Unit tests for color conversion utilities
 */

import { rgbToHsb, hsbToRgb, batchRgbToHsb, clearConversionCache } from '../colorConversion';

describe('Color Conversion', () => {
  beforeEach(() => {
    clearConversionCache();
  });

  describe('rgbToHsb', () => {
    it('should convert pure red correctly', () => {
      const result = rgbToHsb(255, 0, 0);
      expect(result.h).toBeCloseTo(0, 2);
      expect(result.s).toBe(1);
      expect(result.b).toBe(1);
    });

    it('should convert pure green correctly', () => {
      const result = rgbToHsb(0, 255, 0);
      expect(result.h).toBeCloseTo(0.333, 2);
      expect(result.s).toBe(1);
      expect(result.b).toBe(1);
    });

    it('should convert pure blue correctly', () => {
      const result = rgbToHsb(0, 0, 255);
      expect(result.h).toBeCloseTo(0.667, 2);
      expect(result.s).toBe(1);
      expect(result.b).toBe(1);
    });

    it('should convert white correctly', () => {
      const result = rgbToHsb(255, 255, 255);
      expect(result.h).toBe(0);
      expect(result.s).toBe(0);
      expect(result.b).toBe(1);
    });

    it('should convert black correctly', () => {
      const result = rgbToHsb(0, 0, 0);
      expect(result.h).toBe(0);
      expect(result.s).toBe(0);
      expect(result.b).toBe(0);
    });

    it('should use cache for repeated conversions', () => {
      const result1 = rgbToHsb(100, 150, 200);
      const result2 = rgbToHsb(100, 150, 200);
      expect(result1).toEqual(result2);
    });
  });

  describe('hsbToRgb', () => {
    it('should convert HSB to RGB correctly', () => {
      const [r, g, b] = hsbToRgb(0, 1, 1);
      expect(r).toBe(255);
      expect(g).toBe(0);
      expect(b).toBe(0);
    });

    it('should round-trip conversion', () => {
      const hsb = rgbToHsb(100, 150, 200);
      const [r, g, b] = hsbToRgb(hsb.h, hsb.s, hsb.b);
      expect(r).toBeCloseTo(100, 0);
      expect(g).toBeCloseTo(150, 0);
      expect(b).toBeCloseTo(200, 0);
    });
  });

  describe('batchRgbToHsb', () => {
    it('should convert multiple colors', () => {
      const colors: Array<[number, number, number]> = [
        [255, 0, 0],
        [0, 255, 0],
        [0, 0, 255]
      ];
      const results = batchRgbToHsb(colors);
      expect(results).toHaveLength(3);
    });
  });
});
