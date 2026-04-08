// Forza Horizon 5 Tuning Calculator
//
// Formula sources:
//   [1] forzatune.com — "The Fully Updated Forza Tuning Guide" (Anthony Curtis)
//   [2] Community research: Engineering Dynamics and Algorithmic Tuning Protocols in FH5
//       (HokiHoshi / Forza community formulas, verified via telemetry)
//
// FH5-specific rules encoded here (differ from Motorsport):
//   • Brake balance slider is INVERTED  →  display_value = 100 − target_front%
//   • Toe should be 0° for most FH5 cars — non-zero is unpredictable in FH5 [1]
//   • Caster max 6.0° in FH5 — higher values cause too-snappy turn-in [1]
//   • Cold tire pressure 27–30 PSI targets hot range 32–34 PSI [1]
//   • Off-road flotation physics requires 15–20 PSI for Cross-Country [2]
//   • Weight distribution is the backbone for springs, ARBs, and damping [2]

export class TuningCalculator {
  constructor(carData) {
    this.car      = carData
    this.weight   = carData.weight || 1500           // kg
    this.power    = carData.engine?.horsepower || 400
    this.drivetrain = carData.drivetrain || 'RWD'
    this.piClass  = carData.pi?.class || 'A'
    this.piValue  = carData.pi?.value || 700
    this.stats    = carData.stats

    // frontWeight: fraction of total mass on front axle (e.g. 0.52 = 52% front)
    // Use carData.frontWeight when available (set by car-specs DB lookup).
    // Otherwise estimate from car type + drivetrain.
    this.frontWeight = carData.frontWeight != null
      ? carData.frontWeight
      : this._estimateFrontWeight()
    this.rearWeight = 1.0 - this.frontWeight
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  _estimateFrontWeight() {
    const typeBase = {
      'Hypercar':    0.44,  // typically mid/rear engine
      'Track Car':   0.48,
      'Supercar':    0.46,
      'Sports Car':  0.52,
      'Coupe':       0.54,
      'Convertible': 0.53,
      'Classic':     0.50,
      'Rally Car':   0.52,
      'Sedan':       0.58,
      'Wagon':       0.57,
      'SUV':         0.56,
      'Truck':       0.55,
    }
    let base = typeBase[this.car.type] || 0.52
    // FWD cars carry the engine over the front axle
    if (this.drivetrain === 'FWD') base = Math.min(base + 0.05, 0.65)
    // High-PI RWD sports/supercar → likely mid- or rear-engine
    if (this.drivetrain === 'RWD' && this.piValue >= 700 &&
        ['Sports Car', 'Supercar', 'Hypercar'].includes(this.car.type)) {
      base = Math.max(base - 0.04, 0.38)
    }
    return base
  }

  // Calculate base tune using professional principles
  calculateBaseTune() {
    const weightFactor = this.weight / 1500
    const powerToWeight = this.power / this.weight
    const handlingFactor = this.stats.handling / 10
    const speedFactor = this.stats.speed / 10
    const accelFactor = this.stats.acceleration / 10

    return {
      // Tire Pressure: Critical for contact patch and handling
      'tire-pressure-front': this.calculateTirePressure('front'),
      'tire-pressure-rear': this.calculateTirePressure('rear'),

      // Alignment: Foundation of handling characteristics
      'camber-front': this.calculateCamber('front'),
      'camber-rear': this.calculateCamber('rear'),
      'toe-front': this.calculateToe('front'),
      'toe-rear': this.calculateToe('rear'),
      caster: this.calculateCaster(),

      // Suspension: Core handling balance
      'anti-roll-bar-front': this.calculateARB('front'),
      'anti-roll-bar-rear': this.calculateARB('rear'),
      'spring-rate-front': this.calculateSprings('front'),
      'spring-rate-rear': this.calculateSprings('rear'),
      'ride-height-front': this.calculateRideHeight('front'),
      'ride-height-rear': this.calculateRideHeight('rear'),

      // Damping: Fine-tuning suspension response
      'damping-rebound-front': this.calculateDamping('rebound', 'front'),
      'damping-rebound-rear': this.calculateDamping('rebound', 'rear'),
      'damping-bump-front': this.calculateDamping('bump', 'front'),
      'damping-bump-rear': this.calculateDamping('bump', 'rear'),

      // Drivetrain: Power delivery optimization
      'differential-rear-accel': this.calculateDifferential('accel'),
      'differential-rear-decel': this.calculateDifferential('decel'),

      // Brakes: Stopping power balance
      'brake-balance': this.calculateBrakeBalance(),
      'brake-pressure': this.calculateBrakePressure(),

      // Gearing: Speed vs acceleration balance
      'final-drive': this.calculateFinalDrive(),

      // Aerodynamics: Downforce vs drag
      'aero-front': this.calculateAero('front'),
      'aero-rear': this.calculateAero('rear'),
    }
  }

  // Track-specific tune adjustments for FH5
  getTrackRecommendations(trackType) {
    const baseTune = this.calculateBaseTune()
    const adjustments = {}

    switch (trackType) {
      case 'road-racing':
        // Paved surface: normal cold PSI, neutral camber
        adjustments['tire-pressure-front'] = 28
        adjustments['tire-pressure-rear'] = 27
        adjustments['camber-front'] = -1.8
        adjustments['camber-rear'] = -1.5
        adjustments['aero-front'] = 150
        adjustments['aero-rear'] = 200
        break

      case 'street-scene':
        adjustments['final-drive'] = Math.max(2.0, Math.min(6.0, 3.8))
        adjustments['anti-roll-bar-front'] = 20
        adjustments['anti-roll-bar-rear'] = 35
        adjustments['aero-front'] = 200
        adjustments['aero-rear'] = 280
        break

      case 'dirt-racing':
        adjustments['tire-pressure-front'] = 22
        adjustments['tire-pressure-rear'] = 20
        adjustments['ride-height-front'] = 8.0
        adjustments['ride-height-rear'] = 8.5
        adjustments['spring-rate-front'] = 80
        adjustments['spring-rate-rear'] = 75
        break

      case 'cross-country':
        // Flotation principle: 15–20 PSI [2]; soft springs + high ride [2]
        adjustments['tire-pressure-front'] = 17
        adjustments['tire-pressure-rear'] = 15
        adjustments['ride-height-front'] = 10.0
        adjustments['ride-height-rear'] = 10.5
        adjustments['spring-rate-front'] = 60
        adjustments['spring-rate-rear'] = 55
        // AWD/RWD accel lock capped at 45% [1]
        adjustments['differential-rear-accel'] = 45
        break

      case 'drag-strip':
        // Drag-specific: 55 PSI front (bias), 15 PSI rear (contact) [2]
        adjustments['tire-pressure-front'] = 50   // FH5 max is 50
        adjustments['tire-pressure-rear'] = 15
        adjustments['final-drive'] = Math.max(2.0, Math.min(6.0, 2.5))
        // Max accel lock, 0 decel lock for drag [2]
        adjustments['differential-rear-accel'] = 45   // capped at FH5 RWD max 45%
        adjustments['differential-rear-decel'] = 0
        adjustments['aero-front'] = 50
        adjustments['aero-rear'] = 100
        break

      case 'drift':
        // Drift: -3.5° front camber, -1.2° rear; rear diff 100% accel (locked) [2]
        adjustments['tire-pressure-front'] = 30
        adjustments['tire-pressure-rear'] = 22
        adjustments['camber-front'] = -3.5
        adjustments['camber-rear'] = -1.2
        adjustments['toe-front'] = 0.0     // FH5 toe is unpredictable; keep 0 [1]
        adjustments['toe-rear'] = 0.0
        adjustments['differential-rear-accel'] = 100  // locked for rotation [2]
        adjustments['differential-rear-decel'] = 100  // locked [2]
        adjustments['anti-roll-bar-rear'] = 15
        break

      case 'rally':
        adjustments['tire-pressure-front'] = 24
        adjustments['tire-pressure-rear'] = 22
        adjustments['ride-height-front'] = 7.5
        adjustments['ride-height-rear'] = 8.0
        // Rally accel lock: 45% max (AWD rear) [1]
        adjustments['differential-rear-accel'] = 45
        adjustments['anti-roll-bar-front'] = 25
        adjustments['anti-roll-bar-rear'] = 30
        break

      case 'playground-games':
        adjustments['tire-pressure-front'] = 26
        adjustments['tire-pressure-rear'] = 25
        adjustments['final-drive'] = Math.max(2.0, Math.min(6.0, 3.2))
        // Inverted: 50% slider = 50% front bias
        adjustments['brake-balance'] = 50
        break

      case 'eliminator':
        adjustments['tire-pressure-front'] = 25
        adjustments['tire-pressure-rear'] = 23
        adjustments['ride-height-front'] = 7.0
        adjustments['ride-height-rear'] = 7.5
        adjustments['final-drive'] = Math.max(2.0, Math.min(6.0, 3.0))
        break

      case 'horizon-tour':
        adjustments['tire-pressure-front'] = 27
        adjustments['tire-pressure-rear'] = 26
        adjustments['camber-front'] = -1.5
        adjustments['camber-rear'] = -1.2
        // Inverted: 50 slider = 50% front bias (neutral)
        adjustments['brake-balance'] = 50
        break
    }

    return { ...baseTune, ...adjustments }
  }

  // ---------------------------------------------------------------------------
  // Individual calculation methods — FH5-specific formulas
  // All outputs clamped to verified FH5 in-game slider limits
  // ---------------------------------------------------------------------------

  // Tire Pressure [FH5 slider: 15–50 PSI]
  // Cold target 27–30 PSI; anticipate +4–5 PSI heat rise to hit 32–34 PSI hot [1]
  // Heavier cars need slightly less pressure (contact patch loads more easily)
  // Off-road / Cross-country: flotation principle → lower pressure [2]
  calculateTirePressure(position) {
    const weightAdj = -((this.weight - 1300) / 1300) * 1.5   // heavier → lower
    let base = 27.5 + weightAdj
    if (position === 'front' && this.drivetrain === 'FWD') base -= 0.5  // FWD front axle bias
    const val = Math.round(base * 10) / 10
    return Math.max(15, Math.min(50, val))
  }

  // Camber [FH5 slider: -5.0° to 0°]
  // Formula: base + (W_axle - 0.50) × -3.0 (front) or × -2.0 (rear) + piAdj [2]
  // More front weight → more negative front camber to maintain contact patch
  calculateCamber(position) {
    const piAdj = this.piValue >= 900 ? -0.3 : this.piValue >= 700 ? -0.15 : 0
    let val
    if (position === 'front') {
      val = -1.2 + (this.frontWeight - 0.50) * -3.0 + piAdj
      val = Math.round(val * 10) / 10
      return Math.max(-5.0, Math.min(-0.5, val))   // practical clamp -2.5 to -0.5 covered
    } else {
      val = -0.9 + (this.rearWeight - 0.50) * -2.0 + piAdj
      val = Math.round(val * 10) / 10
      return Math.max(-5.0, Math.min(-0.3, val))
    }
  }

  // Toe [FH5 slider: -5.0° to 5.0°]
  // FH5 is unpredictable with toe; leave at 0° for most builds [1]
  // FWD: tiny toe-in front (+0.1) helps turn-in; high-power RWD: tiny toe-in rear for stability
  calculateToe(position) {
    if (position === 'front') {
      return this.drivetrain === 'FWD' ? 0.1 : 0.0
    } else {
      return (this.drivetrain === 'RWD' && this.piValue >= 700) ? 0.1 : 0.0
    }
  }

  // Caster [FH5 slider: 1.0° to 7.0°]
  // FH5 guide: 5.5° ± 0.5°; NEVER above 6.0° (causes snappy turn-in) [1]
  calculateCaster() {
    return 5.5   // fixed; no stat-based creep
  }

  // Anti-Roll Bars [FH5 slider: 1–65]
  // Formula: ARB_F = round(64 × W_front% + 0.5), ARB_R = round(64 × W_rear% + 0.5) [2]
  // Ensures front/rear ARB ratio mirrors weight distribution
  calculateARB(position) {
    const w = position === 'front' ? this.frontWeight : this.rearWeight
    const val = Math.round(64 * w + 0.5)
    return Math.max(1, Math.min(65, val))
  }

  // Spring Rates [FH5 slider: 50–300 lb/in]
  // Natural-frequency formula: K = 4π² × f² × corner_mass [2]
  // corner_mass (kg) = (weight × W_axle%) / 2;  convert N/m → lb/in ÷ 175.127
  // General ride target: 1.5 Hz (comfort) to 2.0 Hz (track)
  calculateSprings(position) {
    const freq = 1.5  // Hz — general / road; track variants override in getTuneTypeRecommendations
    const w = position === 'front' ? this.frontWeight : this.rearWeight
    const cornerMass = (this.weight * w) / 2                 // kg per corner
    const kNm = 4 * Math.PI * Math.PI * freq * freq * cornerMass  // N/m
    const kLbIn = kNm / 175.127                              // lb/in
    return Math.max(50, Math.min(300, Math.round(kLbIn / 5) * 5))  // round to nearest 5
  }

  // Ride Height [FH5 slider: 4.0–15.0 cm]
  // Lower handling stat → higher PI cars tend to be stiffer from factory
  // General baseline: 6.5 cm front, 7.0 cm rear; leave lift for off-road variants
  calculateRideHeight(position) {
    const base = position === 'front' ? 6.5 : 7.0
    // PI-class bias: X-class cars often have race suspension locked low
    const piAdj = this.piValue >= 900 ? -0.5 : this.piValue <= 500 ? 0.5 : 0
    const val = Math.round((base + piAdj) * 10) / 10
    return Math.max(4.0, Math.min(15.0, val))
  }

  // Damping [FH5 slider: 1.0–20.0]
  // Rebound_F = (19 × W_F%) + 0.5, Rebound_R = (19 × W_R%) + 1.0 [2]
  // Bump = Rebound × 0.60 [2]; extra +0.5 on rear rebound prevents lift-off oversteer
  calculateDamping(type, position) {
    const w = position === 'front' ? this.frontWeight : this.rearWeight
    const extraRear = position === 'rear' ? 1.0 : 0.5
    const rebound = 19 * w + extraRear
    const bump    = rebound * 0.60
    const val = type === 'rebound' ? rebound : bump
    return Math.max(1.0, Math.min(20.0, Math.round(val * 10) / 10))
  }

  // Differential [FH5 slider: 0–100%]
  // FH5 ranges (NOT Motorsport) [1]:
  //   RWD  accel 25–45%  decel 30–45%
  //   FWD  accel 15–25%  decel 10–20%
  //   AWD  same as FWD/RWD per axle  +  centre 60–70%
  // More power-to-weight → higher accel lock for traction
  calculateDifferential(type) {
    const ptw = this.power / this.weight   // power-to-weight ratio

    if (this.drivetrain === 'RWD') {
      if (type === 'accel') {
        const val = Math.round(45 - (ptw - 0.2) * 30)
        return Math.max(25, Math.min(45, val))
      } else {
        return 35  // safe neutral decel lock [1]
      }
    }

    if (this.drivetrain === 'FWD') {
      if (type === 'accel') {
        const val = Math.round(25 - (ptw - 0.2) * 15)
        return Math.max(15, Math.min(25, val))
      } else {
        return 15
      }
    }

    // AWD — return rear axle values by default; centre exposed via calculateBaseTune
    if (type === 'accel') {
      const val = Math.round(45 - (ptw - 0.2) * 30)
      return Math.max(25, Math.min(45, val))
    } else {
      return 35
    }
  }

  // Brake Balance [FH5 slider: 0–100 — displayed as front%]
  // FH5 Horizon brake slider is INVERTED: to get target_front% bias, set (100 − target_front) [1]
  // Target biases: RWD 52% front, FWD 58% front, AWD 52% front
  // display_value = 100 − targetFront  →  RWD = 48, FWD = 42, AWD = 48
  calculateBrakeBalance() {
    const targetFront = this.drivetrain === 'FWD' ? 58 : 52
    // Inversion: display slider at (100 − target) so the game reads correct bias
    return Math.max(0, Math.min(100, 100 - targetFront))
  }

  // Brake Pressure [FH5 slider: 0–200%]
  // Default 100% is safe for most cars; lower for very stiff setups with big brakes
  calculateBrakePressure() {
    return 100
  }

  // Final Drive [FH5 slider: ~2.00–6.00]
  // Approximation: (400 − HP) / 600 + 4.25  for 6-speed race box [2]
  // High-HP cars need lower final drive ratio for top speed
  calculateFinalDrive() {
    const val = (400 - this.power) / 600 + 4.25
    return Math.max(2.0, Math.min(6.0, Math.round(val * 100) / 100))
  }

  // Aerodynamics [FH5 slider: front 50–300 kg, rear 100–400 kg]
  // Balance aero proportional to weight distribution [2]
  // More front weight → more front aero to maintain balance
  calculateAero(position) {
    if (position === 'front') {
      const val = Math.round(175 * this.frontWeight * 2)
      return Math.max(50, Math.min(300, Math.round(val / 5) * 5))
    } else {
      const val = Math.round(175 * this.rearWeight * 2)
      return Math.max(100, Math.min(400, Math.round(val / 5) * 5))
    }
  }

  // Get tuning recommendations based on driving style
  getStyleRecommendations(style) {
    const baseTune = this.calculateBaseTune()

    switch (style) {
      case 'aggressive':
        return {
          ...baseTune,
          'camber-front': baseTune['camber-front'] - 0.5,
          'camber-rear': baseTune['camber-rear'] - 0.3,
          'tire-pressure-front': baseTune['tire-pressure-front'] - 2,
          'tire-pressure-rear': baseTune['tire-pressure-rear'] - 2,
          'anti-roll-bar-front': baseTune['anti-roll-bar-front'] + 5,
          'anti-roll-bar-rear': baseTune['anti-roll-bar-rear'] + 5,
        }

      case 'smooth':
        return {
          ...baseTune,
          'spring-rate-front': baseTune['spring-rate-front'] - 20,
          'spring-rate-rear': baseTune['spring-rate-rear'] - 15,
          'damping-rebound-front': baseTune['damping-rebound-front'] - 2,
          'damping-rebound-rear': baseTune['damping-rebound-rear'] - 2,
        }

      case 'drift':
        return {
          ...baseTune,
          'tire-pressure-front': 30,
          'tire-pressure-rear': 22,
          'camber-front': -3.5,
          'camber-rear': -1.2,
          'toe-front': 0.0,   // FH5 toe unpredictable; keep 0 [1]
          'toe-rear': 0.0,
          'differential-rear-accel': 100,  // locked for rotation [2]
          'differential-rear-decel': 100,
          'anti-roll-bar-rear': 15,
        }

      default:
        return baseTune
    }
  }

  // Get tune recommendations based on tune type
  getTuneTypeRecommendations(tuneType) {
    const baseTune = this.calculateBaseTune()

    switch (tuneType) {
      case 'Track':
        return {
          ...baseTune,
          'tire-pressure-front': 26,
          'tire-pressure-rear': 25,
          'camber-front': -2.5,
          'camber-rear': -2.0,
          'aero-front': Math.min(300, baseTune['aero-front'] + 50),
          'aero-rear': Math.min(400, baseTune['aero-rear'] + 50),
          // Higher frequency (2.0 Hz) → stiffer springs; clamp to FH5 max 300
          'spring-rate-front': Math.max(50, Math.min(300, baseTune['spring-rate-front'] + 40)),
          'spring-rate-rear': Math.max(50, Math.min(300, baseTune['spring-rate-rear'] + 30)),
          'anti-roll-bar-front': Math.min(65, baseTune['anti-roll-bar-front'] + 10),
          'anti-roll-bar-rear': Math.min(65, baseTune['anti-roll-bar-rear'] + 10),
          // Inverted: target 52% front → set slider to 48
          'brake-balance': 48,
        }

      case 'Drift':
        return {
          ...baseTune,
          'tire-pressure-front': 30,
          'tire-pressure-rear': 22,
          'camber-front': -3.5,
          'camber-rear': -1.2,
          'toe-front': 0.0,   // FH5 toe unpredictable; keep 0 [1]
          'toe-rear': 0.0,
          'differential-rear-accel': 100,  // locked for rotation [2]
          'differential-rear-decel': 100,
          'anti-roll-bar-front': 25,
          'anti-roll-bar-rear': 15,
          // Inverted: drift wants rear bias → target ~55% front → slider = 45
          'brake-balance': 45,
        }

      case 'Rally':
        return {
          ...baseTune,
          'tire-pressure-front': 24,
          'tire-pressure-rear': 22,
          'ride-height-front': 7.5,
          'ride-height-rear': 8.0,
          'spring-rate-front': 85,
          'spring-rate-rear': 80,
          // Rally accel lock: max 45% per FH5 RWD/AWD cap [1]
          'differential-rear-accel': 45,
          'differential-rear-decel': 35,
          'anti-roll-bar-front': 25,
          'anti-roll-bar-rear': 30,
          'camber-front': -1.5,
          'camber-rear': -1.0,
          // Inverted: neutral 52% front → slider 48
          'brake-balance': 48,
        }

      case 'Basic (General)':
      default:
        return baseTune
    }
  }
}

// Forza Horizon 5 Track Types Database
export const TRACK_TYPES = {
  'road-racing': {
    name: 'Road Racing',
    description: 'Paved circuits with mixed corners',
    characteristics: ['paved', 'mixed-corners', 'high-speed'],
    priority: ['handling', 'top-speed', 'braking'],
  },
  'street-scene': {
    name: 'Street Scene',
    description: 'Urban street racing with tight corners',
    characteristics: ['street', 'tight-corners', 'barriers'],
    priority: ['handling', 'acceleration', 'precision'],
  },
  'dirt-racing': {
    name: 'Dirt Racing',
    description: 'Off-road circuits on dirt surfaces',
    characteristics: ['dirt', 'loose-surface', 'jumps'],
    priority: ['traction', 'stability', 'suspension'],
  },
  'cross-country': {
    name: 'Cross Country',
    description: 'Mixed terrain with jumps and obstacles',
    characteristics: ['mixed-terrain', 'jumps', 'rough'],
    priority: ['durability', 'ground-clearance', 'traction'],
  },
  'drag-strip': {
    name: 'Drag Strip',
    description: 'Straight-line acceleration racing',
    characteristics: ['straight-line', 'launch', 'top-speed'],
    priority: ['launch', 'acceleration', 'top-speed'],
  },
  drift: {
    name: 'Drift',
    description: 'Sideways driving with style points',
    characteristics: ['style', 'oversteer', 'control'],
    priority: ['oversteer', 'control', 'angle'],
  },
  rally: {
    name: 'Rally',
    description: 'Point-to-point racing on varied surfaces',
    characteristics: ['mixed-surface', 'elevation', 'technical'],
    priority: ['adaptability', 'traction', 'stability'],
  },
  'playground-games': {
    name: 'Playground Games',
    description: 'Fun mini-games and challenges',
    characteristics: ['varied', 'fun', 'adaptable'],
    priority: ['versatility', 'handling', 'acceleration'],
  },
  eliminator: {
    name: 'The Eliminator',
    description: 'Battle royale racing across Mexico',
    characteristics: ['open-world', 'mixed-terrain', 'survival'],
    priority: ['versatility', 'durability', 'speed'],
  },
  'horizon-tour': {
    name: 'Horizon Tour',
    description: 'Cooperative championship racing',
    characteristics: ['varied', 'championship', 'team'],
    priority: ['consistency', 'reliability', 'balance'],
  },
}

// Legacy tracks for backwards compatibility
export const TRACKS = TRACK_TYPES
