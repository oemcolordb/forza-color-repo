import { Tokens } from 'csrf';

// Initialize CSRF tokens generator
const tokens = new Tokens();

// Secret should be stored in environment variable in production
const CSRF_SECRET = process.env.CSRF_SECRET || 'forza-color-universe-csrf-secret-change-in-production';

/**
 * Generate a new CSRF token
 * @returns CSRF token string
 */
export function generateCsrfToken(): string {
  return tokens.create(CSRF_SECRET);
}

/**
 * Validate a CSRF token
 * @param token - Token to validate
 * @returns true if valid, false otherwise
 */
export function validateCsrfToken(token: string): boolean {
  if (!token) return false;
  return tokens.verify(CSRF_SECRET, token);
}

/**
 * CSRF protection middleware for API routes
 * Wraps a handler function with CSRF validation
 * @param handler - The API route handler function
 * @returns Wrapped handler with CSRF protection
 */
export function withCsrfProtection(
  handler: (request: Request) => Promise<Response>
) {
  return async (request: Request): Promise<Response> => {
    // Skip CSRF check for GET and HEAD requests (safe methods)
    if (request.method === 'GET' || request.method === 'HEAD') {
      return handler(request);
    }

    // Get CSRF token from header
    const token = request.headers.get('x-csrf-token');

    // Validate token
    if (!token || !validateCsrfToken(token)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid or missing CSRF token',
          code: 'CSRF_VALIDATION_FAILED'
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Token is valid, proceed with handler
    return handler(request);
  };
}

/**
 * Extract CSRF token from request headers
 * @param request - Next.js Request object
 * @returns CSRF token or null
 */
export function getCsrfTokenFromRequest(request: Request): string | null {
  return request.headers.get('x-csrf-token');
}

/**
 * Create response headers with new CSRF token
 * Useful for token rotation
 * @returns Headers object with CSRF token
 */
export function createCsrfHeaders(): Record<string, string> {
  return {
    'X-CSRF-Token': generateCsrfToken()
  };
}
