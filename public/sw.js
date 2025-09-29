const CACHE_NAME = 'forza-colors-v1'
const STATIC_CACHE = 'forza-static-v1'

const STATIC_ASSETS = [
  '/',
  '/manifest.json'
]

const API_CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Cache color data (only GET requests)
  if (request.method === 'GET' && (url.pathname.includes('colorData') || url.pathname.startsWith('/api/'))) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request)
        
        if (cachedResponse) {
          const cachedDate = new Date(cachedResponse.headers.get('sw-cached-date') || 0)
          if (Date.now() - cachedDate.getTime() < API_CACHE_DURATION) {
            return cachedResponse
          }
        }

        try {
          const networkResponse = await fetch(request)
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone()
            const headers = new Headers(responseClone.headers)
            headers.set('sw-cached-date', new Date().toISOString())
            cache.put(request, new Response(responseClone.body, {
              status: responseClone.status,
              statusText: responseClone.statusText,
              headers
            }))
          }
          return networkResponse
        } catch (error) {
          return cachedResponse || new Response('Offline', { status: 503 })
        }
      })
    )
    return
  }

  // Default network first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  )
})