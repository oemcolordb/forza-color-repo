import { blendDualToneFH6, calculateBlendCoefficients, blendHue, blendSaturation, blendBrightness } from '../colorBlending';

describe('FH6 Dual-Tone Color Blending Engine', () => {
  describe('calculateBlendCoefficients', () => {
    it('handles zero saturation', () => {
      const base = { h: 0, s: 0, b: 0.5 };
      const highlight = { h: 0, s: 0, b: 0.5 };
      const weights = calculateBlendCoefficients(base, highlight);
      expect(weights.baseWeight).toBe(0.5);
      expect(weights.highlightWeight).toBe(0.5);
    });

    it('gives higher weight to higher saturation', () => {
      const base = { h: 0, s: 0.8, b: 0.5 };
      const highlight = { h: 0, s: 0.2, b: 0.5 };
      const weights = calculateBlendCoefficients(base, highlight);
      expect(weights.baseWeight).toBeGreaterThan(0.7);
      expect(weights.highlightWeight).toBeLessThan(0.3);
    });

    it('boosts weight for heavily dominant saturation (>3x and >0.3)', () => {
      const base = { h: 0, s: 0.9, b: 0.5 };
      const highlight = { h: 0, s: 0.2, b: 0.5 };
      const weights = calculateBlendCoefficients(base, highlight);
      // Base weight would be 0.9 / 1.1 = 0.818
      // Boost adds 0.15, maxing out at 1.0, but let's check it's boosted
      expect(weights.baseWeight).toBeGreaterThan(0.9);
      expect(weights.highlightWeight).toBeLessThan(0.1);
    });
  });

  describe('blendHue', () => {
    it('pulls completely to base if base saturation heavily dominates', () => {
      const base = { h: 0.6, s: 0.8, b: 0.5 };
      const highlight = { h: 0.2, s: 0.2, b: 0.5 };
      const { hue, dominant } = blendHue(base, highlight, 0.8, 0.2);
      expect(hue).toBe(0.6);
      expect(dominant).toBe('base');
    });

    it('pulls completely to highlight if highlight saturation heavily dominates', () => {
      const base = { h: 0.6, s: 0.2, b: 0.5 };
      const highlight = { h: 0.2, s: 0.8, b: 0.5 };
      const { hue, dominant } = blendHue(base, highlight, 0.2, 0.8);
      expect(hue).toBe(0.2);
      expect(dominant).toBe('highlight');
    });

    it('blends circularly when saturations are similar', () => {
      const base = { h: 0.9, s: 0.8, b: 0.5 }; // near 1
      const highlight = { h: 0.1, s: 0.8, b: 0.5 }; // near 0
      // Interpolating 0.9 to 0.1 around 0
      const { hue, dominant } = blendHue(base, highlight, 0.5, 0.5);
      // diff = 0.1 - 0.9 = -0.8 -> +1 = 0.2
      // 0.9 + 0.2 * 0.5 = 0.9 + 0.1 = 1.0 -> 0.0
      expect(hue).toBeCloseTo(0.0);
      expect(dominant).toBe('blend');
    });
  });

  describe('blendSaturation', () => {
    it('applies max boost when either color is highly saturated', () => {
      const base = { h: 0, s: 0.9, b: 0.5 };
      const highlight = { h: 0, s: 0.1, b: 0.5 };
      const { saturation } = blendSaturation(base, highlight, 0.9, 0.1);
      // lerp gives 0.9 + (0.1 - 0.9)*0.1 = 0.82
      // maxSat * 0.85 = 0.9 * 0.85 = 0.765
      // Math.max(0.82, 0.765) = 0.82
      expect(saturation).toBeCloseTo(0.82);
    });

    it('determines dominant correctly', () => {
      const base = { h: 0, s: 0.8, b: 0.5 };
      const highlight = { h: 0, s: 0.5, b: 0.5 };
      const { dominant } = blendSaturation(base, highlight, 0.8, 0.2);
      expect(dominant).toBe('base');
    });
  });

  describe('blendBrightness', () => {
    const base = { h: 0, s: 0.5, b: 0.2 };
    const highlight = { h: 0, s: 0.5, b: 0.8 };

    it('pulls up significantly for metal-flake', () => {
      const { brightness } = blendBrightness(base, highlight, 0.5, 0.5, 'metal-flake');
      // weight = 0.6 + 0.5*0.3 = 0.75 -> lerp(0.2, 0.8, 0.75) = 0.65
      expect(brightness).toBeCloseTo(0.65);
    });

    it('keeps close to base for two-tone-matte', () => {
      const { brightness } = blendBrightness(base, highlight, 0.5, 0.5, 'two-tone-matte');
      // weight = 0.5*0.3 = 0.15 -> lerp(0.2, 0.8, 0.15) = 0.29
      expect(brightness).toBeCloseTo(0.29);
    });

    it('averages for normal', () => {
      const { brightness } = blendBrightness(base, highlight, 0.5, 0.5, 'normal');
      expect(brightness).toBeCloseTo(0.5);
    });
  });

  describe('blendDualToneFH6 (Integration)', () => {
    it('conserves energy while maintaining accurate dual-tone PBR values', () => {
      // Very bright highlight, dark base
      const base = { h: 0.5, s: 0.8, b: 0.2 };
      const highlight = { h: 0.6, s: 0.8, b: 0.9 };
      
      const result = blendDualToneFH6(base, highlight, 'two-tone-polished');
      
      // Saturation dominant is blend (they are equal)
      expect(result.satDominant).toBe('blend');
      
      // Brightness should be properly constrained by mode
      // two-tone-polished: highlightWeight * 0.7 = 0.5 * 0.7 = 0.35
      // lerp(0.2, 0.9, 0.35) = 0.2 + 0.7 * 0.35 = 0.445
      expect(result.blended.b).toBeCloseTo(0.445);
      
      // Expected material properties for polished
      expect(result.roughness).toBe(0.08);
      expect(result.metalness).toBe(0.05);
      expect(result.clearcoat).toBe(1.0);
    });

    it('handles realistic known color pairs properly (Candy Red)', () => {
      // Candy red with dark red base and bright metallic highlight
      const base = { h: 0.02, s: 0.9, b: 0.25 };
      const highlight = { h: 0.0, s: 0.7, b: 0.85 };
      
      const result = blendDualToneFH6(base, highlight, 'candy');
      
      // Base hue should heavily pull the result
      expect(result.hueDominant).toBe('base');
      expect(result.blended.h).toBe(0.02);
      
      // Candy mode boosts brightness
      expect(result.blended.b).toBeGreaterThan(0.5); // base weight ~0.56, highlight ~0.44
      // candy multiplier: 0.5 + 0.4375 * 0.4 = 0.675
      // lerp(0.25, 0.85, 0.675) = 0.655
      expect(result.blended.b).toBeCloseTo(0.655);
      
      expect(result.roughness).toBe(0.05);
      expect(result.specularIntensity).toBe(1.0);
    });
  });
});
