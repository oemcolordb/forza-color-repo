'use client'

import React, { useState, useEffect } from 'react'
import { CarStatsRadarChart } from '../components/CarStatsRadarChart'

import { TuningCalculator, TRACKS, TRACK_TYPES } from '../lib/tuning-calculator'

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
    class: 'D' | 'C' | 'B' | 'A' | 'S1' | 'S2'
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
  tags?: string[]
}

interface TuneData {
  [key: string]: number
}

export default function TuneForge() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [cars, setCars] = useState<Car[]>([])
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('quick')
  const [tuneData, setTuneData] = useState<TuneData>({})
  const [savedTunes, setSavedTunes] = useState<any[]>([])
  const [sortBy, setSortBy] = useState('manufacturer-az')
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const [selectedTrack, setSelectedTrack] = useState('')
  const [drivingStyle, setDrivingStyle] = useState('balanced')

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved) setIsDarkMode(saved === 'dark')
    loadSampleCars()
    loadSavedTunes()
  }, [])

  const loadSampleCars = async () => {
    try {
      const response = await fetch('/api/tuneforge/cars')
      if (response.ok) {
        const carData = await response.json()
        const processedCars = carData.map((car: any) => ({
          ...car,
          fullName: `${car.year} ${car.manufacturer} ${car.model}`,
          drivetrain: car.drivetrain || (car.type === 'Rally Car' ? 'AWD' : car.type === 'Sports Car' ? 'RWD' : 'RWD'),
          weight: car.weight || Math.round(1200 + (car.pi.value * 2)),
          engine: car.engine || {
            displacement: 3.0 + (car.stats.speed / 10),
            cylinders: car.stats.speed > 8 ? 8 : 6,
            aspiration: car.pi.class === 'S2' || car.pi.class === 'S1' ? 'Turbo' : 'NA',
            horsepower: Math.round(200 + (car.pi.value * 0.8))
          },
          tags: [car.country, car.type, car.rarity]
        }))
        setCars(processedCars)
        setSelectedCar(processedCars[0])
        console.log(`Loaded ${processedCars.length} cars successfully`)
      } else {
        console.warn('API failed, loading fallback cars')
        loadFallbackCars()
      }
    } catch (error) {
      console.error('Failed to load cars:', error)
      loadFallbackCars()
    }
  }

  const loadFallbackCars = () => {
    const carData: Car[] = [
      {
        year: '2020',
        manufacturer: 'Porsche',
        model: '911 Turbo S',
        type: 'Sports Car',
        fullName: '2020 Porsche 911 Turbo S',
        price: 230000,
        rarity: 'Epic',
        country: 'Germany',
        stats: { speed: 9.2, handling: 8.5, acceleration: 9.0, launch: 8.8, braking: 8.7, offroad: 4.2 },
        pi: { class: 'S2', value: 998 },
        drivetrain: 'AWD',
        weight: 1640,
        engine: { displacement: 3.8, cylinders: 6, aspiration: 'Turbo', horsepower: 640 },
        tags: ['German', 'Turbo', 'AWD']
      }
    ]
    setCars(carData)
    setSelectedCar(carData[0])
  }

  const loadSavedTunes = () => {
    const saved = localStorage.getItem('forzaSavedTunes')
    if (saved) {
      try {
        setSavedTunes(JSON.parse(saved))
      } catch (error) {
        setSavedTunes([])
      }
    }
  }

  const filteredCars = React.useMemo(() => {
    return cars
      .filter(car => {
        const searchLower = searchQuery.toLowerCase()
        return !searchQuery || 
          car.fullName?.toLowerCase().includes(searchLower) ||
          `${car.year} ${car.manufacturer} ${car.model}`.toLowerCase().includes(searchLower) ||
          car.manufacturer.toLowerCase().includes(searchLower) ||
          car.model.toLowerCase().includes(searchLower)
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'manufacturer-az': return a.manufacturer.localeCompare(b.manufacturer)
          case 'manufacturer-za': return b.manufacturer.localeCompare(a.manufacturer)
          case 'pi-high': return b.pi.value - a.pi.value
          case 'pi-low': return a.pi.value - b.pi.value
          case 'year-new': return parseInt(b.year) - parseInt(a.year)
          case 'year-old': return parseInt(a.year) - parseInt(b.year)
          default: return 0
        }
      })
  }, [cars, searchQuery, sortBy])

  const calculateBaseTune = () => {
    if (!selectedCar) return
    
    const calculator = new TuningCalculator(selectedCar)
    let tune
    
    if (selectedTrack) {
      tune = calculator.getTrackRecommendations(selectedTrack)
    } else if (drivingStyle !== 'balanced') {
      tune = calculator.getStyleRecommendations(drivingStyle)
    } else {
      tune = calculator.calculateBaseTune()
    }
    
    setTuneData(tune)
    setActiveTab('advanced')
  }

  const applyTemplate = (template: string) => {
    if (!selectedCar) return
    
    let templateTune: TuneData = {}
    
    switch (template) {
      case 'Speed':
        templateTune = {
          'tire-pressure-front': 32,
          'tire-pressure-rear': 30,
          'camber-front': -0.8,
          'camber-rear': -0.6,
          'final-drive': 2.8,
          'gear-1': 4.2,
          'gear-2': 2.8,
          'gear-3': 2.0,
          'gear-4': 1.5,
          'gear-5': 1.2,
          'gear-6': 1.0,
          'aero-front': 80,
          'aero-rear': 120,
          'ride-height-front': 5.0,
          'ride-height-rear': 5.5,
          'tire-compound-front': 6,
          'tire-compound-rear': 6
        }
        break
      case 'Grip':
        templateTune = {
          'tire-pressure-front': 28,
          'tire-pressure-rear': 26,
          'camber-front': -2.5,
          'camber-rear': -2.0,
          'final-drive': 3.8,
          'gear-1': 3.8,
          'gear-2': 2.4,
          'gear-3': 1.7,
          'gear-4': 1.3,
          'gear-5': 1.0,
          'gear-6': 0.8,
          'aero-front': 200,
          'aero-rear': 280,
          'stabilizer-front': 35,
          'stabilizer-rear': 40,
          'tire-compound-front': 7,
          'tire-compound-rear': 7
        }
        break
      case 'Drift':
        templateTune = {
          'tire-pressure-front': 30,
          'tire-pressure-rear': 22,
          'camber-front': -3.5,
          'camber-rear': -1.2,
          'toe-front': -2.0,
          'toe-rear': -1.0,
          'differential-rear-accel': 5,
          'stabilizer-rear': 15,
          'ride-height-front': 4.5,
          'ride-height-rear': 4.5,
          'gear-1': 4.5,
          'gear-2': 3.2,
          'gear-3': 2.3,
          'gear-4': 1.7,
          'tire-compound-front': 4,
          'tire-compound-rear': 3,
          'traction-control': 0
        }
        break
    }
    
    setTuneData({ ...tuneData, ...templateTune })
    setActiveTab('advanced')
  }

  const saveTune = () => {
    if (!selectedCar) return
    
    const tuneName = prompt('Enter tune name:')
    if (!tuneName) return
    
    const newTune = {
      id: Date.now().toString(),
      name: tuneName,
      carFullName: `${selectedCar.year} ${selectedCar.manufacturer} ${selectedCar.model}`,
      carData: selectedCar,
      tune: tuneData,
      timestamp: Date.now(),
      version: '1.0'
    }
    
    const updatedTunes = [...savedTunes, newTune]
    setSavedTunes(updatedTunes)
    localStorage.setItem('forzaSavedTunes', JSON.stringify(updatedTunes))
    
    alert(`Tune "${tuneName}" saved!`)
  }

  const exportTune = () => {
    if (!selectedCar || Object.keys(tuneData).length === 0) return
    
    const exportData = {
      tuneName: prompt('Enter tune name for export:') || 'Exported Tune',
      car: `${selectedCar.year} ${selectedCar.manufacturer} ${selectedCar.model}`,
      carData: selectedCar,
      tune: tuneData,
      exportDate: new Date().toISOString(),
      version: '1.0',
      app: 'Forza TuneForge AI'
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${exportData.tuneName.replace(/[^a-z0-9]/gi, '_')}_${selectedCar.manufacturer}_${selectedCar.model}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  const importTune = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)
        if (importedData.tune) {
          setTuneData(importedData.tune)
          setActiveTab('advanced')
          alert(`Tune "${importedData.tuneName}" imported successfully!`)
        }
      } catch (error) {
        alert('Invalid tune file format')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const shareTune = () => {
    if (!selectedCar || Object.keys(tuneData).length === 0) return
    
    const shareData = {
      car: `${selectedCar.year} ${selectedCar.manufacturer} ${selectedCar.model}`,
      tune: tuneData
    }
    
    const shareText = `Check out my Forza tune for ${shareData.car}!\n\nTune Settings:\n${Object.entries(tuneData).map(([key, value]) => `${key}: ${value}`).join('\n')}\n\nCreated with Forza TuneForge AI`
    
    if (navigator.share) {
      navigator.share({
        title: `Forza Tune - ${shareData.car}`,
        text: shareText
      })
    } else {
      navigator.clipboard.writeText(shareText)
      alert('Tune copied to clipboard!')
    }
  }

  const deleteTune = (tuneId: string) => {
    if (confirm('Delete this tune?')) {
      const updatedTunes = savedTunes.filter(tune => tune.id !== tuneId)
      setSavedTunes(updatedTunes)
      localStorage.setItem('forzaSavedTunes', JSON.stringify(updatedTunes))
    }
  }

  const loadTune = (tune: any) => {
    setTuneData(tune.tune)
    setActiveTab('advanced')
    alert(`Loaded tune "${tune.name}"`)
  }

  const updateTuneValue = (key: string, value: number) => {
    setTuneData({ ...tuneData, [key]: value })
  }

  const getTireCompoundName = (value: number) => {
    const compounds = ['', 'Vintage', 'Stock', 'Street', 'Sport', 'Semi-Slick', 'Slick', 'Rally']
    return compounds[value] || 'Unknown'
  }

  const getAITuningAdvice = async () => {
    if (!aiQuery.trim() || !selectedCar) return
    
    setAiLoading(true)
    try {
      const carInfo = `${selectedCar.year} ${selectedCar.manufacturer} ${selectedCar.model}`
      const carStats = `PI: ${selectedCar.pi.class} ${selectedCar.pi.value}, Stats: Speed ${selectedCar.stats.speed}, Handling ${selectedCar.stats.handling}, Acceleration ${selectedCar.stats.acceleration}`
      
      const prompt = `As a professional Forza tuning expert, provide specific tuning advice for a ${carInfo} (${carStats}). User question: ${aiQuery}`
      
      // Simulate AI response with professional tuning knowledge
      const responses = {
        'understeer': `For ${carInfo} understeer issues:\n\n• Reduce front tire pressure by 2-3 PSI\n• Soften front anti-roll bar by 3-5 points\n• Add more negative front camber (-0.3°)\n• Consider front toe-out adjustment (-0.1°)\n• Reduce front spring rates if very stiff`,
        'oversteer': `For ${carInfo} oversteer issues:\n\n• Reduce rear tire pressure by 2-3 PSI\n• Soften rear anti-roll bar by 3-5 points\n• Add more negative rear camber (-0.2°)\n• Increase rear differential acceleration\n• Check if rear springs are too stiff`,
        'drift': `Drift setup for ${carInfo}:\n\n• Front: 30 PSI, -3.5° camber, -2° toe-out\n• Rear: 22 PSI, -1.2° camber, -1° toe-out\n• Very low rear differential (5-15%)\n• Soften rear anti-roll bar significantly\n• Lower ride height for stability`,
        'grip': `Maximum grip setup for ${carInfo}:\n\n• Lower tire pressures (26-28 PSI)\n• Aggressive camber (-2.5° front, -2° rear)\n• Stiffer anti-roll bars\n• Lower ride height\n• Higher downforce if available\n• Optimize brake balance for track`,
        'speed': `Top speed setup for ${carInfo}:\n\n• Higher tire pressures (30-32 PSI)\n• Less aggressive camber\n• Lower final drive ratio\n• Minimum downforce\n• Slightly higher ride height\n• Optimize gear ratios for track`,
        'default': `General tuning advice for ${carInfo}:\n\n• Start with base tune calculations\n• Adjust tire pressures first (26-30 PSI)\n• Fine-tune camber for your driving style\n• Balance anti-roll bars for handling preference\n• Test and iterate based on track feedback\n• Use telemetry to validate tire temperatures`
      }
      
      const responseKey = Object.keys(responses).find(key => 
        aiQuery.toLowerCase().includes(key)
      ) || 'default'
      
      setAiResponse(responses[responseKey as keyof typeof responses])
    } catch (error) {
      setAiResponse('Sorry, AI tuning advice is currently unavailable. Please try again later.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-black'}`}>
      <header className={`flex justify-between items-center p-4 ${isDarkMode ? 'bg-[#333333]' : 'bg-[#f5f5f5]'} border-b`}>
        <div>
          <h1 className="text-2xl font-bold text-blue-500">🏎️ Forza TuneForge AI</h1>
          <p className="text-xs opacity-75">Professional Tuning Platform</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="text-2xl p-2 rounded"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <a 
            href="/"
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            ← Back to Colors
          </a>
        </div>
      </header>

      <div className={`flex p-4 gap-4 ${isDarkMode ? 'bg-[#333333]' : 'bg-[#f5f5f5]'}`}>
        <input
          type="text"
          placeholder="Search cars..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`flex-1 p-2 rounded border ${isDarkMode ? 'bg-[#1a1a1a] text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={`p-2 rounded border ${isDarkMode ? 'bg-[#1a1a1a] text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
        >
          <option value="manufacturer-az">Manufacturer A-Z</option>
          <option value="manufacturer-za">Manufacturer Z-A</option>
          <option value="pi-high">PI High-Low</option>
          <option value="pi-low">PI Low-High</option>
          <option value="year-new">Year New-Old</option>
          <option value="year-old">Year Old-New</option>
        </select>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-0 h-[calc(100vh-140px)]">
        <div className={`border-r overflow-y-auto ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
          <ul className="list-none">
            {filteredCars.map((car, index) => (
              <li
                key={index}
                onClick={() => setSelectedCar(car)}
                className={`p-4 border-b cursor-pointer transition-colors ${
                  selectedCar === car
                    ? 'bg-blue-500 text-white'
                    : 'hover:opacity-80'
                } ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
              >
                <div className="font-bold mb-2">{car.year} {car.manufacturer} {car.model}</div>
                <div className="flex gap-4 text-sm opacity-80">
                  <span>PI: {car.pi.class} {car.pi.value}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    car.rarity === 'Legendary' ? 'bg-yellow-500 text-black' :
                    car.rarity === 'Epic' ? 'bg-purple-500 text-white' :
                    car.rarity === 'Rare' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
                  }`}>{car.rarity}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 overflow-y-auto">
          {selectedCar ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg">{selectedCar.year} {selectedCar.manufacturer} {selectedCar.model}</h3>
                <p className="text-sm opacity-75">{selectedCar.type} • {selectedCar.country} • ${selectedCar.price.toLocaleString()}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm opacity-75">PI Class</div>
                  <div className="font-semibold">{selectedCar.pi.class} {selectedCar.pi.value}</div>
                </div>
                <div>
                  <div className="text-sm opacity-75">Drivetrain</div>
                  <div className="font-semibold">{selectedCar.drivetrain || 'RWD'}</div>
                </div>
                <div>
                  <div className="text-sm opacity-75">Weight</div>
                  <div className="font-semibold">{selectedCar.weight || 1500}kg</div>
                </div>
                <div>
                  <div className="text-sm opacity-75">Power</div>
                  <div className="font-semibold">{selectedCar.engine?.horsepower || 400}hp</div>
                </div>
              </div>
              
              <div>
                <div className="text-sm opacity-75 mb-2">Stats</div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>SPD: {selectedCar.stats.speed.toFixed(1)}</div>
                  <div>HAN: {selectedCar.stats.handling.toFixed(1)}</div>
                  <div>ACC: {selectedCar.stats.acceleration.toFixed(1)}</div>
                  <div>LAU: {selectedCar.stats.launch.toFixed(1)}</div>
                  <div>BRA: {selectedCar.stats.braking.toFixed(1)}</div>
                  <div>OFF: {selectedCar.stats.offroad.toFixed(1)}</div>
                </div>
                <div className="mt-4 flex justify-center">
                  <CarStatsRadarChart stats={selectedCar.stats} size={180} isDarkMode={isDarkMode} />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center opacity-75 space-y-4">
              <div>
                <p className="text-lg mb-2">🏎️ Select a car to start tuning</p>
                <p className="text-xs text-green-500">✅ {cars.length} cars loaded successfully</p>
              </div>
              
              <div className={`p-4 rounded ${isDarkMode ? 'bg-[#333333]' : 'bg-gray-100'}`}>
                <h4 className="font-bold mb-2">🎯 TuneForge Features:</h4>
                <div className="text-sm space-y-1 text-left">
                  <div>• 🧮 AI-powered base tune calculation</div>
                  <div>• 🏁 Professional racing templates</div>
                  <div>• 🔧 Advanced parameter control</div>
                  <div>• 🤖 Expert tuning advice</div>
                  <div>• 💾 Save & share your tunes</div>
                  <div>• 📊 Visual car statistics</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className={`flex border-b mb-4 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
          {[{id: 'quick', label: '⚡ Quick', desc: 'Templates & Base Tune'}, {id: 'advanced', label: '🔧 Advanced', desc: 'Detailed Settings'}, {id: 'ai', label: '🤖 AI', desc: 'Expert Advice'}].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 flex-1 text-center ${
                activeTab === tab.id ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'
              }`}
            >
              <div className="font-medium">{tab.label}</div>
              <div className="text-xs opacity-75">{tab.desc}</div>
            </button>
          ))}
        </div>
      
        {activeTab === 'quick' && (
          <div className="space-y-4">
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedTrack}
                  onChange={(e) => setSelectedTrack(e.target.value)}
                  className={`p-2 rounded border text-sm ${isDarkMode ? 'bg-[#1a1a1a] text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
                >
                  <option value="">Select Track Type</option>
                  {Object.entries(TRACKS).map(([key, track]) => (
                    <option key={key} value={key}>{track.name}</option>
                  ))}
                </select>
                
                <select
                  value={drivingStyle}
                  onChange={(e) => setDrivingStyle(e.target.value)}
                  className={`p-2 rounded border text-sm ${isDarkMode ? 'bg-[#1a1a1a] text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
                >
                  <option value="balanced">Balanced</option>
                  <option value="aggressive">Aggressive</option>
                  <option value="smooth">Smooth</option>
                  <option value="drift">Drift</option>
                </select>
              </div>
              
              <button
                onClick={calculateBaseTune}
                disabled={!selectedCar}
                className="w-full py-3 px-4 bg-blue-500 text-white rounded font-bold disabled:opacity-50"
              >
                🧮 Calculate {selectedTrack ? `${(TRACKS as any)[selectedTrack]?.name} ` : drivingStyle !== 'balanced' ? `${drivingStyle} ` : ''}Tune
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {['Speed', 'Grip', 'Drift'].map((template) => (
                <button
                  key={template}
                  onClick={() => applyTemplate(template)}
                  disabled={!selectedCar}
                  className="py-3 px-4 bg-blue-500 text-white rounded font-bold disabled:opacity-50"
                >
                  {template}
                </button>
              ))}
            </div>
            
            {selectedCar && (
              <div className={`p-4 rounded ${isDarkMode ? 'bg-[#333333]' : 'bg-gray-100'}`}>
                <h4 className="font-bold mb-2">🎯 Smart Recommendations:</h4>
                <div className="text-sm space-y-1">
                  {selectedTrack && (
                    <div className="mb-2">
                      <div className="font-semibold text-blue-400">🏁 {(TRACKS as any)[selectedTrack].name}</div>
                      <div className="text-xs opacity-75 mb-1">{(TRACKS as any)[selectedTrack].description}</div>
                      <div>Focus: {(TRACKS as any)[selectedTrack].priority.join(', ')}</div>
                      <div className="text-xs mt-1">Characteristics: {(TRACKS as any)[selectedTrack].characteristics.join(', ')}</div>
                    </div>
                  )}
                  <div>• <span className="text-cyan-400">PI {selectedCar.pi.class} ({selectedCar.pi.value})</span> - {
                    selectedCar.pi.value < 500 ? 'Focus on basic handling fundamentals and tire pressure optimization' :
                    selectedCar.pi.value < 600 ? 'Emphasize suspension balance and alignment for consistent handling' :
                    selectedCar.pi.value < 700 ? 'Balance aerodynamics with mechanical grip for versatile performance' :
                    selectedCar.pi.value < 800 ? 'Fine-tune differential and damping for power delivery control' :
                    selectedCar.pi.value < 900 ? 'Manage high downforce and aggressive camber for maximum grip' :
                    'Extreme setup required: maximum aero, stiff suspension, precise alignment'
                  }</div>
                  
                  <div>• <span className="text-green-400">{selectedCar.drivetrain || 'RWD'} drivetrain</span> - {
                    (selectedCar.drivetrain || 'RWD') === 'FWD' ? 
                      `Front bias: ${selectedCar.stats.handling > 7 ? 'Use aggressive front camber (-2.5°) and toe-out for turn-in' : 'Moderate front setup to prevent understeer'}` :
                    (selectedCar.drivetrain || 'RWD') === 'AWD' ? 
                      `All-wheel control: ${selectedCar.stats.acceleration > 8 ? 'High differential lock (60-80%) for traction' : 'Balanced diff settings (40-60%) for stability'}` :
                      `Rear drive: ${selectedCar.stats.speed > 8 ? 'Lower rear diff accel (30-50%) to prevent wheelspin' : 'Higher rear diff (50-70%) for better launches'}`
                  }</div>
                  
                  <div>• <span className="text-orange-400">Weight: {selectedCar.weight || 1500}kg</span> - {
                    (selectedCar.weight || 1500) < 1200 ? 'Lightweight: Softer springs (80-120 lb/in) and lower tire pressures for grip' :
                    (selectedCar.weight || 1500) < 1500 ? 'Medium weight: Balanced spring rates (120-180 lb/in) and standard pressures' :
                    (selectedCar.weight || 1500) < 1800 ? 'Heavy: Stiffer springs (180-240 lb/in) and higher pressures for support' :
                    'Very heavy: Maximum spring rates (240+ lb/in) and high tire pressures for stability'
                  }</div>
                  
                  <div>• <span className="text-red-400">Power: {selectedCar.engine?.horsepower || 400}hp</span> - {
                    (selectedCar.engine?.horsepower || 400) < 300 ? 'Low power: Focus on mechanical grip and cornering speed' :
                    (selectedCar.engine?.horsepower || 400) < 500 ? 'Moderate power: Balance traction and handling with medium diff settings' :
                    (selectedCar.engine?.horsepower || 400) < 700 ? 'High power: Careful differential tuning and traction management needed' :
                    'Extreme power: Maximum traction aids, progressive differential, and stability focus'
                  }</div>
                  
                  <div>• <span className="text-purple-400">Handling: {selectedCar.stats.handling.toFixed(1)}/10</span> - {
                    selectedCar.stats.handling < 5 ? 'Low handling: Prioritize stability over agility, softer anti-roll bars' :
                    selectedCar.stats.handling < 7 ? 'Average handling: Balanced setup with moderate camber and ARBs' :
                    selectedCar.stats.handling < 9 ? 'Good handling: Aggressive alignment and stiffer suspension for precision' :
                    'Excellent handling: Maximum performance setup with extreme camber and stiff ARBs'
                  }</div>
                  
                  {drivingStyle !== 'balanced' && (
                    <div className="text-yellow-400">• <span className="font-semibold">{drivingStyle.charAt(0).toUpperCase() + drivingStyle.slice(1)} style</span> - {
                      drivingStyle === 'aggressive' ? 'Lower tire pressures (-2 PSI), more negative camber (-0.5°), stiffer ARBs (+5)' :
                      drivingStyle === 'smooth' ? 'Softer springs (-20 lb/in), reduced damping (-2), comfort-focused setup' :
                      drivingStyle === 'drift' ? 'Front: 30 PSI, -3.5° camber. Rear: 22 PSI, -1.2° camber, 5% diff lock' :
                      'Optimized for selected driving preference'
                    }</div>
                  )}
                  
                  {Object.keys(tuneData).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-500">
                      <div className="text-xs font-semibold text-blue-300 mb-1">Current Calculated Values:</div>
                      <div className="text-xs space-y-0.5">
                        {tuneData['tire-pressure-front'] && (
                          <div>• Tire Pressure: {tuneData['tire-pressure-front']} PSI front, {tuneData['tire-pressure-rear']} PSI rear</div>
                        )}
                        {tuneData['camber-front'] && (
                          <div>• Camber: {tuneData['camber-front']}° front, {tuneData['camber-rear']}° rear</div>
                        )}
                        {tuneData['final-drive'] && (
                          <div>• Final Drive: {tuneData['final-drive']} (optimized for {selectedCar.stats.speed > selectedCar.stats.acceleration ? 'top speed' : 'acceleration'})</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'advanced' && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries({
              'tire-pressure-front': { min: 15, max: 50, step: 0.5, label: 'Tire Pressure Front', unit: ' PSI', category: 'Tires' },
              'tire-pressure-rear': { min: 15, max: 50, step: 0.5, label: 'Tire Pressure Rear', unit: ' PSI', category: 'Tires' },
              'camber-front': { min: -5, max: 0, step: 0.1, label: 'Camber Front', unit: '°', category: 'Alignment' },
              'camber-rear': { min: -5, max: 0, step: 0.1, label: 'Camber Rear', unit: '°', category: 'Alignment' },
              'toe-front': { min: -3, max: 3, step: 0.1, label: 'Toe Front', unit: '°', category: 'Alignment' },
              'toe-rear': { min: -3, max: 3, step: 0.1, label: 'Toe Rear', unit: '°', category: 'Alignment' },
              'caster': { min: 4.0, max: 7.0, step: 0.1, label: 'Caster', unit: '°', category: 'Alignment' },
              'anti-roll-bar-front': { min: 1, max: 65, step: 1, label: 'Anti-Roll Bar Front', unit: '', category: 'Suspension' },
              'anti-roll-bar-rear': { min: 1, max: 65, step: 1, label: 'Anti-Roll Bar Rear', unit: '', category: 'Suspension' },
              'spring-rate-front': { min: 50, max: 300, step: 5, label: 'Spring Rate Front', unit: ' lb/in', category: 'Suspension' },
              'spring-rate-rear': { min: 50, max: 300, step: 5, label: 'Spring Rate Rear', unit: ' lb/in', category: 'Suspension' },
              'ride-height-front': { min: 4.0, max: 15.0, step: 0.1, label: 'Ride Height Front', unit: ' cm', category: 'Suspension' },
              'ride-height-rear': { min: 4.0, max: 15.0, step: 0.1, label: 'Ride Height Rear', unit: ' cm', category: 'Suspension' },
              'damping-rebound-front': { min: 1, max: 20, step: 0.1, label: 'Rebound Front', unit: '', category: 'Damping' },
              'damping-rebound-rear': { min: 1, max: 20, step: 0.1, label: 'Rebound Rear', unit: '', category: 'Damping' },
              'damping-bump-front': { min: 1, max: 20, step: 0.1, label: 'Bump Front', unit: '', category: 'Damping' },
              'damping-bump-rear': { min: 1, max: 20, step: 0.1, label: 'Bump Rear', unit: '', category: 'Damping' },
              'differential-rear-accel': { min: 0, max: 100, step: 1, label: 'Diff Rear Accel', unit: '%', category: 'Drivetrain' },
              'differential-rear-decel': { min: 0, max: 100, step: 1, label: 'Diff Rear Decel', unit: '%', category: 'Drivetrain' },
              'brake-balance': { min: 40, max: 60, step: 1, label: 'Brake Balance', unit: '%', category: 'Brakes' },
              'brake-pressure': { min: 80, max: 100, step: 1, label: 'Brake Pressure', unit: '%', category: 'Brakes' },
              // Individual Gear Ratios (FH5 supports up to 10 gears)
              'gear-1': { min: 2.0, max: 5.5, step: 0.01, label: '1st Gear', unit: '', category: 'Gearing' },
              'gear-2': { min: 1.5, max: 3.5, step: 0.01, label: '2nd Gear', unit: '', category: 'Gearing' },
              'gear-3': { min: 1.0, max: 2.5, step: 0.01, label: '3rd Gear', unit: '', category: 'Gearing' },
              'gear-4': { min: 0.8, max: 2.0, step: 0.01, label: '4th Gear', unit: '', category: 'Gearing' },
              'gear-5': { min: 0.6, max: 1.5, step: 0.01, label: '5th Gear', unit: '', category: 'Gearing' },
              'gear-6': { min: 0.5, max: 1.2, step: 0.01, label: '6th Gear', unit: '', category: 'Gearing' },
              'gear-7': { min: 0.4, max: 1.0, step: 0.01, label: '7th Gear', unit: '', category: 'Gearing' },
              'gear-8': { min: 0.35, max: 0.9, step: 0.01, label: '8th Gear', unit: '', category: 'Gearing' },
              'gear-9': { min: 0.3, max: 0.8, step: 0.01, label: '9th Gear', unit: '', category: 'Gearing' },
              'gear-10': { min: 0.25, max: 0.7, step: 0.01, label: '10th Gear', unit: '', category: 'Gearing' },
              'final-drive': { min: 2.0, max: 5.0, step: 0.01, label: 'Final Drive', unit: '', category: 'Gearing' },
              
              // AWD/4WD Differentials (missing from original)
              'differential-front-accel': { min: 0, max: 100, step: 1, label: 'Diff Front Accel', unit: '%', category: 'Drivetrain' },
              'differential-front-decel': { min: 0, max: 100, step: 1, label: 'Diff Front Decel', unit: '%', category: 'Drivetrain' },
              'differential-center': { min: 0, max: 100, step: 1, label: 'Center Diff', unit: '%', category: 'Drivetrain' },
              
              // Tire Compound Selection
              'tire-compound-front': { min: 1, max: 7, step: 1, label: 'Front Tire Compound', unit: '', category: 'Tires' },
              'tire-compound-rear': { min: 1, max: 7, step: 1, label: 'Rear Tire Compound', unit: '', category: 'Tires' },
              
              // Tire Width (FH5 specific)
              'tire-width-front': { min: 155, max: 345, step: 5, label: 'Front Tire Width', unit: 'mm', category: 'Tires' },
              'tire-width-rear': { min: 155, max: 345, step: 5, label: 'Rear Tire Width', unit: 'mm', category: 'Tires' },
              
              // Stabilizer Bars (more accurate FH5 naming)
              'stabilizer-front': { min: 1, max: 65, step: 1, label: 'Front Stabilizer', unit: '', category: 'Suspension' },
              'stabilizer-rear': { min: 1, max: 65, step: 1, label: 'Rear Stabilizer', unit: '', category: 'Suspension' },
              
              // Aerodynamics
              'aero-front': { min: 50, max: 300, step: 5, label: 'Front Downforce', unit: ' kg', category: 'Aero' },
              'aero-rear': { min: 100, max: 400, step: 5, label: 'Rear Downforce', unit: ' kg', category: 'Aero' },
              
              // Launch Control (FH5 specific)
              'launch-control': { min: 0, max: 100, step: 1, label: 'Launch Control', unit: '%', category: 'Electronics' },
              
              // Traction Control
              'traction-control': { min: 0, max: 10, step: 1, label: 'Traction Control', unit: '', category: 'Electronics' },
              
              // Stability Control
              'stability-control': { min: 0, max: 10, step: 1, label: 'Stability Control', unit: '', category: 'Electronics' }
            }).map(([key, config]) => (
              <div key={key} className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium">
                    {config.label}
                  </label>
                  <span className="text-xs px-2 py-1 bg-gray-500 text-white rounded">
                    {config.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    value={tuneData[key] || config.min}
                    onChange={(e) => updateTuneValue(key, parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="font-bold text-blue-500 min-w-[60px] text-right">
                    {key.includes('tire-compound') ? 
                      getTireCompoundName(tuneData[key] || config.min) :
                      `${(tuneData[key] || config.min).toFixed(config.step < 0.1 ? 2 : config.step === 0.01 ? 2 : 1)}${config.unit}`
                    }
                  </span>
                </div>
              </div>
            ))}
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={saveTune}
                disabled={!selectedCar || Object.keys(tuneData).length === 0}
                className="py-3 px-4 bg-blue-500 text-white rounded font-bold disabled:opacity-50"
              >
                Save Tune
              </button>
              <button
                onClick={exportTune}
                disabled={!selectedCar || Object.keys(tuneData).length === 0}
                className="py-3 px-4 bg-green-500 text-white rounded font-bold disabled:opacity-50"
              >
                Export
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={shareTune}
                disabled={!selectedCar || Object.keys(tuneData).length === 0}
                className="py-3 px-4 bg-purple-500 text-white rounded font-bold disabled:opacity-50"
              >
                Share
              </button>
              <label className="py-3 px-4 bg-orange-500 text-white rounded font-bold cursor-pointer text-center">
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importTune}
                  className="hidden"
                />
              </label>
            </div>
            
            {savedTunes.length > 0 && (
              <div className="mt-4">
                <h4 className="font-bold mb-2">Saved Tunes ({savedTunes.length})</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {savedTunes.map((tune) => (
                    <div key={tune.id} className={`p-2 rounded border flex justify-between items-center ${isDarkMode ? 'border-gray-600 bg-[#2a2a2a]' : 'border-gray-300 bg-gray-50'}`}>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{tune.name}</div>
                        <div className="text-xs opacity-75">{tune.carFullName}</div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => loadTune(tune)}
                          className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteTune(tune.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                        >
                          Del
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 mb-4">
              {['understeer', 'oversteer', 'drift', 'grip', 'speed'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAiQuery(`How do I fix ${preset} issues?`)}
                  className="py-2 px-3 bg-gray-500 text-white rounded text-sm capitalize"
                >
                  {preset}
                </button>
              ))}
            </div>
            <textarea
              placeholder="Ask AI for professional tuning advice... (e.g., 'How do I reduce understeer?', 'Best drift setup?', 'Optimize for Nürburgring?')"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              className={`w-full h-24 p-3 rounded border resize-none ${isDarkMode ? 'bg-[#1a1a1a] text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
            />
            <button 
              onClick={getAITuningAdvice}
              disabled={!aiQuery.trim() || !selectedCar || aiLoading}
              className="w-full py-3 px-4 bg-blue-500 text-white rounded font-bold disabled:opacity-50"
            >
              {aiLoading ? 'Analyzing...' : 'Get AI Tuning Advice'}
            </button>
            <div className={`p-4 rounded min-h-24 ${isDarkMode ? 'bg-[#333333]' : 'bg-gray-100'}`}>
              {aiResponse ? (
                <div className="text-sm whitespace-pre-line">{aiResponse}</div>
              ) : (
                <div className="text-sm opacity-75">AI tuning suggestions will appear here...</div>
              )}
            </div>
          </div>
        )}
        

      </div>
    </div>
  )
}