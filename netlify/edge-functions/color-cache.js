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
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
  
  // Forward to origin if not cached
  const response = await context.next()
  
  // Cache successful responses
  if (response.ok) {
    const data = await response.text()
    context.cookies.set(cacheKey, data, {
      maxAge: 3600, // 1 hour
      httpOnly: true
    })
    
    return new Response(data, {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
  
  return response
}

export const config = {
  path: '/api/colors/*'
}