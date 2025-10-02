import React, { useState, useEffect } from 'react'

const formatTime = (seconds) => {
  if (!seconds || seconds === 0) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(3)
  return `${mins}:${secs.padStart(6, '0')}`
}

const TelemetryDashboard = () => {
  const [telemetryData, setTelemetryData] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // WebSocket connection for real-time telemetry data
    const ws = new WebSocket('ws://localhost:8080/telemetry')
    
    ws.onopen = () => setIsConnected(true)
    ws.onclose = () => setIsConnected(false)
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setTelemetryData(data)
    }

    return () => ws.close()
  }, [])

  if (!telemetryData) {
    return (
      <div className="p-4 bg-gray-900 text-white rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>Forza Telemetry {isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <p>Waiting for telemetry data...</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span>Forza Telemetry Connected</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-3 rounded">
          <div className="text-sm text-gray-400">Speed</div>
          <div className="text-xl font-bold">{telemetryData.speed.toFixed(0)} m/s</div>
          <div className="text-xs text-gray-500">{(telemetryData.speed * 3.6).toFixed(0)} km/h</div>
        </div>

        <div className="bg-gray-800 p-3 rounded">
          <div className="text-sm text-gray-400">RPM</div>
          <div className="text-xl font-bold">{telemetryData.currentEngineRpm.toFixed(0)}</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all"
              style={{ width: `${(telemetryData.currentEngineRpm / telemetryData.engineMaxRpm) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gray-800 p-3 rounded">
          <div className="text-sm text-gray-400">Gear</div>
          <div className="text-xl font-bold">
            {telemetryData.gear === 0 ? 'R' : telemetryData.gear}
          </div>
        </div>

        <div className="bg-gray-800 p-3 rounded">
          <div className="text-sm text-gray-400">Throttle</div>
          <div className="text-xl font-bold">{((telemetryData.throttle / 255) * 100).toFixed(0)}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-3 rounded">
          <div className="text-sm text-gray-400 mb-2">Tire Temperatures</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>FL: {telemetryData.tireTemp[0].toFixed(0)}°C</div>
            <div>FR: {telemetryData.tireTemp[1].toFixed(0)}°C</div>
            <div>RL: {telemetryData.tireTemp[2].toFixed(0)}°C</div>
            <div>RR: {telemetryData.tireTemp[3].toFixed(0)}°C</div>
          </div>
        </div>

        <div className="bg-gray-800 p-3 rounded">
          <div className="text-sm text-gray-400 mb-2">Tire Slip Ratio</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={telemetryData.tireSlipRatio[0] > 1 ? 'text-red-400' : ''}>
              FL: {telemetryData.tireSlipRatio[0].toFixed(2)}
            </div>
            <div className={telemetryData.tireSlipRatio[1] > 1 ? 'text-red-400' : ''}>
              FR: {telemetryData.tireSlipRatio[1].toFixed(2)}
            </div>
            <div className={telemetryData.tireSlipRatio[2] > 1 ? 'text-red-400' : ''}>
              RL: {telemetryData.tireSlipRatio[2].toFixed(2)}
            </div>
            <div className={telemetryData.tireSlipRatio[3] > 1 ? 'text-red-400' : ''}>
              RR: {telemetryData.tireSlipRatio[3].toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-3 rounded">
          <div className="text-sm text-gray-400">Power</div>
          <div className="text-xl font-bold">{telemetryData.power.toFixed(0)} HP</div>
        </div>
        
        <div className="bg-gray-800 p-3 rounded">
          <div className="text-sm text-gray-400">Boost</div>
          <div className="text-xl font-bold">{telemetryData.boost.toFixed(1)} PSI</div>
        </div>
        
        <div className="bg-gray-800 p-3 rounded">
          <div className="text-sm text-gray-400">Fuel</div>
          <div className="text-xl font-bold">{telemetryData.fuel.toFixed(1)}%</div>
        </div>
        
        <div className="bg-gray-800 p-3 rounded">
          <div className="text-sm text-gray-400">Best Lap</div>
          <div className="text-xl font-bold">{formatTime(telemetryData.bestLap)}</div>
        </div>
      </div>
    </div>
  )
}

export default TelemetryDashboard