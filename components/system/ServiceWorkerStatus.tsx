'use client'

import { useEffect, useState } from 'react'

interface SwStatus {
  registered: boolean
  updateAvailable: boolean
  cacheVersion: string | null
  error: string | null
}

export default function ServiceWorkerStatus() {
  const [status, setStatus] = useState<SwStatus>({
    registered: false,
    updateAvailable: false,
    cacheVersion: null,
    error: null,
  })
  const [isDev, setIsDev] = useState(false)
  const [showDev, setShowDev] = useState(false)

  useEffect(() => {
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    setIsDev(isDev)

    // Check if SW registered via global flag set by layout.js
    const registered = (window as any).__SW_REGISTERED__ ?? false
    const updateAvailable = (window as any).__SW_UPDATE_AVAILABLE__ ?? false

    setStatus(prev => ({
      ...prev,
      registered,
      updateAvailable,
    }))

    // Check cache version from CacheStorage
    if ('caches' in window && registered) {
      caches.keys().then(names => {
        const versionCache = names.find(name => name.startsWith('forza-colors-v'))
        if (versionCache) {
          const version = versionCache.replace('forza-colors-v', '')
          setStatus(prev => ({
            ...prev,
            cacheVersion: version,
          }))
        }
      })
    }

    // Listen for SW update messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data.type === 'VERSION_UPDATE') {
          setStatus(prev => ({
            ...prev,
            updateAvailable: true,
            cacheVersion: event.data.version,
          }))
        }
      })
    }
  }, [])

  const handleEnableDevSW = () => {
    localStorage.setItem('DEV_SW_ENABLED', 'true')
    window.location.reload()
  }

  const handleUpdateSW = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.update()
      })
    }
  }

  // Don't show in production unless explicitly requested
  if (!isDev && !showDev) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-xs bg-gray-900 border border-gray-700 rounded-lg p-4 text-xs text-gray-300 shadow-lg z-50">
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-2 h-2 rounded-full ${
            status.registered ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="font-semibold">
          {status.registered ? '✓ SW Active' : '✗ SW Inactive'}
        </span>
      </div>

      <div className="space-y-1 text-gray-400">
        <div>Cache: {status.cacheVersion || 'Not available'}</div>
        {status.updateAvailable && (
          <div className="text-yellow-400">
            ⚠ Update available
            <button
              onClick={handleUpdateSW}
              className="ml-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
            >
              Update
            </button>
          </div>
        )}
      </div>

      {isDev && (
        <div className="mt-3 pt-3 border-t border-gray-700 space-y-1">
          <div className="text-gray-500">Dev Mode</div>
          {!status.registered && (
            <button
              onClick={handleEnableDevSW}
              className="w-full px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
            >
              Enable SW
            </button>
          )}
          <a
            href="/dev/sw-diagnostics"
            className="block px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-center text-blue-400"
          >
            View Diagnostics
          </a>
        </div>
      )}

      <button
        onClick={() => setShowDev(!showDev)}
        className="mt-2 text-gray-500 hover:text-gray-300 text-xs"
      >
        {showDev ? 'Hide' : 'Show Details'}
      </button>
    </div>
  )
}
