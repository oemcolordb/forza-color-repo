import dgram from 'dgram'

class ForzaTelemetryReceiver {
  static DRIVETRAIN_TYPES = ['FWD', 'RWD', 'AWD']
  static PACKET_SIZE = 324
  constructor(port = 9999) {
    this.port = port
    this.socket = null
    this.isListening = false
    this.callbacks = []
  }

  start() {
    if (this.isListening) return

    this.socket = dgram.createSocket('udp4')

    this.socket.on('message', buffer => {
      const data = this.parsePacket(buffer)
      this.callbacks.forEach(callback => callback(data))
    })

    this.socket.bind(this.port)
    this.isListening = true
    console.log(`Forza telemetry listening on port ${this.port}`)
  }

  stop() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
      this.isListening = false
    }
  }

  onData(callback) {
    this.callbacks.push(callback)
  }

  parsePacket(buffer) {
    // Complete Forza Horizon 5 "Dash" packet (324 bytes)
    return {
      // Core telemetry
      isRaceOn: buffer.readInt32LE(0),
      timestampMS: buffer.readUInt32LE(4),

      // Motion
      engineMaxRpm: buffer.readFloatLE(8),
      engineIdleRpm: buffer.readFloatLE(12),
      currentEngineRpm: buffer.readFloatLE(16),

      accelerationX: buffer.readFloatLE(20),
      accelerationY: buffer.readFloatLE(24),
      accelerationZ: buffer.readFloatLE(28),

      velocityX: buffer.readFloatLE(32),
      velocityY: buffer.readFloatLE(36),
      velocityZ: buffer.readFloatLE(40),

      angularVelocityX: buffer.readFloatLE(44),
      angularVelocityY: buffer.readFloatLE(48),
      angularVelocityZ: buffer.readFloatLE(52),

      yaw: buffer.readFloatLE(56),
      pitch: buffer.readFloatLE(60),
      roll: buffer.readFloatLE(64),

      // Suspension (normalized 0-1)
      suspensionTravelNormalized: [
        buffer.readFloatLE(68),
        buffer.readFloatLE(72),
        buffer.readFloatLE(76),
        buffer.readFloatLE(80),
      ],

      // Suspension (meters)
      suspensionTravelMeters: [
        buffer.readFloatLE(84),
        buffer.readFloatLE(88),
        buffer.readFloatLE(92),
        buffer.readFloatLE(96),
      ],

      // Wheel rotation speed (rad/s)
      wheelRotationSpeed: [
        buffer.readFloatLE(100),
        buffer.readFloatLE(104),
        buffer.readFloatLE(108),
        buffer.readFloatLE(112),
      ],

      // Wheel on rumble strip (0/1)
      wheelOnRumbleStrip: [
        buffer.readInt32LE(116),
        buffer.readInt32LE(120),
        buffer.readInt32LE(124),
        buffer.readInt32LE(128),
      ],

      // Wheel in puddle (0-1)
      wheelInPuddleDepth: [
        buffer.readFloatLE(132),
        buffer.readFloatLE(136),
        buffer.readFloatLE(140),
        buffer.readFloatLE(144),
      ],

      // Surface rumble
      surfaceRumble: [
        buffer.readFloatLE(148),
        buffer.readFloatLE(152),
        buffer.readFloatLE(156),
        buffer.readFloatLE(160),
      ],

      // Tire slip ratio
      tireSlipRatio: [
        buffer.readFloatLE(164),
        buffer.readFloatLE(168),
        buffer.readFloatLE(172),
        buffer.readFloatLE(176),
      ],

      // Tire slip angle
      tireSlipAngle: [
        buffer.readFloatLE(180),
        buffer.readFloatLE(184),
        buffer.readFloatLE(188),
        buffer.readFloatLE(192),
      ],

      // Tire combined slip
      tireCombinedSlip: [
        buffer.readFloatLE(196),
        buffer.readFloatLE(200),
        buffer.readFloatLE(204),
        buffer.readFloatLE(208),
      ],

      // Tire temperature
      tireTemp: [
        buffer.readFloatLE(212),
        buffer.readFloatLE(216),
        buffer.readFloatLE(220),
        buffer.readFloatLE(224),
      ],

      // Tire wear
      tireWear: [
        buffer.readFloatLE(228),
        buffer.readFloatLE(232),
        buffer.readFloatLE(236),
        buffer.readFloatLE(240),
      ],

      boost: buffer.readFloatLE(244),
      fuel: buffer.readFloatLE(248),
      distanceTraveled: buffer.readFloatLE(252),
      bestLap: buffer.readFloatLE(256),
      lastLap: buffer.readFloatLE(260),
      currentLap: buffer.readFloatLE(264),
      currentRaceTime: buffer.readFloatLE(268),

      lapNumber: buffer.readUInt16LE(272),
      racePosition: buffer.readUInt8(274),

      // Input
      throttle: buffer.readUInt8(275),
      brake: buffer.readUInt8(276),
      clutch: buffer.readUInt8(277),
      handbrake: buffer.readUInt8(278),
      gear: buffer.readUInt8(279),
      steer: buffer.readInt8(280),

      normalizedDrivingLine: buffer.readInt8(281),
      normalizedAIBrakeDifference: buffer.readInt8(282),

      // Car data
      carOrdinal: buffer.readInt32LE(284),
      carClass: buffer.readInt32LE(288),
      carPerformanceIndex: buffer.readInt32LE(292),
      drivetrainType: buffer.readInt32LE(296), // 0=FWD, 1=RWD, 2=AWD
      numCylinders: buffer.readInt32LE(300),

      // Position
      positionX: buffer.readFloatLE(304),
      positionY: buffer.readFloatLE(308),
      positionZ: buffer.readFloatLE(312),

      speed: buffer.readFloatLE(316),
      power: buffer.readFloatLE(320),

      timestamp: Date.now(),
    }
  }
}

export default ForzaTelemetryReceiver
