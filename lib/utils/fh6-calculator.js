// Forza Horizon 6 Tuning Calculator
//
// Formula sources:
//   [1] Community telemetry research: Engineering Dynamics and 8-Point tire simulation in FH6/FM8
//   [2] Algorithmic Tuning Protocols for multi-coordinate tire contact models
//
// FH6-specific rules encoded here (differs from FH5):
//   • 8-Point Contact Patch: Tire pressure scales positively with corner weight to prevent carcass
//     deflection and keep the tread flat. Lower pressure on heavy corners is now penalized.
//   • Camber is Conservative: Capped closer to 0° to maximize straight-line footprint and braking traction,
//     relying on higher caster and roll compliance to generate dynamic camber in curves.
//   • Toe is Re-enabled: Slight toe-out front aids turn-in; slight toe-in rear stabilizes corner exits.
//   • Caster is Increased: Set to 6.0° - 6.8° to maximize cornering camber gain.
//   • Damping uses critical damping ($C_c = 2 \times m \times \omega_0$) with bump ratio at 50-65%
//     to absorb track impulses without causing tire contact loss.
//   • Anti-roll bars are scaled softer (0.72× modifier) to prevent inner tire lift under load.

export class FH6Calculator {
  constructor(carData, options = {}) {
    this.car      = carData
    this.weight   = options.weight || carData.weight || 1500           // kg
    this.power    = carData.engine?.horsepower || 400
    this.drivetrain = carData.drivetrain || 'RWD'
    this.piClass  = carData.pi?.class || 'A'
    this.piValue  = carData.pi?.value || 700
    this.stats    = carData.stats
    this.gearCount = options.gearCount || 6
    // handlingBalance: -10 (understeer/stable) → 0 (neutral) → +10 (oversteer/agile)
    this.handlingBalance = options.handlingBalance !== null && options.handlingBalance !== undefined ? options.handlingBalance : 0
    // bumpStiffness: 0–100 scale where 60 = default (bump = rebound × 0.60)
    this.bumpStiffness = options.bumpStiffness !== null && options.bumpStiffness !== undefined ? options.bumpStiffness : 60
    // springFrequency: target natural frequency in Hz (1.5 = street, 2.0 = track)
    this.springFrequency = options.springFrequency !== null && options.springFrequency !== undefined ? options.springFrequency : 1.5

    // frontWeight: fraction of total mass on front axle (e.g. 0.52 = 52% front)
    this.frontWeight = options.frontWeight !== null && options.frontWeight !== undefined
      ? options.frontWeight
      : carData.frontWeight !== null && carData.frontWeight !== undefined
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
    if (this.drivetrain === 'FWD') base = Math.min(base + 0.05, 0.65)
    if (this.drivetrain === 'RWD' && this.piValue >= 700 &&
        ['Sports Car', 'Supercar', 'Hypercar'].includes(this.car.type)) {
      base = Math.max(base - 0.04, 0.38)
    }
    return base
  }

  // Calculate base tune using professional principles for FH6
  calculateBaseTune() {
    return {
      'tire-pressure-front': this.calculateTirePressure('front'),
      'tire-pressure-rear': this.calculateTirePressure('rear'),

      'camber-front': this.calculateCamber('front'),
      'camber-rear': this.calculateCamber('rear'),
      'toe-front': this.calculateToe('front'),
      'toe-rear': this.calculateToe('rear'),
      caster: this.calculateCaster(),

      'anti-roll-bar-front': this.calculateARB('front'),
      'anti-roll-bar-rear': this.calculateARB('rear'),
      'spring-rate-front': this.calculateSprings('front'),
      'spring-rate-rear': this.calculateSprings('rear'),
      'ride-height-front': this.calculateRideHeight('front'),
      'ride-height-rear': this.calculateRideHeight('rear'),

      'damping-rebound-front': this.calculateDamping('rebound', 'front'),
      'damping-rebound-rear': this.calculateDamping('rebound', 'rear'),
      'damping-bump-front': this.calculateDamping('bump', 'front'),
      'damping-bump-rear': this.calculateDamping('bump', 'rear'),

      'differential-rear-accel': this.calculateDifferential('accel'),
      'differential-rear-decel': this.calculateDifferential('decel'),
      ...(this.drivetrain === 'AWD' ? {
        'differential-front-accel': this.calculateFrontDiff('accel'),
        'differential-front-decel': this.calculateFrontDiff('decel'),
        'differential-center': this.calculateCentreDiff(),
      } : {}),

      'brake-balance': this.calculateBrakeBalance(),
      'brake-pressure': this.calculateBrakePressure(),

      'final-drive': this.calculateFinalDrive(),
      ...this.calculateGearRatios(),

      'aero-front': this.calculateAero('front'),
      'aero-rear': this.calculateAero('rear'),
    }
  }

  // Track-specific tune adjustments for FH6
  getTrackRecommendations(trackType) {
    const baseTune = this.calculateBaseTune()
    const adjustments = {}

    switch (trackType) {
      case 'road-racing':
        adjustments['tire-pressure-front'] = Math.round(baseTune['tire-pressure-front'] * 1.02 * 10) / 10
        adjustments['tire-pressure-rear'] = Math.round(baseTune['tire-pressure-rear'] * 1.02 * 10) / 10
        adjustments['camber-front'] = -1.4
        adjustments['camber-rear'] = -1.0
        break

      case 'street-scene':
        // Street bumpy paths require slightly softer damping to keep contact points planted
        adjustments['anti-roll-bar-front'] = Math.max(1, Math.round(baseTune['anti-roll-bar-front'] * 0.9))
        adjustments['anti-roll-bar-rear'] = Math.max(1, Math.round(baseTune['anti-roll-bar-rear'] * 0.9))
        adjustments['damping-bump-front'] = Math.round(baseTune['damping-bump-front'] * 0.9 * 10) / 10
        adjustments['damping-bump-rear'] = Math.round(baseTune['damping-bump-rear'] * 0.9 * 10) / 10
        break

      case 'dirt-racing':
        // Dirt: higher ground clearance, softer tire carcass (20.5 - 22.5 PSI)
        adjustments['tire-pressure-front'] = 22.0
        adjustments['tire-pressure-rear'] = 21.0
        adjustments['ride-height-front'] = Math.round((baseTune['ride-height-front'] + 2.0) * 10) / 10
        adjustments['ride-height-rear'] = Math.round((baseTune['ride-height-rear'] + 2.0) * 10) / 10
        adjustments['camber-front'] = -0.8
        adjustments['camber-rear'] = -0.5
        break

      case 'cross-country':
        // Offroad carcass support: 19-21 PSI to prevent rim strike while utilizing footprint deformation
        adjustments['tire-pressure-front'] = 20.0
        adjustments['tire-pressure-rear'] = 19.5
        adjustments['ride-height-front'] = Math.round((baseTune['ride-height-front'] + 4.5) * 10) / 10
        adjustments['ride-height-rear'] = Math.round((baseTune['ride-height-rear'] + 4.5) * 10) / 10
        adjustments['camber-front'] = -0.5
        adjustments['camber-rear'] = -0.3
        adjustments['differential-rear-accel'] = 65
        adjustments['differential-rear-decel'] = 20
        break

      case 'drag-strip':
        // Drag: High front pressure (reduce roll resistance), Low rear pressure (maximize 8-point footprint on squat)
        adjustments['tire-pressure-front'] = 45.0
        adjustments['tire-pressure-rear'] = 18.0
        adjustments['camber-front'] = -0.1
        adjustments['camber-rear'] = -0.1
        adjustments['toe-front'] = 0.0
        adjustments['toe-rear'] = 0.0
        adjustments['differential-rear-accel'] = 100
        adjustments['differential-rear-decel'] = 0
        break

      case 'drift':
        // Drift: Extreme front camber for slip-angle contact; rear flat camber (0.4) for drive control
        adjustments['tire-pressure-front'] = 31.0
        adjustments['tire-pressure-rear'] = 24.5
        adjustments['camber-front'] = -2.8
        adjustments['camber-rear'] = -0.6
        adjustments['toe-front'] = -0.2 // slight toe-out front stabilizes transition entries
        adjustments['toe-rear'] = 0.0
        adjustments['differential-rear-accel'] = 100
        adjustments['differential-rear-decel'] = 100
        break

      case 'rally':
        adjustments['tire-pressure-front'] = 23.5
        adjustments['tire-pressure-rear'] = 22.5
        adjustments['ride-height-front'] = Math.round((baseTune['ride-height-front'] + 2.5) * 10) / 10
        adjustments['ride-height-rear'] = Math.round((baseTune['ride-height-rear'] + 2.5) * 10) / 10
        adjustments['camber-front'] = -1.0
        adjustments['camber-rear'] = -0.6
        break

      case 'playground-games':
        adjustments['tire-pressure-front'] = 27.0
        adjustments['tire-pressure-rear'] = 26.0
        adjustments['brake-balance'] = 50
        break

      case 'eliminator':
        adjustments['tire-pressure-front'] = 22.5
        adjustments['tire-pressure-rear'] = 21.5
        adjustments['ride-height-front'] = Math.round((baseTune['ride-height-front'] + 3.0) * 10) / 10
        adjustments['ride-height-rear'] = Math.round((baseTune['ride-height-rear'] + 3.0) * 10) / 10
        break

      case 'horizon-tour':
        adjustments['tire-pressure-front'] = 28.5
        adjustments['tire-pressure-rear'] = 27.5
        break
    }

    return { ...baseTune, ...adjustments }
  }

  // ---------------------------------------------------------------------------
  // Individual calculation methods — FH6-specific 8-Point formulas
  // ---------------------------------------------------------------------------

  // Tire Pressure [FH6 slider: 15–50 PSI]
  // In the 8-point model, pressure must scale positively with weight load.
  // Lower loads = lower pressure to keep tread flat. Higher loads = higher pressure to support carcass.
  calculateTirePressure(position) {
    const w = position === 'front' ? this.frontWeight : this.rearWeight
    const cornerLoad = (this.weight * w) / 2       // kg per corner
    
    // Baseline: 28.5 PSI at 375 kg corner weight.
    // Carcass support factor: +0.012 PSI per kg of corner load.
    let base = 28.5 + (cornerLoad - 375) * 0.012

    // Drivetrain load adjustments
    if (position === 'front' && this.drivetrain === 'FWD') {
      base += 0.8  // FWD pulls and steers on front tires; needs carcass support
    } else if (position === 'rear' && this.drivetrain === 'RWD' && this.power > 500) {
      base -= 0.6  // High-power rear tire gets slight squish room under acceleration squat
    }

    // PI / Aero load: higher speed classes load tires heavily via downforce
    if (this.piValue >= 900) {
      base += 0.8
    } else if (this.piValue >= 800) {
      base += 0.4
    }

    return Math.max(26.0, Math.min(34.0, Math.round(base * 10) / 10))
  }

  // Camber [FH6 slider: -5.0° to 0.0°]
  // 8-point tire footprint penalizes excessive static camber (causes tire to sit on inner 2 points).
  // Target conservative static camber values to maximize contact patch on straights / braking.
  calculateCamber(position) {
    const piAdj = this.piValue >= 900 ? -0.3 : this.piValue >= 700 ? -0.15 : 0
    let val
    if (position === 'front') {
      // Front camber uses weight to pre-emptively load inner patch
      val = -1.3 + (this.frontWeight - 0.50) * -2.0 + piAdj
      return Math.max(-2.5, Math.min(-0.8, Math.round(val * 10) / 10))
    } else {
      // Rear camber is even more vertical to support straight traction
      val = -0.9 + (this.rearWeight - 0.50) * -1.5 + piAdj
      return Math.max(-2.0, Math.min(-0.5, Math.round(val * 10) / 10))
    }
  }

  // Toe [FH6 slider: -5.0° to 5.0°]
  // 8-point model makes toe useful. Slight toe-out front pre-loads outer footprint coordinate for turn-in.
  // Slight toe-in rear stabilizes the rear contact patches under braking load.
  calculateToe(position) {
    if (position === 'front') {
      // Slight toe-out (-0.1 to -0.2)
      return -0.1
    } else {
      // Slight toe-in (0.1 to 0.2)
      return 0.1
    }
  }

  // Caster [FH6 slider: 1.0° to 7.0°]
  // We keep static camber mild, and instead run higher caster (6.0 to 6.8) to generate
  // the dynamic camber needed inside corner sweeps.
  calculateCaster() {
    const piFactor = this.piValue >= 900 ? 0.3 : this.piValue <= 600 ? -0.3 : 0
    return Math.max(5.5, Math.min(7.0, Math.round((6.4 + piFactor) * 10) / 10))
  }

  // Anti-Roll Bars [FH6 slider: 1–65]
  // 8-point model suffers severely from tyre lift (if roll stiffness is too high, tires lift and lose 50% contact).
  // Thus, ARB values are scaled down (0.72× base) to allow the chassis to roll and keep contact patches flat.
  calculateARB(position) {
    const w = position === 'front' ? this.frontWeight : this.rearWeight
    let val = 65 * w * 0.72

    if (this.handlingBalance !== 0) {
      const shift = this.handlingBalance * 0.8
      val += position === 'front' ? -shift : shift
    }

    // Rear rotation bias: slightly soften front, stiffen rear to help rear rotatability
    if (position === 'front') {
      val -= 2.0
    } else {
      val += 2.0
    }

    return Math.max(1.0, Math.min(65.0, Math.round(val)))
  }

  // Spring Rates [FH6 slider: 50–2000 lb/in]
  // Natural-frequency: K = 4π² × f² × corner_mass
  calculateSprings(position) {
    const freq = this.springFrequency
    const w = position === 'front' ? this.frontWeight : this.rearWeight
    const cornerMass = (this.weight * w) / 2                 // kg per corner
    const kNm = 4 * Math.PI * Math.PI * freq * freq * cornerMass  // N/m
    const kLbIn = kNm / 175.127                              // lb/in
    return Math.max(50, Math.min(2000, Math.round(kLbIn / 5) * 5))  // round to nearest 5
  }

  // Ride Height [FH6 slider: 4.0–15.0 cm]
  // Baseline setup is conservative to avoid bottoming out and compressing the 8-point carcass.
  calculateRideHeight(position) {
    const base = position === 'front' ? 6.5 : 7.0
    const piAdj = this.piValue >= 900 ? -0.5 : this.piValue <= 500 ? 0.5 : 0
    const val = Math.round((base + piAdj) * 10) / 10
    return Math.max(4.0, Math.min(15.0, val))
  }

  // Damping [FH6 slider: 1.0–20.0]
  // Critical Damping: $C_c = 2 \times m \times \omega_0$
  // ω₀ = 2π × springFrequency
  // Rebound damping scales to 62% of critical damping to restrict body roll.
  // Bump damping scales to 50%-65% of rebound to absorb bump impulses and keep contact patch stable.
  calculateDamping(type, position) {
    const w = position === 'front' ? this.frontWeight : this.rearWeight
    const cornerMass = (this.weight * w) / 2
    const omega = 2 * Math.PI * this.springFrequency  // rad/s
    const criticalDamping = 2 * cornerMass * omega    // Ns/m
    
    const scaleFactor = 440 // Ns/m per FH6 slider unit
    const reboundRatio = 0.62
    
    const rebound = (reboundRatio * criticalDamping) / scaleFactor
    const bump = rebound * (this.bumpStiffness / 100)
    
    const val = type === 'rebound' ? rebound : bump
    return Math.max(1.0, Math.min(20.0, Math.round(val * 10) / 10))
  }

  // Differential [FH6 slider: 0–100%]
  // 8-point tire footprint allows rear tire to rotate on entry if rear decel is low.
  // Accel lock needs to be high for exit traction.
  calculateDifferential(type) {
    const ptw = this.power / this.weight
    
    if (this.drivetrain === 'RWD') {
      if (type === 'accel') {
        const val = Math.round(55 + (ptw - 0.2) * 20)
        return Math.max(45, Math.min(85, val))
      } else {
        const val = Math.round(20 - (ptw - 0.2) * 8)
        return Math.max(12, Math.min(28, val))
      }
    }

    if (this.drivetrain === 'FWD') {
      if (type === 'accel') {
        const val = Math.round(30 - (ptw - 0.2) * 10)
        return Math.max(20, Math.min(40, val))
      } else {
        return 10
      }
    }

    // AWD (Rear axle values; front and center handled separately)
    if (type === 'accel') {
      const val = Math.round(60 + (ptw - 0.2) * 15)
      return Math.max(50, Math.min(85, val))
    } else {
      const val = Math.round(22 - (ptw - 0.2) * 8)
      return Math.max(14, Math.min(30, val))
    }
  }

  // AWD front differential [FH6 slider: 0–100%]
  // Keep front differential low to prevent axle bind under load.
  calculateFrontDiff(type) {
    const ptw = this.power / this.weight
    if (type === 'accel') {
      const val = Math.round(35 + (ptw - 0.2) * 10)
      return Math.max(25, Math.min(50, val))
    } else {
      return 5 // minimal front decel lock to avoid entry understeer
    }
  }

  // AWD centre differential [FH6 slider: 0–100% — balance torque split to rear]
  // FH6 center diff represents Rear split.
  // Baseline: 65% rear split. Heavier power targets slightly higher rear split (70-75%) for RWD handling feel.
  calculateCentreDiff() {
    const ptw = this.power / this.weight
    const val = Math.round(65 + (ptw - 0.2) * 15)
    return Math.max(55, Math.min(80, val))
  }

  // Brake Balance [FH6 slider: 0–100 — displayed as front%]
  // FH6 uses INVERTED brake balance slider (100 - front%).
  // Base targets: 52% front (display 48), adjust for handlingBalance.
  calculateBrakeBalance() {
    let targetFront = this.drivetrain === 'FWD' ? 56 : 52
    targetFront -= this.handlingBalance * 0.3
    return Math.max(0, Math.min(100, Math.round(100 - targetFront)))
  }

  // Brake Pressure [FH6 slider: 0–200%]
  calculateBrakePressure() {
    if (this.piValue >= 900) return 100
    if (this.weight > 2000)  return 115  // heavy weights require high caliper pressure
    if (this.weight < 1100 && this.power < 300) return 95
    return 100
  }

  // Final Drive [FH6 slider: ~2.00–6.00]
  calculateFinalDrive() {
    const val = (400 - this.power) / 600 + 4.25
    return Math.max(2.0, Math.min(6.0, Math.round(val * 100) / 100))
  }

  // Advanced Gearing: geometric progression
  calculateGearRatios() {
    const ratios = {}
    const gC = this.gearCount || 6

    let firstRatio = 2.85
    if (this.power < 300) firstRatio += 0.30
    if (this.power > 800) firstRatio -= 0.40
    if (this.drivetrain === 'FWD') firstRatio *= 0.88

    let topRatio = 0.72
    if (this.power > 800) topRatio += 0.13
    if (this.power < 300) topRatio -= 0.05

    const stepRatio = gC > 1 ? Math.pow(topRatio / firstRatio, 1 / (gC - 1)) : 1

    for (let i = 1; i <= gC; i++) {
      ratios['gear-' + i] = Math.round(firstRatio * Math.pow(stepRatio, i - 1) * 100) / 100
    }
    return ratios
  }

  // Aerodynamics [FH6 slider: front 50–300 kg, rear 100–400 kg]
  calculateAero(position) {
    const balanceFactor = this.handlingBalance / 10
    if (position === 'front') {
      const base = Math.round(185 * this.frontWeight * 2)
      const balanceAdj = Math.round(-balanceFactor * 55)
      return Math.max(50, Math.min(300, Math.round((base + balanceAdj) / 5) * 5))
    } else {
      const base = Math.round(175 * this.rearWeight * 2)
      const balanceAdj = Math.round(balanceFactor * 55)
      return Math.max(100, Math.min(400, Math.round((base + balanceAdj) / 5) * 5))
    }
  }

  // Get tuning recommendations based on driving style in FH6
  getStyleRecommendations(style) {
    const baseTune = this.calculateBaseTune()

    switch (style) {
      case 'aggressive':
        return {
          ...baseTune,
          'camber-front': Math.max(-2.5, Math.round((baseTune['camber-front'] - 0.3) * 10) / 10),
          'camber-rear': Math.max(-2.0, Math.round((baseTune['camber-rear'] - 0.2) * 10) / 10),
          'tire-pressure-front': Math.max(26.0, Math.round((baseTune['tire-pressure-front'] + 0.5) * 10) / 10),
          'tire-pressure-rear': Math.max(26.0, Math.round((baseTune['tire-pressure-rear'] + 0.5) * 10) / 10),
          'anti-roll-bar-front': Math.min(65, baseTune['anti-roll-bar-front'] + 4),
          'anti-roll-bar-rear': Math.min(65, baseTune['anti-roll-bar-rear'] + 4),
        }

      case 'smooth':
        return {
          ...baseTune,
          'spring-rate-front': Math.max(50, Math.round((baseTune['spring-rate-front'] * 0.9) / 5) * 5),
          'spring-rate-rear': Math.max(50, Math.round((baseTune['spring-rate-rear'] * 0.9) / 5) * 5),
          'damping-rebound-front': Math.max(1.0, Math.round((baseTune['damping-rebound-front'] - 1.5) * 10) / 10),
          'damping-rebound-rear': Math.max(1.0, Math.round((baseTune['damping-rebound-rear'] - 1.5) * 10) / 10),
        }

      case 'drift':
        return {
          ...baseTune,
          'tire-pressure-front': 31.0,
          'tire-pressure-rear': 24.5,
          'camber-front': -2.8,
          'camber-rear': -0.6,
          'toe-front': -0.2,
          'toe-rear': 0.0,
          'differential-rear-accel': 100,
          'differential-rear-decel': 100,
          'anti-roll-bar-front': 25,
          'anti-roll-bar-rear': 15,
        }

      default:
        return baseTune
    }
  }

  // Get tune recommendations based on tune type in FH6
  getTuneTypeRecommendations(tuneType) {
    const baseTune = this.calculateBaseTune()

    switch (tuneType) {
      case 'Track': {
        const origFreqTrack = this.springFrequency
        this.springFrequency = 1.95 // 8-point contact benefits from slightly softer track frequencies for compliance
        const trackSprings = {
          'spring-rate-front': this.calculateSprings('front'),
          'spring-rate-rear':  this.calculateSprings('rear'),
        }
        this.springFrequency = origFreqTrack
        return {
          ...baseTune,
          ...trackSprings,
          'tire-pressure-front': Math.round(baseTune['tire-pressure-front'] * 1.03 * 10) / 10,
          'tire-pressure-rear': Math.round(baseTune['tire-pressure-rear'] * 1.03 * 10) / 10,
          'camber-front': -1.6,
          'camber-rear': -1.2,
          'toe-front': -0.15, // slight toe-out assists track turn-in
          'toe-rear': 0.1,    // toe-in rear secures the line
          'aero-front': Math.min(300, baseTune['aero-front'] + 40),
          'aero-rear': Math.min(400, baseTune['aero-rear'] + 40),
          'anti-roll-bar-front': Math.min(65, Math.round(baseTune['anti-roll-bar-front'] + 5)),
          'anti-roll-bar-rear': Math.min(65, Math.round(baseTune['anti-roll-bar-rear'] + 5)),
          'brake-balance': 48, // display balance (52% front)
        }
      }

      case 'Drift':
        return {
          ...baseTune,
          'tire-pressure-front': 31.0,
          'tire-pressure-rear': 24.5,
          'camber-front': -2.8,
          'camber-rear': -0.6,
          'toe-front': -0.2,
          'toe-rear': 0.0,
          'differential-rear-accel': 100,
          'differential-rear-decel': 100,
          'anti-roll-bar-front': 25,
          'anti-roll-bar-rear': 15,
          'brake-balance': 45, // displayed balance (55% front for drift weight shift)
        }

      case 'Rally': {
        const origFreqRally = this.springFrequency
        this.springFrequency = 1.45
        const rallySprings = {
          'spring-rate-front': this.calculateSprings('front'),
          'spring-rate-rear':  this.calculateSprings('rear'),
        }
        this.springFrequency = origFreqRally
        return {
          ...baseTune,
          ...rallySprings,
          'tire-pressure-front': 23.5,
          'tire-pressure-rear': 22.5,
          'ride-height-front': Math.round((baseTune['ride-height-front'] + 2.0) * 10) / 10,
          'ride-height-rear': Math.round((baseTune['ride-height-rear'] + 2.0) * 10) / 10,
          'differential-rear-accel': 65,
          'differential-rear-decel': 25,
          'anti-roll-bar-front': Math.max(1, Math.round(baseTune['anti-roll-bar-front'] * 0.8)),
          'anti-roll-bar-rear': Math.max(1, Math.round(baseTune['anti-roll-bar-rear'] * 0.8)),
          'camber-front': -1.0,
          'camber-rear': -0.6,
          'toe-front': -0.05,
          'toe-rear': 0.05,
          'brake-balance': 48,
        }
      }

      case 'Drag Racing': {
        return {
          ...baseTune,
          'tire-pressure-front': 45.0,
          'tire-pressure-rear': 18.0,
          'camber-front': -0.1,
          'camber-rear': -0.1,
          'toe-front': 0.0,
          'toe-rear': 0.0,
          'ride-height-front': Math.round((baseTune['ride-height-front'] - 1.0) * 10) / 10,
          'ride-height-rear': Math.round((baseTune['ride-height-rear'] + 0.5) * 10) / 10,
          'spring-rate-front': Math.round(baseTune['spring-rate-front'] * 0.80),
          'spring-rate-rear': Math.round(baseTune['spring-rate-rear'] * 1.30),
          'anti-roll-bar-front': Math.max(1, Math.round(baseTune['anti-roll-bar-front'] * 0.5)),
          'anti-roll-bar-rear': Math.min(65, Math.round(baseTune['anti-roll-bar-rear'] * 1.4)),
          'damping-rebound-front': Math.max(1.0, Math.round(baseTune['damping-rebound-front'] * 0.7)),
          'damping-rebound-rear': Math.min(20.0, Math.round(baseTune['damping-rebound-rear'] * 1.3)),
          'differential-rear-accel': 100,
          'differential-rear-decel': 0,
          'brake-balance': 50,
          'brake-pressure': 130,
          'aero-front': 50,
          'aero-rear': 100,
        }
      }

      case 'Off-road': {
        const origFreqOffroad = this.springFrequency
        this.springFrequency = 1.15
        const offroadSprings = {
          'spring-rate-front': this.calculateSprings('front'),
          'spring-rate-rear': this.calculateSprings('rear'),
        }
        this.springFrequency = origFreqOffroad
        return {
          ...baseTune,
          ...offroadSprings,
          'tire-pressure-front': 20.5,
          'tire-pressure-rear': 19.5,
          'camber-front': -0.6,
          'camber-rear': -0.4,
          'ride-height-front': Math.round((baseTune['ride-height-front'] + 4.0) * 10) / 10,
          'ride-height-rear': Math.round((baseTune['ride-height-rear'] + 4.0) * 10) / 10,
          'anti-roll-bar-front': Math.max(1, Math.round(baseTune['anti-roll-bar-front'] * 0.6)),
          'anti-roll-bar-rear': Math.max(1, Math.round(baseTune['anti-roll-bar-rear'] * 0.6)),
          'damping-rebound-front': Math.round(baseTune['damping-rebound-front'] * 0.75 * 10) / 10,
          'damping-rebound-rear': Math.round(baseTune['damping-rebound-rear'] * 0.75 * 10) / 10,
          'differential-rear-accel': 70,
          'differential-rear-decel': 20,
          'brake-balance': 47,
        }
      }

      case 'Cross-country': {
        const origFreqCross = this.springFrequency
        this.springFrequency = 1.30
        const crossSprings = {
          'spring-rate-front': this.calculateSprings('front'),
          'spring-rate-rear': this.calculateSprings('rear'),
        }
        this.springFrequency = origFreqCross
        return {
          ...baseTune,
          ...crossSprings,
          'tire-pressure-front': 21.0,
          'tire-pressure-rear': 20.0,
          'camber-front': -0.8,
          'camber-rear': -0.5,
          'ride-height-front': Math.round((baseTune['ride-height-front'] + 3.5) * 10) / 10,
          'ride-height-rear': Math.round((baseTune['ride-height-rear'] + 3.5) * 10) / 10,
          'anti-roll-bar-front': Math.max(1, Math.round(baseTune['anti-roll-bar-front'] * 0.7)),
          'anti-roll-bar-rear': Math.max(1, Math.round(baseTune['anti-roll-bar-rear'] * 0.7)),
          'differential-rear-accel': 65,
          'differential-rear-decel': 25,
          'brake-balance': 47,
        }
      }

      case 'Snow / Ice': {
        const origFreqSnow = this.springFrequency
        this.springFrequency = 1.10
        const snowSprings = {
          'spring-rate-front': this.calculateSprings('front'),
          'spring-rate-rear': this.calculateSprings('rear'),
        }
        this.springFrequency = origFreqSnow
        return {
          ...baseTune,
          ...snowSprings,
          'tire-pressure-front': 21.5,
          'tire-pressure-rear': 20.5,
          'camber-front': -0.8,
          'camber-rear': -0.5,
          'ride-height-front': Math.round((baseTune['ride-height-front'] + 3.0) * 10) / 10,
          'ride-height-rear': Math.round((baseTune['ride-height-rear'] + 3.0) * 10) / 10,
          'anti-roll-bar-front': Math.max(1, Math.round(baseTune['anti-roll-bar-front'] * 0.5)),
          'anti-roll-bar-rear': Math.max(1, Math.round(baseTune['anti-roll-bar-rear'] * 0.5)),
          'damping-rebound-front': Math.round(baseTune['damping-rebound-front'] * 0.65 * 10) / 10,
          'damping-rebound-rear': Math.round(baseTune['damping-rebound-rear'] * 0.65 * 10) / 10,
          'differential-rear-accel': 40,
          'differential-rear-decel': 15,
          'brake-balance': 47,
          'brake-pressure': 95,
        }
      }

      case 'Buggy / Truck': {
        const origFreqBuggy = this.springFrequency
        this.springFrequency = 1.10
        const buggySprings = {
          'spring-rate-front': this.calculateSprings('front'),
          'spring-rate-rear': this.calculateSprings('rear'),
        }
        this.springFrequency = origFreqBuggy
        return {
          ...baseTune,
          ...buggySprings,
          'tire-pressure-front': 19.5,
          'tire-pressure-rear': 18.5,
          'camber-front': -0.4,
          'camber-rear': -0.3,
          'ride-height-front': Math.round((baseTune['ride-height-front'] + 5.0) * 10) / 10,
          'ride-height-rear': Math.round((baseTune['ride-height-rear'] + 5.0) * 10) / 10,
          'anti-roll-bar-front': Math.max(1, Math.round(baseTune['anti-roll-bar-front'] * 0.4)),
          'anti-roll-bar-rear': Math.max(1, Math.round(baseTune['anti-roll-bar-rear'] * 0.4)),
          'damping-rebound-front': Math.round(baseTune['damping-rebound-front'] * 0.60 * 10) / 10,
          'damping-rebound-rear': Math.round(baseTune['damping-rebound-rear'] * 0.60 * 10) / 10,
          'differential-rear-accel': 65,
          'differential-rear-decel': 25,
          'brake-balance': 46,
        }
      }

      case 'Basic (General)':
      default:
        return baseTune
    }
  }
}

// Forza Horizon 6 Track Types Database (corresponds to 8-point contact physics optimization)
export const TRACK_TYPES = {
  'road-racing': {
    name: 'Road Racing',
    description: 'Paved circuits with smooth asphalt cornering',
    characteristics: ['paved', 'even-surface', 'high-speed'],
    priority: ['contact-patch-stability', 'dynamic-camber', 'trail-braking'],
  },
  'street-scene': {
    name: 'Street Scene',
    description: 'Public roads with elevation shifts and bumps',
    characteristics: ['bumpy', 'camber-changes', 'curbs'],
    priority: ['suspension-compliance', 'rebound-control', 'bump-absorption'],
  },
  'dirt-racing': {
    name: 'Dirt Racing',
    description: 'Loose soil racing requiring high carcass flexibility',
    characteristics: ['dirt', 'slippery', 'ruts'],
    priority: ['footprint-deformation', 'flotation', 'diff-slip'],
  },
  'cross-country': {
    name: 'Cross Country',
    description: 'Rugged off-road driving with deep jumps',
    characteristics: ['rough-terrain', 'heavy-landings', 'rocks'],
    priority: ['dampener-stroke', 'carcass-pressure', 'chassis-height'],
  },
  'drag-strip': {
    name: 'Drag Strip',
    description: 'Straight-line launch optimization',
    characteristics: ['straight-line', 'maximum-bite', 'flat-surface'],
    priority: ['rear-squat-traction', 'zero-scrub-camber', 'locked-differential'],
  },
  drift: {
    name: 'Drift',
    description: 'Continuous controlled oversteer',
    characteristics: ['sideways', 'steering-angle', 'tire-smoke'],
    priority: ['front-slip-grip', 'rear-drive-bite', 'locked-diff'],
  },
  rally: {
    name: 'Rally',
    description: 'Varied surface point-to-point stages',
    characteristics: ['mixed-surfaces', 'jumps', 'technical'],
    priority: ['carcass-compliance', 'camber-recovery', 'braking-stability'],
  },
  'playground-games': {
    name: 'Playground Games',
    description: 'Extreme acceleration and rapid transitions',
    characteristics: ['varied', 'sudden-reversals', 'agility'],
    priority: ['rapid-weight-transfer', 'neutral-brake', 'quick-turn-in'],
  },
  eliminator: {
    name: 'The Eliminator',
    description: 'Survival racing across diverse open world terrain',
    characteristics: ['free-roam', 'uneven-obstacles', 'jumps'],
    priority: ['durability', 'flotation-grip', 'chassis-travel'],
  },
  'horizon-tour': {
    name: 'Horizon Tour',
    description: 'Cooperative race championships',
    characteristics: ['varied', 'standardized', 'teamwork'],
    priority: ['predictable-grip', 'tire-wear-heat', 'balance'],
  },
}

export const TRACKS = TRACK_TYPES
