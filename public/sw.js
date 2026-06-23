// Service Worker for PWA functionality
const APP_VERSION = '1.0.0'
const CACHE_NAME = `forza-colors-v${APP_VERSION}`
const STATIC_CACHE = `forza-static-v${APP_VERSION}`
const DYNAMIC_CACHE = `forza-dynamic-v${APP_VERSION}`

// Detect development mode
const isDev =
  self.location.hostname === 'localhost' ||
  self.location.hostname === '127.0.0.1' ||
  self.location.hostname === '[::1]' ||
  self.location.hostname.startsWith('192.168.') ||
  self.location.hostname.startsWith('10.') ||
  self.location.hostname.startsWith('172.') ||
  self.location.hostname.endsWith('.local')

const STATIC_ASSETS = ['/manifest.json', '/offline.html', '/tuneforge/']

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(cache => {
        return Promise.allSettled(
          STATIC_ASSETS.map(url =>
            cache.add(url).catch(err => {
              console.warn(`[SW] Failed to cache ${url}:`, err.message)
            })
          )
        )
      })
      .catch(err => {
        console.error('[SW] Static cache open failed:', err.message)
      })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('forza-'))
          .map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log(`[SW] Deleting old cache: ${cacheName}`)
              return caches.delete(cacheName)
            }
          })
      )
    })
  )
  self.clients.claim()
})

// Fetch event
self.addEventListener('fetch', event => {
  const { request } = event

  // Skip service worker in development mode
  if (isDev) {
    return
  }

  // Only handle HTTP/HTTPS requests — skip blob:, data:, etc.
  if (!request.url.startsWith('http://') && !request.url.startsWith('https://')) {
    return
  }

  const url = new URL(request.url)

  // Let browser handle navigation requests (page loads) normally — never intercept them
  // This prevents false offline pages and stale cache issues
  if (request.mode === 'navigate' || url.pathname === '/' || request.destination === 'document') {
    return
  }

  // Handle API requests - always fetch fresh
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request, { cache: 'no-store', credentials: 'same-origin' }).catch(() => {
        return caches.match(request).then(r => r || Response.error())
      })
    )
    return
  }

  // Handle static assets (CSS, JS, Images) - Cache First
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/images/') ||
    STATIC_ASSETS.includes(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).then(fetchRes => fetchRes)
      })
    )
    return
  }

  // Handle other requests - network first
  event.respondWith(
    fetch(request)
      .then(fetchResponse => {
        return fetchResponse
      })
      .catch(() => {
        return caches.match(request).then(response => {
          if (response) return response
          return Response.error()
        })
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      self.registration.showNotification('Forza Colors', {
        body: 'Your offline changes have been synced!',
        icon: '/icon-192.png',
      })
    )
  }
})

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New colors available!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  }

  event.waitUntil(self.registration.showNotification('Forza Colors', options))
})
