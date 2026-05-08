'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CarStatsRadarChart } from '../../../components/CarStatsRadarChart'
import { getCountryFlag, formatPrice } from '../../../lib/countryFlags'
import TokyoBackground from '../../../components/TokyoBackground'
import { TuningCalculator } from '../../../lib/tuning-calculator'

interface Car {
  year: string
  manufacturer: string
  model: string
  type: string
  price: number
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary'
  country: string
  stats: {
    speed: number
    handling: number
    acceleration: number
    launch: number
    braking: number
    offroad: number
  }
  pi: {
    class: 'D' | 'C' | 'B' | 'A' | 'S1' | 'S2' | 'X'
    value: number
  }
  fullName?: string
  drivetrain?: string
  weight?: number
  engine?: {
    displacement: number
    cylinders: number
    aspiration: string
    horsepower: number
  }
}

interface TuneData {
  [key: string]: number
}

export default function TuneCalcClient({ car }: { car: Car }) {
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [activeTab, setActiveTab] = useState('quick')
  const [tuneData, setTuneData] = useState<TuneData>({})
  const [isCalculating, setIsCalculating] = useState(false)

  // Input states
  const [tuneType, setTuneType] = useState('Grip/Race')
  const [drivingStyle, setDrivingStyle] = useState<'smooth' | 'balanced' | 'aggressive' | 'drift'>('balanced')
  const [weatherCondition, setWeatherCondition] = useState('dry')
  const [trackSurface, setTrackSurface] = useState('tarmac')
  const [handlingBalance, setHandlingBalance] = useState(0)
  const [bumpStiffness, setBumpStiffness] = useState(65)
  const [springFrequency, setSpringFrequency] = useState(1.5)
  const [rollStiffness, setRollStiffness] = useState(0)
  const [carWeight, setCarWeight] = useState(car.weight || 1500)
  const [frontDistribution, setFrontDistribution] = useState(
    car.drivetrain === 'FWD' ? 62 : car.drivetrain === 'AWD' ? 55 : 52
  )
  const [drivetrain, setDrivetrain] = useState<'AWD' | 'RWD' | 'FWD'>(car.drivetrain as any || 'RWD')
  const [gearCount, setGearCount] = useState(6)
  const [hpOverride, setHpOverride] = useState<number | null>(null)

  // AI states
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiMessages, setAiMessages] = useState<{role: 'user'|'assistant'; content: string}[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved) setIsDarkMode(saved === 'dark')
  }, [])

  const calculateTune = () => {
    setIsCalculating(true)

    setTimeout(() => {
      try {
        const calculator = new TuningCalculator(car, {
          weight: carWeight,
          frontWeight: frontDistribution / 100,
          gearCount,
          handlingBalance,
          bumpStiffness,
          springFrequency,
        })

        const tune = calculator.getTuneTypeRecommendations(tuneType)
        setTuneData(tune)
      } catch (error) {
        console.error('Calculation error:', error)
      } finally {
        setIsCalculating(false)
      }
    }, 500)
  }

  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return

    setAiLoading(true)
    setAiMessages(prev => [...prev, { role: 'user', content: aiQuery }])
    setAiQuery('')

    try {
      const res = await fetch('/api/tuneforge/ai-tune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userGoal: aiQuery,
          carInfo: `${car.year} ${car.manufacturer} ${car.model}`,
          drivetrain: car.drivetrain,
          weight: car.weight,
          power: car.engine?.horsepower,
          piClass: car.pi.class,
          piValue: car.pi.value,
          currentTune: Object.keys(tuneData).length > 0 ? tuneData : undefined,
        }),
      })

      const data = await res.json()

      if (data.error) {
        setAiResponse(`Error: ${data.error}`)
      } else {
        setAiResponse(data.response)
        setAiMessages(prev => [...prev, { role: 'assistant', content: data.response }])
      }
    } catch (error) {
      setAiResponse('Failed to get AI response. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const applyAiAdjustment = (adjustments: Record<string, number>) => {
    setTuneData(prev => ({ ...prev, ...adjustments }))
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <TokyoBackground />
      <div className={`relative z-10 min-h-screen p-4 md:p-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <button
            onClick={() => router.push('/tuneforge')}
            className="mb-4 px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            ← Back to Car List
          </button>

          <div className={`p-6 rounded-lg backdrop-blur-sm ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {getCountryFlag(car.country)} {car.year} {car.manufacturer} {car.model}
                </h1>
                <div className="flex flex-wrap gap-3 text-sm opacity-80">
                  <span>{car.type}</span>
                  <span>{getCountryFlag(car.country)} {car.country}</span>
                  <span>{formatPrice(car.price)}</span>
                  <span>PI: {car.pi.class} {car.pi.value}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    car.rarity === 'Legendary' ? 'bg-yellow-500 text-black' :
                    car.rarity === 'Epic' ? 'bg-purple-500 text-white' :
                    car.rarity === 'Rare' ? 'bg-blue-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {car.rarity}
                  </span>
                </div>
              </div>

              <div className="w-48 h-48">
                <CarStatsRadarChart car={car} size={192} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
              <div>SPD: {car.stats.speed.toFixed(1)}</div>
              <div>HAN: {car.stats.handling.toFixed(1)}</div>
              <div>ACC: {car.stats.acceleration.toFixed(1)}</div>
              <div>LAU: {car.stats.launch.toFixed(1)}</div>
              <div>BRA: {car.stats.braking.toFixed(1)}</div>
              <div>OFF: {car.stats.offroad.toFixed(1)}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: 'quick', label: '⚡ Quick Tune' },
              { id: 'advanced', label: '🔧 Advanced' },
              { id: 'ai', label: '🤖 AI Advisor' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bamboo-button text-white'
                    : isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Tune Tab */}
          {activeTab === 'quick' && (
            <div className={`p-6 rounded-lg backdrop-blur-sm ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
              <h2 className="text-2xl font-bold mb-6">Quick Tune Calculator</h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="tune-type" className="block mb-2 font-medium">Tune Type</label>
                  <select
                    id="tune-type"
                    value={tuneType}
                    onChange={(e) => setTuneType(e.target.value)}
                    className={`w-full p-3 rounded ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300'} border`}
                  >
                    <option value="Grip/Race">Grip/Race</option>
                    <option value="Drift">Drift</option>
                    <option value="Rally">Rally</option>
                    <option value="Drag Racing">Drag Racing</option>
                    <option value="Off-road">Off-road</option>
                    <option value="Cross-country">Cross-country</option>
                    <option value="Snow / Ice">Snow / Ice</option>
                    <option value="Buggy / Truck">Buggy / Truck</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="driving-style" className="block mb-2 font-medium">Driving Style</label>
                  <select
                    id="driving-style"
                    value={drivingStyle}
                    onChange={(e) => setDrivingStyle(e.target.value as any)}
                    className={`w-full p-3 rounded ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300'} border`}
                  >
                    <option value="smooth">Smooth</option>
                    <option value="balanced">Balanced</option>
                    <option value="aggressive">Aggressive</option>
                    <option value="drift">Drift</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="weather" className="block mb-2 font-medium">Weather</label>
                  <select
                    id="weather"
                    value={weatherCondition}
                    onChange={(e) => setWeatherCondition(e.target.value)}
                    className={`w-full p-3 rounded ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300'} border`}
                  >
                    <option value="dry">Dry</option>
                    <option value="wet">Wet</option>
                    <option value="snow">Snow</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="surface" className="block mb-2 font-medium">Surface</label>
                  <select
                    id="surface"
                    value={trackSurface}
                    onChange={(e) => setTrackSurface(e.target.value)}
                    className={`w-full p-3 rounded ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300'} border`}
                  >
                    <option value="tarmac">Tarmac</option>
                    <option value="dirt">Dirt</option>
                    <option value="grass">Grass</option>
                    <option value="sand">Sand</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="car-weight" className="block mb-2 font-medium">Car Weight (kg)</label>
                  <input
                    id="car-weight"
                    type="number"
                    value={carWeight}
                    onChange={(e) => setCarWeight(Number(e.target.value))}
                    placeholder="Enter car weight in kg"
                    className={`w-full p-3 rounded ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300'} border`}
                  />
                </div>

                <div>
                  <label htmlFor="front-distribution" className="block mb-2 font-medium">Front Weight Distribution (%)</label>
                  <input
                    id="front-distribution"
                    type="number"
                    value={frontDistribution}
                    onChange={(e) => setFrontDistribution(Number(e.target.value))}
                    placeholder="Enter front weight distribution percentage"
                    className={`w-full p-3 rounded ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300'} border`}
                  />
                </div>
              </div>

              <button
                onClick={calculateTune}
                disabled={isCalculating}
                className="w-full py-3 rounded bamboo-button text-white font-bold text-lg disabled:opacity-50"
              >
                {isCalculating ? 'Calculating...' : 'Calculate Tune'}
              </button>

              {Object.keys(tuneData).length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Tune Results</h3>
                  <div className={`p-4 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Tires</h4>
                        <p>Front Pressure: {tuneData.frontTirePressure || tuneData.tirePressureFront || 28} PSI</p>
                        <p>Rear Pressure: {tuneData.rearTirePressure || tuneData.tirePressureRear || 27} PSI</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Alignment</h4>
                        <p>Front Camber: {tuneData.frontCamber || -2.0}°</p>
                        <p>Rear Camber: {tuneData.rearCamber || -1.5}°</p>
                        <p>Front Toe: {tuneData.frontToe || 0.0}°</p>
                        <p>Rear Toe: {tuneData.rearToe || 0.1}°</p>
                        <p>Caster: {tuneData.caster || 5.5}°</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Suspension</h4>
                        <p>Front Springs: {tuneData.frontSprings || 150} lb/in</p>
                        <p>Rear Springs: {tuneData.rearSprings || 130} lb/in</p>
                        <p>Front ARB: {tuneData.frontARB || 25}</p>
                        <p>Rear ARB: {tuneData.rearARB || 25}</p>
                        <p>Front Ride Height: {tuneData.frontRideHeight || 6.5} cm</p>
                        <p>Rear Ride Height: {tuneData.rearRideHeight || 7.0} cm</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Damping</h4>
                        <p>Front Rebound: {tuneData.frontRebound || 10}</p>
                        <p>Rear Rebound: {tuneData.rearRebound || 10}</p>
                        <p>Front Bump: {tuneData.frontBump || 7}</p>
                        <p>Rear Bump: {tuneData.rearBump || 7}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Differential</h4>
                        <p>Accel: {tuneData.diffAccel || 50}%</p>
                        <p>Decel: {tuneData.diffDecel || 25}%</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Brakes</h4>
                        <p>Balance: {tuneData.brakeBalance || 48}%</p>
                        <p>Pressure: {tuneData.brakePressure || 100}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Advisor Tab */}
          {activeTab === 'ai' && (
            <div className={`p-6 rounded-lg backdrop-blur-sm ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
              <h2 className="text-2xl font-bold mb-6">AI Tuning Advisor</h2>

              <div className="mb-6">
                <label className="block mb-2 font-medium">Ask for tuning advice:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !aiLoading && handleAiQuery()}
                    placeholder={`e.g., "I want to drift my ${car.manufacturer} ${car.model}" or "Give me a track setup for circuit racing"`}
                    className={`flex-1 p-3 rounded ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300'} border`}
                  />
                  <button
                    onClick={handleAiQuery}
                    disabled={aiLoading || !aiQuery.trim()}
                    className="px-6 py-3 rounded bamboo-button text-white disabled:opacity-50"
                  >
                    {aiLoading ? 'Asking...' : 'Ask AI'}
                  </button>
                </div>
              </div>

              {aiMessages.length > 0 && (
                <div className={`p-4 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} max-h-96 overflow-y-auto`}>
                  {aiMessages.map((msg, idx) => (
                    <div key={idx} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
                        msg.role === 'user'
                          ? 'bamboo-button text-white'
                          : isDarkMode
                          ? 'bg-gray-700'
                          : 'bg-gray-200'
                      }`}>
                        <div className="font-semibold mb-1">{msg.role === 'user' ? 'You' : 'AI Advisor'}</div>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className={`p-6 rounded-lg backdrop-blur-sm ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
              <h2 className="text-2xl font-bold mb-6">Advanced Tuning</h2>
              <p className="opacity-70">Advanced tuning options coming soon. Use the Quick Tune tab for now.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
