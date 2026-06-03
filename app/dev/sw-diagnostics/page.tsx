'use client'

import { useEffect, useState } from 'react'

interface CacheInfo {
  name: string
  size: number
  entries: number
}

interface SwDiagnostics {
  registered: boolean
  active: boolean
  updateAvailable: boolean
  status: string
  scope: string
  updateTime: string
  installTime: string
}

interface VersionInfo {
  version: string
  commit: string
  branch: string
  buildTime: string
}

export default function SWDiagnosticsPage() {
  const [swDiagnostics, setSwDiagnostics] = useState<SwDiagnostics | null>(null)
  const [caches, setCaches] = useState<CacheInfo[]>([])
  const [version, setVersion] = useState<VersionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        // Check Service Worker
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations()

          if (registrations.length > 0) {
            const reg = registrations[0]
            setSwDiagnostics({
              registered: true,
              active: !!reg.active,
              updateAvailable: !!reg.installing || !!reg.waiting,
              status: reg.active?.state || 'unknown',
              scope: reg.scope,
              updateTime: reg.updateViaCache,
              installTime: new Date(0).toISOString(), // Not available in API
            })
          } else {
            setSwDiagnostics({
              registered: false,
              active: false,
              updateAvailable: false,
              status: 'not registered',
              scope: 'N/A',
              updateTime: 'N/A',
              installTime: 'N/A',
            })
          }
        }

        // Check Caches
        if ('caches' in window) {
          const cacheNames = await caches.keys()
          const cacheInfo: CacheInfo[] = []

          for (const name of cacheNames) {
            const cache = await caches.open(name)
            const requests = await cache.keys()
            cacheInfo.push({
              name,
              entries: requests.length,
              size: 0, // Rough estimate
            })
          }

          setCaches(cacheInfo)
        }

        // Fetch version info
        const versionRes = await fetch('/api/version')
        if (versionRes.ok) {
          setVersion(await versionRes.json())
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    runDiagnostics()
  }, [])

  const handleClearCaches = async () => {
    try {
      const names = await caches.keys()
      await Promise.all(names.map(name => caches.delete(name)))
      alert('All caches cleared')
      window.location.reload()
    } catch (err) {
      alert('Error clearing caches: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const handleUnregisterSW = async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map(r => r.unregister()))
      alert('Service Worker unregistered')
      window.location.reload()
    } catch (err) {
      alert('Error unregistering SW: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const handleUpdateSW = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.update()
      alert('Service Worker update check complete')
    } catch (err) {
      alert('Error updating SW: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Service Worker Diagnostics</h1>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            <p className="mt-4 text-gray-400">Gathering diagnostics...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔧 Service Worker Diagnostics</h1>

        {error && (
          <div className="bg-red-900 border border-red-700 rounded p-4 mb-6">
            <p className="font-semibold">Error:</p>
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {/* Version Info */}
        {version && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">📦 App Version</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Version</p>
                <p className="text-lg font-mono text-blue-400">{version.version}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Commit</p>
                <p className="text-lg font-mono text-green-400">{version.commit}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Branch</p>
                <p className="text-lg font-mono text-yellow-400">{version.branch}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Build Time</p>
                <p className="text-sm font-mono text-gray-400">{new Date(version.buildTime).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Service Worker Status */}
        {swDiagnostics && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">🔄 Service Worker</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Status</span>
                <span className={`px-3 py-1 rounded ${swDiagnostics.registered ? 'bg-green-600' : 'bg-red-600'}`}>
                  {swDiagnostics.registered ? '✓ Registered' : '✗ Not Registered'}
                </span>
              </div>
              {swDiagnostics.registered && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Active</span>
                    <span className={`px-3 py-1 rounded ${swDiagnostics.active ? 'bg-green-600' : 'bg-yellow-600'}`}>
                      {swDiagnostics.active ? '✓ Yes' : '○ Waiting'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Update Available</span>
                    <span className={`px-3 py-1 rounded ${swDiagnostics.updateAvailable ? 'bg-yellow-600' : 'bg-gray-600'}`}>
                      {swDiagnostics.updateAvailable ? '⚠ Yes' : '○ No'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Scope</span>
                    <span className="font-mono text-sm">{swDiagnostics.scope}</span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              {swDiagnostics.registered ? (
                <>
                  <button
                    onClick={handleUpdateSW}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition"
                  >
                    Check for Updates
                  </button>
                  <button
                    onClick={handleUnregisterSW}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition"
                  >
                    Unregister
                  </button>
                </>
              ) : (
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition">
                  Reload Page
                </button>
              )}
            </div>
          </div>
        )}

        {/* Caches */}
        {caches.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">💾 Cache Storage</h2>
            <div className="space-y-2">
              {caches.map(cache => (
                <div key={cache.name} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                  <div>
                    <p className="font-mono text-sm text-blue-400">{cache.name}</p>
                    <p className="text-xs text-gray-400">{cache.entries} entries</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleClearCaches}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition"
            >
              Clear All Caches
            </button>
          </div>
        )}

        {/* Tests */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">✅ Quick Tests</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
              <input type="checkbox" disabled checked={typeof localStorage !== 'undefined'} />
              <span>LocalStorage available</span>
            </label>
            <label className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
              <input type="checkbox" disabled checked={'serviceWorker' in navigator} />
              <span>Service Worker API available</span>
            </label>
            <label className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
              <input type="checkbox" disabled checked={'caches' in window} />
              <span>Cache API available</span>
            </label>
            <label className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
              <input type="checkbox" disabled checked={window.location.protocol === 'https:'} />
              <span>HTTPS (required for SW)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
