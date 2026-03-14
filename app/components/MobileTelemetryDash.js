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
          <h1 className="text-2xl font-bold mb-6 text-center">Forza Telemetry</h1>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="PC IP Address (e.g., 192.168.1.100)"
              value={serverIP}
              onChange={e => setServerIP(e.target.value)}
              className="w-full p-3 bamboo-input"
            />
            <button onClick={handleConnect} className="w-full p-3 bamboo-button rounded font-bold">
              Connect
            </button>
          </div>
          <div className="mt-6 text-sm text-gray-400">
            <p>1. Run telemetry server on PC</p>
            <p>2. Enter PC's IP address</p>
            <p>3. Start Forza Horizon 5</p>
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
