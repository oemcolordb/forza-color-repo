import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// ─── Protected data files ────────────────────────────────────────────────────
const PROTECTED_DATA = ['/cars.json', '/tuneforge-cars-full.json', '/discord-manifest.json']

// ─── Known bot / scraper User-Agent patterns ────────────────────────────────
const BOT_UA = /curl|wget|python-requests|httpx|scrapy|bot|spider|crawl|go-http|java\//i

// ─── JWT Configuration ───────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev'

// ─── In-memory rate limiter (best-effort; resets on cold start) ──────────────
const _rl = new Map()
const WINDOW = 60_000 // 1 minute

function isRateLimited(key, max) {
  // Prevent memory leak from unbounded Map growth
  if (_rl.size > 10000) _rl.clear()

  const now = Date.now()
  const e = _rl.get(key)
  if (!e || now - e.s > WINDOW) {
    _rl.set(key, { c: 1, s: now })
    return false
  }
  e.c++
  return e.c > max
}

export async function proxy(request) {
  const { pathname } = request.nextUrl
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '0.0.0.0'
  const ua = request.headers.get('user-agent') ?? ''
  const fetchSite = request.headers.get('sec-fetch-site')
  const fetchMode = request.headers.get('sec-fetch-mode')

  // ── Block bots / scrapers on ALL routes ─────────────────────────────────────
  if (ua && BOT_UA.test(ua)) {
    const isApi = pathname.startsWith('/api/')
    return new NextResponse(isApi ? JSON.stringify({ error: 'Forbidden' }) : null, {
      status: 403,
      headers: isApi ? { 'Content-Type': 'application/json' } : {},
    })
  }

  // ── Protect raw data JSON files ──────────────────────────────────────────────
  if (PROTECTED_DATA.some(p => pathname === p)) {
    const isDirect = fetchMode === 'navigate' && (fetchSite === 'none' || !fetchSite)
    const isCrossSite = fetchSite === 'cross-site'

    if (isDirect || isCrossSite) {
      return new NextResponse(null, { status: 403 })
    }

    if (isRateLimited('data:' + ip, 20)) {
      return new NextResponse(null, { status: 429, headers: { 'Retry-After': '60' } })
    }
  }

  // ── Rate-limit API routes (100 req/min per IP) ───────────────────────────────
  if (pathname.startsWith('/api/')) {
    if (isRateLimited('api:' + ip, 100)) {
      return new NextResponse(JSON.stringify({ error: 'Too many requests. Slow down.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
      })
    }
  }

  // ── Selective JWT Validation ────────────────────────────────────────────────
  // Protect /api/user/* (Favorites, profiles, settings)
  const isUserRoute = pathname.startsWith('/api/user')
  // Protect POST/PUT/DELETE on /api/tunes (Voting, rating, submitting content)
  const isTuneMutation = pathname.startsWith('/api/tunes') && request.method !== 'GET'
  // Protect POST on /api/process-image (Expensive Python ML Service compute)
  const isMLService = pathname === '/api/process-image' && request.method === 'POST'

  // TEMPORARILY DISABLED: Allow all users to access all features during onboarding
  if (false /* isUserRoute || isTuneMutation || isMLService */) {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return new NextResponse(JSON.stringify({ message: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET)
      await jwtVerify(token, secret)
    } catch (error) {
      console.error('JWT Verification Error:', error)
      return new NextResponse(JSON.stringify({ message: 'Invalid or expired token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // ── Security headers ─────────────────────────────────────────────────────────
  const response = NextResponse.next()

  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  if (pathname === '/api/map-proxy') {
    response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  } else {
    response.headers.set('X-Frame-Options', 'DENY')
  }

  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
      "script-src-elem 'self' 'unsafe-inline' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src * data: blob:",
      "connect-src 'self' http://localhost:8000 https://generativelanguage.googleapis.com https://*.turso.io https://va.vercel-scripts.com https://vitals.vercel-insights.com",
      "frame-src 'self'",
    ].join('; ')
  )

  return response
}
