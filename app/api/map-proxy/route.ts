/**
 * /api/map-proxy
 *
 * Server-side reverse proxy for the FH5 interactive map embed.
 * Bypasses CSP iframe restrictions by fetching the external map HTML on the
 * server, stripping X-Frame-Options / CSP frame-ancestors headers, injecting
 * a <base> tag so relative asset paths resolve correctly, and serving the
 * result from our own origin.
 *
 * Proxy rotation: on each request a random SOCKS proxy is selected from the
 * bundled proxy-list.json. Up to MAX_PROXY_ATTEMPTS proxies are tried before
 * falling back to a direct fetch. Set SOCKS5_PROXY_URL to force a specific
 * proxy instead of using the random pool.
 */

import { NextRequest, NextResponse } from 'next/server'
import PROXY_LIST from './proxy-list.json'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const ALLOWED_HOST = 'swissgameguides.app'
const TARGET_BASE  = 'https://swissgameguides.app'
const DEFAULT_PATH = '/maps/forza_horizon_5/mexico'

/** How many random proxies to try before giving up and falling back to direct. */
const MAX_PROXY_ATTEMPTS = 3

/** Response Cache-Control sent to the browser. */
const CACHE_CC = 'public, max-age=60, stale-while-revalidate=120'

// ---------------------------------------------------------------------------
// Proxy helpers
// ---------------------------------------------------------------------------

function pickRandomProxy(): string {
  const list = PROXY_LIST as string[]
  return list[Math.floor(Math.random() * list.length)]
}

/**
 * Fetch a URL through a single SOCKS proxy using node-fetch.
 * Throws on any network or agent error.
 */
async function fetchViaProxy(url: string, proxyUrl: string, init: RequestInit): Promise<Response> {
  const { SocksProxyAgent } = await import('socks-proxy-agent')
  const agent = new SocksProxyAgent(proxyUrl)
  const nodeFetch = (await import('node-fetch')).default
  return nodeFetch(url, { ...init, agent } as Parameters<typeof nodeFetch>[1]) as unknown as Response
}

/**
 * Fetch a URL, trying up to MAX_PROXY_ATTEMPTS random SOCKS proxies.
 * Falls back to direct fetch if all proxies fail.
 * Set SOCKS5_PROXY_URL env var to pin a specific proxy.
 */
async function proxyFetch(url: string, init: RequestInit = {}): Promise<Response> {
  // Env var override — use exactly this proxy (legacy / CI use).
  const pinnedProxy = process.env.SOCKS5_PROXY_URL
  if (pinnedProxy) {
    try {
      return await fetchViaProxy(url, pinnedProxy, init)
    } catch (err) {
      console.warn('[map-proxy] Pinned proxy failed, falling through to pool:', err)
    }
  }

  // Random rotation with failover.
  const tried = new Set<string>()
  for (let attempt = 0; attempt < MAX_PROXY_ATTEMPTS; attempt++) {
    const proxy = pickRandomProxy()
    if (tried.has(proxy)) continue
    tried.add(proxy)
    try {
      const result = await fetchViaProxy(url, proxy, init)
      return result
    } catch (err) {
      console.warn(`[map-proxy] Proxy ${proxy} attempt ${attempt + 1} failed:`, (err as Error).message)
    }
  }

  // All proxies failed — direct fetch fallback.
  console.warn('[map-proxy] All proxy attempts exhausted, using direct fetch')
  return fetch(url, init)
}

/** Common upstream request headers — appear as a real browser. */
const UPSTREAM_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'identity',
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export const runtime = 'nodejs'   // needs net/tls for SOCKS5
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  // Accept an explicit ?url= param (validated) or default to the FH5 map.
  let targetUrl: string

  const urlParam = searchParams.get('url')
  if (urlParam) {
    let parsed: URL
    try {
      parsed = new URL(urlParam)
    } catch {
      return NextResponse.json({ error: 'Invalid url parameter' }, { status: 400 })
    }
    if (parsed.hostname !== ALLOWED_HOST) {
      return NextResponse.json({ error: 'Forbidden: host not whitelisted' }, { status: 403 })
    }
    targetUrl = urlParam
  } else {
    // Also support ?path= to proxy a specific sub-path of the allowed host.
    const pathParam = searchParams.get('path') ?? DEFAULT_PATH
    // Strip any attempt to escape the allowed host via path traversal.
    const safePath = '/' + pathParam.replace(/^\/+/, '').replace(/\.\.\//g, '')
    targetUrl = `${TARGET_BASE}${safePath}`
  }

  try {
    const upstream = await proxyFetch(targetUrl, { headers: UPSTREAM_HEADERS })

    const contentType = upstream.headers.get('content-type') ?? 'text/html'

    // ── HTML responses ────────────────────────────────────────────────────────
    if (contentType.includes('text/html')) {
      let html = await upstream.text()

      // Inject <base> so relative asset paths (CSS / JS / fonts / API calls)
      // in the upstream SPA resolve against the upstream origin, not ours.
      const baseTag = `<base href="${TARGET_BASE}/" target="_blank">`
      if (/<head[^>]*>/i.test(html)) {
        html = html.replace(/(<head[^>]*>)/i, `$1${baseTag}`)
      } else {
        // No <head> tag — prepend base tag at the top.
        html = baseTag + html
      }

      const headers = new Headers({
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': CACHE_CC,
        // Explicitly allow framing from our own origin only.
        'X-Frame-Options': 'SAMEORIGIN',
        // Do NOT propagate the upstream X-Frame-Options or CSP frame-ancestors.
      })

      return new NextResponse(html, { status: upstream.status, headers })
    }

    // ── Non-HTML (CSS, JS, images, JSON …) ───────────────────────────────────
    // Pass through the body; strip any frame-blocking headers.
    const body = await upstream.arrayBuffer()
    const headers = new Headers({ 'Content-Type': contentType })

    // Forward safe caching headers if present.
    const cc = upstream.headers.get('cache-control')
    if (cc) headers.set('Cache-Control', cc)

    return new NextResponse(body, { status: upstream.status, headers })
  } catch (err) {
    console.error('[map-proxy] Upstream fetch failed:', err)
    return NextResponse.json({ error: 'Upstream fetch failed' }, { status: 502 })
  }
}
