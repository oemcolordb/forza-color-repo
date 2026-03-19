/**
 * API Integration tests for /api/analytics endpoint
 */

import { NextRequest } from 'next/server';
import { POST } from '../analytics/route';

// Mock rate limiter
jest.mock('@/app/lib/rateLimit', () => ({
  rateLimiter: {
    check: jest.fn(() => ({ allowed: true, remaining: 99, resetTime: Date.now() + 60000 }))
  },
  getClientIp: jest.fn(() => '127.0.0.1'),
  createRateLimitHeaders: jest.fn(() => ({}))
}));

describe('API: /api/analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/analytics', () => {
    it('should accept valid analytics event', async () => {
      const validEvent = {
        category: 'Color',
        action: 'select_color',
        label: 'Rosso Corsa',
        value: 1,
        timestamp: Date.now()
      };

      const request = new NextRequest('http://localhost/api/analytics', {
        method: 'POST',
        body: JSON.stringify(validEvent)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 400 for missing category', async () => {
      const invalidEvent = {
        action: 'select_color'
      };

      const request = new NextRequest('http://localhost/api/analytics', {
        method: 'POST',
        body: JSON.stringify(invalidEvent)
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 for missing action', async () => {
      const invalidEvent = {
        category: 'Color'
      };

      const request = new NextRequest('http://localhost/api/analytics', {
        method: 'POST',
        body: JSON.stringify(invalidEvent)
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should return 429 when rate limited', async () => {
      const { rateLimiter } = require('@/app/lib/rateLimit');
      rateLimiter.check.mockReturnValue({ 
        allowed: false, 
        remaining: 0, 
        resetTime: Date.now() + 60000,
        retryAfter: 60 
      });

      const request = new NextRequest('http://localhost/api/analytics', {
        method: 'POST',
        body: JSON.stringify({ category: 'Test', action: 'test' })
      });

      const response = await POST(request);
      expect(response.status).toBe(429);
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost/api/analytics', {
        method: 'POST',
        body: 'invalid json'
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
    });
  });
});
