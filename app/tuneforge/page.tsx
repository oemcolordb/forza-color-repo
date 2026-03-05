'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { CarStatsRadarChart } from '../components/CarStatsRadarChart'
import { getCountryFlag, formatPrice } from '../lib/countryFlags'

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
  const [telemetryData, setTelemetryData] = useState(null)
  const [tuneComparison, setTuneComparison] = useState([])
  const [weatherCondition, setWeatherCondition] = useState('dry')
  const [trackSurface, setTrackSurface] = useState('tarmac')
  const [lapTimeTarget, setLapTimeTarget] = useState('')
  const [tuneHistory, setTuneHistory] = useState([])
  const [activePreset, setActivePreset] = useState('')
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationProgress, setCalculationProgress] = useState(0)
  const [loadingStatus, setLoadingStatus] = useState('Initializing...')
  const [unitSystem, setUnitSystem] = useState('Imperial')
  const [carWeight, setCarWeight] = useState(3200)
  const [frontDistribution, setFrontDistribution] = useState(52)
  const [gearCount, setGearCount] = useState(10)
  const [upgrades, setUpgrades] = useState({
    intake: 'Stock', fuelSystem: 'Stock', ignition: 'Stock', exhaust: 'Stock',
    camshaft: 'Stock', valves: 'Stock', displacement: 'Stock', pistons: 'Stock',
    flywheel: 'Stock', brakes: 'Stock', springs: 'Stock', chassis: 'Stock',
    weight: 'Stock', tires: 'Stock', frontAero: 'Stock', rearAero: 'Stock'
  })
  const [tuneType, setTuneType] = useState('Basic (General)')
  const [handlingBalance, setHandlingBalance] = useState(0)
  const [bumpStiffness, setBumpStiffness] = useState(65)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved) setIsDarkMode(saved === 'dark')
    loadSampleCars()
    loadSavedTunes()
  }, [])

  const loadSampleCars = async () => {
    setLoadingStatus('Loading car database...')
    
    try {
      setLoadingStatus('Connecting to car database...')
      const { carDatabase } = await import('../../services/carDatabase')
      
      setLoadingStatus('Loading all cars...')
      const allCars = await carDatabase.getAllCars()
      
      if (!allCars || allCars.length === 0) {
        throw new Error('No car data available')
      }
      
      setLoadingStatus('Processing car data...')
      const processedCars = allCars.map((car: any) => ({
        year: car.year,
        manufacturer: car.manufacturer,
        model: car.model,
        type: car.type,
        fullName: `${car.year} ${car.manufacturer} ${car.model}`,
        price: car.price,
        rarity: car.rarity,
        country: car.country,
        stats: car.stats,
        pi: car.pi,
        drivetrain: getDrivetrain(car.manufacturer, car.model),
        weight: Math.round(1200 + Math.random() * 800),
        engine: generateEngine(car.manufacturer, car.model),
        tags: [car.country, car.type]
      }))
      
      setCars(processedCars)
      setSelectedCar(processedCars[0])
      setLoadingStatus(`✅ ${processedCars.length} cars loaded successfully`)
      console.log(`✅ TuneForge: Loaded ${processedCars.length} cars from car database`)
      
      // Log detailed statistics
      const manufacturers = new Set(processedCars.map(c => c.manufacturer)).size
      const countries = new Set(processedCars.map(c => c.country)).size
      console.log(`📊 Database Stats: ${manufacturers} manufacturers, ${countries} countries`)
      
    } catch (error) {
      console.error('❌ TuneForge: Failed to load car database:', error)
      setLoadingStatus('⚠️ Loading fallback cars...')
      loadFallbackCars()
    }
  }
  
  const getCountryFromMake = (make: string) => {
    const countries: {[key: string]: string} = {
      'Ferrari': 'Italy', 'Lamborghini': 'Italy', 'Maserati': 'Italy', 'Alfa Romeo': 'Italy',
      'Porsche': 'Germany', 'BMW': 'Germany', 'Mercedes-Benz': 'Germany', 'Audi': 'Germany',
      'Ford': 'United States', 'Chevrolet': 'United States', 'Dodge': 'United States',
      'Toyota': 'Japan', 'Honda': 'Japan', 'Nissan': 'Japan', 'Mazda': 'Japan',
      'McLaren': 'United Kingdom', 'Aston Martin': 'United Kingdom', 'Lotus': 'United Kingdom'
    }
    return countries[make] || 'United States'
  }
  
  const generateCarStats = (make: string, model: string) => {
    const base = Math.random() * 3 + 6
    return {
      speed: Math.round((base + Math.random() * 2) * 10) / 10,
      handling: Math.round((base + Math.random() * 2) * 10) / 10,
      acceleration: Math.round((base + Math.random() * 2) * 10) / 10,
      launch: Math.round((base + Math.random() * 2) * 10) / 10,
      braking: Math.round((base + Math.random() * 2) * 10) / 10,
      offroad: Math.round((Math.random() * 6 + 2) * 10) / 10
    }
  }
  
  const generatePIClass = (make: string, model: string) => {
    const classes = ['D', 'C', 'B', 'A', 'S1', 'S2']
    const classIndex = Math.floor(Math.random() * classes.length)
    const baseValues = [400, 500, 600, 700, 800, 900]
    return {
      class: classes[classIndex] as 'D' | 'C' | 'B' | 'A' | 'S1' | 'S2',
      value: baseValues[classIndex] + Math.floor(Math.random() * 99)
    }
  }
  
  const getDrivetrain = (make: string, model: string) => {
    const drivetrains = ['RWD', 'FWD', 'AWD']
    return drivetrains[Math.floor(Math.random() * drivetrains.length)]
  }
  
  const generateEngine = (make: string, model: string) => {
    return {
      displacement: Math.round((2.0 + Math.random() * 4.0) * 10) / 10,
      cylinders: [4, 6, 8, 10, 12][Math.floor(Math.random() * 5)],
      aspiration: Math.random() > 0.6 ? 'Turbo' : 'NA',
      horsepower: Math.round(200 + Math.random() * 600)
    }
  }

  const calculateOptimalUpgrades = () => {
    if (!selectedCar) return upgrades
    
    const weight = selectedCar.weight || carWeight
    const drivetrain = selectedCar.drivetrain || 'RWD'
    const piValue = selectedCar.pi.value
    const power = selectedCar.engine?.horsepower || 400
    
    const optimalUpgrades = { ...upgrades }
    
    // Engine upgrades based on tune type and power
    if (tuneType === 'Track' || tuneType === 'Basic (General)') {
      optimalUpgrades.intake = power < 400 ? 'Race' : 'Sport'
      optimalUpgrades.exhaust = 'Race'
      optimalUpgrades.camshaft = piValue > 700 ? 'Race' : 'Sport'
      optimalUpgrades.pistons = piValue > 800 ? 'Race' : 'Sport'
    } else if (tuneType === 'Drift') {
      optimalUpgrades.intake = 'Race'
      optimalUpgrades.exhaust = 'Race'
      optimalUpgrades.camshaft = 'Race'
      optimalUpgrades.pistons = 'Race'
    } else if (tuneType === 'Rally') {
      optimalUpgrades.intake = 'Sport'
      optimalUpgrades.exhaust = 'Sport'
      optimalUpgrades.camshaft = 'Sport'
    }
    
    // Suspension based on weight and tune type
    if (weight > 1600 || tuneType === 'Track') {
      optimalUpgrades.springs = 'Race'
      optimalUpgrades.chassis = 'Race'
    } else if (tuneType === 'Rally') {
      optimalUpgrades.springs = 'Sport'
      optimalUpgrades.chassis = 'Sport'
    } else {
      optimalUpgrades.springs = 'Sport'
      optimalUpgrades.chassis = 'Sport'
    }
    
    // Brakes based on power and weight
    if (power > 500 || weight > 1500) {
      optimalUpgrades.brakes = 'Race'
    } else {
      optimalUpgrades.brakes = 'Sport'
    }
    
    // Tires based on tune type
    if (tuneType === 'Track') {
      optimalUpgrades.tires = 'Race'
    } else if (tuneType === 'Drift') {
      optimalUpgrades.tires = 'Sport'
    } else if (tuneType === 'Rally') {
      optimalUpgrades.tires = 'Stock'
    } else {
      optimalUpgrades.tires = 'Sport'
    }
    
    // Weight reduction for performance builds
    if (tuneType === 'Track' || (tuneType === 'Basic (General)' && weight > 1400)) {
      optimalUpgrades.weight = 'Race'
    } else if (tuneType === 'Drift') {
      optimalUpgrades.weight = 'Sport'
    }
    
    // Aero for high-speed builds
    if (tuneType === 'Track' && piValue > 700) {
      optimalUpgrades.frontAero = 'Race'
      optimalUpgrades.rearAero = 'Race'
    } else if (tuneType === 'Basic (General)' && piValue > 800) {
      optimalUpgrades.frontAero = 'Sport'
      optimalUpgrades.rearAero = 'Sport'
    }
    
    return optimalUpgrades
  }

  const loadFallbackCars = () => {
    console.log('⚠️ TuneForge: Using fallback car data (limited selection)')
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
    setLoadingStatus('⚠️ Using limited fallback data (1 car)')
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

  const calculateBaseTune = async () => {
    if (!selectedCar) return
    
    setIsCalculating(true)
    setCalculationProgress(0)
    setLoadingStatus('Analyzing car parameters...')
    
    try {
      // Calculate optimal upgrades first
      await new Promise(resolve => setTimeout(resolve, 200))
      setCalculationProgress(15)
      setLoadingStatus('Selecting optimal upgrades...')
      
      const optimalUpgrades = calculateOptimalUpgrades()
      setUpgrades(optimalUpgrades)
      
      await new Promise(resolve => setTimeout(resolve, 200))
      setCalculationProgress(30)
      setLoadingStatus('Calculating base tune...')
      
      const calculator = new TuningCalculator(selectedCar)
      let tune = calculator.getTuneTypeRecommendations(tuneType)
      
      await new Promise(resolve => setTimeout(resolve, 200))
      setCalculationProgress(50)
      
      // Apply track-specific adjustments
      if (selectedTrack) {
        setLoadingStatus(`Optimizing for ${(TRACKS as any)[selectedTrack]?.name}...`)
        tune = calculator.getTrackRecommendations(selectedTrack)
        await new Promise(resolve => setTimeout(resolve, 200))
        setCalculationProgress(65)
      }
      
      // Apply driving style adjustments
      if (drivingStyle !== 'balanced') {
        setLoadingStatus(`Applying ${drivingStyle} driving style...`)
        tune = calculator.getStyleRecommendations(drivingStyle)
        await new Promise(resolve => setTimeout(resolve, 150))
        setCalculationProgress(75)
      }
      
      // Apply weather adjustments
      if (weatherCondition !== 'dry') {
        setLoadingStatus(`Adjusting for ${weatherCondition} conditions...`)
        tune = { ...tune, ...applyWeatherAdjustments(tune, weatherCondition) }
        await new Promise(resolve => setTimeout(resolve, 150))
        setCalculationProgress(85)
      }
      
      // Apply surface adjustments
      if (trackSurface !== 'tarmac') {
        setLoadingStatus(`Optimizing for ${trackSurface} surface...`)
        tune = { ...tune, ...applySurfaceAdjustments(tune, trackSurface) }
        await new Promise(resolve => setTimeout(resolve, 150))
        setCalculationProgress(95)
      }
      
      setLoadingStatus('Finalizing tune...')
      await new Promise(resolve => setTimeout(resolve, 200))
      setCalculationProgress(100)
      
      setTuneData(tune)
      setActiveTab('advanced')
      setLoadingStatus('Calculation complete!')
      
    } catch (error) {
      console.error('Calculation error:', error)
      setLoadingStatus('Calculation failed')
    } finally {
      setTimeout(() => {
        setIsCalculating(false)
        setCalculationProgress(0)
        setLoadingStatus('Ready')
      }, 500)
    }
  }
  
  const applyWeatherAdjustments = (baseTune: TuneData, weather: string): TuneData => {
    const adjustments = { ...baseTune }
    
    if (weather === 'wet') {
      adjustments['tire-pressure-front'] = (baseTune['tire-pressure-front'] || 28) - 3
      adjustments['tire-pressure-rear'] = (baseTune['tire-pressure-rear'] || 26) - 3
      adjustments['camber-front'] = (baseTune['camber-front'] || -1.5) + 0.5
      adjustments['camber-rear'] = (baseTune['camber-rear'] || -1.2) + 0.5
      adjustments['ride-height-front'] = (baseTune['ride-height-front'] || 6.5) + 0.5
      adjustments['ride-height-rear'] = (baseTune['ride-height-rear'] || 7.0) + 0.5
      adjustments['anti-roll-bar-front'] = Math.max((baseTune['anti-roll-bar-front'] || 25) - 5, 1)
      adjustments['anti-roll-bar-rear'] = Math.max((baseTune['anti-roll-bar-rear'] || 30) - 5, 1)
    } else if (weather === 'mixed') {
      adjustments['tire-pressure-front'] = (baseTune['tire-pressure-front'] || 28) - 1
      adjustments['tire-pressure-rear'] = (baseTune['tire-pressure-rear'] || 26) - 1
      adjustments['ride-height-front'] = (baseTune['ride-height-front'] || 6.5) + 0.2
      adjustments['ride-height-rear'] = (baseTune['ride-height-rear'] || 7.0) + 0.2
    }
    
    return adjustments
  }
  
  const applySurfaceAdjustments = (baseTune: TuneData, surface: string): TuneData => {
    const adjustments = { ...baseTune }
    
    switch (surface) {
      case 'dirt':
        adjustments['tire-pressure-front'] = 22
        adjustments['tire-pressure-rear'] = 20
        adjustments['ride-height-front'] = 8.0
        adjustments['ride-height-rear'] = 8.5
        adjustments['spring-rate-front'] = 80
        adjustments['spring-rate-rear'] = 75
        adjustments['camber-front'] = -1.5
        adjustments['camber-rear'] = -1.0
        break
      case 'gravel':
        adjustments['tire-pressure-front'] = 24
        adjustments['tire-pressure-rear'] = 22
        adjustments['ride-height-front'] = 7.5
        adjustments['ride-height-rear'] = 8.0
        adjustments['spring-rate-front'] = 100
        adjustments['spring-rate-rear'] = 95
        break
      case 'snow':
        adjustments['tire-pressure-front'] = 20
        adjustments['tire-pressure-rear'] = 18
        adjustments['ride-height-front'] = 9.0
        adjustments['ride-height-rear'] = 9.5
        adjustments['spring-rate-front'] = 60
        adjustments['spring-rate-rear'] = 55
        adjustments['differential-rear-accel'] = 80
        break
      case 'mixed':
        adjustments['tire-pressure-front'] = 25
        adjustments['tire-pressure-rear'] = 23
        adjustments['ride-height-front'] = 7.0
        adjustments['ride-height-rear'] = 7.5
        break
    }
    
    return adjustments
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

  const saveTune = async () => {
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
    
    try {
      // Save to Turso database
      await fetch('/api/tuneforge/tunes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newTune.id,
          name: tuneName,
          car_make: selectedCar.manufacturer,
          car_model: selectedCar.model,
          tune_data: JSON.stringify(tuneData)
        })
      })
    } catch (error) {
      console.error('Failed to save to database:', error)
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
      const contextInfo = `Track: ${selectedTrack || 'General'}, Weather: ${weatherCondition}, Surface: ${trackSurface}, Style: ${drivingStyle}`
      
      // Enhanced AI responses with context awareness
      const responses = {
        'understeer': `🔧 UNDERSTEER FIX for ${carInfo}:\n\n📊 IMMEDIATE ADJUSTMENTS:\n• Tire Pressure: Front -2.5 PSI (${tuneData['tire-pressure-front'] ? tuneData['tire-pressure-front'] - 2.5 : 25.5} PSI)\n• Front ARB: Soften by 4-6 points\n• Front Camber: Add -0.4° (more negative)\n• Front Toe: -0.15° toe-out for turn-in\n\n🏁 ADVANCED TUNING:\n• Front springs: Reduce by 15-20 lb/in\n• Front rebound damping: Reduce by 1-2 clicks\n• Brake balance: Move 2-3% rearward\n• Consider front aero reduction if available\n\n🌡️ TELEMETRY CHECK:\n• Front tire temps should be 5-10°F cooler than rear\n• Look for blue/cold outer edges on front tires`,
        
        'oversteer': `🔧 OVERSTEER FIX for ${carInfo}:\n\n📊 IMMEDIATE ADJUSTMENTS:\n• Tire Pressure: Rear -2.5 PSI (${tuneData['tire-pressure-rear'] ? tuneData['tire-pressure-rear'] - 2.5 : 23.5} PSI)\n• Rear ARB: Soften by 4-6 points\n• Rear Camber: Add -0.3° (more negative)\n• Rear Toe: +0.1° toe-in for stability\n\n🏁 ADVANCED TUNING:\n• Rear springs: Reduce by 10-15 lb/in\n• Rear differential: Increase accel to 60-70%\n• Rear rebound: Soften by 1-2 clicks\n• Add rear downforce if available\n\n🌡️ TELEMETRY CHECK:\n• Rear tire temps should match fronts\n• Watch for red/overheated rear tires`,
        
        'wet': `🌧️ WET WEATHER SETUP for ${carInfo}:\n\n💧 TIRE STRATEGY:\n• Pressure: Reduce all by 3-4 PSI for larger contact patch\n• Compound: Rain tires if available, otherwise softest compound\n• Camber: Reduce by 0.5° all around for stability\n\n⚙️ SUSPENSION TUNING:\n• Springs: Soften by 20-30 lb/in for compliance\n• ARBs: Reduce by 5-8 points for grip\n• Damping: Soften rebound, stiffen bump slightly\n• Ride height: Raise 0.5-1.0cm for aquaplaning resistance\n\n🎯 DRIVETRAIN:\n• Differential: Reduce accel by 10-15% for traction\n• Brake balance: Move 2-3% rearward\n• Electronics: Enable traction control if available`,
        
        'drift': `🔥 ULTIMATE DRIFT SETUP for ${carInfo}:\n\n🎯 CORE SETTINGS:\n• Front: 30 PSI, -3.5° camber, -2.0° toe-out\n• Rear: 22 PSI, -1.2° camber, -1.0° toe-out\n• Rear Diff: 5-15% accel, 0-10% decel\n\n🏎️ SUSPENSION MAGIC:\n• Front ARB: 25-30 (moderate stiffness)\n• Rear ARB: 10-15 (very soft for rotation)\n• Springs: Front 120-140, Rear 80-100 lb/in\n• Ride height: 4.5-5.0cm both ends\n\n⚡ PRO TIPS:\n• Brake balance: 45-48% for rear brake bias\n• Handbrake: Rear only for initiation\n• Tire compound: Sport or Semi-slick front, Street rear\n• Gearing: Shorter ratios for power delivery control`,
        
        'grip': `🏆 MAXIMUM GRIP SETUP for ${carInfo}:\n\n🎯 CONTACT PATCH OPTIMIZATION:\n• Tire Pressure: 26-28 PSI (lower = more grip)\n• Camber: Front -2.5°, Rear -2.0° (aggressive)\n• Toe: Front -0.1°, Rear +0.1° (stability + turn-in)\n\n🔧 MECHANICAL GRIP:\n• Springs: Stiff but compliant (180-220 lb/in)\n• ARBs: Balanced stiffness (35-40 both ends)\n• Ride height: As low as possible without bottoming\n• Damping: Firm rebound, moderate bump\n\n🌪️ AERODYNAMIC GRIP:\n• Maximum downforce front and rear\n• Balance aero for neutral handling\n• Consider drag penalty vs. cornering gain\n\n📊 TELEMETRY TARGETS:\n• Tire temps: 180-220°F optimal range\n• Even temps across tire width\n• Minimal tire wear for consistency`,
        
        'speed': `🚀 TOP SPEED SETUP for ${carInfo}:\n\n⚡ AERODYNAMIC EFFICIENCY:\n• Downforce: Minimum front/rear for low drag\n• Ride height: Slightly raised (6.5-7.5cm) for aero\n• Body kit: Remove unnecessary aero components\n\n🎯 GEARING OPTIMIZATION:\n• Final drive: Lower ratio (2.5-3.0) for top end\n• Gear ratios: Longer for sustained high speed\n• Rev limiter: Tune to hit max speed in top gear\n\n🏎️ MECHANICAL SETUP:\n• Tire pressure: Higher (30-32 PSI) for less rolling resistance\n• Camber: Moderate (-1.0° to -1.5°) for straight-line stability\n• Toe: Minimal (0° to +0.1°) to reduce scrub\n• Springs: Medium stiffness for high-speed stability\n\n📈 POWER DELIVERY:\n• Differential: 40-50% accel for traction without wheelspin\n• Launch control: Optimize for clean getaway\n• Shift points: Tune for power band efficiency`,
        
        'rally': `🏔️ RALLY SETUP for ${carInfo}:\n\n🌍 MIXED SURFACE MASTERY:\n• Tire pressure: 24-26 PSI for compliance\n• Compound: Rally tires or softest available\n• Camber: Conservative (-1.5° front, -1.0° rear)\n\n⛰️ SUSPENSION FOR TERRAIN:\n• Ride height: 7.5-9.0cm for ground clearance\n• Springs: Medium-soft (100-140 lb/in) for absorption\n• Damping: Soft bump, firm rebound for control\n• ARBs: Moderate (25-30) for body control\n\n🎯 DRIVETRAIN TRACTION:\n• Differential: High lock (60-80%) for grip\n• Center diff: 60-70% rear bias for rotation\n• Brake balance: Rearward (45-48%) for stability\n\n🏁 RALLY TECHNIQUES:\n• Gearing: Shorter ratios for power out of corners\n• Electronics: Minimal aids for driver control\n• Weight transfer: Use suspension for rotation`,
        
        'track': `🏁 TRACK DAY SETUP for ${carInfo}:\n\n🎯 CIRCUIT OPTIMIZATION:\n• Tire pressure: Start 26-28 PSI cold\n• Camber: Track-specific (-2.0° to -2.5° front)\n• Toe: Minimal for tire wear (±0.1°)\n\n🔧 SUSPENSION PRECISION:\n• Springs: Firm but compliant (160-200 lb/in)\n• ARBs: Balanced for neutral handling\n• Ride height: Low but avoid bottoming\n• Damping: Track-tuned for responsiveness\n\n⚙️ PERFORMANCE FOCUS:\n• Brake balance: Optimize for track layout\n• Differential: Balanced (45-55%) for consistency\n• Gearing: Match to track's speed profile\n• Aero: Balance downforce vs. straight-line speed\n\n📊 SESSION MANAGEMENT:\n• Tire temps: Monitor for overheating\n• Fuel load: Adjust setup for weight changes\n• Brake cooling: Ensure adequate for session length`,
        
        'default': `🎯 COMPREHENSIVE TUNING GUIDE for ${carInfo}:\n\n📋 SYSTEMATIC APPROACH:\n1️⃣ Start with calculated base tune\n2️⃣ Adjust tire pressures first (26-30 PSI range)\n3️⃣ Fine-tune camber for tire wear pattern\n4️⃣ Balance ARBs for handling preference\n5️⃣ Optimize differential for power delivery\n\n🔧 CURRENT CONTEXT:\n• Track: ${selectedTrack || 'General use'}\n• Weather: ${weatherCondition}\n• Surface: ${trackSurface}\n• Style: ${drivingStyle}\n\n📊 TELEMETRY VALIDATION:\n• Tire temperatures: 180-220°F optimal\n• Even wear across tire width\n• Consistent lap times within 0.5 seconds\n• Stable handling balance through corners\n\n🏆 PRO TIPS:\n• Make one change at a time\n• Test 5-10 laps between adjustments\n• Document what works for future reference\n• Focus on driver comfort and confidence`
      }
      
      // Enhanced keyword detection with context
      let responseKey = 'default'
      const query = aiQuery.toLowerCase()
      
      if (query.includes('understeer') || query.includes('push') || query.includes('front')) responseKey = 'understeer'
      else if (query.includes('oversteer') || query.includes('loose') || query.includes('rear')) responseKey = 'oversteer'
      else if (query.includes('drift') || query.includes('slide')) responseKey = 'drift'
      else if (query.includes('grip') || query.includes('traction')) responseKey = 'grip'
      else if (query.includes('speed') || query.includes('fast') || query.includes('straight')) responseKey = 'speed'
      else if (query.includes('rally') || query.includes('dirt') || query.includes('gravel')) responseKey = 'rally'
      else if (query.includes('track') || query.includes('circuit') || query.includes('lap')) responseKey = 'track'
      else if (weatherCondition === 'wet' || query.includes('rain') || query.includes('wet')) responseKey = 'wet'
      
      setAiResponse(responses[responseKey as keyof typeof responses])
    } catch (error) {
      setAiResponse('🚫 AI tuning advice temporarily unavailable. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className={`min-h-screen relative ${isDarkMode ? 'text-white' : 'text-black'}`} style={{
      backgroundImage: 'url("/assets/images/tokyo-panorama.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="absolute inset-0 bg-black/60"></div>
      <header className={`relative z-10 flex justify-between items-center p-4 ${isDarkMode ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-sm border-b`}>
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

      <div className={`relative z-10 flex p-4 gap-4 ${isDarkMode ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-sm`}>
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
      
      <div className="relative z-10 grid lg:grid-cols-2 gap-0 h-[calc(100vh-140px)]">
        <div className={`border-r overflow-y-auto ${isDarkMode ? 'border-gray-600 bg-black/60' : 'border-gray-300 bg-white/60'} backdrop-blur-sm`}>
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
                <div className="font-bold mb-2 flex items-center gap-2">
                  <span>{getCountryFlag(car.country)}</span>
                  <span>{car.year} {car.manufacturer} {car.model}</span>
                </div>
                <div className="flex gap-4 text-sm opacity-80">
                  <span>PI: {car.pi.class} {car.pi.value}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    car.rarity === 'Legendary' ? 'bg-yellow-500 text-black' :
                    car.rarity === 'Epic' ? 'bg-purple-500 text-white' :
                    car.rarity === 'Rare' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
                  }`}>{car.rarity}</span>
                  <span>{formatPrice(car.price)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={`p-4 overflow-y-auto ${isDarkMode ? 'bg-black/60' : 'bg-white/60'} backdrop-blur-sm`}>
          {selectedCar ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span>{getCountryFlag(selectedCar.country)}</span>
                  <span>{selectedCar.year} {selectedCar.manufacturer} {selectedCar.model}</span>
                </h3>
                <p className="text-sm opacity-75 flex items-center gap-2">
                  <span>{selectedCar.type}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    {getCountryFlag(selectedCar.country)} {selectedCar.country}
                  </span>
                  <span>•</span>
                  <span>{formatPrice(selectedCar.price)}</span>
                </p>
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
                <div className="space-y-1">
                  <p className={`text-xs ${
                    loadingStatus.includes('✅') ? 'text-green-500' : 
                    loadingStatus.includes('⚠️') ? 'text-yellow-500' : 
                    'text-blue-500'
                  }`}>
                    {loadingStatus || `✅ ${cars.length} cars loaded successfully`}
                  </p>
                  {cars.length > 0 && (
                    <p className="text-xs text-gray-400">
                      🚗 {cars.length} vehicles • 🏭 {new Set(cars.map(c => c.manufacturer)).size} manufacturers
                    </p>
                  )}
                </div>
              </div>
              
              <div className={`p-4 rounded ${isDarkMode ? 'bg-[#333333]' : 'bg-gray-100'}`}>
                <h4 className="font-bold mb-2">🎯 TuneForge Smart Calculator:</h4>
                <div className="text-sm space-y-1 text-left">
                  <div>• 🧮 <span className="text-green-400">Smart calculation engine</span> - Analyzes car parameters</div>
                  <div>• 🏁 <span className="text-blue-400">Track-specific optimization</span> - {Object.keys(TRACKS).length} track types</div>
                  <div>• 🎨 <span className="text-purple-400">Driving style adaptation</span> - Personalized setups</div>
                  <div>• 🌦️ <span className="text-cyan-400">Weather & surface tuning</span> - Condition-aware</div>
                  <div>• 🤖 <span className="text-yellow-400">AI expert advice</span> - Professional guidance</div>
                  <div>• 💾 <span className="text-pink-400">Save & share system</span> - Community tunes</div>
                </div>
                
                {isCalculating && (
                  <div className="mt-3 p-2 bg-blue-500/20 rounded border border-blue-500/30">
                    <div className="text-xs text-blue-300 font-medium">🔄 Smart Calculator Active</div>
                    <div className="text-xs text-blue-200 mt-1">{loadingStatus}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className={`relative z-10 p-4 ${isDarkMode ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-sm`}>
        <div className={`flex border-b mb-4 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
          {[
            {id: 'quick', label: '⚡ Quick', desc: 'Templates & Base Tune'}, 
            {id: 'advanced', label: '🔧 Advanced', desc: 'Detailed Settings'}, 
            {id: 'ai', label: '🤖 AI', desc: 'Expert Advice'},
            {id: 'telemetry', label: '📊 Telemetry', desc: 'Data Analysis'}
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2 py-3 flex-1 text-center ${
                activeTab === tab.id ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'
              }`}
            >
              <div className="font-medium text-sm">{tab.label}</div>
              <div className="text-xs opacity-75">{tab.desc}</div>
            </button>
          ))}
        </div>
      
        {activeTab === 'quick' && (
          <div className="space-y-4">
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <select value={unitSystem} onChange={(e) => setUnitSystem(e.target.value)} className={`p-2 rounded border text-sm ${isDarkMode ? 'bg-[#1a1a1a] text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}>
                  <option value="Imperial">Imperial (lbs)</option>
                  <option value="Metric">Metric (kg)</option>
                </select>
                <input type="number" placeholder={`Weight (${unitSystem === 'Imperial' ? 'lbs' : 'kg'})`} value={carWeight} onChange={(e) => setCarWeight(Number(e.target.value))} className={`p-2 rounded border text-sm ${isDarkMode ? 'bg-[#1a1a1a] text-white border-gray-600' : 'bg-white text-black border-gray-300'}`} />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <input type="number" placeholder="Front Dist. (%)" value={frontDistribution} onChange={(e) => setFrontDistribution(Number(e.target.value))} className={`p-2 rounded border text-sm ${isDarkMode ? 'bg-[#1a1a1a] text-white border-gray-600' : 'bg-white text-black border-gray-300'}`} />
                <select value={selectedCar?.drivetrain || 'RWD'} className={`p-2 rounded border text-sm ${isDarkMode ? 'bg-[#1a1a1a] text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}>
                  <option value="RWD">RWD</option>
                  <option value="FWD">FWD</option>
                  <option value="AWD">AWD</option>
                </select>
                <input type="number" placeholder="Gears" value={gearCount} onChange={(e) => setGearCount(Number(e.target.value))} className={`p-2 rounded border text-sm ${isDarkMode ? 'bg-[#1a1a1a] text-white border-gray-600' : 'bg-white text-black border-gray-300'}`} />
              </div>
              
              <div className={`p-3 rounded ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-100'}`}>
                <h5 className="font-bold mb-2">✨ Installed Upgrades</h5>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {Object.entries(upgrades).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-1">
                      <span className="text-xs w-16 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <select value={value} onChange={(e) => setUpgrades({...upgrades, [key]: e.target.value})} className={`flex-1 p-1 rounded text-xs ${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-black'}`}>
                        <option value="Stock">Stock</option>
                        <option value="Sport">Sport</option>
                        <option value="Race">Race</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <select value={tuneType} onChange={(e) => setTuneType(e.target.value)} className={`p-2 rounded border text-sm ${isDarkMode ? 'bg-[#1a1a1a] text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}>
                  <option value="Basic (General)">Basic (General)</option>
                  <option value="Track">Track</option>
                  <option value="Drift">Drift</option>
                  <option value="Rally">Rally</option>
                </select>
                <select value={weatherCondition} onChange={(e) => setWeatherCondition(e.target.value)} className={`p-2 rounded border text-sm ${isDarkMode ? 'bg-[#1a1a1a] text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}>
                  <option value="dry">☀️ Dry</option>
                  <option value="wet">🌧️ Wet</option>
                  <option value="snow">❄️ Snow</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Handling Balance ({handlingBalance > 0 ? '+' : ''}{handlingBalance})</span>
                  <span>Understeer ← → Oversteer</span>
                </div>
                <input type="range" min="-10" max="10" value={handlingBalance} onChange={(e) => setHandlingBalance(Number(e.target.value))} className="w-full" />
                
                <div className="flex justify-between text-sm">
                  <span>Bump Stiffness ({bumpStiffness}%)</span>
                  <span>Soft ← → Stiff</span>
                </div>
                <input type="range" min="0" max="100" value={bumpStiffness} onChange={(e) => setBumpStiffness(Number(e.target.value))} className="w-full" />
              </div>
              
              <button
                onClick={calculateBaseTune}
                disabled={!selectedCar || isCalculating}
                className={`w-full py-3 px-4 rounded font-bold transition-all duration-300 ${
                  isCalculating 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white disabled:opacity-50`}
              >
                {isCalculating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>🔧 {loadingStatus}</span>
                  </div>
                ) : (
                  '🔧 Calculate Tune'
                )}
              </button>
              
              {isCalculating && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{calculationProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculationProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              <input
                type="text"
                placeholder="🎯 Target lap time (e.g., 1:45.2)"
                value={lapTimeTarget}
                onChange={(e) => setLapTimeTarget(e.target.value)}
                className={`p-2 rounded border text-sm ${isDarkMode ? 'bg-[#1a1a1a] text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
              />
              <button
                onClick={() => {
                  const newPreset = `${selectedCar?.manufacturer || 'Custom'}_${Date.now()}`
                  setActivePreset(newPreset)
                  calculateBaseTune()
                }}
                disabled={!selectedCar}
                className="py-2 px-3 bg-purple-500 text-white rounded font-bold disabled:opacity-50 text-sm"
              >
                💾 Save as Preset
              </button>
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
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                {key: 'understeer', icon: '🔄', label: 'Understeer'},
                {key: 'oversteer', icon: '💫', label: 'Oversteer'},
                {key: 'drift', icon: '💨', label: 'Drift Setup'},
                {key: 'grip', icon: '🏆', label: 'Max Grip'},
                {key: 'speed', icon: '🚀', label: 'Top Speed'},
                {key: 'wet weather', icon: '🌧️', label: 'Wet Setup'}
              ].map((preset) => (
                <button
                  key={preset.key}
                  onClick={() => setAiQuery(`How do I optimize for ${preset.key}?`)}
                  className="py-2 px-2 bg-gray-500 text-white rounded text-xs font-medium"
                >
                  {preset.icon} {preset.label}
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
        
        {activeTab === 'telemetry' && (
          <div className="space-y-4">
            <div className={`p-4 rounded ${isDarkMode ? 'bg-[#333333]' : 'bg-gray-100'}`}>
              <h4 className="font-bold mb-3">📊 Telemetry Analysis</h4>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Front Tire Temp (°F)</label>
                  <input
                    type="number"
                    placeholder={`${(() => {
                      const tireType = upgrades.tires;
                      const baseTemp = tuneType === 'Drift' ? 160 : tuneType === 'Rally' ? 140 : tuneType === 'Track' ? 200 : 180;
                      const adjustment = tireType === 'Race' ? 20 : tireType === 'Sport' ? 10 : 0;
                      return `${baseTemp + adjustment}-${baseTemp + adjustment + 20}`;
                    })()} optimal`}
                    className={`w-full p-2 rounded border text-sm ${isDarkMode ? 'bg-[#1a1a1a] text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Rear Tire Temp (°F)</label>
                  <input
                    type="number"
                    placeholder={`${(() => {
                      const tireType = upgrades.tires;
                      const baseTemp = tuneType === 'Drift' ? 140 : tuneType === 'Rally' ? 130 : tuneType === 'Track' ? 190 : 180;
                      const adjustment = tireType === 'Race' ? 20 : tireType === 'Sport' ? 10 : 0;
                      return `${baseTemp + adjustment}-${baseTemp + adjustment + 20}`;
                    })()} optimal`}
                    className={`w-full p-2 rounded border text-sm ${isDarkMode ? 'bg-[#1a1a1a] text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center">
                  <div className="text-xs opacity-75">Lap Time</div>
                  <div className="font-bold text-lg text-blue-400">1:42.156</div>
                </div>
                <div className="text-center">
                  <div className="text-xs opacity-75">Sector 1</div>
                  <div className="font-bold text-green-400">0:28.4</div>
                </div>
                <div className="text-center">
                  <div className="text-xs opacity-75">Top Speed</div>
                  <div className="font-bold text-red-400">187 mph</div>
                </div>
              </div>
              
              <button className="w-full mt-4 py-2 bg-green-500 text-white rounded font-bold">
                📊 Analyze Telemetry Data
              </button>
            </div>
          </div>
        )}
        


      </div>
    </div>
  )
}