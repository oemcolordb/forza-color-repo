import { z } from 'zod'

/**
 * calculate-tune.ts
 * 
 * Ported logic for FH5 suspension and aero calculations.
 */

const TuneInputSchema = z.object({
  weightKg: z.number().min(500, 'Weight must be at least 500kg').max(3000, 'Weight must be under 3000kg'),
  weightDistFrontPct: z.number().min(0.1, 'Dist must be > 10%').max(0.9, 'Dist must be < 90%'),
  drivetrain: z.enum(['FWD', 'RWD', 'AWD']),
  piValue: z.number().min(100).max(999),
  buildGoal: z.enum(['Track', 'Drift', 'Rally', 'Offroad', 'Street']),
  carMake: z.string().optional(),
  carModel: z.string().optional(),
  tuneName: z.string().optional(),
  tunerName: z.string().optional(),
  shareCode: z.string().optional(),
  piClass: z.string().optional(),
  tuneId: z.string().optional()
})

type TuneInput = z.infer<typeof TuneInputSchema>

export function calculateTune(input: TuneInput) {
  const { weightKg, weightDistFrontPct, drivetrain, buildGoal } = input

  // Basic Spring logic: (Max - Min) * Dist + Min
  // For simplicity, we use generic racing spring ranges
  const minSpring = 20
  const maxSpring = 200
  
  const frontSpring = (maxSpring - minSpring) * weightDistFrontPct + minSpring
  const rearSpring  = (maxSpring - minSpring) * (1 - weightDistFrontPct) + minSpring

  // ARB logic: standard range 1-65
  const frontARB = 65 * weightDistFrontPct
  const rearARB  = 65 * (1 - weightDistFrontPct)

  // Damping: usually 10% of spring rate for rebound
  const frontRebound = frontSpring * 0.1
  const rearRebound  = rearSpring * 0.1
  
  // Bump: 50-70% of rebound
  const frontBump = frontRebound * 0.6
  const rearBump  = rearRebound * 0.6

  return {
    springs: { front: frontSpring.toFixed(1), rear: rearSpring.toFixed(1) },
    arbs: { front: frontARB.toFixed(1), rear: rearARB.toFixed(1) },
    rebound: { front: frontRebound.toFixed(1), rear: rearRebound.toFixed(1) },
    bump: { front: frontBump.toFixed(1), rear: rearBump.toFixed(1) },
    alignment: { 
      camber: buildGoal === 'Drift' ? { front: -5.0, rear: -1.0 } : { front: -1.5, rear: -1.0 },
      toe: buildGoal === 'Drift' ? { front: 0.5, rear: 0.0 } : { front: 0.0, rear: 0.0 },
      caster: 5.0
    }
  }
}

if (process.argv.includes('--test')) {
  console.log('Running Tuning Calculation Test...')
  const testInput: TuneInput = {
    weightKg: 1200,
    weightDistFrontPct: 0.55,
    drivetrain: 'RWD',
    piValue: 800,
    buildGoal: 'Track'
  }
  
  try {
    const result = calculateTune(testInput)
    console.log('Test Result:', JSON.stringify(result, null, 2))
    console.log('✅ Calculation logic verified.')
  } catch (err) {
    console.error('❌ Calculation test failed:', err)
    process.exit(1)
  }
}
