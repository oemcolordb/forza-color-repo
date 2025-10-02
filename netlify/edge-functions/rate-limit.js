const rateLimitMap = new Map()

export default async (request, context) => {
  const clientIP = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
  
  const now = Date.now()
  const windowMs = 60000 // 1 minute
  const maxRequests = 100 // per minute
  
  const key = `${clientIP}-${Math.floor(now / windowMs)}`
  const current = rateLimitMap.get(key) || 0
  
  if (current >= maxRequests) {
    return new Response('Rate limit exceeded', { 
      status: 429,
      headers: {
        'Retry-After': '60',
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': '0'
      }
    })
  }
  
  rateLimitMap.set(key, current + 1)
  
  // Cleanup old entries
  if (rateLimitMap.size > 10000) {
    const cutoff = now - windowMs * 2
    for (const [k] of rateLimitMap) {
      const timestamp = parseInt(k.split('-').pop())
      if (timestamp < cutoff) rateLimitMap.delete(k)
    }
  }
  
  const response = await context.next()
  const headers = new Headers(response.headers)
  headers.set('X-RateLimit-Limit', maxRequests.toString())
  headers.set('X-RateLimit-Remaining', (maxRequests - current - 1).toString())
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}