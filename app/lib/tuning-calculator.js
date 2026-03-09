// Professional Forza Tuning Calculator
// Based on real-world racing principles and Forza-specific mechanics

export class TuningCalculator {
  constructor(carData) {
    this.car = carData
    this.weight = carData.weight || 1500
    this.power = carData.engine?.horsepower || 400
    this.drivetrain = carData.drivetrain || 'RWD'
    this.piClass = carData.pi?.class || 'A'
    this.piValue = carData.pi?.value || 700
    this.stats = carData.stats
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
        adjustments['tire-pressure-front'] = 28
        adjustments['tire-pressure-rear'] = 26
        adjustments['camber-front'] = -1.8
        adjustments['camber-rear'] = -1.5
        adjustments['aero-front'] = 150
        adjustments['aero-rear'] = 200
        break

      case 'street-scene':
        adjustments['final-drive'] = 3.8
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
        adjustments['tire-pressure-front'] = 20
        adjustments['tire-pressure-rear'] = 18
        adjustments['ride-height-front'] = 10.0
        adjustments['ride-height-rear'] = 10.5
        adjustments['spring-rate-front'] = 60
        adjustments['spring-rate-rear'] = 55
        adjustments['differential-rear-accel'] = 70
        break

      case 'drag-strip':
        adjustments['tire-pressure-front'] = 35
        adjustments['tire-pressure-rear'] = 18
        adjustments['final-drive'] = 2.5
        adjustments['differential-rear-accel'] = 85
        adjustments['aero-front'] = 50
        adjustments['aero-rear'] = 100
        break

      case 'drift':
        adjustments['tire-pressure-front'] = 30
        adjustments['tire-pressure-rear'] = 22
        adjustments['camber-front'] = -3.5
        adjustments['camber-rear'] = -1.2
        adjustments['toe-front'] = -2.0
        adjustments['toe-rear'] = -1.0
        adjustments['differential-rear-accel'] = 5
        adjustments['anti-roll-bar-rear'] = 15
        break

      case 'rally':
        adjustments['tire-pressure-front'] = 24
        adjustments['tire-pressure-rear'] = 22
        adjustments['ride-height-front'] = 7.5
        adjustments['ride-height-rear'] = 8.0
        adjustments['differential-rear-accel'] = 60
        adjustments['anti-roll-bar-front'] = 25
        adjustments['anti-roll-bar-rear'] = 30
        break

      case 'playground-games':
        adjustments['tire-pressure-front'] = 26
        adjustments['tire-pressure-rear'] = 24
        adjustments['final-drive'] = 3.2
        adjustments['brake-balance'] = 52
        break

      case 'eliminator':
        adjustments['tire-pressure-front'] = 25
        adjustments['tire-pressure-rear'] = 23
        adjustments['ride-height-front'] = 7.0
        adjustments['ride-height-rear'] = 7.5
        adjustments['final-drive'] = 3.0
        break

      case 'horizon-tour':
        adjustments['tire-pressure-front'] = 27
        adjustments['tire-pressure-rear'] = 25
        adjustments['camber-front'] = -1.5
        adjustments['camber-rear'] = -1.2
        adjustments['brake-balance'] = 50
        break
    }

    return { ...baseTune, ...adjustments }
  }

  // Individual calculation methods
  calculateTirePressure(position) {
    const base = position === 'front' ? 28 : 26
    const speedAdj = (this.stats.speed / 10) * 2
    const handlingAdj = (this.stats.handling / 10) * 1.5
    const weightAdj = (this.weight / 1500) * 2

    return Math.round((base + speedAdj + handlingAdj + weightAdj) * 10) / 10
  }

  calculateCamber(position) {
    const base = position === 'front' ? -1.5 : -1.2
    const handlingAdj = (this.stats.handling / 10) * -0.8
    const piAdj = this.piValue > 800 ? -0.3 : 0

    return Math.round((base + handlingAdj + piAdj) * 10) / 10
  }

  calculateToe(position) {
    if (position === 'front') {
      return this.drivetrain === 'FWD' || this.drivetrain === 'AWD' ? -0.15 : 0.0
    } else {
      return this.drivetrain === 'RWD' ? 0.15 : 0.0
    }
  }

  calculateCaster() {
    const base = 5.5
    const handlingAdj = (this.stats.handling / 10) * 1.5
    return Math.round((base + handlingAdj) * 10) / 10
  }

  calculateARB(position) {
    const weightFactor = this.weight / 1500
    const handlingFactor = this.stats.handling / 10

    if (position === 'front') {
      const base = this.drivetrain === 'RWD' ? 25 : 20
      return Math.round(base + handlingFactor * 10 + weightFactor * 5)
    } else {
      const base = 30
      return Math.round(base + handlingFactor * 8 + weightFactor * 4)
    }
  }

  calculateSprings(position) {
    const weightFactor = this.weight / 1500
    const handlingFactor = this.stats.handling / 10

    const base = position === 'front' ? 120 : 110
    return Math.round(base + weightFactor * 60 + handlingFactor * 40)
  }

  calculateRideHeight(position) {
    const handlingFactor = this.stats.handling / 10
    const base = position === 'front' ? 6.5 : 7.0
    const adjustment = handlingFactor * (position === 'front' ? -1.0 : -0.8)

    return Math.round((base + adjustment) * 10) / 10
  }

  calculateDamping(type, position) {
    const weightFactor = this.weight / 1500
    const handlingFactor = this.stats.handling / 10

    const base = position === 'front' ? 8 : 7
    const rebound = Math.round(base + handlingFactor * 4 + weightFactor * 2)

    return type === 'rebound' ? rebound : Math.round(rebound * 0.65)
  }

  calculateDifferential(type) {
    const powerToWeight = this.power / this.weight
    const handlingFactor = this.stats.handling / 10

    if (type === 'accel') {
      return Math.round(40 + powerToWeight * 30 + handlingFactor * 15)
    } else {
      return Math.round(20 + handlingFactor * 10)
    }
  }

  calculateBrakeBalance() {
    switch (this.drivetrain) {
      case 'FWD':
        return 58
      case 'RWD':
        return 45
      case 'AWD':
        return 52
      default:
        return 50
    }
  }

  calculateBrakePressure() {
    return Math.round(90 + this.stats.braking * 1)
  }

  calculateFinalDrive() {
    const accelFactor = this.stats.acceleration / 10
    const speedFactor = this.stats.speed / 10

    return Math.round((3.4 + accelFactor * 0.3 - speedFactor * 0.25) * 100) / 100
  }

  calculateAero(position) {
    const speedFactor = this.stats.speed / 10
    const handlingFactor = this.stats.handling / 10

    if (position === 'front') {
      return Math.round(speedFactor < 0.7 ? 150 + handlingFactor * 50 : 100)
    } else {
      return Math.round(speedFactor < 0.7 ? 200 + handlingFactor * 60 : 150)
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
          'toe-front': -2.0,
          'toe-rear': -1.0,
          'differential-rear-accel': 5,
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
          'tire-pressure-rear': 24,
          'camber-front': -2.5,
          'camber-rear': -2.0,
          'aero-front': 200,
          'aero-rear': 280,
          'spring-rate-front': baseTune['spring-rate-front'] + 40,
          'spring-rate-rear': baseTune['spring-rate-rear'] + 30,
          'anti-roll-bar-front': 35,
          'anti-roll-bar-rear': 40,
        }

      case 'Drift':
        return {
          ...baseTune,
          'tire-pressure-front': 30,
          'tire-pressure-rear': 22,
          'camber-front': -3.5,
          'camber-rear': -1.2,
          'toe-front': -2.0,
          'toe-rear': -1.0,
          'differential-rear-accel': 5,
          'differential-rear-decel': 0,
          'anti-roll-bar-front': 25,
          'anti-roll-bar-rear': 15,
          'brake-balance': 45,
        }

      case 'Rally':
        return {
          ...baseTune,
          'tire-pressure-front': 24,
          'tire-pressure-rear': 22,
          'ride-height-front': 7.5,
          'ride-height-rear': 8.0,
          'spring-rate-front': 100,
          'spring-rate-rear': 95,
          'differential-rear-accel': 60,
          'anti-roll-bar-front': 25,
          'anti-roll-bar-rear': 30,
          'camber-front': -1.5,
          'camber-rear': -1.0,
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
