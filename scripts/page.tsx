'use client'

import { useState, useTransition, useEffect } from 'react'
import { calculateTune } from '@/scripts/calculate-tune'

type TuneInput = {
  weightKg: number
  weightDistFrontPct: number
  drivetrain: 'FWD' | 'RWD' | 'AWD'
  piValue: number
  buildGoal: 'Track' | 'Drift' | 'Rally' | 'Offroad' | 'Street'
  carMake?: string
  carModel?: string
  tuneName?: string
  tunerName?: string
  shareCode?: string
  piClass?: string
  tuneId?: string
  saveToDb?: boolean
}

type TuneSetupOutput = {
  springs: { front: string; rear: string }
  arbs: { front: string; rear: string }
  rebound: { front: string; rear: string }
  bump: { front: string; rear: string }
  alignment: {
    camber: { front: number; rear: number }
    toe: { front: number; rear: number }
    caster: number
  }
  tires: { front: string; rear: string }
}

export default function TuningCalculatorPage() {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<TuneSetupOutput | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [springUnit, setSpringUnit] = useState<'lbf/in' | 'kgf/mm'>('lbf/in')

  const [formData, setFormData] = useState<TuneInput>({
    weightKg: 1500,
    weightDistFrontPct: 50,
    drivetrain: 'RWD',
    piValue: 800,
    buildGoal: 'Track',
    saveToDb: false,
    carMake: '',
    carModel: '',
    tuneName: ''
  })

  // Auto-reload to fetch the newest update if the user comes back after 30 mins
  useEffect(() => {
    const INACTIVITY_LIMIT = 30 * 60 * 1000 // 30 minutes
    let lastActive = Date.now()

    const checkInactivity = () => {
      if (document.visibilityState === 'visible') {
        if (Date.now() - lastActive > INACTIVITY_LIMIT) {
          window.location.reload()
        } else {
          lastActive = Date.now()
        }
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') lastActive = Date.now()
      else checkInactivity()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', checkInactivity)
    const keepAlive = setInterval(() => { if (document.visibilityState === 'visible') lastActive = Date.now() }, 60000)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', checkInactivity)
      clearInterval(keepAlive)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        const tune = calculateTune(formData)
        setResult(tune)
      } catch (err: any) {
        setError(err.message || 'An error occurred during calculation.')
      }
    })
  }

  const displaySpringRate = (lbfIn: number) => {
    if (springUnit === 'kgf/mm') return (lbfIn * 0.01786).toFixed(1)
    return lbfIn
  }

  return (
    <div className="min-h-screen p-4 text-slate-100 relative">
      <div className="absolute inset-0 bg-black/60 pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-6 pt-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Horizon Oracle Engine</h1>
          <p className="text-gray-400">Enter your FH5 telemetry stats below to instantly generate a mathematical tuning setup.</p>
        </header>

        <div className="grid md:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Input Form */}
          <div className="md:col-span-4 space-y-6">
            <form onSubmit={handleSubmit} className="bamboo-surface-dark p-6 rounded-xl border border-gray-700/50 space-y-5">

              {/* Validation Error Banner */}
              {error && (
                <div className="p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
                  ⚠️ {error}
                </div>
              )}

              {/* Weight & PI */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Weight (kg)</label>
                  <input
                    type="number" name="weightKg" min="1" max="10000" required
                    value={formData.weightKg || ''} onChange={handleChange}
                    className="w-full bg-black/40 border border-gray-600 rounded p-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">PI Value</label>
                  <input
                    type="number" name="piValue" min="100" max="999" required
                    value={formData.piValue || ''} onChange={handleChange}
                    className="w-full bg-black/40 border border-gray-600 rounded p-2 text-white font-mono text-green-400"
                  />
                </div>
              </div>

              {/* Weight Distribution Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <label>Front Weight Dist.</label>
                  <span className="text-amber-400">{formData.weightDistFrontPct}%</span>
                </div>
                <input
                  type="range" name="weightDistFrontPct" min="0" max="100" step="1"
                  value={formData.weightDistFrontPct} onChange={handleChange}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Drivetrain & Goal */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Drivetrain</label>
                  <select name="drivetrain" value={formData.drivetrain} onChange={handleChange} className="w-full bg-black/40 border border-gray-600 rounded p-2 text-white">
                    <option value="RWD">RWD</option>
                    <option value="AWD">AWD</option>
                    <option value="FWD">FWD</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Build Goal</label>
                  <select name="buildGoal" value={formData.buildGoal} onChange={handleChange} className="w-full bg-black/40 border border-gray-600 rounded p-2 text-white">
                    <option value="Track">🏁 Track</option>
                    <option value="Drift">💨 Drift</option>
                    <option value="Rally">🗺️ Rally</option>
                    <option value="Offroad">🌍 Offroad</option>
                    <option value="Street">🛣️ Street</option>
                  </select>
                </div>
              </div>

              {/* Database Saving Toggle */}
              <div className="pt-4 border-t border-gray-700/50">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" name="saveToDb" checked={formData.saveToDb} onChange={handleChange} className="w-4 h-4 rounded text-amber-500 bg-black/40 border-gray-600 focus:ring-amber-500" />
                  <span className="text-sm font-medium text-gray-300">Save & Share to Community</span>
                </label>

                {formData.saveToDb && (
                  <div className="mt-4 space-y-3 p-3 bg-black/20 rounded border border-gray-700/50">
                    <input type="text" name="carMake" placeholder="Car Make (e.g. Nissan)" required={formData.saveToDb} value={formData.carMake} onChange={handleChange} className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-sm text-white" />
                    <input type="text" name="carModel" placeholder="Car Model (e.g. Skyline GT-R)" required={formData.saveToDb} value={formData.carModel} onChange={handleChange} className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-sm text-white" />
                    <input type="text" name="tuneName" placeholder="Tune Name (e.g. Grip Monster)" required={formData.saveToDb} value={formData.tuneName} onChange={handleChange} className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-sm text-white" />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> Calculating...</>
                ) : (
                  <>🔧 Generate Tune</>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: Results Dashboard */}
          <div className="md:col-span-8">
            {result ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Tires */}
                <div className="bamboo-surface-dark p-4 rounded-xl border border-gray-700/50">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">🛞 Tires (PSI)</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center"><span className="text-gray-300">Front</span><span className="font-mono text-lg text-amber-400">{result.tires.front}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-300">Rear</span><span className="font-mono text-lg text-amber-400">{result.tires.rear}</span></div>
                  </div>
                </div>

                {/* Springs */}
                <div className="bamboo-surface-dark p-4 rounded-xl border border-gray-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">🔩 Springs ({springUnit})</h3>
                    <button
                      type="button"
                      onClick={() => setSpringUnit(prev => prev === 'lbf/in' ? 'kgf/mm' : 'lbf/in')}
                      className="text-[10px] px-2 py-0.5 rounded border border-gray-600 bg-black/40 text-gray-300 hover:text-white transition-colors"
                    >
                      Swap to {springUnit === 'lbf/in' ? 'kgf/mm' : 'lbf/in'}
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center"><span className="text-gray-300">Front</span><span className="font-mono text-lg text-amber-400">{displaySpringRate(parseFloat(result.springs.front))}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-300">Rear</span><span className="font-mono text-lg text-amber-400">{displaySpringRate(parseFloat(result.springs.rear))}</span></div>
                  </div>
                </div>

                {/* Anti-Roll Bars */}
                <div className="bamboo-surface-dark p-4 rounded-xl border border-gray-700/50">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">🔄 Anti-Roll Bars</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center"><span className="text-gray-300">Front</span><span className="font-mono text-lg text-amber-400">{result.arbs.front}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-300">Rear</span><span className="font-mono text-lg text-amber-400">{result.arbs.rear}</span></div>
                  </div>
                </div>

                {/* Damping */}
                <div className="bamboo-surface-dark p-4 rounded-xl border border-gray-700/50 lg:col-span-2">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">〰️ Damping</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500 uppercase">Rebound</div>
                      <div className="flex justify-between items-center"><span className="text-gray-300">Front</span><span className="font-mono text-lg text-amber-400">{result.rebound.front}</span></div>
                      <div className="flex justify-between items-center"><span className="text-gray-300">Rear</span><span className="font-mono text-lg text-amber-400">{result.rebound.rear}</span></div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500 uppercase">Bump</div>
                      <div className="flex justify-between items-center"><span className="text-gray-300">Front</span><span className="font-mono text-lg text-amber-400">{result.bump.front}</span></div>
                      <div className="flex justify-between items-center"><span className="text-gray-300">Rear</span><span className="font-mono text-lg text-amber-400">{result.bump.rear}</span></div>
                    </div>
                  </div>
                </div>

                {/* Alignment */}
                <div className="bamboo-surface-dark p-4 rounded-xl border border-gray-700/50">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">📐 Alignment (°)</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center"><span className="text-gray-300">Camber F</span><span className="font-mono text-lg text-amber-400">{result.alignment.camber.front}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-300">Camber R</span><span className="font-mono text-lg text-amber-400">{result.alignment.camber.rear}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-300">Toe F/R</span><span className="font-mono text-sm text-gray-300">{result.alignment.toe.front} / {result.alignment.toe.rear}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-300">Caster</span><span className="font-mono text-sm text-gray-300">{result.alignment.caster}</span></div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-700/50 rounded-xl bg-black/20">
                <div className="text-6xl mb-4 opacity-50">🏎️</div>
                <h2 className="text-xl font-bold text-gray-300 mb-2">Awaiting Telemetry Data</h2>
                <p className="text-gray-500 max-w-sm">Enter your car's weight, balance, and drivetrain on the left, then click Generate to view your personalized tune.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
