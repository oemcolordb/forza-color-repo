export default async (request, context) => {
  const response = await context.next()
  
  const headers = new Headers(response.headers)
  
  // Security headers
  headers.set('X-Frame-Options', 'DENY')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-XSS-Protection', '1; mode=block')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  
  // Enhanced CSP
  // Remove CSP header - causing conflicts with Next.js
  // headers.set('Content-Security-Policy', '...')
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}