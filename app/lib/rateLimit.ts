/**
 * In-memory rate limiter for API endpoints
 * Uses sliding window algorithm to track requests per IP/identifier
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

class RateLimiter {
  private limits = new Map<string, RateLimitRecord>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired records every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Check if a request is allowed under rate limit
   * @param identifier - Unique identifier (usually IP address)
   * @param limit - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns Rate limit result with allowed status and remaining count
   */
  check(
    identifier: string,
    limit: number = 10,
    windowMs: number = 60000
  ): RateLimitResult {
    const now = Date.now();
    const record = this.limits.get(identifier);

    // No record or expired - create new
    if (!record || now > record.resetTime) {
      const resetTime = now + windowMs;
      this.limits.set(identifier, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime
      };
    }

    // Limit exceeded
    if (record.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      };
    }

    // Increment count
    record.count++;
    return {
      allowed: true,
      remaining: limit - record.count,
      resetTime: record.resetTime
    };
  }

  /**
   * Reset rate limit for a specific identifier
   * @param identifier - Unique identifier to reset
   */
  reset(identifier: string): void {
    this.limits.delete(identifier);
  }

  /**
   * Clean up expired records to prevent memory leaks
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.limits.entries()) {
      if (now > record.resetTime) {
        this.limits.delete(key);
      }
    }
  }

  /**
   * Get current stats (for monitoring)
   */
  getStats(): { totalTracked: number; memoryUsage: number } {
    return {
      totalTracked: this.limits.size,
      memoryUsage: process.memoryUsage().heapUsed
    };
  }

  /**
   * Destroy the rate limiter and cleanup
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.limits.clear();
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Get client IP address from request
 * @param request - Next.js Request object
 * @returns IP address or 'unknown'
 */
export function getClientIp(request: Request): string {
  // Try various headers for IP address
  const headers = request.headers;
  
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = headers.get('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return 'unknown';
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Strict limits for write operations
  POST_SCAN: { limit: 10, windowMs: 60000 }, // 10 requests per minute
  DELETE_SCAN: { limit: 20, windowMs: 60000 }, // 20 requests per minute
  
  // More lenient for read operations
  GET_SCANS: { limit: 60, windowMs: 60000 }, // 60 requests per minute
  
  // Very strict for expensive operations
  IMAGE_UPLOAD: { limit: 5, windowMs: 60000 }, // 5 uploads per minute
  
  // Default fallback
  DEFAULT: { limit: 30, windowMs: 60000 } // 30 requests per minute
};

/**
 * Create rate limit response headers
 * @param result - Rate limit result
 * @returns Headers object
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
  };

  if (result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString();
  }

  return headers;
}
