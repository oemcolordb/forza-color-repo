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
  headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: blob: https:; " +
    "media-src 'self' data: blob:; " +
    "connect-src 'self' https:; " +
    "object-src 'none'; " +
    "base-uri 'self';"
  )
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}