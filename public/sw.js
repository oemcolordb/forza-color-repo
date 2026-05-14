// Service Worker for PWA functionality
const APP_VERSION = '1.0.1'
const CACHE_NAME = `forza-colors-v${APP_VERSION}`
const STATIC_CACHE = `forza-static-v${APP_VERSION}`
const DYNAMIC_CACHE = `forza-dynamic-v${APP_VERSION}`

// Detect development mode
const isDev = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1'

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
]

// Install event
self.addEventListener('install', event => {
  if (!isDev) {
    event.waitUntil(
      caches.open(STATIC_CACHE).then(cache => {
        // Use individual add to prevent one failure from breaking the whole cache
        return Promise.allSettled(
          STATIC_ASSETS.map(url =>
            cache.add(url).catch(err => {
              console.warn(`Failed to cache ${url}:`, err)
            })
          )
        )
      }).catch(err => {
        console.error('Static cache open failed:', err)
      })
    )
  }
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name.startsWith('forza-')).map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
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
  // Skip service worker in development mode
  if (isDev) {
    return
  }

  const { request } = event
  const url = new URL(request.url)

  // Force fresh fetch for ALL HTML pages and navigation requests
  if (request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html') || request.destination === 'document') {
    event.respondWith(
      fetch(request, {
        cache: 'no-store',
        mode: 'navigate',
        credentials: 'same-origin',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
        .then(response => {
          // Check for version change header
          const versionChanged = response.headers.get('X-App-Version-Changed')
          const currentVersion = response.headers.get('X-App-Version')

          if (versionChanged === 'true') {
            // Version changed, notify clients
            self.clients.matchAll().then(clients => {
              clients.forEach(client => {
                client.postMessage({
                  type: 'VERSION_UPDATE',
                  version: currentVersion
                })
              })
            })
          }

          return response
        })
        .catch(() => {
          // If network fails, try to return the exact cached page (ignoring query strings)
          return caches.match(request, { ignoreSearch: true }).then(response => {
            if (response) {
              return response
            }
            // Fallback to offline page if the route wasn't cached
            return caches.match('/offline.html').then(r => r || Response.error())
          })
        })
    )
    return
  }

  // Handle API requests - always fetch fresh
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request, { cache: 'no-store', credentials: 'same-origin' })
        .catch(() => {
          return caches.match(request).then(r => r || Response.error())
        })
    )
    return
  }

  // Handle static assets (CSS, JS, Images) - Cache First
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/images/') || STATIC_ASSETS.includes(url.pathname)) {
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
      // Handle offline actions when back online
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
