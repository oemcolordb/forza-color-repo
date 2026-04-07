'use client'

export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import TelemetryDashboard from '../components/TelemetryDashboard'
import TokyoBackground from '../components/TokyoBackground'
import { getSecureAssetUrl } from '../lib/assetProtection'

export default function TelemetryPage() {
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    setIsDarkMode(savedTheme !== 'light')
  }, [])

  return (
    <div
      className={`min-h-screen ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
    >
      <TokyoBackground isDarkMode={isDarkMode} getSecureAssetUrl={getSecureAssetUrl} />

      <div className="relative z-10 max-w-6xl mx-auto p-4">
        {/* Engine Bay - Header */}
        <div
          className={`relative mb-6 rounded-xl overflow-hidden p-6 ${
            isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'
          }`}
        >
          <div className="absolute top-2 left-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span
                className={`text-xs font-mono ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}
              >
                TELEMETRY SYSTEM
              </span>
            </div>
          </div>
          <div className="mt-4">
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-yellow-400 to-red-400 text-transparent bg-clip-text">
              🏎️ Forza Horizon 5 Telemetry
            </h1>
          </div>
        </div>

        {/* Dashboard - Setup Instructions */}
        <div
          className={`relative mb-6 rounded-xl overflow-hidden p-6 ${
            isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'
          }`}
        >
          <div className="absolute top-2 left-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span
                className={`text-xs font-mono ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
              >
                SETUP GUIDE
              </span>
            </div>
          </div>
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              ⚙️ <span>Setup Instructions</span>
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-sm">
              <li>
                Install{' '}
                <a
                  href="https://nodejs.org/en/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 underline hover:text-orange-300"
                >
                  Node.js
                </a>{' '}
                (LTS version) on your PC if you haven&apos;t already
              </li>
              <li>
                Download{' '}
                <a
                  href="/server.js"
                  download="server.js"
                  className="text-orange-400 underline hover:text-orange-300"
                >
                  server.js
                </a>{' '}
                and run it with:{' '}
                <code className="bg-black/40 px-1 rounded text-green-400">node server.js</code>
              </li>
              <li>In Forza Horizon 5, go to Settings → HUD and Gameplay</li>
              <li>Set &quot;Data Out&quot; to &quot;On&quot;</li>
              <li>Set &quot;Data Out IP Address&quot; to &quot;127.0.0.1&quot;</li>
              <li>Set &quot;Data Out IP Port&quot; to &quot;5300&quot;</li>
              <li>Set &quot;Data Out Packet Format&quot; to &quot;Dash&quot;</li>
              <li>Refresh this page — the dashboard below will connect automatically</li>
            </ol>
          </div>
        </div>

        {/* Control Panel - Telemetry Dashboard */}
        <div
          className={`relative rounded-xl overflow-hidden p-6 ${
            isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'
          }`}
        >
          <div className="absolute top-2 left-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span
                className={`text-xs font-mono ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}
              >
                LIVE DATA
              </span>
            </div>
          </div>
          <div className="mt-6">
            <TelemetryDashboard />
          </div>
        </div>
      </div>
    </div>
  )
}
