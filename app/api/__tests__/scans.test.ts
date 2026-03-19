/**
 * API Integration tests for /api/scans endpoint
 */

import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from '../scans/route';

// Mock database client
jest.mock('@/app/lib/db', () => ({
  getDbClient: jest.fn(() => ({
    execute: jest.fn()
  }))
}));

// Mock rate limiter
jest.mock('@/app/lib/rateLimit', () => ({
  rateLimiter: {
    check: jest.fn(() => ({ allowed: true, remaining: 10, resetTime: Date.now() + 60000 }))
  },
  getClientIp: jest.fn(() => '127.0.0.1'),
  createRateLimitHeaders: jest.fn(() => ({}))
}));

// Mock CSRF
jest.mock('@/app/lib/csrf', () => ({
  validateCsrfToken: jest.fn(() => true)
}));

describe('API: /api/scans', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/scans', () => {
    it('should return scans for valid user', async () => {
      const { getDbClient } = require('@/app/lib/db');
      const mockClient = getDbClient();
      
      mockClient.execute.mockResolvedValue({
        rows: [
          {
            id: '1',
            userId: 'user123',
            imageName: 'test.jpg',
            extractedColors: '[]',
            matches: '[]',
            imageData: 'data:image/jpeg;base64,test',
            createdAt: '2024-01-01'
          }
        ]
      });

      const request = new NextRequest('http://localhost/api/scans?userId=user123');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(mockClient.execute).toHaveBeenCalledWith({
        sql: expect.stringContaining('SELECT'),
        args: ['user123']
      });
    });

    it('should return 400 for missing userId', async () => {
      const request = new NextRequest('http://localhost/api/scans');
      const response = await GET(request);

      expect(response.status).toBe(400);
    });

    it('should return 429 when rate limited', async () => {
      const { rateLimiter } = require('@/app/lib/rateLimit');
      rateLimiter.check.mockReturnValue({ allowed: false, remaining: 0, resetTime: Date.now(), retryAfter: 60 });

      const request = new NextRequest('http://localhost/api/scans?userId=user123');
      const response = await GET(request);

      expect(response.status).toBe(429);
    });
  });

  describe('POST /api/scans', () => {
    it('should save scan with valid data', async () => {
      const { getDbClient } = require('@/app/lib/db');
      const mockClient = getDbClient();
      
      mockClient.execute.mockResolvedValue({
        lastInsertRowid: 1
      });

      const validScan = {
        userId: 'user123',
        imageName: 'test.jpg',
        extractedColors: [{ h: 0.5, s: 0.8, b: 0.9, rgb: [100, 150, 200], percentage: 50 }],
        matches: [],
        imageData: 'data:image/jpeg;base64,/9j/4AAQ'
      };

      const request = new NextRequest('http://localhost/api/scans', {
        method: 'POST',
        headers: { 'x-csrf-token': 'valid-token' },
        body: JSON.stringify(validScan)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.id).toBe(1);
    });

    it('should return 400 for invalid data', async () => {
      const invalidScan = {
        userId: '',
        imageName: 'test.jpg'
      };

      const request = new NextRequest('http://localhost/api/scans', {
        method: 'POST',
        headers: { 'x-csrf-token': 'valid-token' },
        body: JSON.stringify(invalidScan)
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should return 403 for invalid CSRF token', async () => {
      const { validateCsrfToken } = require('@/app/lib/csrf');
      validateCsrfToken.mockReturnValue(false);

      const request = new NextRequest('http://localhost/api/scans', {
        method: 'POST',
        headers: { 'x-csrf-token': 'invalid-token' },
        body: JSON.stringify({})
      });

      const response = await POST(request);
      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/scans', () => {
    it('should delete scan with valid credentials', async () => {
      const { getDbClient } = require('@/app/lib/db');
      const mockClient = getDbClient();
      
      mockClient.execute.mockResolvedValue({});

      const request = new NextRequest('http://localhost/api/scans?scanId=1&userId=user123', {
        method: 'DELETE',
        headers: { 'x-csrf-token': 'valid-token' }
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 400 for missing parameters', async () => {
      const request = new NextRequest('http://localhost/api/scans', {
        method: 'DELETE',
        headers: { 'x-csrf-token': 'valid-token' }
      });

      const response = await DELETE(request);
      expect(response.status).toBe(400);
    });
  });
});
