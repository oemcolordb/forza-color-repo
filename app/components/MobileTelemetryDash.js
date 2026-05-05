'use client'
import React, { useState, useEffect } from 'react'

const MobileTelemetryDash = () => {
  const [data, setData] = useState(null)
  const [connected, setConnected] = useState(false)
  const [serverIP, setServerIP] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setServerIP(localStorage.getItem('telemetryIP') || '')
    }
  }, [])

  useEffect(() => {
    if (!serverIP) return

    const ws = new WebSocket(`ws://${serverIP}:8080`)

    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onmessage = event => setData(JSON.parse(event.data))
    ws.onerror = () => setConnected(false)

    return () => ws.close()
  }, [serverIP])

  const handleConnect = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('telemetryIP', serverIP)
      window.location.reload()
    }
  }

  if (!serverIP || !connected) {
    return (
      <div className="min-h-screen text-white p-4 flex flex-col justify-center">
        <div className="max-w-sm mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-center">🏎️ Forza Telemetry</h1>

          {/* Why we need an IP explanation */}
          <div className="mb-5 p-4 rounded-lg bg-yellow-900/40 border border-yellow-600/40 text-sm text-yellow-200 space-y-2">
            <p className="font-semibold text-yellow-300">📡 Why do I need to enter an IP?</p>
            <p>
              Browsers can&apos;t receive UDP data directly — it&apos;s a browser security limit.
              Forza outputs telemetry as raw UDP packets, so a tiny bridge converts them to
              WebSocket so this page can display them live.
            </p>
            <p>
              The bridge runs on your gaming PC on port <span className="font-mono text-white">8080</span>.
              If you&apos;re on the same PC, enter <span className="font-mono text-white">localhost</span>.
              On a phone or second screen, enter your PC&apos;s local IP address.
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="e.g. localhost or 192.168.1.100"
              value={serverIP}
              onChange={e => setServerIP(e.target.value)}
              className="w-full p-3 bamboo-input rounded"
            />
            <button onClick={handleConnect} className="w-full p-3 bamboo-button rounded font-bold">
              Connect to Bridge
            </button>
          </div>

          <div className="mt-5 p-3 rounded bg-black/30 text-xs text-gray-400 space-y-1">
            <p className="text-gray-300 font-semibold">Before connecting:</p>
            <p>1. Open a terminal on your gaming PC</p>
            <p>2. Run: <span className="font-mono text-green-400">node server.js</span></p>
            <p>3. In Forza: Settings → HUD → Data Out <span className="font-mono text-white">ON</span>, Port <span className="font-mono text-white">5300</span></p>
            <p>4. Enter your PC IP above and hit Connect</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-green-500 text-xl mb-2">●</div>
          <p>Waiting for telemetry data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white p-2">
      {/* Speed & RPM */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-4 rounded text-center bamboo-surface-dark">
          <div className="text-3xl font-bold text-[color:var(--bamboo-stalk)]">{data.speed.toFixed(0)}</div>
          <div className="text-sm text-gray-400">m/s</div>
          <div className="text-xs text-gray-500">{(data.speed * 3.6).toFixed(0)} km/h</div>
        </div>
        <div className="p-4 rounded text-center bamboo-surface-dark">
          <div className="text-3xl font-bold text-red-400">{data.currentEngineRpm.toFixed(0)}</div>
          <div className="text-sm text-gray-400">RPM</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all"
              style={{ width: `${(data.currentEngineRpm / data.engineMaxRpm) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Gear & Inputs */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="p-3 rounded text-center bamboo-surface-dark">
          <div className="text-2xl font-bold">{data.gear === 0 ? 'R' : data.gear}</div>
          <div className="text-xs text-gray-400">GEAR</div>
        </div>
        <div className="p-3 rounded text-center bamboo-surface-dark">
          <div className="text-lg font-bold">{((data.throttle / 255) * 100).toFixed(0)}%</div>
          <div className="text-xs text-gray-400">THR</div>
        </div>
        <div className="p-3 rounded text-center bamboo-surface-dark">
          <div className="text-lg font-bold">{((data.brake / 255) * 100).toFixed(0)}%</div>
          <div className="text-xs text-gray-400">BRK</div>
        </div>
        <div className="p-3 rounded text-center bamboo-surface-dark">
          <div className="text-lg font-bold">{data.power.toFixed(0)}</div>
          <div className="text-xs text-gray-400">HP</div>
        </div>
      </div>

      {/* Tire Temps */}
      <div className="p-3 rounded mb-4 bamboo-surface-dark">
        <div className="text-sm text-gray-400 mb-2">Tire Temperatures</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span>FL:</span>
            <span>{data.tireTemp[0].toFixed(0)}°C</span>
          </div>
          <div className="flex justify-between">
            <span>FR:</span>
            <span>{data.tireTemp[1].toFixed(0)}°C</span>
          </div>
          <div className="flex justify-between">
            <span>RL:</span>
            <span>{data.tireTemp[2].toFixed(0)}°C</span>
          </div>
          <div className="flex justify-between">
            <span>RR:</span>
            <span>{data.tireTemp[3].toFixed(0)}°C</span>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="text-center text-xs text-gray-500">
        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
        Connected to {serverIP}
      </div>
    </div>
  )
}

export default MobileTelemetryDash
