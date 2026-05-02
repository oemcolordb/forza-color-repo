# TuneForge — Forza Horizon 5 Tuning Calculator

TuneForge is the physics-based FH5 tuning calculator built into the Forza Color Universe
web app. It generates race-ready tunes from car data and user inputs, provides a
problem-solving Fix-It guide, contextual AI advice, telemetry guidance, and an in-app
FH5 tuning reference.

---

## Architecture

```
app/
├── lib/
│   └── tuning-calculator.js        ← Core TuningCalculator class + TRACK_TYPES constant
├── components/
│   └── CarStatsRadarChart.tsx      ← Canvas-based radar chart (speed/handling/accel/braking)
├── api/tuneforge/
│   ├── cars/route.js               ← Car database API (serves from tuneforge-cars.json)
│   ├── tunes/route.ts              ← Saved tunes CRUD (Turso/libsql)
│   ├── community-tunes/route.ts    ← Community tune submission & retrieval
│   └── database/route.ts          ← Raw database access endpoint
└── tuneforge/
    └── page.tsx                    ← Full TuneForge React page (6 tabs, ~2900 lines)

public/
└── tuneforge-cars.json             ← Extended car database (manufacturer, model, stats, PI, engine)
```

---

## Core: `app/lib/tuning-calculator.js`

`TuningCalculator` is a physics-based ES module class. It exposes:

```js
import { TuningCalculator, TRACK_TYPES } from '@/app/lib/tuning-calculator'

const calculator = new TuningCalculator(car, {
  weight,           // kg (total car weight incl. driver)
  frontWeight,      // 0–1 fraction (e.g. 0.52 = 52 % front)
  gearCount,        // integer 4–8
  handlingBalance,  // -10 to +10 (-10 = understeer-safe, +10 = oversteer-biased)
  bumpStiffness,    // 0–100 (% of rebound; typically 50–75 per FH5 guide)
  springFrequency,  // Hz (1.2 street → 1.7 rally → 2.0 track/race)
})

const tune = calculator.getTuneTypeRecommendations(tuneType)
// tuneType: 'Basic (General)' | 'Track' | 'Drift' | 'Rally' | 'Drag Racing' |
//           'Off-road' | 'Cross-country' | 'Snow / Ice' | 'Buggy / Truck'
```

### Calculation Methods

| Method | Formula / Source |
|--------|------------------|
| `calculateSprings(pos)` | K = 4π²f²× corner_mass (N/m) → lb/in via ÷175.127; clamped 50–300 |
| `calculateDamping(type, pos)` | Critical damping: ζ = 0.65, scaled 435 Ns/m per FH5 slider unit |
| `calculateARB(pos)` | 65×w + 1.5 + rotation bias ± 0.7×handlingBalance; clamped 1–65 |
| `calculateTirePressure(pos)` | Corner-load model, 28 PSI @ 400 kg baseline; clamped 15–50 |
| `calculateCamber(pos)` | -1.5° front / -1.0° rear base + weight-distribution scaling |
| `calculateToe(pos)` | Always 0.0° (FH5-specific; toe is unreliable on most builds) |
| `calculateCaster()` | Always 5.5° (verified safe max ≤ 6.0° in FH5) |
| `calculateDifferential(type)` | RWD accel 25–55 %, decel 20–40 %; FWD 15–25 %; AWD 25–50 % |
| `calculateBrakeBalance()` | FH5 INVERTED slider: display = 100 − targetFront%; RWD/AWD neutral = 48 |
| `calculateGearRatios()` | Progressive spread based on gearCount and estimated redline |
| `calculateAero()` | Balanced front/rear by default; Track tune raises both +50 |
| `calculateRideHeight(pos)` | Base 6.5 cm front / 7.0 cm rear; tune-type offsets applied |

### Tune-Type Overrides (`getTuneTypeRecommendations`)

| Tune Type | Key differences from base |
|-----------|---------------------------|
| `Track` | 2.0 Hz springs, 26/25 PSI, camber -2.5/-2.0°, ARBs +10, brake balance 48 |
| `Drift` | 30/22 PSI, camber -3.5/-1.2°, rear diff fully locked, ARBs 25/15, balance 45 |
| `Rally` | 1.7 Hz springs, 7.5/8.0 cm ride height, ARBs 25/30, balance 48 |
| `Drag Racing` | Rear springs +25 %, rear diff 100/0, high brake pressure (130), min aero drag |
| `Off-road` | 1.3 Hz springs, 10.0/10.5 cm ride height, 18/16 PSI, ARBs 50 % of base |
| `Cross-country` | 1.5 Hz springs, 9.0/9.5 cm ride height, 22/20 PSI |
| `Snow / Ice` | 1.2 Hz springs, 9.5/10.0 cm ride height, 20/18 PSI, softer diff |
| `Buggy / Truck` | 1.2 Hz springs, 12.0/13.0 cm ride height, 16/14 PSI, minimal ARBs |

---

## TuneForge Page: `app/tuneforge/page.tsx`

### Tabs

| Tab | Label | Description |
|-----|-------|-------------|
| `quick` | ⚡ Quick | Base tune: car selector, tune type, driving style, weather/surface, sliders, calculate |
| `advanced` | 🔧 Advanced | Per-parameter fine-tune sliders grouped by category |
| `fixit` | 🩺 Fix It | Corner phase × symptom → one-click delta fix |
| `ai` | 🤖 AI | Contextual AI tuning advice for common problems |
| `telemetry` | 📊 Telemetry | Tyre temperature inputs and session data entry |
| `guide` | 📖 Guide | In-app FH5 tuning reference (collapsible sections) |

### Quick Tab Inputs

| Input | State | Default |
|-------|-------|---------|
| Tune type | `tuneType` | `'Grip/Race'` |
| Driving style | `drivingStyle` | `'balanced'` |
| Track type | `selectedTrack` | `''` |
| Weather | `weatherCondition` | `'dry'` |
| Surface | `trackSurface` | `'tarmac'` |
| Handling balance | `handlingBalance` | `0` (-10 → +10) |
| Bump stiffness | `bumpStiffness` | `65` % of rebound |
| Spring frequency | `springFrequency` | `1.5` Hz |
| Roll stiffness bias | `rollStiffness` | `0` (-5 → +5) |
| Drivetrain | `drivetrain` | Auto-set from car; user-overridable |
| Front distribution | `frontDistribution` | 52 % (RWD), 55 % (AWD), 62 % (FWD) |
| Car weight | `carWeight` | From car database; unit-aware |
| HP override | `hpOverride` | `null` (use post-upgrade HP after engine mods) |
| Gear count | `gearCount` | Auto-set from PI class |

### Fix-It Tab

Covers 12 corner phase × symptom combinations:

- **Corner phases:** Entry, Mid, Exit
- **Symptoms:** Understeer, Oversteer, Bounce, Slide
- Each entry provides 2–4 `delta` adjustments applied directly to `tuneData` on click
- **Brake balance deltas use the FH5 inverted convention** — a negative delta increases
  front bias (lower display number = more front braking power)

### Guide Tab

Collapsible `<details>` sections covering (from `FORZA_TUNING_GUIDE_COMPLETE.md`):

Aerodynamics · Damping · Springs · Ride Height · ARBs · Alignment · Gearing ·
Tyres · Telemetry · Differential · Brakes · Drift-Specific Setup · Common Mistakes

---

## API Routes

### `GET /api/tuneforge/cars`
Serves car data from `public/tuneforge-cars.json`. Falls back to a sample dataset if the
file is unavailable.

```ts
// Response: Car[]
[
  {
    id: string,
    manufacturer: string,
    model: string,
    year: number,
    drivetrain: 'RWD' | 'FWD' | 'AWD',
    weight: number,          // kg
    pi: { class: string, value: number },
    engine: { horsepower: number, torque: number, type: string },
    stats: { speed: number, handling: number, acceleration: number, ... },
  }
]
```

### `GET /api/tuneforge/community-tunes?make=&model=`
Fetches community-submitted tunes for a specific car from the Turso database.

### `POST /api/tuneforge/tunes`
Saves a tune to the Turso database.

### `GET /api/tuneforge/database`
Development/admin database accessor.

---

## Components

### `app/components/CarStatsRadarChart.tsx`
Canvas-based hexagonal radar chart showing six car statistics:
**Speed · Handling · Acceleration · Launch · Braking · Off-road**

Props: `car: Car`, `className?: string`, `size?: number`

---

## FH5 Tuning Quick Reference

### Damping Rule
> Bump stiffness = **50–75 % of rebound**. Start low, raise only if bouncing.

### Brake Balance (FH5 inverted slider)
> `display = 100 − targetFront%`
> - Neutral RWD/AWD: display **48** (targets 52 % front)
> - More front braking → **lower** display value
> - More rear braking → **higher** display value

### ARB Base (from guide)
| Drivetrain | Front ARB | Rear ARB |
|------------|-----------|----------|
| FWD / AWD | ½ between min and 50 % | 50 % of range |
| RWD | Stock | Stock |

### Tire Pressure (FH5 track)
| Context | Front | Rear |
|---------|-------|------|
| Track base | 26–32 PSI | 25–30 PSI |
| Drift | ~30 PSI | ~22 PSI |
| Off-road | 16–20 PSI | 14–18 PSI |

---

## Development

```bash
# Dev server (Turbopack)
npm run dev

# Production build (webpack)
npm run build

# Type-check only
npx tsc --noEmit
```

The calculator is plain JavaScript (no TypeScript compilation needed). The page is
TypeScript strict-mode. After editing `tuning-calculator.js`, run `npm run build` to
confirm no type errors surfaced through the import.
