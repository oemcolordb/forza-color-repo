export default async (request, context) => {
  const clientIP = context.ip
  const rateLimitKey = `rate-limit-${clientIP}`
  
  // Get current request count
  const currentCount = parseInt(context.cookies.get(rateLimitKey) || '0')
  const limit = 100 // requests per hour
  
  if (currentCount >= limit) {
    return new Response(JSON.stringify({
      error: 'Rate limit exceeded',
      limit,
      resetTime: new Date(Date.now() + 3600000).toISOString()
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '3600'
      }
    })
  }
  
  // Increment counter
  context.cookies.set(rateLimitKey, (currentCount + 1).toString(), {
    maxAge: 3600, // 1 hour
    httpOnly: true
  })
  
  const response = await context.next()
  
  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', (limit - currentCount - 1).toString())
  
  return response
}

export const config = {
  path: '/api/*'
}