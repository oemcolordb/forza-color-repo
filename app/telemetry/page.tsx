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
      className={`min-h-screen ${
        isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800'
      }`}
    >
      <TokyoBackground isDarkMode={isDarkMode} getSecureAssetUrl={getSecureAssetUrl} />

      <div className="relative z-10 max-w-6xl mx-auto p-4">
        {/* Engine Bay - Header */}
        <div
          className={`relative mb-6 rounded-xl overflow-hidden ${
            isDarkMode
              ? 'bg-gradient-to-r from-gray-800 to-gray-900'
              : 'bg-gradient-to-r from-gray-100 to-gray-200'
          } border-2 ${isDarkMode ? 'border-orange-500/30' : 'border-orange-400/40'} p-6`}
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
          className={`relative mb-6 rounded-xl overflow-hidden ${
            isDarkMode
              ? 'bg-gradient-to-r from-slate-800 to-slate-900'
              : 'bg-gradient-to-r from-slate-100 to-slate-200'
          } border-2 ${isDarkMode ? 'border-blue-500/30' : 'border-blue-400/40'} p-6`}
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
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>In Forza Horizon 5, go to Settings → HUD and Gameplay</li>
              <li>Set "Data Out" to "On"</li>
              <li>Set "Data Out IP Address" to "127.0.0.1"</li>
              <li>Set "Data Out IP Port" to "9999"</li>
              <li>Set "Data Out Packet Format" to "Dash"</li>
            </ol>
          </div>
        </div>

        {/* Control Panel - Telemetry Dashboard */}
        <div
          className={`relative rounded-xl overflow-hidden ${
            isDarkMode
              ? 'bg-gradient-to-r from-green-800 to-green-900'
              : 'bg-gradient-to-r from-green-100 to-green-200'
          } border-2 ${isDarkMode ? 'border-green-500/30' : 'border-green-400/40'} p-6`}
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
