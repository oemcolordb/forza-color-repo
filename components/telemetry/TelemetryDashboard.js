'use client'
import React, { useReducer, useEffect, useRef } from 'react'
import TelemetryMap from '@/components/telemetry/TelemetryMap'

// ─── helpers ────────────────────────────────────────────────────────────────

const formatTime = s => {
  if (!s || s === 0) return '--:--'
  const mins = Math.floor(s / 60)
  const secs = (s % 60).toFixed(3)
  return `${mins}:${secs.padStart(6, '0')}`
}

const G = 9.81

// Approximate tank size (litres) by car class index (0=D … 6=X)
const TANK_BY_CLASS = [50, 52, 55, 58, 65, 70, 75]

// Brake temp estimator – proxy using brake input × speed (°C)
// Runs every packet; passive cooling factor of 0.985 per tick
function estimateBrakeTemp(prev, data) {
  const input = data.brake / 255
  const heat  = input * (data.speed * 3.6) * 0.35
  return (prev ?? 20) * 0.985 + heat
}

// ─── reducer ────────────────────────────────────────────────────────────────

const initialState = {
  data: null,
  lapCoords: [],
  prevLapCoords: [],
  lapNumber: 0,
  sessionBestLap: null,
  brakeTemp: [20, 20, 20, 20],
  connected: false,
}

function telemetryReducer(state, action) {
  switch (action.type) {
    case 'CONNECT':    return { ...state, connected: true }
    case 'DISCONNECT': return { ...state, connected: false }
    case 'UPDATE': {
      const d = action.payload

      // Detect lap boundary
      const lapChanged = state.data !== null && d.lapNumber > state.lapNumber

      // Brake temp estimation (same proxy for all four — UDP has no direct field)
      const bt0 = estimateBrakeTemp(state.brakeTemp[0], d)
      const brakeTemp = [bt0, bt0, bt0 * 0.93, bt0 * 0.93]

      // Map trace coords – keep newest 8000 pts per lap; preserve previous lap
      const newCoord = [d.positionX, d.positionZ]
      const lapCoords     = lapChanged ? [newCoord] : [...state.lapCoords, newCoord].slice(-8000)
      const prevLapCoords = lapChanged ? state.lapCoords : state.prevLapCoords

      // Rolling session best lap
      const sessionBestLap =
        d.bestLap > 0
          ? state.sessionBestLap === null
            ? d.bestLap
            : Math.min(state.sessionBestLap, d.bestLap)
          : state.sessionBestLap

      return {
        ...state,
        data: d,
        lapCoords,
        prevLapCoords,
        lapNumber: lapChanged ? d.lapNumber : state.lapNumber,
        sessionBestLap,
        brakeTemp,
      }
    }
    default: return state
  }
}

// ─── memoised sub-components ────────────────────────────────────────────────

const StatCard = React.memo(function StatCard({ label, value, sub, accent }) {
  return (
    <div className="p-3 rounded bamboo-surface-dark" style={{ borderLeft: accent ? `3px solid ${accent}` : undefined }}>
      <div className="text-sm text-white/70">{label}</div>
      <div className="text-xl font-bold">{value}</div>
      {sub && <div className="text-xs text-white/50">{sub}</div>}
    </div>
  )
})

const RpmBar = React.memo(function RpmBar({ rpm, maxRpm }) {
  const pct  = maxRpm > 0 ? (rpm / maxRpm) * 100 : 0
  const color = pct > 90 ? '#ef4444' : pct > 75 ? '#facc15' : '#22c55e'
  return (
    <div className="p-3 rounded bamboo-surface-dark" style={{ borderLeft: '3px solid #ef4444' }}>
      <div className="text-sm text-white/70">RPM</div>
      <div className="text-xl font-bold">{rpm.toFixed(0)}</div>
      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
})

const GForcePanel = React.memo(function GForcePanel({ ax, az }) {
  const lat   = ax / G
  const lon   = az / G
  const total = Math.sqrt(lat * lat + lon * lon)
  const cx    = 40 + Math.max(-36, Math.min(36, lat * 22))
  const cy    = 40 - Math.max(-36, Math.min(36, lon * 22))
  const hot   = total > 1.5
  return (
    <div className="p-3 rounded bamboo-surface-dark">
      <div className="text-sm text-white/70 mb-2">G-Force</div>
      <div className="flex gap-3 items-center">
        <svg width="80" height="80" className="flex-shrink-0">
          <circle cx="40" cy="40" r="38" stroke="#444" strokeWidth="1" fill="none" />
          <circle cx="40" cy="40" r="25" stroke="#333" strokeWidth="1" fill="none" />
          <line x1="2"  y1="40" x2="78" y2="40" stroke="#333" strokeWidth="1" />
          <line x1="40" y1="2"  x2="40" y2="78" stroke="#333" strokeWidth="1" />
          <circle cx={cx} cy={cy} r="6" fill={hot ? '#ef4444' : '#22c55e'} />
        </svg>
        <div className="text-xs space-y-1">
          <div>Lat: <span className={Math.abs(lat) > 1.5 ? 'text-red-400' : 'text-green-400'}>{lat.toFixed(2)}g</span></div>
          <div>Lon: <span className={Math.abs(lon) > 1.5 ? 'text-red-400' : 'text-green-400'}>{lon.toFixed(2)}g</span></div>
          <div>Total: <span className="font-bold">{total.toFixed(2)}g</span></div>
        </div>
      </div>
    </div>
  )
})

const BoostGauge = React.memo(function BoostGauge({ boost }) {
  // FH5 UDP boost field is in bar; 0 bar = atmospheric, positive = boost pressure
  const psi = (boost * 14.5037).toFixed(1)
  const pct = Math.min(100, Math.max(0, (boost + 0.2) / 2.0 * 100))
  return (
    <div className="p-3 rounded bamboo-surface-dark">
      <div className="text-sm text-white/70">Boost</div>
      <div className="text-xl font-bold">{psi} PSI</div>
      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
        <div className="bg-blue-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs text-white/40 mt-1">{boost.toFixed(3)} bar</div>
    </div>
  )
})

const FuelPanel = React.memo(function FuelPanel({ fuel, carClass }) {
  const tankL    = TANK_BY_CLASS[carClass] ?? 60
  const fuelL    = (fuel * tankL).toFixed(1)
  const pct      = (fuel * 100).toFixed(1)
  const barColor = fuel < 0.15 ? '#ef4444' : fuel < 0.30 ? '#facc15' : '#22c55e'
  return (
    <div className="p-3 rounded bamboo-surface-dark">
      <div className="text-sm text-white/70">Fuel</div>
      <div className={`text-xl font-bold ${fuel < 0.15 ? 'text-red-400 animate-pulse' : ''}`}>{pct}%</div>
      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
      </div>
      <div className="text-xs text-white/40 mt-1">{fuelL}L / {tankL}L (est.)</div>
    </div>
  )
})

const TirePanel = React.memo(function TirePanel({ tireTemp, tireWear, tireSlipRatio, brakeTemp }) {
  const tempColor = t => {
    if (t < 70)  return '#60a5fa'  // cold – blue
    if (t < 90)  return '#22c55e'  // optimal – green
    if (t < 105) return '#facc15'  // hot – yellow
    return '#ef4444'                // overtemp – red
  }
  return (
    <div className="p-3 rounded bamboo-surface-dark">
      <div className="text-sm text-white/70 mb-2">Tires</div>
      <div className="grid grid-cols-2 gap-2">
        {['FL', 'FR', 'RL', 'RR'].map((l, i) => (
          <div key={l} className="text-xs space-y-1 p-2 rounded bg-black/20">
            <div className="flex justify-between font-bold">
              <span>{l}</span>
              <span style={{ color: tempColor(tireTemp[i]) }}>{tireTemp[i].toFixed(0)}°C</span>
            </div>
            <div className="w-full bg-gray-700 rounded h-1">
              <div className="h-1 rounded" style={{ width: `${Math.min(100, (tireTemp[i] - 40) / 80 * 100)}%`, background: tempColor(tireTemp[i]) }} />
            </div>
            <div className="flex justify-between text-white/55">
              <span>Wear</span>
              <span className={(tireWear?.[i] ?? 1) < 0.3 ? 'text-red-400' : ''}>{(((tireWear?.[i] ?? 1)) * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between text-white/55">
              <span>Slip</span>
              <span className={Math.abs(tireSlipRatio[i]) > 0.5 ? 'text-orange-400' : ''}>{tireSlipRatio[i].toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white/55">
              <span>Brk°</span>
              <span className={brakeTemp[i] > 400 ? 'text-red-400' : brakeTemp[i] > 200 ? 'text-yellow-400' : ''}>{brakeTemp[i].toFixed(0)}°C</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

const LapDelta = React.memo(function LapDelta({ currentLap, bestLap, sessionBestLap }) {
  if (!currentLap || currentLap <= 0) return null
  const delta    = bestLap > 0 ? currentLap - bestLap : null
  const sdelta   = sessionBestLap ? currentLap - sessionBestLap : null
  return (
    <div className="p-3 rounded bamboo-surface-dark">
      <div className="text-sm text-white/70 mb-1">Lap Delta</div>
      {delta !== null ? (
        <div className={`text-xl font-bold ${delta > 0 ? 'text-red-400' : 'text-green-400'}`}>
          {delta > 0 ? '+' : ''}{delta.toFixed(3)}s <span className="text-xs text-white/50">vs best</span>
        </div>
      ) : (
        <div className="text-lg text-white/40">--</div>
      )}
      {sdelta !== null && (
        <div className={`text-sm mt-1 ${sdelta > 0 ? 'text-orange-400' : 'text-green-400'}`}>
          {sdelta > 0 ? '+' : ''}{sdelta.toFixed(3)}s vs session best
        </div>
      )}
    </div>
  )
})

const BrakeAnalysis = React.memo(function BrakeAnalysis({ brake, brakeTemp, tireSlipRatio }) {
  const pct    = ((brake / 255) * 100).toFixed(0)
  const lockup = brake > 100 && (Math.abs(tireSlipRatio[2]) > 0.8 || Math.abs(tireSlipRatio[3]) > 0.8)
  return (
    <div className="p-3 rounded bamboo-surface-dark">
      <div className="text-sm text-white/70 mb-1">Brake Analysis</div>
      <div className="flex justify-between text-xs mb-1">
        <span>Input {pct}%</span>
        {lockup && <span className="text-red-400 font-bold animate-pulse">LOCKUP</span>}
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3">
        <div className="bg-red-500 h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-1 mt-2 text-xs text-white/55">
        <div>Front: {((brakeTemp[0] + brakeTemp[1]) / 2).toFixed(0)}°C</div>
        <div>Rear: {((brakeTemp[2] + brakeTemp[3]) / 2).toFixed(0)}°C</div>
      </div>
    </div>
  )
})

const SuspensionPanel = React.memo(function SuspensionPanel({ normalized, meters }) {
  return (
    <div className="p-3 rounded bamboo-surface-dark">
      <div className="text-sm text-white/70 mb-2">Suspension Travel</div>
      <div className="grid grid-cols-4 gap-2">
        {['FL', 'FR', 'RL', 'RR'].map((l, i) => (
          <div key={l} className="text-center text-xs">
            <div className="text-white/60 mb-1">{l}</div>
            <div className="h-14 bg-gray-800 rounded relative overflow-hidden mx-auto w-6">
              <div
                className="absolute bottom-0 w-full bg-blue-500 transition-all"
                style={{ height: `${(normalized?.[i] ?? 0) * 100}%` }}
              />
            </div>
            <div className="mt-1">{((meters?.[i] ?? 0) * 100).toFixed(0)}mm</div>
          </div>
        ))}
      </div>
    </div>
  )
})

const TelemetryDashboard = () => {
  const [state, dispatch] = useReducer(telemetryReducer, initialState)
  const pendingRaf = useRef(null)
  const latestData = useRef(null)

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_TELEMETRY_WS_URL || 'ws://localhost:8080'
    const ws = new WebSocket(wsUrl)

    ws.onopen  = () => dispatch({ type: 'CONNECT' })
    ws.onclose = () => dispatch({ type: 'DISCONNECT' })

    // RAF throttling — coalesce packets to ~60fps max (#8)
    ws.onmessage = event => {
      latestData.current = JSON.parse(event.data)
      if (!pendingRaf.current) {
        pendingRaf.current = requestAnimationFrame(() => {
          if (latestData.current) dispatch({ type: 'UPDATE', payload: latestData.current })
          pendingRaf.current = null
        })
      }
    }

    return () => {
      if (pendingRaf.current) cancelAnimationFrame(pendingRaf.current)
      ws.close()
    }
  }, [])

  const { data, connected, brakeTemp, lapCoords, prevLapCoords, sessionBestLap } = state

  if (!data) {
    return (
      <div className="p-4 rounded-lg bamboo-surface-dark text-white">
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span>Forza Telemetry {connected ? 'Connected — waiting for race data…' : 'Disconnected'}</span>
        </div>
        <p className="text-white/50 text-sm">Start a race in Forza Horizon 5 to see live telemetry.</p>
      </div>
    )
  }

  const speedKph = data.speed * 3.6
  const gearLabel = data.gear === 0 ? 'R' : data.gear === 1 ? 'N' : data.gear - 1

  return (
    <div className="p-4 rounded-lg bamboo-surface-dark text-white space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-mono">LIVE TELEMETRY</span>
        </div>
        <div className="text-xs text-white/40 font-mono">
          Lap {data.lapNumber} · P{data.racePosition} · {data.currentRaceTime?.toFixed(0)}s
        </div>
      </div>

      {/* Row 1: Core vitals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Speed"    value={`${speedKph.toFixed(0)} km/h`} sub={`${data.speed.toFixed(1)} m/s`}          accent="#22c55e" />
        <RpmBar   rpm={data.currentEngineRpm} maxRpm={data.engineMaxRpm} />
        <StatCard label="Gear"     value={gearLabel}                                                                     accent="#a78bfa" />
        <StatCard label="Throttle" value={`${((data.throttle / 255) * 100).toFixed(0)}%`} sub={`Brake: ${((data.brake / 255) * 100).toFixed(0)}%`} accent="#fb923c" />
      </div>

      {/* Row 2: G-Force (#2) · Boost (#4) · Fuel (#15) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <GForcePanel ax={data.accelerationX} az={data.accelerationZ} />
        <BoostGauge  boost={data.boost} />
        <FuelPanel   fuel={data.fuel} carClass={data.carClass} />
      </div>

      {/* Row 3: Tire panel — temps + wear + slip + brake temp (#1 #3 #6) */}
      <TirePanel
        tireTemp={data.tireTemp}
        tireWear={data.tireWear}
        tireSlipRatio={data.tireSlipRatio}
        brakeTemp={brakeTemp}
      />

      {/* Row 4: Lap times · Delta (#10) · Brake Analysis (#11) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 rounded bamboo-surface-dark">
          <div className="text-sm text-white/70 mb-2">Lap Times</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-white/55">Current</span>    <span>{formatTime(data.currentLap)}</span></div>
            <div className="flex justify-between"><span className="text-white/55">Best (all-time)</span><span className="text-yellow-400">{formatTime(data.bestLap)}</span></div>
            <div className="flex justify-between"><span className="text-white/55">Session best</span><span className="text-green-400">{formatTime(sessionBestLap)}</span></div>
            <div className="flex justify-between"><span className="text-white/55">Last</span>       <span>{formatTime(data.lastLap)}</span></div>
          </div>
        </div>
        <LapDelta
          currentLap={data.currentLap}
          bestLap={data.bestLap}
          sessionBestLap={sessionBestLap}
        />
        <BrakeAnalysis
          brake={data.brake}
          brakeTemp={brakeTemp}
          tireSlipRatio={data.tireSlipRatio}
        />
      </div>

      {/* Row 5: Suspension travel (#3 proxy) */}
      <SuspensionPanel
        normalized={data.suspensionTravelNormalized}
        meters={data.suspensionTravelMeters}
      />

      {/* Row 6: Live map trace — only renders once we have coords (#5 #14) */}
      {lapCoords.length > 5 && (
        <TelemetryMap lapCoords={lapCoords} prevLapCoords={prevLapCoords} />
      )}
    </div>
  )
}

export default TelemetryDashboard
