import dgram    from 'dgram'
import fs        from 'fs'
import path      from 'path'
import { WebSocketServer } from 'ws'
import ForzaTelemetryReceiver from './forzaTelemetry.js'

// ─── CSV Session Recorder ────────────────────────────────────────────────────
// Buffers rows in memory and flushes every FLUSH_INTERVAL ms (#12, #13).

const CSV_DIR          = './sessions'
const FLUSH_INTERVAL   = 1000   // flush buffered rows every second
const CSV_ROW_LIMIT    = 20     // rows buffered before an early flush

const CSV_HEADER = [
  'timestamp', 'speed', 'gear', 'throttle', 'brake',
  'currentEngineRpm', 'boost', 'fuel',
  'tireTemp_FL', 'tireTemp_FR', 'tireTemp_RL', 'tireTemp_RR',
  'tireWear_FL', 'tireWear_FR', 'tireWear_RL', 'tireWear_RR',
  'positionX', 'positionY', 'positionZ',
  'accelerationX', 'accelerationZ',
  'lapNumber', 'currentLap', 'bestLap',
].join(',')

class SessionRecorder {
  constructor() {
    this.fd          = null
    this.csvPath     = null
    this.metaPath    = null
    this.rows        = []
    this.flushTimer  = null
    this.startTime   = null
    this.lapCount    = 0
    this.lastLapNum  = -1
  }

  start(meta = {}) {
    if (!fs.existsSync(CSV_DIR)) fs.mkdirSync(CSV_DIR, { recursive: true })

    const stamp       = new Date().toISOString().replace(/[:.]/g, '-')
    this.csvPath      = path.join(CSV_DIR, `session_${stamp}.csv`)
    this.metaPath     = path.join(CSV_DIR, `session_${stamp}.json`)
    this.startTime    = Date.now()
    this.lapCount     = 0
    this.lastLapNum   = -1

    this.fd = fs.openSync(this.csvPath, 'a')
    fs.writeSync(this.fd, CSV_HEADER + '\n')

    // Write initial session metadata (#13)
    const sessionMeta = {
      startedAt:  new Date().toISOString(),
      carOrdinal: meta.carOrdinal ?? null,
      carClass:   meta.carClass   ?? null,
      udpPort:    meta.udpPort    ?? null,
    }
    fs.writeFileSync(this.metaPath, JSON.stringify(sessionMeta, null, 2))

    this.flushTimer = setInterval(() => this._flush(), FLUSH_INTERVAL)
    console.log(`[SessionRecorder] Recording → ${this.csvPath}`)
  }

  record(data) {
    if (!this.fd) return

    // Track laps for metadata (#13)
    if (data.lapNumber > this.lastLapNum) {
      this.lapCount++
      this.lastLapNum = data.lapNumber
    }

    const row = [
      Date.now(),
      data.speed?.toFixed(3)           ?? '',
      data.gear                        ?? '',
      data.throttle                    ?? '',
      data.brake                       ?? '',
      data.currentEngineRpm?.toFixed(1) ?? '',
      data.boost?.toFixed(4)           ?? '',
      data.fuel?.toFixed(4)            ?? '',
      data.tireTemp?.[0]?.toFixed(1)   ?? '', data.tireTemp?.[1]?.toFixed(1) ?? '',
      data.tireTemp?.[2]?.toFixed(1)   ?? '', data.tireTemp?.[3]?.toFixed(1) ?? '',
      data.tireWear?.[0]?.toFixed(4)   ?? '', data.tireWear?.[1]?.toFixed(4) ?? '',
      data.tireWear?.[2]?.toFixed(4)   ?? '', data.tireWear?.[3]?.toFixed(4) ?? '',
      data.positionX?.toFixed(3)       ?? '', data.positionY?.toFixed(3)     ?? '',
      data.positionZ?.toFixed(3)       ?? '',
      data.accelerationX?.toFixed(4)   ?? '', data.accelerationZ?.toFixed(4) ?? '',
      data.lapNumber                   ?? '', data.currentLap?.toFixed(3)    ?? '',
      data.bestLap?.toFixed(3)         ?? '',
    ].join(',')

    this.rows.push(row)
    if (this.rows.length >= CSV_ROW_LIMIT) this._flush()
  }

  stop() {
    clearInterval(this.flushTimer)
    this._flush()
    if (this.fd !== null) {
      fs.closeSync(this.fd)
      this.fd = null
    }

    // Update session metadata with final stats (#13)
    if (this.metaPath) {
      try {
        const prev = JSON.parse(fs.readFileSync(this.metaPath, 'utf8'))
        const final = {
          ...prev,
          endedAt:      new Date().toISOString(),
          durationSec:  Math.round((Date.now() - this.startTime) / 1000),
          lapsCompleted: this.lapCount,
        }
        fs.writeFileSync(this.metaPath, JSON.stringify(final, null, 2))
      } catch {/* non-fatal */}
    }
    console.log('[SessionRecorder] Session ended.')
  }

  _flush() {
    if (this.fd === null || this.rows.length === 0) return
    fs.writeSync(this.fd, this.rows.join('\n') + '\n')
    this.rows = []
  }
}

// ─── TelemetryBridge ─────────────────────────────────────────────────────────

class TelemetryBridge {
  constructor(udpPort = 9999, wsPort = 8080) {
    this.udpPort    = udpPort
    this.wsPort     = wsPort
    this.forwarders = []
    this.clients    = new Set()
    this.lastData   = null

    // 60Hz broadcast throttle (#8)
    // Packets arrive at up to ~360Hz; we flush the latest at ~60fps (16ms).
    this._pendingData   = null
    this._broadcastTimer = null

    this.recorder = new SessionRecorder()
    this.receiver = new ForzaTelemetryReceiver(udpPort)
    this.wss      = new WebSocketServer({ port: wsPort })

    this.setupWebSocket()
    this.setupTelemetry()
  }

  setupWebSocket() {
    this.wss.on('connection', ws => {
      ws.isAlive = true
      ws.on('pong', () => { ws.isAlive = true })

      this.clients.add(ws)

      // Send last known data immediately on new connection
      if (this.lastData) {
        ws.send(JSON.stringify(this.lastData))
      }

      ws.on('close', () => this.clients.delete(ws))
      ws.on('error', () => this.clients.delete(ws))
    })

    // Heartbeat interval to keep clients alive and prevent idle timeouts
    this.heartbeat = setInterval(() => {
      this.wss.clients.forEach(ws => {
        if (ws.isAlive === false) {
          this.clients.delete(ws)
          return ws.terminate()
        }
        ws.isAlive = false
        ws.ping()
      })
    }, 30000)
  }

  setupTelemetry() {
    this.receiver.onData(data => {
      this.lastData      = data
      this._pendingData  = data          // overwrite; we only want the latest (#8)
      this.recorder.record(data)
      this.forwardUDP(data)
    })

    // 60Hz flush timer (#8)
    this._broadcastTimer = setInterval(() => {
      if (this._pendingData) {
        this._broadcastNow(this._pendingData)
        this._pendingData = null
      }
    }, 16) // ~62.5 Hz
  }

  _broadcastNow(data) {
    const message = JSON.stringify(data)
    this.clients.forEach(client => {
      if (client.readyState === 1 /* WebSocket.OPEN */) {
        client.send(message)
      }
    })
  }

  // UDP forwarding for companion apps
  addForwarder(ip, port) {
    const socket = dgram.createSocket('udp4')
    this.forwarders.push({ socket, ip, port })
  }

  forwardUDP(data) {
    if (!this.forwarders.length) return
    const buffer = Buffer.from(JSON.stringify(data))
    this.forwarders.forEach(({ socket, ip, port }) => {
      socket.send(buffer, port, ip)
    })
  }

  start() {
    this.receiver.start()
    // Start recording once; first packet meta will fill carOrdinal/carClass
    this.receiver.onData(data => {
      if (!this.recorder.fd) {
        this.recorder.start({ carOrdinal: data.carOrdinal, carClass: data.carClass, udpPort: this.udpPort })
      }
    })
    console.log(`Telemetry bridge: UDP:${this.udpPort} → WebSocket:${this.wsPort}`)
  }

  stop() {
    clearInterval(this._broadcastTimer)
    if (this.heartbeat) clearInterval(this.heartbeat)
    this.recorder.stop()
    this.receiver.stop()
    this.wss.close()
    this.forwarders.forEach(({ socket }) => socket.close())
  }
}

export default TelemetryBridge
