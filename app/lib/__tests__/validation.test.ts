/**
 * Unit tests for validation utilities
 */

import {
  validateInput,
  scanInputSchema,
  userIdSchema,
  sanitizeString,
  sanitizeFileName,
  sanitizeUserId,
  sanitizeSearchQuery,
  validateImageFile,
  handleError
} from '../validation';

describe('Validation', () => {
  describe('validateInput', () => {
    it('should validate correct user ID', () => {
      const result = validateInput(userIdSchema, { userId: 'user123' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userId).toBe('user123');
      }
    });

    it('should reject empty user ID', () => {
      const result = validateInput(userIdSchema, { userId: '' });
      expect(result.success).toBe(false);
    });

    it('should reject too long user ID', () => {
      const result = validateInput(userIdSchema, { userId: 'a'.repeat(101) });
      expect(result.success).toBe(false);
    });

    it('should validate scan input', () => {
      const validScan = {
        userId: 'user123',
        imageName: 'test.jpg',
        extractedColors: [{ h: 0.5, s: 0.8, b: 0.9, rgb: [100, 150, 200], percentage: 50 }],
        matches: [],
        imageData: 'data:image/jpeg;base64,/9j/4AAQ'
      };
      const result = validateInput(scanInputSchema, validScan);
      expect(result.success).toBe(true);
    });
  });

  describe('sanitizeString', () => {
    it('should remove HTML tags', () => {
      const result = sanitizeString('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
    });

    it('should trim whitespace', () => {
      const result = sanitizeString('  test  ');
      expect(result).toBe('test');
    });

    it('should handle empty string', () => {
      const result = sanitizeString('');
      expect(result).toBe('');
    });
  });

  describe('sanitizeFileName', () => {
    it('should replace unsafe characters', () => {
      const result = sanitizeFileName('test<>file.jpg');
      expect(result).toBe('test__file.jpg');
    });

    it('should prevent path traversal', () => {
      const result = sanitizeFileName('../../../etc/passwd');
      expect(result).not.toContain('..');
    });

    it('should limit length', () => {
      const result = sanitizeFileName('a'.repeat(300));
      expect(result.length).toBeLessThanOrEqual(255);
    });

    it('should remove leading dots', () => {
      const result = sanitizeFileName('...test.jpg');
      expect(result).toBe('test.jpg');
    });
  });

  describe('sanitizeUserId', () => {
    it('should allow alphanumeric and hyphens', () => {
      const result = sanitizeUserId('user-123_test');
      expect(result).toBe('user-123_test');
    });

    it('should remove special characters', () => {
      const result = sanitizeUserId('user@#$123');
      expect(result).toBe('user123');
    });

    it('should limit length', () => {
      const result = sanitizeUserId('a'.repeat(150));
      expect(result.length).toBe(100);
    });
  });

  describe('sanitizeSearchQuery', () => {
    it('should remove XSS characters', () => {
      const result = sanitizeSearchQuery('<script>alert("xss")</script>');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should trim whitespace', () => {
      const result = sanitizeSearchQuery('  search query  ');
      expect(result).toBe('search query');
    });

    it('should limit length', () => {
      const result = sanitizeSearchQuery('a'.repeat(300));
      expect(result.length).toBe(200);
    });
  });

  describe('validateImageFile', () => {
    it('should accept valid image file', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      expect(() => validateImageFile(file)).not.toThrow();
    });

    it('should reject non-image file', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      expect(() => validateImageFile(file)).toThrow('File must be an image');
    });

    it('should reject oversized file', () => {
      const largeFile = new File([new ArrayBuffer(51 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      expect(() => validateImageFile(largeFile)).toThrow('too large');
    });

    it('should reject invalid extension', () => {
      const file = new File([''], 'test.exe', { type: 'image/jpeg' });
      expect(() => validateImageFile(file)).toThrow('Invalid image format');
    });
  });

  describe('handleError', () => {
    it('should handle Error objects', () => {
      const error = new Error('Test error');
      const result = handleError(error);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Test error');
    });

    it('should handle string errors', () => {
      const result = handleError('String error');
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('String error');
    });

    it('should handle unknown errors', () => {
      const result = handleError({ unknown: 'error' });
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('An unexpected error occurred');
    });
  });
});
