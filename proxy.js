import { NextResponse } from 'next/server'

// ─── Protected data files ────────────────────────────────────────────────────
// These JSON files contain the full car / tune databases and should never be
// served to direct browser navigation, cross-site requests, or known bots.
const PROTECTED_DATA = ['/cars.json', '/tuneforge-cars-full.json', '/discord-manifest.json']

// ─── Known bot / scraper User-Agent patterns ────────────────────────────────
const BOT_UA = /curl|wget|python-requests|httpx|scrapy|bot|spider|crawl|go-http|java\//i

// ─── In-memory rate limiter (best-effort; resets on cold start) ──────────────
const _rl = new Map()
const WINDOW = 60_000 // 1 minute

function isRateLimited(key, max) {
  const now = Date.now()
  const e = _rl.get(key)
  if (!e || now - e.s > WINDOW) {
    _rl.set(key, { c: 1, s: now })
    return false
  }
  e.c++
  return e.c > max
}

export function proxy(request) {
  const { pathname } = request.nextUrl
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '0.0.0.0'
  const ua = request.headers.get('user-agent') ?? ''
  const fetchSite = request.headers.get('sec-fetch-site') // same-origin | cross-site | none | null
  const fetchMode = request.headers.get('sec-fetch-mode') // navigate | cors | no-cors | same-origin

  // ── Block bots / scrapers on ALL routes ─────────────────────────────────────
  if (!ua || BOT_UA.test(ua)) {
    const isApi = pathname.startsWith('/api/')
    return new NextResponse(isApi ? JSON.stringify({ error: 'Forbidden' }) : null, {
      status: 403,
      headers: isApi ? { 'Content-Type': 'application/json' } : {},
    })
  }

  // ── Protect raw data JSON files ──────────────────────────────────────────────
  if (PROTECTED_DATA.some(p => pathname === p)) {
    // Direct browser navigation (user typed the URL or opened it in a tab)
    const isDirect = fetchMode === 'navigate' && (fetchSite === 'none' || !fetchSite)
    // Request coming from a different website
    const isCrossSite = fetchSite === 'cross-site'

    if (isDirect || isCrossSite) {
      return new NextResponse(null, { status: 403 })
    }

    // Rate-limit data file fetches per IP (20 req/min)
    if (isRateLimited(`data:${ip}`, 20)) {
      return new NextResponse(null, {
        status: 429,
        headers: { 'Retry-After': '60' },
      })
    }
  }

  // ── Rate-limit API routes (100 req/min per IP) ───────────────────────────────
  if (pathname.startsWith('/api/')) {
    if (isRateLimited(`api:${ip}`, 100)) {
      return new NextResponse(JSON.stringify({ error: 'Too many requests. Slow down.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
      })
    }
  }

  // ── Security headers on all other responses ──────────────────────────────────
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://generativelanguage.googleapis.com https://*.turso.io"
  )

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)', '/api/:path*'],
}
