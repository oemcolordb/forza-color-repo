/**
 * rateLimit.ts — simple in-memory rate limiter for API routes
 * Uses a sliding window per IP address.
 * Not persisted across serverless cold starts (acceptable for this scale).
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Cleanup stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanup(): void {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) {
      store.delete(key)
    }
  }
}

export interface RateLimitOptions {
  /** Max requests in the window */
  max: number
  /** Window duration in milliseconds */
  windowMs: number
}

const defaultOptions: RateLimitOptions = {
  max: 30,
  windowMs: 60 * 1000, // 1 minute
}

export function checkRateLimit(
  ip: string,
  options: Partial<RateLimitOptions> = {}
): { allowed: boolean; remaining: number; resetAt: number } {
  cleanup()

  const { max, windowMs } = { ...defaultOptions, ...options }
  const now = Date.now()
  const entry = store.get(ip)

  if (!entry || now >= entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs }
  }

  entry.count++

  if (entry.count > max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt }
}

/**
 * Higher-order function to wrap API route handlers with rate limiting.
 */
export function withRateLimit(
  handler: (request: Request, ...args: any[]) => Promise<Response>,
  options: Partial<RateLimitOptions> = {}
): (request: Request, ...args: any[]) => Promise<Response> {
  return async (request: Request, ...args: any[]) => {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1'

    const result = checkRateLimit(ip, options)

    if (!result.allowed) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
            'X-RateLimit-Remaining': '0',
          },
        }
      )
    }

    const response = await handler(request, ...args)

    // Add rate limit headers if response is a NextResponse (has headers)
    if (response && 'headers' in response) {
      response.headers.set('X-RateLimit-Remaining', String(result.remaining))
      response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)))
    }

    return response
  }
}
