/**
 * Data Normalization Engine
 * Converts car stats + objective into concrete tune values
 * via physics-informed heuristics.
 */

export type TuneObjective = 'grip' | 'drift' | 'top-speed' | 'off-road' | 'rally' | 'drag'

export interface CarProfile {
  weight: number          // kg
  horsepower: number
  drivetrain: 'RWD' | 'FWD' | 'AWD'
  frontBias: number       // 0-100 (% front weight)
  piValue: number
  stats: {
    speed: number
    handling: number
    acceleration: number
    braking: number
    offroad: number
  }
}

export interface NormalizedTune {
  tires: {
    pressureFront: number
    pressureRear: number
  }
  alignment: {
    camberFront: number
    camberRear: number
    toeFront: number
    toeRear: number
    caster: number
  }
  suspension: {
    springFront: number
    springRear: number
    rideHeightFront: number
    rideHeightRear: number
    arbFront: number
    arbRear: number
  }
  damping: {
    reboundFront: number
    reboundRear: number
    bumpFront: number
    bumpRear: number
  }
  aero: {
    front: number
    rear: number
  }
  brakes: {
    balance: number   // % front
    pressure: number  // %
  }
  drivetrain: {
    diffAccel: number
    diffDecel: number
    finalDrive: number
  }
}

/** Clamp a number between min/max and round to `dp` decimal places */
function clamp(val: number, min: number, max: number, dp = 1) {
  return parseFloat(Math.min(max, Math.max(min, val)).toFixed(dp))
}

/** Weight-to-spring-rate baseline in lb/in */
function baseSpring(weightKg: number): number {
  const lbs = weightKg * 2.205
  return Math.round(lbs / 18)
}

/** Power-to-weight ratio (hp/kg) */
function pwr(car: CarProfile): number {
  return car.horsepower / car.weight
}

export function generateTune(car: CarProfile, objective: TuneObjective): NormalizedTune {
  const p = pwr(car)
  const rearBias = 100 - car.frontBias
  const isRWD = car.drivetrain === 'RWD'
  const isFWD = car.drivetrain === 'FWD'

  // ── Baseline springs ───────────────────────────────────────────────────────
  const baseF = baseSpring(car.weight * (car.frontBias / 100))
  const baseR = baseSpring(car.weight * (rearBias / 100))

  // ── Objective multipliers ──────────────────────────────────────────────────
  const obj: Record<TuneObjective, () => NormalizedTune> = {
    grip: () => ({
      tires: {
        pressureFront: clamp(27 - car.stats.handling * 0.3, 24, 30),
        pressureRear: clamp(26 - car.stats.handling * 0.3, 23, 29),
      },
      alignment: {
        camberFront: clamp(-2.5 + car.stats.handling * 0.05, -3.0, -1.5),
        camberRear: clamp(-2.0 + car.stats.handling * 0.04, -2.5, -1.2),
        toeFront: -0.1,
        toeRear: 0.1,
        caster: clamp(5.0 + car.stats.speed * 0.1, 4.5, 7.0),
      },
      suspension: {
        springFront: clamp(baseF * 1.25, 100, 300, 0),
        springRear: clamp(baseR * 1.20, 95, 280, 0),
        rideHeightFront: clamp(6.5 - car.stats.handling * 0.1, 4.5, 9.0),
        rideHeightRear: clamp(6.8 - car.stats.handling * 0.1, 4.5, 9.0),
        arbFront: clamp(30 + car.stats.handling * 2, 20, 55, 0),
        arbRear: clamp(28 + car.stats.handling * 2, 18, 52, 0),
      },
      damping: {
        reboundFront: clamp(7 + car.stats.handling * 0.3, 5, 14),
        reboundRear: clamp(7 + car.stats.handling * 0.25, 5, 13),
        bumpFront: clamp(5 + car.stats.handling * 0.2, 3, 10),
        bumpRear: clamp(5 + car.stats.handling * 0.2, 3, 10),
      },
      aero: {
        front: clamp(100 + car.piValue * 0.15, 80, 200, 0),
        rear: clamp(150 + car.piValue * 0.2, 120, 300, 0),
      },
      brakes: {
        balance: clamp(50 - car.frontBias * 0.1, 46, 54, 0),
        pressure: 95,
      },
      drivetrain: {
        diffAccel: isRWD ? 40 : isFWD ? 30 : 50,
        diffDecel: isRWD ? 25 : isFWD ? 20 : 30,
        finalDrive: clamp(4.2 - car.stats.speed * 0.1, 3.2, 4.8),
      },
    }),

    drift: () => ({
      tires: { pressureFront: 30, pressureRear: 22 },
      alignment: {
        camberFront: -3.5,
        camberRear: -1.2,
        toeFront: -0.2,
        toeRear: -0.1,
        caster: 6.5,
      },
      suspension: {
        springFront: clamp(baseF * 1.1, 90, 180, 0),
        springRear: clamp(baseR * 0.85, 70, 140, 0),
        rideHeightFront: 4.8,
        rideHeightRear: 4.5,
        arbFront: clamp(28, 20, 40, 0),
        arbRear: clamp(12, 8, 20, 0),
      },
      damping: {
        reboundFront: clamp(8.5, 7, 12),
        reboundRear: clamp(6.0, 4, 9),
        bumpFront: clamp(5.5, 4, 8),
        bumpRear: clamp(4.0, 3, 7),
      },
      aero: { front: 60, rear: 80 },
      brakes: { balance: 46, pressure: 90 },
      drivetrain: {
        diffAccel: isRWD ? 10 : 25,
        diffDecel: 5,
        finalDrive: clamp(3.6 - car.stats.speed * 0.05, 3.0, 4.2),
      },
    }),

    'top-speed': () => ({
      tires: { pressureFront: 31, pressureRear: 30 },
      alignment: {
        camberFront: -1.0,
        camberRear: -0.8,
        toeFront: 0.0,
        toeRear: 0.1,
        caster: clamp(4.5 + car.stats.speed * 0.05, 4.0, 6.0),
      },
      suspension: {
        springFront: clamp(baseF * 1.1, 100, 260, 0),
        springRear: clamp(baseR * 1.05, 95, 250, 0),
        rideHeightFront: clamp(6.5, 5.5, 8.5),
        rideHeightRear: clamp(6.8, 5.8, 8.8),
        arbFront: clamp(25, 18, 40, 0),
        arbRear: clamp(22, 16, 38, 0),
      },
      damping: {
        reboundFront: clamp(6.5, 5, 11),
        reboundRear: clamp(6.5, 5, 11),
        bumpFront: clamp(4.5, 3, 8),
        bumpRear: clamp(4.5, 3, 8),
      },
      aero: { front: 50, rear: 60 },
      brakes: { balance: 50, pressure: 90 },
      drivetrain: {
        diffAccel: isRWD ? 45 : isFWD ? 35 : 55,
        diffDecel: 20,
        finalDrive: clamp(2.8 - car.stats.speed * 0.05, 2.2, 3.5),
      },
    }),

    'off-road': () => ({
      tires: { pressureFront: 22, pressureRear: 20 },
      alignment: {
        camberFront: -1.5,
        camberRear: -1.0,
        toeFront: 0.0,
        toeRear: 0.0,
        caster: 4.5,
      },
      suspension: {
        springFront: clamp(baseF * 0.75, 60, 140, 0),
        springRear: clamp(baseR * 0.70, 55, 130, 0),
        rideHeightFront: clamp(9.5 + car.stats.offroad * 0.2, 7.5, 13.0),
        rideHeightRear: clamp(9.8 + car.stats.offroad * 0.2, 8.0, 13.5),
        arbFront: clamp(18, 10, 30, 0),
        arbRear: clamp(15, 8, 25, 0),
      },
      damping: {
        reboundFront: clamp(5.5, 4, 10),
        reboundRear: clamp(5.0, 3, 9),
        bumpFront: clamp(4.0, 3, 7),
        bumpRear: clamp(3.5, 2, 6),
      },
      aero: { front: 0, rear: 0 },
      brakes: { balance: 48, pressure: 85 },
      drivetrain: {
        diffAccel: isRWD ? 70 : isFWD ? 60 : 75,
        diffDecel: isRWD ? 50 : isFWD ? 40 : 55,
        finalDrive: clamp(4.5 + (10 - car.stats.speed) * 0.05, 3.8, 5.0),
      },
    }),

    rally: () => ({
      tires: { pressureFront: 24, pressureRear: 22 },
      alignment: {
        camberFront: -1.5,
        camberRear: -1.0,
        toeFront: 0.0,
        toeRear: 0.1,
        caster: 5.0,
      },
      suspension: {
        springFront: clamp(baseF * 0.85, 70, 160, 0),
        springRear: clamp(baseR * 0.82, 65, 150, 0),
        rideHeightFront: clamp(8.0 + car.stats.offroad * 0.1, 6.5, 11.0),
        rideHeightRear: clamp(8.5 + car.stats.offroad * 0.1, 7.0, 11.5),
        arbFront: clamp(22, 15, 35, 0),
        arbRear: clamp(20, 12, 30, 0),
      },
      damping: {
        reboundFront: clamp(6.0, 4, 11),
        reboundRear: clamp(5.5, 3, 10),
        bumpFront: clamp(4.5, 3, 8),
        bumpRear: clamp(4.0, 3, 7),
      },
      aero: { front: 40, rear: 60 },
      brakes: { balance: 47, pressure: 88 },
      drivetrain: {
        diffAccel: isRWD ? 60 : isFWD ? 50 : 65,
        diffDecel: 35,
        finalDrive: clamp(4.0 - car.stats.speed * 0.05, 3.4, 4.6),
      },
    }),

    drag: () => ({
      tires: { pressureFront: 32, pressureRear: 26 },
      alignment: {
        camberFront: 0.0,
        camberRear: 0.0,
        toeFront: 0.0,
        toeRear: 0.0,
        caster: 4.0,
      },
      suspension: {
        springFront: clamp(baseF * 0.8, 70, 150, 0),
        springRear: clamp(baseR * 1.3, 130, 300, 0),
        rideHeightFront: 8.0,
        rideHeightRear: 7.0,
        arbFront: clamp(15, 10, 25, 0),
        arbRear: clamp(35, 25, 55, 0),
      },
      damping: {
        reboundFront: clamp(4.0, 3, 7),
        reboundRear: clamp(9.0, 7, 14),
        bumpFront: clamp(3.0, 2, 6),
        bumpRear: clamp(7.0, 5, 12),
      },
      aero: { front: 0, rear: 0 },
      brakes: { balance: 52, pressure: 100 },
      drivetrain: {
        diffAccel: isRWD ? 80 : isFWD ? 60 : 90,
        diffDecel: 10,
        finalDrive: clamp(3.8 - car.stats.speed * 0.04, 2.8, 4.2),
      },
    }),
  }

  const base = obj[objective]()

  // ── Power-to-weight diff corrections ───────────────────────────────────────
  if (p > 0.4) {
    base.drivetrain.diffAccel = clamp(base.drivetrain.diffAccel + (p - 0.4) * 40, 5, 100, 0)
  }
  if (isFWD) {
    base.alignment.toeFront = clamp(base.alignment.toeFront - 0.1, -0.3, 0.1)
    base.brakes.balance = clamp(base.brakes.balance + 4, 48, 62, 0)
  }

  return base
}

/** Apply a signed delta to a NormalizedTune for the Refine step */
export function refineTune(
  tune: NormalizedTune,
  axis: string,
  delta: number
): NormalizedTune {
  const t = JSON.parse(JSON.stringify(tune)) as NormalizedTune
  switch (axis) {
    case 'oversteer':
      t.suspension.arbRear = clamp(t.suspension.arbRear - delta * 3, 5, 65, 0)
      t.tires.pressureRear = clamp(t.tires.pressureRear - delta * 0.5, 16, 40)
      t.alignment.camberRear = clamp(t.alignment.camberRear - delta * 0.1, -4.0, 0)
      break
    case 'understeer':
      t.suspension.arbFront = clamp(t.suspension.arbFront - delta * 3, 5, 65, 0)
      t.tires.pressureFront = clamp(t.tires.pressureFront - delta * 0.5, 16, 40)
      t.alignment.camberFront = clamp(t.alignment.camberFront - delta * 0.1, -4.0, 0)
      break
    case 'traction':
      t.drivetrain.diffAccel = clamp(t.drivetrain.diffAccel + delta * 5, 0, 100, 0)
      t.tires.pressureRear = clamp(t.tires.pressureRear - delta * 0.3, 16, 40)
      break
    case 'top-speed':
      t.drivetrain.finalDrive = clamp(t.drivetrain.finalDrive - delta * 0.1, 2.0, 5.0)
      t.aero.front = clamp(t.aero.front - delta * 10, 0, 300, 0)
      t.aero.rear = clamp(t.aero.rear - delta * 10, 0, 400, 0)
      break
    case 'stability':
      t.suspension.arbFront = clamp(t.suspension.arbFront + delta * 2, 5, 65, 0)
      t.suspension.arbRear = clamp(t.suspension.arbRear + delta * 2, 5, 65, 0)
      t.alignment.toeFront = clamp(t.alignment.toeFront + delta * 0.05, -0.3, 0.3)
      t.alignment.toeRear = clamp(t.alignment.toeRear + delta * 0.05, -0.3, 0.3)
      break
  }
  return t
}
