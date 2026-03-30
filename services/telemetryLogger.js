import fs from 'fs'
import path from 'path'

class TelemetryLogger {
  constructor(logDir = './telemetry-logs') {
    this.logDir = logDir
    this.currentSession = null
    this.logStream = null
    // Resolve and lock the base directory to prevent path traversal
    this.baseLogDir = path.resolve(process.cwd(), logDir)

    if (!fs.existsSync(this.baseLogDir)) {
      fs.mkdirSync(this.baseLogDir, { recursive: true })
    }
  }

  startSession(sessionName = null) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    this.currentSession = sessionName || `session-${timestamp}`

    // Validate sessionName and resolve inside baseLogDir to avoid traversal
    const isSafeName = name => /^[A-Za-z0-9._-]+$/.test(name)
    const safeName = sessionName && isSafeName(sessionName) ? sessionName : this.currentSession

    const logFilePath = path.resolve(this.baseLogDir, `${safeName}.csv`)
    const baseWithSep = this.baseLogDir.endsWith(path.sep) ? this.baseLogDir : this.baseLogDir + path.sep
    if (logFilePath !== this.baseLogDir && !logFilePath.startsWith(baseWithSep)) {
      // Fallback to a safe filename inside the base directory
      this.logStream = fs.createWriteStream(path.join(this.baseLogDir, `${this.currentSession}.csv`))
    } else {
      this.logStream = fs.createWriteStream(logFilePath)
    }

    // CSV header
    this.logStream.write(
      [
        'timestamp',
        'speed',
        'rpm',
        'gear',
        'throttle',
        'brake',
        'steering',
        'power',
        'boost',
        'fuel',
        'lapTime',
        'bestLap',
        'position',
        'tireTemp_FL',
        'tireTemp_FR',
        'tireTemp_RL',
        'tireTemp_RR',
        'tireSlip_FL',
        'tireSlip_FR',
        'tireSlip_RL',
        'tireSlip_RR',
        'suspensionTravel_FL',
        'suspensionTravel_FR',
        'suspensionTravel_RL',
        'suspensionTravel_RR',
        'posX',
        'posY',
        'posZ',
        'yaw',
        'pitch',
        'roll',
      ].join(',') + '\n'
    )
  }

  logData(telemetryData) {
    if (!this.logStream) return

    const row = [
      telemetryData.timestamp,
      telemetryData.speed,
      telemetryData.currentEngineRpm,
      telemetryData.gear,
      telemetryData.throttle,
      telemetryData.brake,
      telemetryData.steer,
      telemetryData.power,
      telemetryData.boost,
      telemetryData.fuel,
      telemetryData.currentLap,
      telemetryData.bestLap,
      telemetryData.racePosition,
      ...telemetryData.tireTemp,
      ...telemetryData.tireSlipRatio,
      ...telemetryData.suspensionTravelMeters,
      telemetryData.positionX,
      telemetryData.positionY,
      telemetryData.positionZ,
      telemetryData.yaw,
      telemetryData.pitch,
      telemetryData.roll,
    ]

    this.logStream.write(row.join(',') + '\n')
  }

  stopSession() {
    if (this.logStream) {
      this.logStream.end()
      this.logStream = null
      console.log(`Telemetry session saved: ${this.currentSession}`)
    }
  }
}

export default TelemetryLogger
