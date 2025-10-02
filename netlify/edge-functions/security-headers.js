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
    "script-src 'self' 'unsafe-inline' 'nonce-forza2024'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: blob: https://fonts.gstatic.com; " +
    "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://generativelanguage.googleapis.com; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "frame-ancestors 'none'; " +
    "form-action 'self'; " +
    "upgrade-insecure-requests"
  )
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}