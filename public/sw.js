// Service Worker for PWA functionality
const CACHE_NAME = 'forza-colors-v2'
const STATIC_CACHE = 'forza-static-v2'
const DYNAMIC_CACHE = 'forza-dynamic-v2'

// Detect development mode
const isDev = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1'

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/_next/static/css/app/layout.css',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/main.js',
]

// Install event
self.addEventListener('install', event => {
  if (!isDev) {
    event.waitUntil(
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll(STATIC_ASSETS).catch(err => {
          console.warn('Cache addAll failed:', err)
        })
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
        cacheNames.map(cacheName => {
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

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (request.method === 'GET' && request.url.startsWith('http') && response.status === 200) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          return caches.match(request).then(r => r || Response.error())
        })
    )
    return
  }

  // Handle static assets
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request)
      })
    )
    return
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (request.method === 'GET' && request.url.startsWith('http') && response.status === 200) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          return caches.match('/offline.html').then(r => r || Response.error())
        })
    )
    return
  }

  // Handle other requests
  event.respondWith(
    caches.match(request).then(response => {
      if (response) return response
      return fetch(request)
        .then(fetchResponse => {
          if (request.method === 'GET' && request.url.startsWith('http') && fetchResponse.status === 200) {
            const responseClone = fetchResponse.clone()
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone)
            })
          }
          return fetchResponse
        })
        .catch(() => Response.error())
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
