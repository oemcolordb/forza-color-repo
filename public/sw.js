// Service Worker for PWA functionality
let APP_VERSION = '1.0.0'
let CACHE_NAME = `forza-colors-v${APP_VERSION}`
let STATIC_CACHE = `forza-static-v${APP_VERSION}`
let DYNAMIC_CACHE = `forza-dynamic-v${APP_VERSION}`

// Detect development mode
const isDev = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1'

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/tuneforge',
  '/location-finder',
]

// Fetch and update version from API
async function updateAppVersion() {
  try {
    if (!isDev) {
      const response = await fetch('/api/version', { method: 'HEAD', cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        if (data.version && data.version !== APP_VERSION) {
          const oldVersion = APP_VERSION
          APP_VERSION = data.version
          CACHE_NAME = `forza-colors-v${APP_VERSION}`
          STATIC_CACHE = `forza-static-v${APP_VERSION}`
          DYNAMIC_CACHE = `forza-dynamic-v${APP_VERSION}`

          console.log(`[SW] Version updated: ${oldVersion} → ${APP_VERSION}`)
          return true // Version changed
        }
      }
    }
  } catch (err) {
    console.warn('[SW] Failed to check version:', err.message)
  }
  return false // Version unchanged
}

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    updateAppVersion().then(() => {
      if (!isDev) {
        return caches.open(STATIC_CACHE).then(cache => {
          // Use individual add to prevent one failure from breaking the whole cache
          return Promise.allSettled(
            STATIC_ASSETS.map(url =>
              cache.add(url).catch(err => {
                console.warn(`[SW] Failed to cache ${url}:`, err.message)
              })
            )
          )
        }).catch(err => {
          console.error('[SW] Static cache open failed:', err.message)
        })
      }
    })
  )
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    updateAppVersion().then(() => {
      return caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.filter(name => name.startsWith('forza-')).map(cacheName => {
            // Delete caches that don't match current version
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log(`[SW] Deleting old cache: ${cacheName}`)
              return caches.delete(cacheName)
            }
          })
        )
      })
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

  // Smart caching for HTML pages and navigation requests
  if (request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html') || request.destination === 'document') {
    event.respondWith(
      // Try network first, with aggressive timeout
      Promise.race([
        fetch(request, {
          cache: 'no-store',
          mode: 'navigate',
          credentials: 'same-origin',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }),
        // 8 second timeout - if network is slow, try cache
        new Promise(resolve => setTimeout(() => resolve(null), 8000))
      ])
        .then(response => {
          if (!response) {
            // Network timeout - try cache
            return caches.match(request, { ignoreSearch: true }).then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse
              }
              // No cache available, let page load without full offline.html redirect
              return Response.error()
            })
          }

          // Cache successful responses
          const responseToCache = response.clone()
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request.url, responseToCache).catch(err => {
              console.warn(`Failed to cache ${request.url}:`, err)
            })
          })

          // Check for version change header
          const versionChanged = response.headers.get('X-App-Version-Changed')
          const currentVersion = response.headers.get('X-App-Version')

          if (versionChanged === 'true' && currentVersion) {
            // Version changed, notify clients
            self.clients.matchAll().then(clients => {
              clients.forEach(client => {
                client.postMessage({
                  type: 'VERSION_UPDATE',
                  version: currentVersion,
                })
              })
            })
          }

          return response
        })
        .catch(err => {
          console.error('[SW] Fetch failed, trying cache:', err.message)
          // Network error - try cache first
          return caches.match(request, { ignoreSearch: true }).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse
            }
            // Last resort: return offline page only if available
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
