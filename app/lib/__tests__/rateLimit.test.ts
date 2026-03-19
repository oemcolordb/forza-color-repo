/**
 * Unit tests for rate limiting
 */

import { rateLimiter, getClientIp, RATE_LIMITS } from '../rateLimit';

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Reset rate limiter state
    jest.clearAllMocks();
  });

  describe('rateLimiter.check', () => {
    it('should allow requests under limit', () => {
      const result = rateLimiter.check('test-ip', 10, 60000);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('should block requests over limit', () => {
      const identifier = 'test-ip-2';
      const limit = 3;
      
      // Make requests up to limit
      for (let i = 0; i < limit; i++) {
        rateLimiter.check(identifier, limit, 60000);
      }
      
      // Next request should be blocked
      const result = rateLimiter.check(identifier, limit, 60000);
      
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should reset after window expires', async () => {
      const identifier = 'test-ip-3';
      const limit = 2;
      const window = 100; // 100ms
      
      // Use up limit
      rateLimiter.check(identifier, limit, window);
      rateLimiter.check(identifier, limit, window);
      
      // Should be blocked
      let result = rateLimiter.check(identifier, limit, window);
      expect(result.allowed).toBe(false);
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should be allowed again
      result = rateLimiter.check(identifier, limit, window);
      expect(result.allowed).toBe(true);
    });

    it('should track different identifiers separately', () => {
      const result1 = rateLimiter.check('ip-1', 5, 60000);
      const result2 = rateLimiter.check('ip-2', 5, 60000);
      
      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
      expect(result1.remaining).toBe(4);
      expect(result2.remaining).toBe(4);
    });
  });

  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for', () => {
      const request = new Request('http://localhost', {
        headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' }
      });
      
      const ip = getClientIp(request);
      expect(ip).toBe('192.168.1.1');
    });

    it('should extract IP from x-real-ip', () => {
      const request = new Request('http://localhost', {
        headers: { 'x-real-ip': '192.168.1.2' }
      });
      
      const ip = getClientIp(request);
      expect(ip).toBe('192.168.1.2');
    });

    it('should return unknown if no IP headers', () => {
      const request = new Request('http://localhost');
      const ip = getClientIp(request);
      expect(ip).toBe('unknown');
    });
  });

  describe('RATE_LIMITS', () => {
    it('should have stricter limits for POST', () => {
      expect(RATE_LIMITS.POST_SCAN.limit).toBeLessThan(RATE_LIMITS.GET_SCANS.limit);
    });

    it('should have very strict limits for uploads', () => {
      expect(RATE_LIMITS.IMAGE_UPLOAD.limit).toBeLessThanOrEqual(5);
    });

    it('should have reasonable window times', () => {
      expect(RATE_LIMITS.DEFAULT.windowMs).toBe(60000); // 1 minute
    });
  });
});
