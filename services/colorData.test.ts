/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});

import { describe, it, expect } from 'vitest';

describe('carColors data', () => {
  it('should be an array of car color objects', () => {
    expect(Array.isArray(carColors)).toBe(true);
    expect(carColors.length).toBeGreaterThan(0);
  });

  it('should have valid properties for each color', () => {
    carColors.forEach((color) => {
      expect(color).toHaveProperty('manufacturer');
      expect(typeof color.manufacturer).toBe('string');

      expect(color).toHaveProperty('name');
      expect(typeof color.name).toBe('string');

      expect(color).toHaveProperty('type');
      expect(['Solid', 'Metallic', 'Pearl', 'Matte', 'Color-Shift', 'Special']).toContain(color.type);

      expect(color).toHaveProperty('hsb');
      expect(typeof color.hsb.h).toBe('number');
      expect(typeof color.hsb.s).toBe('number');
      expect(typeof color.hsb.b).toBe('number');
    });
  });
});

export type CarColor = {
  manufacturer: string;
  name: string;
  type: 'Solid' | 'Metallic' | 'Pearl' | 'Matte' | 'Color-Shift' | 'Special';
  hsb: {
    h: number;
    s: number;
    b: number;
  };
};

export const carColors = [
  // ...color objects
];