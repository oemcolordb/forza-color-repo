import dgram from 'dgram'

class ForzaTelemetryReceiver {
  static DRIVETRAIN_TYPES = ['FWD', 'RWD', 'AWD']
  // Full Dash packet: 332 bytes (Sled 232 + Dash-extra 100)
  // Official spec: https://support.forzamotorsport.net/hc/en-us/articles/21742934024211
  static PACKET_SIZE = 332
  constructor(port = 5300) {
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
    // Guard helpers — returns 0 if offset is beyond packet length
    const f32  = (o) => buffer.length >= o + 4 ? buffer.readFloatLE(o)   : 0
    const s32  = (o) => buffer.length >= o + 4 ? buffer.readInt32LE(o)   : 0
    const u32  = (o) => buffer.length >= o + 4 ? buffer.readUInt32LE(o)  : 0
    const u16  = (o) => buffer.length >= o + 2 ? buffer.readUInt16LE(o)  : 0
    const u8   = (o) => buffer.length >= o + 1 ? buffer.readUInt8(o)     : 0
    const s8   = (o) => buffer.length >= o + 1 ? buffer.readInt8(o)      : 0

    // ── SLED section (bytes 0-231) ────────────────────────────────────
    return {
      isRaceOn:         s32(0),
      timestampMS:      u32(4),

      engineMaxRpm:     f32(8),
      engineIdleRpm:    f32(12),
      currentEngineRpm: f32(16),

      // Local-space acceleration (X=right, Y=up, Z=forward)
      accelerationX: f32(20),
      accelerationY: f32(24),
      accelerationZ: f32(28),

      // Local-space velocity
      velocityX: f32(32),
      velocityY: f32(36),
      velocityZ: f32(40),

      // Local-space angular velocity
      angularVelocityX: f32(44),
      angularVelocityY: f32(48),
      angularVelocityZ: f32(52),

      yaw:   f32(56),
      pitch: f32(60),
      roll:  f32(64),

      // Suspension travel normalized (0=max stretch, 1=max compression)
      // Order: FL, FR, RL, RR
      suspensionTravelNormalized: [f32(68), f32(72), f32(76), f32(80)],

      // Tire slip ratio (0=100% grip, |x|>1=loss of grip) — FL FR RL RR
      tireSlipRatio: [f32(84), f32(88), f32(92), f32(96)],

      // Wheel rotation speed (radians/sec) — FL FR RL RR
      wheelRotationSpeed: [f32(100), f32(104), f32(108), f32(112)],

      // 1 = on rumble strip, 0 = off — FL FR RL RR
      wheelOnRumbleStrip: [s32(116), s32(120), s32(124), s32(128)],

      // Puddle depth 0-1 (1=deepest) — FL FR RL RR
      wheelInPuddleDepth: [f32(132), f32(136), f32(140), f32(144)],

      // Surface rumble (controller force feedback) — FL FR RL RR
      surfaceRumble: [f32(148), f32(152), f32(156), f32(160)],

      // Tire slip angle (0=100% grip, |x|>1=loss of grip) — FL FR RL RR
      tireSlipAngle: [f32(164), f32(168), f32(172), f32(176)],

      // Tire combined slip (0=100% grip, |x|>1=loss of grip) — FL FR RL RR
      tireCombinedSlip: [f32(180), f32(184), f32(188), f32(192)],

      // Actual suspension travel in meters — FL FR RL RR
      suspensionTravelMeters: [f32(196), f32(200), f32(204), f32(208)],

      // Car identification (all S32)
      carOrdinal:          s32(212),
      carClass:            s32(216), // 0=D, 1=C, 2=B, 3=A, 4=S1, 5=S2, 6=X
      carPerformanceIndex: s32(220), // 100-999
      drivetrainType:      s32(224), // 0=FWD, 1=RWD, 2=AWD
      numCylinders:        s32(228),

      // ── DASH extra (bytes 232-331) ────────────────────────────────────
      positionX: f32(232),
      positionY: f32(236),
      positionZ: f32(240),

      speed:  f32(244), // m/s
      power:  f32(248), // watts
      torque: f32(252), // Nm

      // Tire temperatures (Celsius) — FL FR RL RR
      tireTemp: [f32(256), f32(260), f32(264), f32(268)],

      boost:            f32(272),
      fuel:             f32(276),
      distanceTraveled: f32(280),

      bestLap:         f32(284),
      lastLap:         f32(288),
      currentLap:      f32(292),
      currentRaceTime: f32(296),

      lapNumber:    u16(300),
      racePosition: u8(302),

      // Raw driver inputs (0-255)
      throttle:  u8(303), // labeled "Accel" in official spec
      brake:     u8(304),
      clutch:    u8(305),
      handbrake: u8(306),
      gear:      u8(307), // 0=reverse, 1=neutral, 2=1st … 7=6th
      steer:     s8(308), // -128 (full left) to 127 (full right)

      normalizedDrivingLine:       s8(309),
      normalizedAIBrakeDifference: s8(310),

      // byte 311: alignment padding

      // Tire wear (0.0-1.0) — FL FR RL RR
      tireWear: [f32(312), f32(316), f32(320), f32(324)],

      // Track identifier
      trackOrdinal: s32(328),

      timestamp: Date.now(),
    }
  }
}
