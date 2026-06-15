// Forza Horizon 5 Tuning Calculator
//
// Formula sources:
//   [1] forzatune.com — "The Fully Updated Forza Tuning Guide" (Anthony Curtis)
//   [2] Community research: Engineering Dynamics and Algorithmic Tuning Protocols in FH5
//       (HokiHoshi / Forza community formulas, verified via telemetry)
//
// FH5-specific rules encoded here (differ from Motorsport):
//   • Brake balance slider is INVERTED  →  display_value = 100 − target_front%
//   • Toe should be 0° for ALL FH5 builds — non-zero is unpredictable in FH5 [1] (v5.4.5)
//   • Caster max 6.0° in FH5 — higher values cause too-snappy turn-in [1]
//   • Cold tire pressure 27–30 PSI targets hot range 32–34 PSI [1] (v6.5.0 corner-load model)
//   • Off-road flotation physics requires 15–20 PSI for Cross-Country [2]
//   • Weight distribution is the backbone for springs, ARBs, and damping [2]
//   • Damping uses physics-based critical damping model (v6.8.0) — scales with corner mass
//   • ARBs default rear-biased for natural rotation tendency (v6.1.0)
//   • Brake balance responds to handlingBalance slider (v6.6.0)
//   • Aero balance sensitivity ±55 kg (v6.7.0); front base at 185× (v6.9.0)

export class TuningCalculator {
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
      // AWD-only: front diff and centre split
      ...(this.drivetrain === 'AWD' ? {
        'differential-front-accel': this.calculateFrontDiff('accel'),
        'differential-front-decel': this.calculateFrontDiff('decel'),
        'differential-center': this.calculateCentreDiff(),
      } : {}),

      // Brakes: Stopping power balance
      'brake-balance': this.calculateBrakeBalance(),
      'brake-pressure': this.calculateBrakePressure(),

      // Gearing: Speed vs acceleration balance
      'final-drive': this.calculateFinalDrive(),
      ...this.calculateGearRatios(),

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
  // v6.5.0 / v5.2.0: advanced tire pressure model — corner-load based for handling balance
  // Corner load (kg) = (weight × axle_fraction) / 2;  heavier corners → slightly lower pressure
  //   to spread the contact patch correctly under sustained cornering load
  // Baseline: 28.0 PSI at 400 kg corner load; ±~0.003 PSI per kg delta
  // Cold target 27–30 PSI; anticipate +4–5 PSI heat rise to hit 32–34 PSI hot [1]
  // FWD front: steering + drive load → +0.5 PSI to keep contact patch firm
  // High-power non-FWD rear: heavy acceleration load → -1.0 PSI for wider patch
  // X/S2 PI class: high aero cars benefit from slightly lower pressures (-0.5)
  calculateTirePressure(position) {
    const w = position === 'front' ? this.frontWeight : this.rearWeight
    const cornerLoad = (this.weight * w) / 2       // kg per corner
    const baseCornerLoad = 400                      // kg calibration point
    const pressureDelta = 0.003                     // PSI per kg delta from base

    let base = 28.0 - (cornerLoad - baseCornerLoad) * pressureDelta

    // Drivetrain loads
    if (position === 'front' && this.drivetrain === 'FWD') base += 0.5
    if (position === 'rear' && this.drivetrain !== 'FWD' && this.power > 600) base -= 1.0
    if (position === 'front' && this.drivetrain === 'FWD' && this.power > 400) base += 0.5

    // PI class: X-class high-aero cars run slightly lower pressures
    if (this.piValue >= 900) base -= 0.5

    return Math.max(15, Math.min(50, Math.round(base * 10) / 10))
  }

  // Camber [FH5 slider: -5.0° to 0°]
  // v4.1.0: dynamic camber model — scales with weight distribution AND PI class
  // v6.9.0: updated FH5 alignment settings for improved turn-in
  // Formula: base + (W_axle - 0.50) × -3.0 (front) or × -2.0 (rear) + piAdj [2]
  // More front weight → more negative front camber to maintain contact patch
  // Base values increased (v6.9.0) from -1.2/-0.9 to -1.5/-1.0 for better turn-in entry
  calculateCamber(position) {
    // v4.1.0: expanded PI class scaling for dynamic camber model
    const piAdj = this.piValue >= 900 ? -0.4 : this.piValue >= 700 ? -0.2 : this.piValue >= 500 ? -0.1 : 0
    let val
    if (position === 'front') {
      // v6.9.0: base raised to -1.5 (was -1.2) for improved turn-in
      val = -1.5 + (this.frontWeight - 0.50) * -3.0 + piAdj
      val = Math.round(val * 10) / 10
      return Math.max(-5.0, Math.min(-0.5, val))
    } else {
      // v6.9.0: base raised to -1.0 (was -0.9)
      val = -1.0 + (this.rearWeight - 0.50) * -2.0 + piAdj
      val = Math.round(val * 10) / 10
      return Math.max(-5.0, Math.min(-0.3, val))
    }
  }

  // Toe [FH5 slider: -5.0° to 5.0°]
  // v5.4.5: "Toe values are now zero in almost all situations" — FH5 toe is unpredictable [1]
  // Non-zero toe interacts badly with FH5 steering assists and gives inconsistent results.
  calculateToe(_position) {
    return 0.0  // FH5: 0° in virtually all situations [1] (v5.4.5)
  }

  // Caster [FH5 slider: 1.0° to 7.0°]
  // FH5 guide: 5.5° ± 0.5°; NEVER above 6.0° (causes snappy turn-in) [1]
  calculateCaster() {
    return 5.5   // fixed; no stat-based creep
  }

  // Anti-Roll Bars [FH5 slider: 1–65]
  // v6.1.0: stiffer ARBs in defaults + rear rotation bias for more natural oversteer tendency
  // Formula: ARB = 65 × W_axle% + 1.5; then rear gets +3, front gets -2 (rotation shift)
  // This mirrors weight distribution but biases rear slightly stiffer → promotes rotation under load
  // handlingBalance: -10 (understeer) → -shift on front, +shift on rear; +10 (oversteer) → inverse
  calculateARB(position) {
    const w = position === 'front' ? this.frontWeight : this.rearWeight
    // v6.1.0: base multiplier raised to 65 (was 64); rotation bias applied per axle
    let val = 65 * w + 1.5
    // Rotation bias: rear ARB stiffer than weight distribution alone would suggest
    // This gives more rear resistance to roll → oversteer tendency under cornering load
    if (position === 'rear') val += 3
    else val -= 2
    if (this.handlingBalance !== 0) {
      // v6.1.0: slightly wider balance range (0.7 per unit, was 0.5)
      const shift = this.handlingBalance * 0.7
      val += position === 'front' ? -shift : shift
    }
    return Math.max(1, Math.min(65, Math.round(val)))
  }

  // Spring Rates [FH5 slider: 50–300 lb/in]
  // Natural-frequency formula: K = 4π² × f² × corner_mass [2]
  // corner_mass (kg) = (weight × W_axle%) / 2;  convert N/m → lb/in ÷ 175.127
  // this.springFrequency: 1.5 Hz street, 1.7 Hz rally, 2.0 Hz track (set in constructor/tune-type)
  calculateSprings(position) {
    const freq = this.springFrequency
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
  // v6.1.0: more aggressive damping for better rotation
  // v6.8.0: physics-based model for consistent handling across vehicles (replaces flat 19×w formula)
  // Formula: critical damping Cc = 2 × cornerMass × ω₀ (rad/s); ω₀ = 2π × springFrequency
  //   rebound = ζ_rebound × Cc  (ζ = 0.65 per FH5 community testing)
  //   bump    = rebound × (bumpStiffness / 100)
  // Scaled by 435 Ns/m per FH5 unit (empirically calibrated)
  // This model naturally handles lighter/heavier and stiffer/softer suspensions correctly.
  calculateDamping(type, position) {
    const w = position === 'front' ? this.frontWeight : this.rearWeight
    const cornerMass = (this.weight * w) / 2          // kg per corner
    const omega = 2 * Math.PI * this.springFrequency  // rad/s
    const criticalDamping = 2 * cornerMass * omega    // Ns/m
    const scaleFactor = 435                            // Ns/m per FH5 slider unit
    const reboundRatio = 0.65                          // verified critical damping ratio

    const rebound = reboundRatio * criticalDamping / scaleFactor
    const bump    = rebound * (this.bumpStiffness / 100)
    const val = type === 'rebound' ? rebound : bump
    return Math.max(1.0, Math.min(20.0, Math.round(val * 10) / 10))
  }

  // Differential [FH5 slider: 0–100%]
  // FH5 ranges (NOT Motorsport) [1]:
  //   RWD  accel 25–55%  decel 20–40%  (v6.1.0: wider range for more natural oversteer)
  //   FWD  accel 15–25%  decel 10–20%
  //   AWD  same as FWD/RWD per axle  +  centre 50–75%
  // v6.1.0: wider range of differential values to shift balance towards oversteer;
  //   decel lock is now dynamic (was fixed 35) — lower decel = more rotation on trail braking
  // v5.3.0: fix rear differential calculations (AWD rear decel now dynamic)
  calculateDifferential(type) {
    const ptw = this.power / this.weight   // power-to-weight ratio

    if (this.drivetrain === 'RWD') {
      if (type === 'accel') {
        // Higher PTW → higher lock for traction; lower PTW → more slip for rotation
        const val = Math.round(35 + (ptw - 0.2) * 25)
        return Math.max(25, Math.min(55, val))
      } else {
        // v6.1.0: dynamic decel (was fixed 35); lower = more rotation under braking
        const val = Math.round(30 - (ptw - 0.2) * 10)
        return Math.max(20, Math.min(40, val))
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

    // AWD — return rear axle values; centre and front exposed via calculateBaseTune
    if (type === 'accel') {
      const val = Math.round(40 - (ptw - 0.2) * 20)
      return Math.max(25, Math.min(50, val))
    } else {
      // v5.3.0: fix — was hardcoded 35; now dynamic for more consistent AWD handling
      const val = Math.round(30 - (ptw - 0.2) * 10)
      return Math.max(20, Math.min(40, val))
    }
  }

  // AWD front differential [FH5 slider: 0–100%]
  // v6.2.0: increased front differential values for better compromise on different corner radii
  // Front accel lock is lower than rear to control understeer; decel very low [1]
  calculateFrontDiff(type) {
    const ptw = this.power / this.weight
    if (type === 'accel') {
      // v6.2.0: increased range from 10-30 to 15-40
      const val = Math.round(28 - (ptw - 0.2) * 8)
      return Math.max(15, Math.min(40, val))
    } else {
      return 10  // minimal front decel lock to allow rotation [1]
    }
  }

  // AWD centre differential [FH5 slider: 0–100% — front torque split]
  // 50% = equal; higher value = more front torque (understeer); lower = more rear (rotation) [1]
  // Neutral baseline: 65% front split (FH5 AWD is front-biased by default)
  // More power-to-weight → slightly less front (allow rear rotation)
  calculateCentreDiff() {
    const ptw = this.power / this.weight
    const val = Math.round(65 - (ptw - 0.2) * 15)
    return Math.max(50, Math.min(80, val))
  }

  // Brake Balance [FH5 slider: 0–100 — displayed as front%]
  // FH5 Horizon brake slider is INVERTED: to get target_front% bias, set (100 − target_front) [1]
  // v6.6.0: brake balance now responds to handling balance (turn entry adjustment)
  //   More understeer (negative balance) → more front brake bias (trail braking stability)
  //   More oversteer (positive balance) → less front brake bias (allows rotation on entry)
  // Base targets: RWD 52% front, FWD 58% front, AWD 52% front
  // display_value = 100 − targetFront  →  RWD/AWD neutral = 48, FWD neutral = 42
  calculateBrakeBalance() {
    let targetFront = this.drivetrain === 'FWD' ? 58 : 52
    // v6.6.0: dynamic adjustment from handling balance; ±0.3% per balance unit (max ±3%)
    targetFront -= this.handlingBalance * 0.3
    // FH5 inversion: display = 100 − targetFront
    return Math.max(0, Math.min(100, Math.round(100 - targetFront)))
  }

  // Brake Pressure [FH5 slider: 0–200%]
  // Light cars with big brakes can safely go higher (quicker deceleration).
  // Very heavy trucks/SUVs need higher pressure to overcome rotational inertia.
  // X-class cars at 900+ PI already have race-spec brakes — stay at 100% [1].
  calculateBrakePressure() {
    if (this.piValue >= 900) return 100          // race brakes — already optimal
    if (this.weight > 2000)  return 110          // heavy — need more caliper force
    if (this.weight < 1100 && this.power < 300) return 95  // light low-power cars
    return 100
  }

  // Final Drive [FH5 slider: ~2.00–6.00]
  // Approximation: (400 − HP) / 600 + 4.25  for 6-speed race box [2]
  // High-HP cars need lower final drive ratio for top speed
  calculateFinalDrive() {
    const val = (400 - this.power) / 600 + 4.25
    return Math.max(2.0, Math.min(6.0, Math.round(val * 100) / 100))
  }

  // Advanced Gearing: calculates individual gear ratios using geometric progression
  // Each gear is a constant percentage taller than the previous one, matching how
  // real motorsport gearboxes are cut ("equal step ratio" or "close ratio" box) [2].
  // step = (topRatio / firstRatio) ^ (1 / (n-1));  gear_i = firstRatio × step^(i-1)
  calculateGearRatios() {
    const ratios = {}
    const gC = this.gearCount || 6

    // First-gear ratio: lower power → shorter first (more torque multiplication)
    let firstRatio = 2.85
    if (this.power < 300) firstRatio += 0.30
    if (this.power > 800) firstRatio -= 0.40
    // FWD: taller first/second gears manage torque steer on front axle
    if (this.drivetrain === 'FWD') firstRatio *= 0.88

    // Top-gear ratio: higher power → slightly taller overdrive for top speed
    let topRatio = 0.72
    if (this.power > 800) topRatio += 0.13
    if (this.power < 300) topRatio -= 0.05

    const stepRatio = gC > 1 ? Math.pow(topRatio / firstRatio, 1 / (gC - 1)) : 1

    for (let i = 1; i <= gC; i++) {
      ratios['gear-' + i] = Math.round(firstRatio * Math.pow(stepRatio, i - 1) * 100) / 100
    }
    return ratios
  }

  // Aerodynamics [FH5 slider: front 50–300 kg, rear 100–400 kg]
  // Balance aero proportional to weight distribution [2]
  // v6.7.0: aerodynamic recommendations now change more noticeably with balance adjustment
  //   Balance factor increased from ±35 to ±55 kg per ±10 balance for more meaningful sensitivity
  // v6.9.0: updated FH5 aero base recommendations — front aero base adjusted upward slightly
  //   More front weight → more front downforce to maintain balance under braking
  calculateAero(position) {
    // handlingBalance: -10 (understeer/stable) → 0 (neutral) → +10 (oversteer/agile)
    const balanceFactor = this.handlingBalance / 10  // -1.0 to +1.0
    if (position === 'front') {
      // v6.9.0: base factor 185 (was 175) for slightly higher default front downforce
      const base = Math.round(185 * this.frontWeight * 2)
      // v6.7.0: balance sensitivity increased from ±35 to ±55 for more noticeable response
      const balanceAdj = Math.round(-balanceFactor * 55)
      return Math.max(50, Math.min(300, Math.round((base + balanceAdj) / 5) * 5))
    } else {
      const base = Math.round(175 * this.rearWeight * 2)
      // v6.7.0: rear sensitivity also increased from ±35 to ±55
      const balanceAdj = Math.round(balanceFactor * 55)
      return Math.max(100, Math.min(400, Math.round((base + balanceAdj) / 5) * 5))
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
      case 'Track': {
        // Recalculate springs at 2.0 Hz using natural-frequency formula (not a flat offset) [2]
        const origFreqTrack = this.springFrequency
        this.springFrequency = 2.0
        const trackSprings = {
          'spring-rate-front': this.calculateSprings('front'),
          'spring-rate-rear':  this.calculateSprings('rear'),
        }
        this.springFrequency = origFreqTrack
        return {
          ...baseTune,
          ...trackSprings,
          'tire-pressure-front': 26,
          'tire-pressure-rear': 25,
          'camber-front': -2.5,
          'camber-rear': -2.0,
          'aero-front': Math.min(300, baseTune['aero-front'] + 50),
          'aero-rear': Math.min(400, baseTune['aero-rear'] + 50),
          'anti-roll-bar-front': Math.min(65, baseTune['anti-roll-bar-front'] + 10),
          'anti-roll-bar-rear': Math.min(65, baseTune['anti-roll-bar-rear'] + 10),
          // Inverted: target 52% front → set slider to 48
          'brake-balance': 48,
        }
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

      case 'Rally': {
        // Rally: 1.7 Hz — softer than track to absorb surface changes [2]
        const origFreqRally = this.springFrequency
        this.springFrequency = 1.7
        const rallySprings = {
          'spring-rate-front': this.calculateSprings('front'),
          'spring-rate-rear':  this.calculateSprings('rear'),
        }
        this.springFrequency = origFreqRally
        return {
          ...baseTune,
          ...rallySprings,
          'tire-pressure-front': 24,
          'tire-pressure-rear': 22,
          'ride-height-front': 7.5,
          'ride-height-rear': 8.0,
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
      }

      case 'Drag Racing': {
        // Drag: flat gearing profile, wide tires, stiff rear, open front diff [1][2]
        // Very low front camber prevents side-load on straights.
        // Rear diff fully locked for maximum traction off the line.
        return {
          ...baseTune,
          'tire-pressure-front': 32,
          'tire-pressure-rear': 26,
          'camber-front': -0.5,
          'camber-rear': -0.5,
          'toe-front': 0.0,
          'toe-rear': 0.0,
          'ride-height-front': 5.5,
          'ride-height-rear': 7.0,   // squat for better launch weight transfer
          'spring-rate-front': Math.round(baseTune['spring-rate-front'] * 0.85),
          'spring-rate-rear': Math.round(baseTune['spring-rate-rear'] * 1.25),
          'anti-roll-bar-front': Math.max(1, baseTune['anti-roll-bar-front'] - 10),
          'anti-roll-bar-rear': Math.min(65, baseTune['anti-roll-bar-rear'] + 15),
          'damping-rebound-front': Math.max(1, baseTune['damping-rebound-front'] - 2),
          'damping-rebound-rear': Math.min(20, baseTune['damping-rebound-rear'] + 3),
          'differential-rear-accel': 100,  // full lock for maximum launch grip [2]
          'differential-rear-decel': 0,
          'brake-balance': 50,
          'brake-pressure': 130,           // high braking at finish line
          'aero-front': 50,                // minimum drag
          'aero-rear': 100,                // minimum drag
        }
      }

      case 'Off-road': {
        // Off-road: flotation pressure, high ride, soft springs, minimal ARB [1][2]
        // FH5 cross-country physics requires 15–20 PSI for proper flotation [2]
        const origFreqOffroad = this.springFrequency
        this.springFrequency = 1.3
        const offroadSprings = {
          'spring-rate-front': this.calculateSprings('front'),
          'spring-rate-rear': this.calculateSprings('rear'),
        }
        this.springFrequency = origFreqOffroad
        return {
          ...baseTune,
          ...offroadSprings,
          'tire-pressure-front': 18,
          'tire-pressure-rear': 16,
          'camber-front': -0.5,
          'camber-rear': -0.3,
          'ride-height-front': 10.0,
          'ride-height-rear': 10.5,
          'anti-roll-bar-front': Math.max(1, Math.round(baseTune['anti-roll-bar-front'] * 0.5)),
          'anti-roll-bar-rear': Math.max(1, Math.round(baseTune['anti-roll-bar-rear'] * 0.5)),
          'damping-rebound-front': Math.round(baseTune['damping-rebound-front'] * 0.7),
          'damping-rebound-rear': Math.round(baseTune['damping-rebound-rear'] * 0.7),
          'differential-rear-accel': 60,
          'differential-rear-decel': 25,
          'brake-balance': 47,
        }
      }

      case 'Cross-country': {
        // Cross-country: between Rally and Off-road — mixed tarmac + dirt [2]
        const origFreqCross = this.springFrequency
        this.springFrequency = 1.5
        const crossSprings = {
          'spring-rate-front': this.calculateSprings('front'),
          'spring-rate-rear': this.calculateSprings('rear'),
        }
        this.springFrequency = origFreqCross
        return {
          ...baseTune,
          ...crossSprings,
          'tire-pressure-front': 22,
          'tire-pressure-rear': 20,
          'camber-front': -1.0,
          'camber-rear': -0.8,
          'ride-height-front': 9.0,
          'ride-height-rear': 9.5,
          'anti-roll-bar-front': Math.max(1, Math.round(baseTune['anti-roll-bar-front'] * 0.65)),
          'anti-roll-bar-rear': Math.max(1, Math.round(baseTune['anti-roll-bar-rear'] * 0.65)),
          'differential-rear-accel': 50,
          'differential-rear-decel': 30,
          'brake-balance': 47,
        }
      }

      case 'Snow / Ice': {
        // Snow/Ice: minimal camber, very soft, flotation pressures, smooth power [2]
        const origFreqSnow = this.springFrequency
        this.springFrequency = 1.2
        const snowSprings = {
          'spring-rate-front': this.calculateSprings('front'),
          'spring-rate-rear': this.calculateSprings('rear'),
        }
        this.springFrequency = origFreqSnow
        return {
          ...baseTune,
          ...snowSprings,
          'tire-pressure-front': 20,
          'tire-pressure-rear': 18,
          'camber-front': -1.0,
          'camber-rear': -0.8,
          'ride-height-front': 9.5,
          'ride-height-rear': 10.0,
          'anti-roll-bar-front': Math.max(1, Math.round(baseTune['anti-roll-bar-front'] * 0.45)),
          'anti-roll-bar-rear': Math.max(1, Math.round(baseTune['anti-roll-bar-rear'] * 0.45)),
          'damping-rebound-front': Math.round(baseTune['damping-rebound-front'] * 0.65),
          'damping-rebound-rear': Math.round(baseTune['damping-rebound-rear'] * 0.65),
          'differential-rear-accel': 35,     // gentle delivery on slippery surface
          'differential-rear-decel': 20,
          'brake-balance': 47,
          'brake-pressure': 95,              // lighter braking to prevent lock-up
        }
      }

      case 'Buggy / Truck': {
        // Buggy/Truck: extreme ride height, maximum wheel travel, flotation [2]
        const origFreqBuggy = this.springFrequency
        this.springFrequency = 1.2
        const buggySprings = {
          'spring-rate-front': this.calculateSprings('front'),
          'spring-rate-rear': this.calculateSprings('rear'),
        }
        this.springFrequency = origFreqBuggy
        return {
          ...baseTune,
          ...buggySprings,
          'tire-pressure-front': 16,
          'tire-pressure-rear': 14,
          'camber-front': -0.3,
          'camber-rear': -0.3,
          'ride-height-front': 12.0,
          'ride-height-rear': 13.0,
          'anti-roll-bar-front': Math.max(1, Math.round(baseTune['anti-roll-bar-front'] * 0.35)),
          'anti-roll-bar-rear': Math.max(1, Math.round(baseTune['anti-roll-bar-rear'] * 0.35)),
          'damping-rebound-front': Math.round(baseTune['damping-rebound-front'] * 0.55),
          'damping-rebound-rear': Math.round(baseTune['damping-rebound-rear'] * 0.55),
          'differential-rear-accel': 55,
          'differential-rear-decel': 30,
          'brake-balance': 46,
        }
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
