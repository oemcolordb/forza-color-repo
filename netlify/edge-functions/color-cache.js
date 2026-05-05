/**
 * Color Cache Edge Function
 *
 * Caches color API responses at the edge for improved performance.
 * Reduces origin server load and improves response times globally.
 *
 * @param {Request} request - Incoming HTTP request
 * @param {Object} context - Netlify edge context with cookies and next()
 * @returns {Response} Cached or fresh response with cache headers
 *
 * @example
 * // Automatically caches responses for 1 hour
 * // GET /api/colors?make=Ferrari
 * // Response headers: X-Cache: HIT or MISS
 */
export default async (request, context) => {
  const url = new URL(request.url)
  const cacheKey = `colors-${url.searchParams.toString()}`

  // Try to get from edge cache
  const cached = await context.cookies.get(cacheKey)
  if (cached) {
    return new Response(cached, {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'HIT',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  // Forward to origin if not cached
  const response = await context.next()

  // Cache successful responses
  if (response.ok) {
    // Clone response before consuming body to ensure we can return it if caching fails
    const responseClone = response.clone()

    try {
      const data = await response.text()
      context.cookies.set(cacheKey, data, {
        maxAge: 3600, // 1 hour
        httpOnly: true,
      })

      return new Response(data, {
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'MISS',
          'Access-Control-Allow-Origin': '*',
        },
      })
    } catch (error) {
      console.error('Failed to cache response:', error)
      // Return the cloned response if caching fails
      return responseClone
    }
  }

  return response
}

/**
 * Edge function configuration
 * @type {Object}
 * @property {string} path - URL pattern to match
 */
export const config = {
  path: '/api/colors/*',
}
