import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Cache-control headers are managed by Next.js and next.config.js

  // Add app version to cookies for tracking
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
  const existingVersion = request.cookies.get('app_version')?.value

  // If version changed, set new cookie and add header to trigger client refresh
  if (existingVersion !== appVersion) {
    response.cookies.set('app_version', appVersion, {
      path: '/',
      maxAge: 86400, // 24 hours
      sameSite: 'lax',
      httpOnly: false,
    })
    // Add header to signal version change to client
    response.headers.set('X-App-Version-Changed', 'true')
    response.headers.set('X-App-Version', appVersion)
  }

  // Always add current version header
  response.headers.set('X-App-Version', appVersion)

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  return response
}

export const config = {
  matcher: [
    // Match all paths except for static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}
