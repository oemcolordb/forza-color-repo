'use client'




import React, { useState, useEffect, useRef } from 'react'
import { CarStatsRadarChart } from '../components/CarStatsRadarChart'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import { getCountryFlag, formatPrice } from '@/lib/utils/countryFlags'
import TokyoBackground from '@/components/backgrounds/TokyoBackground'
import { getSecureAssetUrl } from '@/lib/utils/assetProtection'

import { TuningCalculator, TRACKS } from '@/lib/utils/tuning-calculator'
import { Car as BaseCar } from '@/types/car'

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
  tags?: string[]
}

interface TuneData {
  [key: string]: number
}

interface SavedTune {
  id: string
  name: string
  carFullName: string
  carData: Car
  tune: TuneData
  timestamp: number
  version: string
}

interface CommunityTune {
  id: string
  car_make: string
  car_model: string
  tune_name: string
  tuner_name: string
  share_code: string | null
  discipline: string
  pi_class: string | null
  pi_value: number | null
  tune_data: string
  votes: number
  created_at: string
}

import ClientOnly from '@/components/system/ClientOnly'



export default function TuneforgePage() {
  return <ClientOnly>
        <TuneforgePageInner />
      </ClientOnly>
}

function TuneforgePageInner() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [cars, setCars] = useState<Car[]>([])
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('quick')
  const [tuneData, setTuneData] = useState<TuneData>({})
  const [savedTunes, setSavedTunes] = useState<SavedTune[]>([])
  const [sortBy, setSortBy] = useState('manufacturer-az')
  const [aiQuery, setAiQuery] = useState('')
  const [_aiResponse, setAiResponse] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiMessages, setAiMessages] = useState<{role: 'user'|'assistant'; content: string}[]>([])

  const [selectedTrack, setSelectedTrack] = useState('')
  const [drivingStyle, setDrivingStyle] = useState<'smooth' | 'balanced' | 'aggressive' | 'drift'>('balanced')
  const [weatherCondition, setWeatherCondition] = useState('dry')
  const [trackSurface, setTrackSurface] = useState('tarmac')
  const [lapTimeTarget, setLapTimeTarget] = useState('')
  const [, _setActivePreset] = useState('')
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationProgress, setCalculationProgress] = useState(0)
  const [loadingStatus, setLoadingStatus] = useState('Initializing...')
  const [unitSystem, setUnitSystem] = useState('Imperial')
  const [carWeight, setCarWeight] = useState(3200)
  const [frontDistribution, setFrontDistribution] = useState(52)
  const [drivetrain, setDrivetrain] = useState<'AWD'|'RWD'|'FWD'>('RWD')
  const [tuneType, setTuneType] = useState('Grip/Race')
  const [gearCount, setGearCount] = useState(6)
  const [hpOverride, setHpOverride] = useState<number | null>(null)
  const [upgrades, setUpgrades] = useState<Record<string, string>>({})
  const [handlingBalance, setHandlingBalance] = useState(0)
  const [bumpStiffness, setBumpStiffness] = useState(65)
  const [springFrequency, setSpringFrequency] = useState(1.5)
  const [rollStiffness, setRollStiffness] = useState(0)
  const [springUnit, setSpringUnit] = useState('lbf/in')
  const [showChecklist, setShowChecklist] = useState(false)
  const [advancedCategory, setAdvancedCategory] = useState('')
  const [savedTuneSearch, setSavedTuneSearch] = useState('')
  const [fixItCorner, setFixItCorner] = useState('')
  const [fixItProblem, setFixItProblem] = useState('')
  const [fixAppliedIndex, setFixAppliedIndex] = useState<number | null>(null)
  const [simpleMode, setSimpleMode] = useState(true)
  const [gameVersion, setGameVersion] = useState<'FH5' | 'FH6'>('FH6')
  const tuneResultsRef = useRef<HTMLDivElement>(null)

  // Community tunes
  const [communityTunes, setCommunityTunes] = useState<CommunityTune[]>([])
  const [communityLoading, setCommunityLoading] = useState(false)
  const [selectedCommunityId, setSelectedCommunityId] = useState('')
  const [showTuneSubmit, setShowTuneSubmit] = useState(false)
  const [submitCode, setSubmitCode] = useState('')
  const [submitTuner, setSubmitTuner] = useState('')
  const [submitDiscipline, setSubmitDiscipline] = useState('General')
  const [submitTuneName, setSubmitTuneName] = useState('')
  const [submitFeedback, setSubmitFeedback] = useState<{message: string, isError: boolean} | null>(null)
  const [guideSubTab, setGuideSubTab] = useState<'tuning' | 'painting'>('tuning')

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved) setIsDarkMode(saved === 'dark')
    loadSampleCars()
    loadSavedTunes()

  }, [])

  // Auto-populate input fields from selected car
  useEffect(() => {
    if (!selectedCar) return
    // Weight: cars.json stores kg — display in the active unit system
    if (selectedCar.weight) {
      setCarWeight(unitSystem === 'Imperial' ? Math.round(selectedCar.weight * 2.205) : selectedCar.weight)
    }
    // Front weight distribution: derive from drivetrain heuristic
    if (selectedCar.drivetrain === 'FWD') setFrontDistribution(62)
    else if (selectedCar.drivetrain === 'AWD') setFrontDistribution(55)
    else setFrontDistribution(52) // RWD
    setDrivetrain((selectedCar.drivetrain as 'AWD'|'RWD'|'FWD') ?? 'RWD')
    // Gear count: estimate from PI class
    const gByClass: Record<string, number> = { D: 4, C: 5, B: 5, A: 6, S1: 6, S2: 7, X: 8 }
    const g = gByClass[selectedCar.pi.class] ?? 6
    setGearCount(g)
    // Clear HP override so it doesn't carry over to the new car
    setHpOverride(null)

  }, [selectedCar])

  // Fetch community tunes whenever selected car changes
  useEffect(() => {
    if (!selectedCar) { setCommunityTunes([]); return }
    setCommunityLoading(true)
    setSelectedCommunityId('')
    setShowTuneSubmit(false)
    setSubmitCode('')
    setSubmitTuner('')
    setSubmitTuneName('')
    setSubmitFeedback(null)
    fetch(`/api/tuneforge/community-tunes?make=${encodeURIComponent(selectedCar.manufacturer)}&model=${encodeURIComponent(selectedCar.model)}`)
      .then(r => r.json())
      .then(data => setCommunityTunes(Array.isArray(data) ? data : []))
      .catch(() => setCommunityTunes([]))
      .finally(() => setCommunityLoading(false))
  }, [selectedCar])

  const loadSampleCars = async () => {
    setLoadingStatus('Loading car database...')

    try {
      setLoadingStatus('Fetching cars with community tunes...')
      const res = await fetch('/api/tuneforge/cars')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const allCars: BaseCar[] = await res.json()

      if (!allCars || allCars.length === 0) {
        throw new Error('No car data available')
      }

      setLoadingStatus('Processing car data...')
      const processedCars = allCars.map((car: BaseCar) => ({
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
        drivetrain: estimateDrivetrain(car.type, car.stats),
        weight: estimateWeight(car.type, car.pi.class),
        engine: estimateEngine(car.pi.value, car.stats.acceleration),
        tags: [car.country, car.type],
      }))

      setCars(processedCars)
      setSelectedCar(processedCars[0])
      setLoadingStatus(`${processedCars.length} cars loaded`)
    } catch (error) {
      console.error('TuneForge: Failed to load car database:', error)
      setLoadingStatus('Loading fallback cars...')
      loadFallbackCars()
    }
  }

  // Deterministic weight estimate from car type + PI class.
  // cars.json does not include real weight — these are Forza-plausible baselines,
  // not real-world kerb weights.
  const estimateWeight = (type: string, piClass: string): number => {
    const typeBase: Record<string, number> = {
      'Hypercar':    1100,
      'Track Car':   1050,
      'Sports Car':  1300,
      'Supercar':    1350,
      'Coupe':       1400,
      'Convertible': 1450,
      'Classic':     1500,
      'Rally Car':   1350,
      'Sedan':       1600,
      'Wagon':       1650,
      'SUV':         2050,
      'Truck':       2300,
    }
    const piAdj: Record<string, number> = {
      X: -250, S2: -200, S1: -150, A: -50, B: 0, C: 50, D: 100,
    }
    return (typeBase[type] ?? 1450) + (piAdj[piClass] ?? 0)
  }

  // Drivetrain estimate from car type + launch stat.
  // Strong launch (>= 8) without high handling stat strongly correlates with AWD.
  // Most classics and rear-engined sports cars in FH5 are RWD.
  // FWD is rare in this dataset (mostly hatchbacks/saloons).
  const estimateDrivetrain = (type: string, stats: BaseCar['stats']): string => {
    if (type === 'Rally Car' || type === 'SUV' || type === 'Truck') return 'AWD'
    if (stats.launch >= 8.0) return 'AWD'
    if (type === 'Classic' || type === 'Track Car') return 'RWD'
    if (type === 'Sports Car' || type === 'Supercar' || type === 'Hypercar') {
      return stats.handling >= 8.5 ? 'RWD' : 'AWD'
    }
    if (type === 'Sedan' || type === 'Wagon') return 'FWD'
    return 'RWD'
  }

  // Power estimate from PI value + acceleration stat.
  // In Forza's internal model, PI encodes power-to-weight holistically.
  // This gives a plausible horsepower figure — not a datasheet value.
  const estimateEngine = (piValue: number, accelStat: number) => {
    const horsepower = Math.round((piValue - 400) * 1.8 + accelStat * 18)
    const aspirated = piValue < 700
    // Displacement + cylinder count: rough proxy from power range
    const displacement = aspirated
      ? Math.round((2.4 + (horsepower / 400)) * 10) / 10
      : Math.round((1.8 + (horsepower / 600)) * 10) / 10
    const cylinders = horsepower < 300 ? 4 : horsepower < 500 ? 6 : horsepower < 700 ? 8 : 10
    return {
      displacement,
      cylinders,
      aspiration: aspirated ? 'NA' : 'Turbo',
      horsepower: Math.max(150, horsepower),
    }
  }

  const calculateOptimalUpgrades = () => {
    if (!selectedCar) return upgrades

    const weight = selectedCar.weight || carWeight
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
        stats: {
          speed: 9.2,
          handling: 8.5,
          acceleration: 9.0,
          launch: 8.8,
          braking: 8.7,
          offroad: 4.2,
        },
        pi: { class: 'S2', value: 998 },
        drivetrain: 'AWD',
        weight: 1640,
        engine: { displacement: 3.8, cylinders: 6, aspiration: 'Turbo', horsepower: 640 },
        tags: ['German', 'Turbo', 'AWD'],
      },
    ]
    setCars(carData)
    setSelectedCar(carData[0])
    setLoadingStatus('Using limited fallback data (1 car)')
  }

  const loadSavedTunes = () => {
    const saved = localStorage.getItem('forzaSavedTunes')
    if (saved) {
      try {
        setSavedTunes(JSON.parse(saved))
      } catch {
        setSavedTunes([])
      }
    }
  }

  const filteredCars = React.useMemo(() => {
    return cars
      .filter(car => {
        const searchLower = searchQuery.toLowerCase()
        return (
          !searchQuery ||
          car.fullName?.toLowerCase().includes(searchLower) ||
          `${car.year} ${car.manufacturer} ${car.model}`.toLowerCase().includes(searchLower) ||
          car.manufacturer.toLowerCase().includes(searchLower) ||
          car.model.toLowerCase().includes(searchLower)
        )
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'manufacturer-az':
            return a.manufacturer.localeCompare(b.manufacturer)
          case 'manufacturer-za':
            return b.manufacturer.localeCompare(a.manufacturer)
          case 'pi-high':
            return b.pi.value - a.pi.value
          case 'pi-low':
            return a.pi.value - b.pi.value
          case 'year-new':
            return parseInt(b.year) - parseInt(a.year)
          case 'year-old':
            return parseInt(a.year) - parseInt(b.year)
          default:
            return 0
        }
      })
  }, [cars, searchQuery, sortBy])

  // Lazy loading / Pagination state
  const [displayCount, setDisplayCount] = useState(50)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Reset display count when search or sort changes
  useEffect(() => {
    setDisplayCount(50)
  }, [searchQuery, sortBy])

  // Intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setDisplayCount(prev => prev + 50)
        }
      },
      { root: null, rootMargin: '200px', threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [])

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

      // Convert to kg for calculator — carWeight is tracked in the active unit system
      const weightKg = unitSystem === 'Imperial' ? Math.round(carWeight / 2.205) : carWeight

      // Apply HP override if set (post-upgrade engine)
      const carWithOverride = {
        ...(hpOverride !== null && hpOverride !== undefined ? { ...selectedCar, engine: { ...(selectedCar.engine ?? {}), horsepower: hpOverride } } : selectedCar),
        drivetrain,
      }

      const calculator = new TuningCalculator(carWithOverride, {
        weight: weightKg,
        frontWeight: frontDistribution / 100,
        gearCount: gearCount,
        handlingBalance: handlingBalance,
        bumpStiffness: bumpStiffness,
        springFrequency: springFrequency,
        gameVersion: gameVersion,
      })
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

      // Apply roll stiffness bias (separate from spring frequency — rear vs front ARB balance)
      if (rollStiffness !== 0) {
        const arbAdj = rollStiffness * 3  // ±3 lb/in per step
        tune = {
          ...tune,
          'anti-roll-bar-front': Math.max(1, Math.min(65, Math.round((tune['anti-roll-bar-front'] || 25) + arbAdj))),
          'anti-roll-bar-rear': Math.max(1, Math.min(65, Math.round((tune['anti-roll-bar-rear'] || 30) - arbAdj))),
        }
      }

      setLoadingStatus('Finalizing tune...')
      await new Promise(resolve => setTimeout(resolve, 200))
      setCalculationProgress(100)

      setTuneData(tune)
      // Stay on Quick tab — scroll down to results instead of jarring tab switch
      setTimeout(() => {
        tuneResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 200)
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
      case 'sand':
        // Sand: flotation critical — very low pressure, maximum ride height [2]
        adjustments['tire-pressure-front'] = 16
        adjustments['tire-pressure-rear'] = 14
        adjustments['ride-height-front'] = 10.5
        adjustments['ride-height-rear'] = 11.0
        adjustments['spring-rate-front'] = 55
        adjustments['spring-rate-rear'] = 50
        adjustments['camber-front'] = -0.3
        adjustments['camber-rear'] = -0.3
        adjustments['anti-roll-bar-front'] = Math.max(1, (baseTune['anti-roll-bar-front'] || 25) - 12)
        adjustments['anti-roll-bar-rear'] = Math.max(1, (baseTune['anti-roll-bar-rear'] || 30) - 12)
        break
      case 'mud':
        // Mud: slightly higher pressures than sand to push through, more aggressive diff [2]
        adjustments['tire-pressure-front'] = 20
        adjustments['tire-pressure-rear'] = 18
        adjustments['ride-height-front'] = 9.5
        adjustments['ride-height-rear'] = 10.0
        adjustments['spring-rate-front'] = 65
        adjustments['spring-rate-rear'] = 60
        adjustments['camber-front'] = -1.0
        adjustments['camber-rear'] = -0.8
        adjustments['differential-rear-accel'] = Math.min(75, (baseTune['differential-rear-accel'] || 40) + 20)
        adjustments['anti-roll-bar-front'] = Math.max(1, (baseTune['anti-roll-bar-front'] || 25) - 8)
        adjustments['anti-roll-bar-rear'] = Math.max(1, (baseTune['anti-roll-bar-rear'] || 30) - 8)
        break
    }

    return adjustments
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
      version: '1.0',
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
          tune_data: JSON.stringify(tuneData),
        }),
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
      app: 'Forza TuneForge',
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
    reader.onload = e => {
      try {
        const importedData = JSON.parse(e.target?.result as string)
        if (importedData.tune) {
          setTuneData(importedData.tune)
          setActiveTab('advanced')
          alert(`Tune "${importedData.tuneName}" imported successfully!`)
        }
      } catch {
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
      tune: tuneData,
    }

    const shareText = `Check out my Forza tune for ${shareData.car}!\n\nTune Settings:\n${Object.entries(
      tuneData
    )
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')}\n\nCreated with Forza TuneForge — Tune Build & Sharing Platform`

    if (navigator.share) {
      navigator.share({
        title: `Forza Tune - ${shareData.car}`,
        text: shareText,
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

  const loadTune = (tune: SavedTune) => {
    setTuneData(tune.tune)
    setActiveTab('advanced')
    alert(`Loaded tune "${tune.name}"`)
  }

  const applyCommunityTune = (tune: CommunityTune) => {
    try {
      const parsed = JSON.parse(tune.tune_data)
      setTuneData(parsed)
      setActiveTab('advanced')
    } catch {
      alert('Failed to load tune data')
    }
  }

  const submitCommunityTune = async () => {
    if (!selectedCar || !submitTuneName.trim()) return
    const id = `ct-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const payload = {
      id,
      car_make:   selectedCar.manufacturer,
      car_model:  selectedCar.model,
      tune_name:  submitTuneName.trim(),
      tuner_name: submitTuner.trim() || 'Anonymous',
      share_code: submitCode.trim() || null,
      discipline: submitDiscipline,
      pi_class:   selectedCar.pi?.class ?? null,
      pi_value:   selectedCar.pi?.value ?? null,
      tune_data:  JSON.stringify(tuneData),
    }
    const res = await fetch('/api/tuneforge/community-tunes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setCommunityTunes(prev => [{ ...payload, votes: 0, created_at: new Date().toISOString(), share_code: payload.share_code } as CommunityTune, ...prev])
      setShowTuneSubmit(false)
      setSubmitCode('')
      setSubmitTuner('')
      setSubmitTuneName('')
      setSubmitDiscipline('General')
      setSubmitFeedback(null)
    } else {
      setSubmitFeedback({ message: 'Failed to submit tune. Please try again.', isError: true })
    }
  }

  const updateTuneValue = (key: string, value: number) => {
    setTuneData({ ...tuneData, [key]: value })
  }

  // Spring rate unit conversion helpers (internal values always in lbf/in)
  const displaySpringRate = (lbfIn: number) => {
    if (springUnit === 'N/mm') return parseFloat((lbfIn * 0.17513).toFixed(2))
    if (springUnit === 'kgf/mm') return parseFloat((lbfIn * 0.01786).toFixed(3))
    return lbfIn
  }
  const parseSpringRate = (displayed: number) => {
    if (springUnit === 'N/mm') return Math.round(displayed / 0.17513)
    if (springUnit === 'kgf/mm') return Math.round(displayed / 0.01786)
    return Math.round(displayed)
  }
  const springUnitLabel = springUnit === 'lbf/in' ? ' lb/in' : springUnit === 'N/mm' ? ' N/mm' : ' kgf/mm'

  const _getTireCompoundName = (value: number) => {
    const compounds = ['', 'Vintage', 'Stock', 'Street', 'Sport', 'Semi-Slick', 'Slick', 'Rally']
    return compounds[value] || 'Unknown'
  }

  const getAITuningAdvice = async () => {
    if (!aiQuery.trim() || !selectedCar) return

    const userMsg = aiQuery.trim()
    setAiMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setAiQuery('')
    setAiLoading(true)

    try {
      const res = await fetch('/api/tuneforge/ai-tune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userGoal: userMsg,
          carInfo: `${selectedCar.year} ${selectedCar.manufacturer} ${selectedCar.model}`,
          drivetrain: selectedCar.drivetrain,
          weight: selectedCar.weight,
          power: selectedCar.engine?.horsepower,
          piClass: selectedCar.pi.class,
          piValue: selectedCar.pi.value,
          currentTune: Object.keys(tuneData).length > 0 ? tuneData : undefined,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errData.error || `Service error (${res.status})`)
      }

      const data = await res.json()
      const reply: string = data.response || 'No response received.'
      setAiMessages(prev => [...prev, { role: 'assistant', content: reply }])
      setAiResponse(reply)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'AI tuning advice temporarily unavailable.'
      setAiMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${message}` }])
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div
      className={`min-h-screen relative ${isDarkMode ? 'text-white' : 'text-black'}`}
    >
      <TokyoBackground isDarkMode={isDarkMode} getSecureAssetUrl={getSecureAssetUrl} />
      <div className="absolute inset-0 bg-black/60 pointer-events-none z-0"></div>
      <header
        className={`relative z-10 flex flex-col gap-3 p-4 backdrop-blur-sm border-b sm:flex-row sm:items-center sm:justify-between ${
          isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'
        }`}
      >
        <div>
          <h1 className="text-2xl font-bold">🏎️ Forza TuneForge</h1>
          <p className="text-xs opacity-75">Tune Build &amp; Sharing Platform</p>
        </div>
        <div className="flex w-full gap-3 sm:w-auto sm:gap-4 sm:justify-end">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-2xl p-2 rounded bamboo-button-ghost">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <a href="/" className="px-4 py-2 bamboo-button rounded text-center">
            ← Back to Colors
          </a>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="outline-none">
        <div className="relative z-10">
        <Breadcrumbs isDarkMode={isDarkMode} />
      </div>

      <div
        className={`relative z-10 flex flex-col p-4 gap-4 backdrop-blur-sm sm:flex-row ${
          isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'
        }`}
      >
        <input
          type="text"
          placeholder="Search cars..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full flex-1 bamboo-input"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          aria-label="Sort cars by"
          className="w-full p-2 bamboo-input sm:w-auto"
        >
          <option value="manufacturer-az">Manufacturer A-Z</option>
          <option value="manufacturer-za">Manufacturer Z-A</option>
          <option value="pi-high">PI High-Low</option>
          <option value="pi-low">PI Low-High</option>
          <option value="year-new">Year New-Old</option>
          <option value="year-old">Year Old-New</option>
        </select>
      </div>

      <div className="relative z-10 grid gap-0 lg:grid-cols-2 min-h-[calc(100vh-220px)] lg:h-[calc(100vh-220px)]">
        <div
          className={`overflow-y-auto backdrop-blur-sm lg:border-r ${selectedCar ? 'hidden lg:block' : ''} ${
            isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'
          }`}
        >
          <ul className="list-none">
            {filteredCars.slice(0, displayCount).map((car, index) => (
              <li
                key={index}
                onClick={() => setSelectedCar(car)}
                className={`p-4 border-b cursor-pointer transition-colors ${
                  selectedCar === car ? 'bamboo-button text-white' : 'hover:opacity-90'
                } ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
              >
                <div className="font-bold mb-2 flex items-center gap-2">
                  <span className="font-emoji">{getCountryFlag(car.country)}</span>
                  <span>
                    {car.year} {car.manufacturer} {car.model}
                  </span>
                </div>
                <div className="flex gap-4 text-sm opacity-80">
                  <span>
                    PI: {car.pi.class} {car.pi.value}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      car.rarity === 'Legendary'
                        ? 'bg-yellow-500 text-black'
                        : car.rarity === 'Epic'
                          ? 'bg-purple-500 text-white'
                          : car.rarity === 'Rare'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-500 text-white'
                    }`}
                  >
                    {car.rarity}
                  </span>
                  <span>{formatPrice(car.price)}</span>
                </div>
              </li>
            ))}
          </ul>

          {displayCount < filteredCars.length && (
            <div ref={loadMoreRef} className="p-4 text-center text-sm opacity-50">
              Loading more cars...
            </div>
          )}
        </div>

        <div
          className={`p-4 overflow-y-auto backdrop-blur-sm ${!selectedCar ? 'hidden lg:block' : ''} ${
            isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'
          }`}
        >
          {selectedCar ? (
            <div className="space-y-4">
              <div>
                <button 
                  onClick={() => setSelectedCar(null)}
                  className="mb-4 text-sm bamboo-button px-3 py-1 rounded lg:hidden"
                >
                  ← Back to List
                </button>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span className="font-emoji">{getCountryFlag(selectedCar.country)}</span>
                  <span>
                    {selectedCar.year} {selectedCar.manufacturer} {selectedCar.model}
                  </span>
                </h3>
                <p className="text-sm opacity-75 flex items-center gap-2">
                  <span>{selectedCar.type}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-emoji">
                    {getCountryFlag(selectedCar.country)} {selectedCar.country}
                  </span>
                  <span>•</span>
                  <span>{formatPrice(selectedCar.price)}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm opacity-75">PI Class</div>
                  <div className="font-semibold">
                    {selectedCar.pi.class} {selectedCar.pi.value}
                  </div>
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
                  <CarStatsRadarChart
                    stats={selectedCar.stats}
                    size={180}
                    isDarkMode={isDarkMode}
                  />
                </div>
              </div>

              {/* ── Community Tunes ── */}
              <div className={`mt-4 p-3 rounded border ${isDarkMode ? 'bamboo-surface-dark border-yellow-600/30' : 'bamboo-surface border-yellow-500/30'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-yellow-400">🎮 Community Tunes</h4>
                  <button
                    onClick={() => setShowTuneSubmit(s => !s)}
                    className="text-xs bamboo-button-ghost px-2 py-0.5 rounded"
                  >
                    {showTuneSubmit ? 'Cancel' : '+ Share mine'}
                  </button>
                </div>

                {communityLoading ? (
                  <p className="text-xs opacity-60">Loading tunes…</p>
                ) : communityTunes.length === 0 ? (
                  <p className="text-xs opacity-50">No community tunes yet for this car.</p>
                ) : (
                  <div className="space-y-1">
                    <select
                      value={selectedCommunityId}
                      onChange={e => setSelectedCommunityId(e.target.value)}
                      className="w-full text-xs bamboo-input rounded px-2 py-1"
                    >
                      <option value="">— Browse {communityTunes.length} tune{communityTunes.length !== 1 ? 's' : ''} —</option>
                      {communityTunes.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.tune_name} by {t.tuner_name} [{t.discipline}] {t.share_code ? `· ${t.share_code}` : ''} ▲{t.votes}
                        </option>
                      ))}
                    </select>
                    {selectedCommunityId && (() => {
                      const t = communityTunes.find(x => x.id === selectedCommunityId)
                      if (!t) return null
                      return (
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => applyCommunityTune(t)}
                            className="flex-1 text-xs bamboo-button rounded px-2 py-1"
                          >
                            Apply tune
                          </button>
                          {t.share_code && (
                            <button
                              onClick={() => { navigator.clipboard.writeText(t.share_code!); }}
                              className="text-xs bamboo-button-ghost border border-yellow-600/40 rounded px-2 py-1"
                              title="Copy share code"
                            >
                              📋 {t.share_code}
                            </button>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}

                {showTuneSubmit && (
                  <div className="mt-3 space-y-2 border-t border-yellow-600/20 pt-3">
                    {submitFeedback && (
                      <div className={`text-xs p-2 rounded ${submitFeedback.isError ? 'bg-red-500/20 text-red-200 border border-red-500/30' : 'bg-green-500/20 text-green-200 border border-green-500/30'}`}>
                        {submitFeedback.message}
                      </div>
                    )}
                    <input
                      placeholder="Tune name *"
                      value={submitTuneName}
                      onChange={e => setSubmitTuneName(e.target.value)}
                      className="w-full text-xs bamboo-input rounded px-2 py-1"
                    />
                    <input
                      placeholder="Your name (optional)"
                      value={submitTuner}
                      onChange={e => setSubmitTuner(e.target.value)}
                      className="w-full text-xs bamboo-input rounded px-2 py-1"
                    />
                    <input
                      placeholder="Share code (9 digits, optional)"
                      value={submitCode}
                      onChange={e => setSubmitCode(e.target.value.replace(/\D/g, '').slice(0, 9))}
                      className="w-full text-xs bamboo-input rounded px-2 py-1"
                      maxLength={9}
                    />
                    <select
                      value={submitDiscipline}
                      onChange={e => setSubmitDiscipline(e.target.value)}
                      className="w-full text-xs bamboo-input rounded px-2 py-1"
                    >
                      {['General','Track','Drift','Rally','Drag','Cross-Country','Road'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <button
                      onClick={submitCommunityTune}
                      disabled={!submitTuneName.trim()}
                      className="w-full text-xs bamboo-button rounded px-2 py-1 disabled:opacity-40"
                    >
                      Submit tune
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center opacity-75 space-y-4">
              <div>
                <p className="text-lg mb-2">🏎️ Select a car to start tuning</p>
                <div className="space-y-1">
                  <p
                    className={`text-xs ${
                      loadingStatus.includes('✅')
                        ? 'text-green-500'
                        : loadingStatus.includes('⚠️')
                          ? 'text-yellow-500'
                          : 'text-blue-500'
                    }`}
                  >
                    {loadingStatus || `✅ ${cars.length} cars loaded successfully`}
                  </p>
                  {cars.length > 0 && (
                    <p className="text-xs text-gray-400">
                      🚗 {cars.length} vehicles • 🏭 {new Set(cars.map(c => c.manufacturer)).size}{' '}
                      manufacturers
                    </p>
                  )}
                </div>
              </div>

              <div className={`p-4 rounded ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
                <h4 className="font-bold mb-2">🎯 TuneForge Smart Calculator:</h4>
                <div className="text-sm space-y-1 text-left">
                  <div>
                    • 🧮 <span className="text-green-400">Smart calculation engine</span> - Analyzes
                    car parameters
                  </div>
                  <div>
                    • 🏁 <span className="text-[color:var(--bamboo-stalk)]">Track-specific optimization</span> -{' '}
                    {Object.keys(TRACKS).length} track types
                  </div>
                  <div>
                    • 🎨 <span className="text-purple-400">Driving style adaptation</span> -
                    Personalized setups
                  </div>
                  <div>
                    • 🌦️ <span className="text-cyan-400">Weather & surface tuning</span> -
                    Condition-aware
                  </div>
                  <div>
                    • 🤖 <span className="text-yellow-400">AI expert advice</span> - Professional
                    guidance
                  </div>
                  <div>
                    • 💾 <span className="text-pink-400">Save & share system</span> - Community
                    tunes
                  </div>
                </div>

                {isCalculating && (
                  <div className="mt-3 p-2 rounded border bamboo-surface-dark">
                    <div className="text-xs font-medium text-[color:var(--bamboo-stalk)]">
                      🔄 Smart Calculator Active
                    </div>
                    <div className="text-xs text-white/80 mt-1">{loadingStatus}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className={`relative z-10 p-4 backdrop-blur-sm ${
          isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'
        }`}
      >
        <div className={`flex border-b mb-4 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
          {[
            { id: 'quick', label: '⚡ Quick', desc: 'Base Tune' },
            { id: 'advanced', label: '🔧 Advanced', desc: 'Fine Tune' },
            { id: 'fixit', label: '🩺 Fix It', desc: 'Problem Solver' },
            { id: 'ai', label: '🤖 AI', desc: 'Expert Advice' },
            { id: 'telemetry', label: '📊 Telemetry', desc: 'Live Data' },
            { id: 'guide', label: '📖 Guide', desc: 'FH5 Tips' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2 py-3 flex-1 text-center ${
                activeTab === tab.id ? 'bamboo-button' : 'bamboo-button-ghost'
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
              {/* ── Simple / Advanced mode toggle ── */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold opacity-50">Setup — {simpleMode ? 'essential controls' : 'all controls'}</span>
                <div className="flex text-xs rounded overflow-hidden border border-[color:var(--bamboo-stalk)]/30">
                  <button onClick={() => setSimpleMode(true)} className={`px-3 py-1 font-medium transition-all ${simpleMode ? 'bamboo-button' : 'bamboo-button-ghost opacity-60'}`}>⚡ Simple</button>
                  <button onClick={() => setSimpleMode(false)} className={`px-3 py-1 font-medium transition-all ${!simpleMode ? 'bamboo-button' : 'bamboo-button-ghost opacity-60'}`}>🔧 Advanced</button>
                </div>
              </div>

              {!simpleMode && (
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={unitSystem}
                  onChange={e => setUnitSystem(e.target.value)}
                  aria-label="Unit system"
                  className="p-2 bamboo-input text-sm"
                >
                  <option value="Imperial">Imperial (lbs)</option>
                  <option value="Metric">Metric (kg)</option>
                </select>
                <input
                  type="number"
                  placeholder={`Weight (${unitSystem === 'Imperial' ? 'lbs' : 'kg'})`}
                  value={carWeight}
                  onChange={e => setCarWeight(Number(e.target.value))}
                  className="p-2 bamboo-input text-sm"
                />
              </div>
              )}

              {!simpleMode && selectedCar && (() => {
                const carWeightLbs = unitSystem === 'Imperial'
                  ? Math.round((selectedCar.weight ?? 1500) * 2.205)
                  : (selectedCar.weight ?? 1500)
                const piVal = selectedCar.pi?.value ?? 700
                const defaultGears = piVal >= 900 ? 7 : piVal >= 700 ? 6 : 5
                const defaultFront = selectedCar.drivetrain === 'FWD' ? 63 : selectedCar.drivetrain === 'AWD' ? 52 : 45
                const weightDiff = Math.abs(carWeight - carWeightLbs) > 50
                const gearDiff = gearCount !== defaultGears
                const frontDiff = Math.abs(frontDistribution - defaultFront) > 3
                if (!weightDiff && !gearDiff && !frontDiff && hpOverride === null) return null
                return (
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {weightDiff && <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">⚠ Weight override (stock: {carWeightLbs} {unitSystem === 'Imperial' ? 'lbs' : 'kg'})</span>}
                    {hpOverride !== null && hpOverride !== undefined && <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">⚠ HP override ({hpOverride} hp, stock: {selectedCar.engine?.horsepower ?? '?'} hp)</span>}
                    {frontDiff && <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">⚠ Front dist override ({frontDistribution}%, typical: {defaultFront}%)</span>}
                    {gearDiff && <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">⚠ Gear override ({gearCount} gears)</span>}
                  </div>
                )
              })()}

              {/* Engine HP override — useful after engine upgrades */}
              {!simpleMode && (
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="number"
                    placeholder={`HP (stock: ${selectedCar?.engine?.horsepower ?? '—'})`}
                    value={hpOverride ?? ''}
                    onChange={e => setHpOverride(e.target.value === '' ? null : Number(e.target.value))}
                    className="p-2 bamboo-input text-sm w-full"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-40 pointer-events-none">HP</span>
                </div>
                {hpOverride !== null && hpOverride !== undefined && (
                  <button
                    onClick={() => setHpOverride(null)}
                    className="py-2 px-3 bamboo-button-ghost rounded text-xs"
                  >
                    ✕ Use stock HP
                  </button>
                )}
                {hpOverride === null && (
                  <div className="py-2 px-3 text-xs opacity-40 flex items-center">
                    Override for upgrades
                  </div>
                )}
              </div>
              )}

              <div className="mb-3">
                <select
                  value={selectedTrack}
                  onChange={e => setSelectedTrack(e.target.value)}
                  className="p-2 bamboo-input w-full text-sm"
                  aria-label="Select Track Type"
                >
                  <option value="">Select Track Type (Optional)</option>
                  {Object.entries(TRACKS).map(([key, track]: [string, any]) => (
                    <option key={key} value={key}>{track.name}</option>
                  ))}
                </select>
              </div>

              {!simpleMode && (
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="Front Dist. (%)"
                  value={frontDistribution}
                  onChange={e => setFrontDistribution(Number(e.target.value))}
                  className="p-2 bamboo-input text-sm"
                />
                <select
                  value={drivetrain}
                  onChange={e => setDrivetrain(e.target.value as 'AWD'|'RWD'|'FWD')}
                  aria-label="Drivetrain type"
                  className="p-2 bamboo-input text-sm"
                >
                  <option value="RWD">RWD</option>
                  <option value="FWD">FWD</option>
                  <option value="AWD">AWD</option>
                </select>
                <input
                  type="number"
                  placeholder="Gears"
                  value={gearCount}
                  onChange={e => setGearCount(Number(e.target.value))}
                  className="p-2 bamboo-input text-sm"
                />
              </div>
              )}

              {/* Estimate Redline — ForzaTune Pro feature */}
              {!simpleMode && selectedCar && (
                <div className={`p-3 rounded text-xs ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm">⚡ Gearing Estimator</div>
                      <div className="opacity-60 mt-0.5">
                        {(() => {
                          const hp = hpOverride ?? selectedCar?.engine?.horsepower ?? 400
                          const weightKg = unitSystem === 'Imperial' ? Math.round(carWeight / 2.205) : carWeight
                          const ptw = hp / weightKg
                          // Optimal redline estimate: higher PTW → higher useful rev range
                          const estRedline = Math.round((5500 + ptw * 800) / 100) * 100
                          const topSpeed = selectedCar.stats?.speed ?? 7
                          // Optimal top gear ratio: lower ratio = higher speed, higher class
                          const optFinalDrive = parseFloat((4.5 - (topSpeed / 10) * 1.8).toFixed(2))
                          return `Est. redline: ~${estRedline.toLocaleString()} RPM  •  Optimal final drive: ~${optFinalDrive}`
                        })()}
                      </div>
                    </div>
                    <div className="text-[color:var(--bamboo-stalk)] font-bold text-lg">
                      {(() => {
                        const hp = hpOverride ?? selectedCar?.engine?.horsepower ?? 400
                        const weightKg = unitSystem === 'Imperial' ? Math.round(carWeight / 2.205) : carWeight
                        return `${(hp / weightKg * 100).toFixed(0)} hp/t`
                      })()}
                    </div>
                  </div>
                </div>
              )}
              {!simpleMode && (
              <div className="grid grid-cols-2 gap-1 text-xs">
                {Object.entries(upgrades).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-1">
                    <span className="text-xs w-16 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <select
                      value={value}
                      onChange={e => setUpgrades({ ...upgrades, [key]: e.target.value })}
                      aria-label={`${key.replace(/([A-Z])/g, ' $1').trim()} upgrade level`}
                      className="flex-1 p-1 rounded text-xs bamboo-input"
                    >
                      <option value="Stock">Stock</option>
                      <option value="Sport">Sport</option>
                      <option value="Race">Race</option>
                    </select>
                  </div>
                ))}
              </div>
              )}

              <div className="text-xs font-semibold opacity-50 mt-1 mb-0.5">🎮 Game Version</div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <select
                  value={gameVersion}
                  onChange={e => setGameVersion(e.target.value as 'FH5' | 'FH6')}
                  aria-label="Game Version"
                  className="p-2 bamboo-input text-sm"
                >
                  <option value="FH5">Forza Horizon 5</option>
                  <option value="FH6">Forza Horizon 6</option>
                </select>
              </div>

              <div className="text-xs font-semibold opacity-50 mt-1 mb-0.5">🏎️ Tune Type &amp; Conditions</div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={tuneType}
                  onChange={e => setTuneType(e.target.value)}
                  aria-label="Tune type"
                  className="p-2 bamboo-input text-sm"
                >
                  <optgroup label="Road">
                    <option value="Basic (General)">🛣️ Basic (General)</option>
                    <option value="Track">🏁 Track / Circuit</option>
                    <option value="Drift">💨 Drift</option>
                    <option value="Drag Racing">🚦 Drag Racing</option>
                  </optgroup>
                  <optgroup label="Open World / Off-road">
                    <option value="Rally">🗺️ Rally</option>
                    <option value="Cross-country">🌄 Cross-country</option>
                    <option value="Off-road">🌍 Off-road</option>
                    <option value="Buggy / Truck">🚛 Buggy / Truck</option>
                  </optgroup>
                  <optgroup label="Conditions">
                    <option value="Snow / Ice">❄️ Snow / Ice</option>
                  </optgroup>
                </select>
                <select
                  value={weatherCondition}
                  onChange={e => setWeatherCondition(e.target.value)}
                  aria-label="Weather condition"
                  className="p-2 bamboo-input text-sm"
                >
                  <option value="dry">☀️ Dry</option>
                  <option value="wet">🌧️ Wet / Rain</option>
                  <option value="mixed">🌤️ Mixed</option>
                  <option value="snow">❄️ Snow</option>
                </select>
              </div>

              {/* Driving Surface Selector — ForzaTune Pro equivalent */}
              <div>
                <div className="text-xs font-semibold opacity-60 mb-1">Driving Surface</div>
                <div className="grid grid-cols-3 gap-1">
                  {([
                    { value: 'tarmac',  label: '🏁 Tarmac',  desc: 'Road / Circuit' },
                    { value: 'dirt',    label: '🌍 Dirt',    desc: 'Loose surface' },
                    { value: 'gravel',  label: '🪨 Gravel',  desc: 'Mixed off-road' },
                    { value: 'snow',    label: '❄️ Snow/Ice', desc: 'Slippery' },
                    { value: 'sand',    label: '🏜️ Sand',    desc: 'Low traction' },
                    { value: 'mud',     label: '🌧️ Mud',     desc: 'Sticky terrain' },
                  ] as const).map(s => (
                    <button
                      key={s.value}
                      onClick={() => setTrackSurface(s.value)}
                      className={`py-1.5 px-1 rounded text-center text-xs transition-all ${
                        trackSurface === s.value ? 'bamboo-button font-bold' : 'bamboo-button-ghost opacity-70'
                      }`}
                    >
                      <div>{s.label}</div>
                      <div className="opacity-50 text-[10px]">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {!simpleMode && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    Handling Balance ({handlingBalance > 0 ? '+' : ''}
                    {handlingBalance})
                  </span>
                  <span className="opacity-60 text-xs">Understeer ← → Oversteer</span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  value={handlingBalance}
                  onChange={e => setHandlingBalance(Number(e.target.value))}
                  aria-label="Handling balance slider"
                  className="w-full"
                />
                <div className="text-xs opacity-50 leading-tight">
                  Shifts aero downforce and ARB bias. Negative = more front grip (understeer safe). Positive = more rear rotation (oversteer tendency).
                </div>

                <div className="flex justify-between text-sm mt-2">
                  <span>Bump Stiffness ({bumpStiffness}%)</span>
                  <span className="opacity-60 text-xs">Soft ← → Stiff</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bumpStiffness}
                  onChange={e => setBumpStiffness(Number(e.target.value))}
                  aria-label="Bump stiffness slider"
                  className="w-full"
                />
                <div className="text-xs opacity-50 leading-tight">
                  Controls compression damping. Lower = absorbs bumps better (rough roads). Higher = less body roll, faster response (smooth tarmac / race tracks).
                </div>

                <div className="flex justify-between text-sm mt-2">
                  <span>Roll Stiffness ({rollStiffness > 0 ? '+' : ''}{rollStiffness})</span>
                  <span className="opacity-60 text-xs">Rear ARB ← → Front ARB</span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="1"
                  value={rollStiffness}
                  onChange={e => setRollStiffness(Number(e.target.value))}
                  aria-label="Roll stiffness bias slider"
                  className="w-full"
                />
                <div className="flex justify-between text-xs opacity-50">
                  <span>Rear bias (oversteer)</span><span>Neutral</span><span>Front bias (understeer)</span>
                </div>
                <div className="text-xs opacity-50 leading-tight">
                  Fine-tunes the ARB split after Handling Balance. Use this for corner-exit balance — rear bias loosens the tail, front bias adds high-speed stability.
                </div>

                <div className="flex justify-between text-sm mt-2">
                  <span>Suspension Feel ({springFrequency.toFixed(1)} Hz)</span>
                  <span className="opacity-60 text-xs">Comfort ← → Track</span>
                </div>
                <input
                  type="range"
                  min="1.2"
                  max="2.2"
                  step="0.1"
                  value={springFrequency}
                  onChange={e => setSpringFrequency(Number(e.target.value))}
                  aria-label="Spring frequency slider"
                  className="w-full"
                />
                <div className="flex justify-between text-xs opacity-50">
                  <span>1.2 Street</span><span>1.5 Sport</span><span>1.7 Rally</span><span>2.0 Track</span><span>2.2 Race</span>
                </div>
                <div className="text-xs opacity-50 leading-tight">
                  Sets spring rate stiffness via natural frequency. 1.2–1.5 Hz = compliant, good for bumpy roads. 1.8–2.2 Hz = firm, best on smooth circuits. Affects front &amp; rear springs.
                </div>
              </div>
              )}

              {/* Driving Style Picker */}
              <div className={`p-3 rounded ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
                <h5 className="font-bold mb-2 text-sm">🎮 Driving Style</h5>
                <div className="grid grid-cols-4 gap-1">
                  {([
                    { key: 'smooth', icon: '🛋️', label: 'Smooth', desc: 'Comfort' },
                    { key: 'balanced', icon: '⚖️', label: 'Balanced', desc: 'Default' },
                    { key: 'aggressive', icon: '🔥', label: 'Aggressive', desc: 'Grip+' },
                    { key: 'drift', icon: '💨', label: 'Drift', desc: 'Slide' },
                  ] as const).map(s => (
                    <button
                      key={s.key}
                      onClick={() => setDrivingStyle(s.key)}
                      className={`py-2 px-1 rounded text-center text-xs transition-all ${
                        drivingStyle === s.key ? 'bamboo-button font-bold' : 'bamboo-button-ghost'
                      }`}
                    >
                      <div className="text-base">{s.icon}</div>
                      <div className="font-semibold">{s.label}</div>
                      <div className="opacity-60">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={calculateBaseTune}
                disabled={!selectedCar || isCalculating}
                className={`w-full py-3 px-4 rounded font-bold transition-all duration-300 bamboo-button disabled:opacity-50 ${
                  isCalculating ? 'animate-pulse' : ''
                }`}
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
                  <div className="w-full rounded-full h-2" style={{ background: 'rgba(205, 187, 151, 0.25)' }}>
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${calculationProgress}%`,
                        background: 'linear-gradient(90deg, var(--bamboo-stalk) 0%, var(--bamboo-moss) 100%)',
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <input
                  type="text"
                  placeholder="🎯 Target lap time (e.g., 1:45.2)"
                  value={lapTimeTarget}
                  onChange={e => setLapTimeTarget(e.target.value)}
                  className="p-2 bamboo-input text-sm w-full"
                />
                <div className="text-[10px] opacity-40 mt-0.5 pl-1">For reference — not yet used in calculation</div>
              </div>
              <button
                onClick={() => {
                  setHandlingBalance(0)
                  setBumpStiffness(65)
                  setSpringFrequency(1.5)
                  setRollStiffness(0)
                  setHpOverride(null)
                  setWeatherCondition('dry')
                  setTrackSurface('tarmac')
                  setDrivingStyle('balanced')
                }}
                disabled={!selectedCar}
                title="Reset all sliders, weather, surface and style back to defaults"
                className="py-2 px-3 bamboo-button-ghost rounded font-bold disabled:opacity-50 text-sm"
              >
                ↺ Reset Sliders
              </button>
            </div>

            {selectedCar && Object.keys(tuneData).length > 0 && (
              <div ref={tuneResultsRef} className={`p-4 rounded border-2 border-[color:var(--bamboo-stalk)] ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-[color:var(--bamboo-stalk)]">📋 Your Tune Results</h4>
                  <button
                    onClick={() => {
                      const lines = Object.entries(
                        ([
                          ['Tires', ['tire-pressure-front', 'tire-pressure-rear']],
                          ['Alignment', ['camber-front', 'camber-rear', 'toe-front', 'toe-rear', 'caster']],
                          ['Suspension', ['ride-height-front', 'ride-height-rear', 'spring-rate-front', 'spring-rate-rear', 'anti-roll-bar-front', 'anti-roll-bar-rear']],
                          ['Damping', ['damping-rebound-front', 'damping-rebound-rear', 'damping-bump-front', 'damping-bump-rear']],
                          ['Gearing', Array.from({length: gearCount}, (_, i) => `gear-${i+1}`).concat(['final-drive'])],
                          ['Aero', ['aero-front', 'aero-rear']],
                          ['Brakes', ['brake-balance', 'brake-pressure']],
                          ['Drivetrain', ['differential-rear-accel', 'differential-rear-decel', 'differential-front-accel', 'differential-front-decel', 'differential-center']],
                        ] as [string, string[]][]).reduce((acc, [cat, keys]) => {
                          const vals = keys.filter(k => tuneData[k] !== null && tuneData[k] !== undefined).map(k => `  ${k}: ${tuneData[k]}`).join('\n')
                          if (vals) acc[cat] = vals
                          return acc
                        }, {} as Record<string, string>)
                      ).map(([cat, vals]) => `── ${cat} ──\n${vals}`).join('\n\n')
                      navigator.clipboard.writeText(`${selectedCar.year} ${selectedCar.manufacturer} ${selectedCar.model} | ${tuneType} | ${drivingStyle}\n\n${lines}`)
                    }}
                    className="text-xs px-3 py-1 bamboo-button rounded"
                  >
                    📋 Copy All
                  </button>
                </div>
                {([
                  ['🛞 Tires', [
                    {k: 'tire-pressure-front', l: 'Front PSI', u: ' PSI'},
                    {k: 'tire-pressure-rear', l: 'Rear PSI', u: ' PSI'},
                  ]],
                  ['📐 Alignment', [
                    {k: 'camber-front', l: 'Camber F', u: '°'},
                    {k: 'camber-rear', l: 'Camber R', u: '°'},
                    {k: 'toe-front', l: 'Toe F', u: '°'},
                    {k: 'toe-rear', l: 'Toe R', u: '°'},
                    {k: 'caster', l: 'Caster', u: '°'},
                  ]],
                  ['🔩 Suspension', [
                    {k: 'ride-height-front', l: 'Height F', u: ' cm'},
                    {k: 'ride-height-rear', l: 'Height R', u: ' cm'},
                    {k: 'spring-rate-front', l: 'Spring F', u: ' lb/in'},
                    {k: 'spring-rate-rear', l: 'Spring R', u: ' lb/in'},
                    {k: 'anti-roll-bar-front', l: 'ARB F', u: ''},
                    {k: 'anti-roll-bar-rear', l: 'ARB R', u: ''},
                  ]],
                  ['〰️ Damping', [
                    {k: 'damping-rebound-front', l: 'Rebound F', u: ''},
                    {k: 'damping-rebound-rear', l: 'Rebound R', u: ''},
                    {k: 'damping-bump-front', l: 'Bump F', u: ''},
                    {k: 'damping-bump-rear', l: 'Bump R', u: ''},
                  ]],
                  ['⚙️ Gearing', [
                    ...Array.from({length: gearCount}, (_, i) => ({k: `gear-${i+1}`, l: `Gear ${i+1}`, u: ''})),
                    {k: 'final-drive', l: 'Final Dr.', u: ''},
                  ]],
                  ['💨 Aero', [
                    {k: 'aero-front', l: 'Front DF', u: ' kg'},
                    {k: 'aero-rear', l: 'Rear DF', u: ' kg'},
                  ]],
                  ['🛑 Brakes', [
                    {k: 'brake-balance', l: 'Balance', u: '%'},
                    {k: 'brake-pressure', l: 'Pressure', u: '%'},
                  ]],
                  ['🔀 Drivetrain', [
                    {k: 'differential-rear-accel', l: 'Rear Accel', u: '%'},
                    {k: 'differential-rear-decel', l: 'Rear Decel', u: '%'},
                    ...(selectedCar.drivetrain === 'AWD' ? [
                      {k: 'differential-front-accel', l: 'Front Accel', u: '%'},
                      {k: 'differential-front-decel', l: 'Front Decel', u: '%'},
                      {k: 'differential-center', l: 'Centre', u: '%'},
                    ] : []),
                  ]],
                ] as [string, {k:string;l:string;u:string}[]][]).map(([cat, fields]) => {
                  const visible = fields.filter(f => tuneData[f.k] !== null && tuneData[f.k] !== undefined)
                  if (!visible.length) return null
                  return (
                    <div key={cat} className="mb-3">
                      <div className="text-xs font-semibold opacity-60 mb-1">{cat}</div>
                      <div className="grid grid-cols-3 gap-1 sm:grid-cols-4">
                        {visible.map(f => (
                          <div key={f.k} className={`p-2 rounded text-center ${isDarkMode ? 'bg-black/30' : 'bg-white/40'}`}>
                            <div className="text-xs opacity-60 truncate">{f.l}</div>
                            <div className="font-bold text-[color:var(--bamboo-stalk)]">
                              {typeof tuneData[f.k] === 'number' ? tuneData[f.k].toFixed(f.u === '°' || f.u === '' ? 1 : 0) : tuneData[f.k]}{f.u}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
                <button
                  onClick={() => {
                    setActiveTab('advanced')
                  }}
                  className="w-full mt-2 py-2 bamboo-button-ghost rounded text-sm"
                >
                  🔧 Fine-tune in Advanced →
                </button>
              </div>
            )}

            {/* Tuning Checklist — ForzaTune Pro built-in wizard equivalent */}
            {selectedCar && Object.keys(tuneData).length > 0 && (
              <div className={`p-3 rounded ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
                <button
                  onClick={() => setShowChecklist(v => !v)}
                  className="w-full flex items-center justify-between text-sm font-bold"
                >
                  <span>📋 Tuning Checklist</span>
                  <span className="opacity-60 text-xs">{showChecklist ? '▲ Hide' : '▼ Show'}</span>
                </button>
                {showChecklist && (
                  <div className="mt-3 space-y-2 text-xs">
                    {([
                      {
                        step: 1, label: 'Set tire pressures',
                        check: !!(tuneData['tire-pressure-front'] && tuneData['tire-pressure-front'] >= 26 && tuneData['tire-pressure-front'] <= 32),
                        tip: `Current: ${tuneData['tire-pressure-front'] ?? '–'} PSI front. Target cold: 26–30 PSI (hot: 32–34 PSI).`,
                      },
                      {
                        step: 2, label: 'Check camber',
                        check: !!(tuneData['camber-front'] && tuneData['camber-front'] <= -0.5 && tuneData['camber-front'] >= -3.5),
                        tip: `Current: ${tuneData['camber-front'] ?? '–'}°. Street: −1.0 to −2.0°. Track: −2.0 to −3.0°.`,
                      },
                      {
                        step: 3, label: 'Verify suspension balance',
                        check: !!(tuneData['anti-roll-bar-front'] && tuneData['anti-roll-bar-rear'] &&
                          Math.abs(tuneData['anti-roll-bar-front'] - tuneData['anti-roll-bar-rear']) <= 25),
                        tip: `ARB F: ${tuneData['anti-roll-bar-front'] ?? '–'} / R: ${tuneData['anti-roll-bar-rear'] ?? '–'}. Large gaps cause one-axle instability.`,
                      },
                      {
                        step: 4, label: 'Differential settings',
                        check: !!(tuneData['differential-rear-accel'] && tuneData['differential-rear-accel'] <= 80),
                        tip: `Rear accel diff: ${tuneData['differential-rear-accel'] ?? '–'}%. Over 80% causes snap oversteer.`,
                      },
                      {
                        step: 5, label: 'Aero balance',
                        check: !!(tuneData['aero-front'] && tuneData['aero-rear'] &&
                          tuneData['aero-rear'] >= tuneData['aero-front']),
                        tip: `Front: ${tuneData['aero-front'] ?? '–'} kg / Rear: ${tuneData['aero-rear'] ?? '–'} kg. Rear should ≥ front for stability.`,
                      },
                      {
                        step: 6, label: 'Gearing complete',
                        check: !!(tuneData['final-drive'] && tuneData['gear-1']),
                        tip: `Final drive: ${tuneData['final-drive'] ?? '–'}. Gear 1: ${tuneData['gear-1'] ?? '–'}. Test top-speed in highest gear.`,
                      },
                      {
                        step: 7, label: 'Test-drive validation',
                        check: false,
                        tip: 'Drive 3 laps: check tire temps 180–220°F, even wear, no snap oversteer under power.',
                      },
                    ]).map(item => (
                      <div key={item.step} className="flex gap-2 items-start">
                        <div className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center text-[10px] mt-0.5 ${
                          item.check ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                        }`}>
                          {item.check ? '✓' : item.step}
                        </div>
                        <div>
                          <div className={`font-semibold ${item.check ? 'opacity-50 line-through' : ''}`}>{item.label}</div>
                          <div className="opacity-60 text-[10px]">{item.tip}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!simpleMode && selectedCar && (
              <div className={`p-4 rounded ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
                <h4 className="font-bold mb-2">🎯 Smart Recommendations:</h4>
                <div className="text-sm space-y-1">
                  {selectedTrack && (
                    <div className="mb-2">
                      <div className="font-semibold text-[color:var(--bamboo-stalk)]">
                        🏁 {(TRACKS as any)[selectedTrack].name}
                      </div>
                      <div className="text-xs opacity-75 mb-1">
                        {(TRACKS as any)[selectedTrack].description}
                      </div>
                      <div>Focus: {(TRACKS as any)[selectedTrack].priority.join(', ')}</div>
                      <div className="text-xs mt-1">
                        Characteristics: {(TRACKS as any)[selectedTrack].characteristics.join(', ')}
                      </div>
                    </div>
                  )}
                  <div>
                    •{' '}
                    <span className="text-cyan-400">
                      PI {selectedCar.pi.class} ({selectedCar.pi.value})
                    </span>{' '}
                    -{' '}
                    {selectedCar.pi.value < 500
                      ? 'Focus on basic handling fundamentals and tire pressure optimization'
                      : selectedCar.pi.value < 600
                        ? 'Emphasize suspension balance and alignment for consistent handling'
                        : selectedCar.pi.value < 700
                          ? 'Balance aerodynamics with mechanical grip for versatile performance'
                          : selectedCar.pi.value < 800
                            ? 'Fine-tune differential and damping for power delivery control'
                            : selectedCar.pi.value < 900
                              ? 'Manage high downforce and aggressive camber for maximum grip'
                              : 'Extreme setup required: maximum aero, stiff suspension, precise alignment'}
                  </div>

                  <div>
                    •{' '}
                    <span className="text-green-400">
                      {selectedCar.drivetrain || 'RWD'} drivetrain
                    </span>{' '}
                    -{' '}
                    {(selectedCar.drivetrain || 'RWD') === 'FWD'
                      ? `Front bias: ${selectedCar.stats.handling > 7 ? 'Use aggressive front camber (-2.5°) and toe-out for turn-in' : 'Moderate front setup to prevent understeer'}`
                      : (selectedCar.drivetrain || 'RWD') === 'AWD'
                        ? `All-wheel control: ${selectedCar.stats.acceleration > 8 ? 'High differential lock (60-80%) for traction' : 'Balanced diff settings (40-60%) for stability'}`
                        : `Rear drive: ${selectedCar.stats.speed > 8 ? 'Lower rear diff accel (30-50%) to prevent wheelspin' : 'Higher rear diff (50-70%) for better launches'}`}
                  </div>

                  <div>
                    •{' '}
                    <span className="text-orange-400">Weight: {selectedCar.weight || 1500}kg</span>{' '}
                    -{' '}
                    {(selectedCar.weight || 1500) < 1200
                      ? 'Lightweight: Softer springs (80-120 lb/in) and lower tire pressures for grip'
                      : (selectedCar.weight || 1500) < 1500
                        ? 'Medium weight: Balanced spring rates (120-180 lb/in) and standard pressures'
                        : (selectedCar.weight || 1500) < 1800
                          ? 'Heavy: Stiffer springs (180-240 lb/in) and higher pressures for support'
                          : 'Very heavy: Maximum spring rates (240+ lb/in) and high tire pressures for stability'}
                  </div>

                  <div>
                    •{' '}
                    <span className="text-red-400">
                      Power: {selectedCar.engine?.horsepower || 400}hp
                    </span>{' '}
                    -{' '}
                    {(selectedCar.engine?.horsepower || 400) < 300
                      ? 'Low power: Focus on mechanical grip and cornering speed'
                      : (selectedCar.engine?.horsepower || 400) < 500
                        ? 'Moderate power: Balance traction and handling with medium diff settings'
                        : (selectedCar.engine?.horsepower || 400) < 700
                          ? 'High power: Careful differential tuning and traction management needed'
                          : 'Extreme power: Maximum traction aids, progressive differential, and stability focus'}
                  </div>

                  <div>
                    •{' '}
                    <span className="text-purple-400">
                      Handling: {selectedCar.stats.handling.toFixed(1)}/10
                    </span>{' '}
                    -{' '}
                    {selectedCar.stats.handling < 5
                      ? 'Low handling: Prioritize stability over agility, softer anti-roll bars'
                      : selectedCar.stats.handling < 7
                        ? 'Average handling: Balanced setup with moderate camber and ARBs'
                        : selectedCar.stats.handling < 9
                          ? 'Good handling: Aggressive alignment and stiffer suspension for precision'
                          : 'Excellent handling: Maximum performance setup with extreme camber and stiff ARBs'}
                  </div>

                  {drivingStyle !== 'balanced' && (
                    <div className="text-yellow-400">
                      •{' '}
                      <span className="font-semibold">
                        {drivingStyle.charAt(0).toUpperCase() + drivingStyle.slice(1)} style
                      </span>{' '}
                      -{' '}
                      {drivingStyle === 'aggressive'
                        ? 'Lower tire pressures (-2 PSI), more negative camber (-0.5°), stiffer ARBs (+5)'
                        : drivingStyle === 'smooth'
                          ? 'Softer springs (-20 lb/in), reduced damping (-2), comfort-focused setup'
                          : drivingStyle === 'drift'
                            ? 'Front: 30 PSI, -3.5° camber. Rear: 22 PSI, -1.2° camber, 5% diff lock'
                            : 'Optimized for selected driving preference'}
                    </div>
                  )}

                  {Object.keys(tuneData).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-500">
                      <div className="text-xs font-semibold text-blue-300 mb-1">
                        Current Calculated Values:
                      </div>
                      <div className="text-xs space-y-0.5">
                        {tuneData['tire-pressure-front'] && (
                          <div>
                            • Tire Pressure: {tuneData['tire-pressure-front']} PSI front,{' '}
                            {tuneData['tire-pressure-rear']} PSI rear
                          </div>
                        )}
                        {tuneData['camber-front'] && (
                          <div>
                            • Camber: {tuneData['camber-front']}° front, {tuneData['camber-rear']}°
                            rear
                          </div>
                        )}
                        {tuneData['final-drive'] && (
                          <div>
                            • Final Drive: {tuneData['final-drive']} (optimized for{' '}
                            {selectedCar.stats.speed > selectedCar.stats.acceleration
                              ? 'top speed'
                              : 'acceleration'}
                            )
                          </div>
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
          <div className="space-y-3">
            {/* Category filter pills */}
            <div className="flex flex-wrap gap-1">
              {['All', 'Tires', 'Alignment', 'Suspension', 'Damping', 'Gearing', 'Brakes', 'Drivetrain', 'Aero', 'Electronics'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setAdvancedCategory(cat)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    advancedCategory === cat ? 'bamboo-button' : 'bamboo-button-ghost opacity-70'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {/* Spring Units toggle — ForzaTune Pro feature */}
            {(advancedCategory === 'All' || advancedCategory === 'Suspension') && (
              <div className="flex items-center gap-2 text-xs">
                <span className="opacity-60">Spring units:</span>
                {(['lbf/in', 'N/mm', 'kgf/mm'] as const).map(u => (
                  <button
                    key={u}
                    onClick={() => setSpringUnit(u)}
                    className={`px-2 py-0.5 rounded text-xs ${
                      springUnit === u ? 'bamboo-button font-bold' : 'bamboo-button-ghost opacity-60'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            )}
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {Object.entries({
              'tire-pressure-front': {
                min: 15,
                max: 50,
                step: 0.5,
                label: 'Tire Pressure Front',
                unit: ' PSI',
                category: 'Tires',
              },
              'tire-pressure-rear': {
                min: 15,
                max: 50,
                step: 0.5,
                label: 'Tire Pressure Rear',
                unit: ' PSI',
                category: 'Tires',
              },
              'camber-front': {
                min: -5,
                max: 0,
                step: 0.1,
                label: 'Camber Front',
                unit: '°',
                category: 'Alignment',
              },
              'camber-rear': {
                min: -5,
                max: 0,
                step: 0.1,
                label: 'Camber Rear',
                unit: '°',
                category: 'Alignment',
              },
              'toe-front': {
                min: -3,
                max: 3,
                step: 0.1,
                label: 'Toe Front',
                unit: '°',
                category: 'Alignment',
              },
              'toe-rear': {
                min: -3,
                max: 3,
                step: 0.1,
                label: 'Toe Rear',
                unit: '°',
                category: 'Alignment',
              },
              caster: {
                min: 4.0,
                max: 7.0,
                step: 0.1,
                label: 'Caster',
                unit: '°',
                category: 'Alignment',
              },
              'anti-roll-bar-front': {
                min: 1,
                max: 65,
                step: 1,
                label: 'Anti-Roll Bar Front',
                unit: '',
                category: 'Suspension',
              },
              'anti-roll-bar-rear': {
                min: 1,
                max: 65,
                step: 1,
                label: 'Anti-Roll Bar Rear',
                unit: '',
                category: 'Suspension',
              },
              'spring-rate-front': {
                min: 50,
                max: 300,
                step: 5,
                label: 'Spring Rate Front',
                unit: springUnitLabel,
                category: 'Suspension',
                isSpring: true,
              },
              'spring-rate-rear': {
                min: 50,
                max: 300,
                step: 5,
                label: 'Spring Rate Rear',
                unit: springUnitLabel,
                category: 'Suspension',
                isSpring: true,
              },
              'ride-height-front': {
                min: 4.0,
                max: 15.0,
                step: 0.1,
                label: 'Ride Height Front',
                unit: ' cm',
                category: 'Suspension',
              },
              'ride-height-rear': {
                min: 4.0,
                max: 15.0,
                step: 0.1,
                label: 'Ride Height Rear',
                unit: ' cm',
                category: 'Suspension',
              },
              'damping-rebound-front': {
                min: 1,
                max: 20,
                step: 0.1,
                label: 'Rebound Front',
                unit: '',
                category: 'Damping',
              },
              'damping-rebound-rear': {
                min: 1,
                max: 20,
                step: 0.1,
                label: 'Rebound Rear',
                unit: '',
                category: 'Damping',
              },
              'damping-bump-front': {
                min: 1,
                max: 20,
                step: 0.1,
                label: 'Bump Front',
                unit: '',
                category: 'Damping',
              },
              'damping-bump-rear': {
                min: 1,
                max: 20,
                step: 0.1,
                label: 'Bump Rear',
                unit: '',
                category: 'Damping',
              },
              'differential-rear-accel': {
                min: 0,
                max: 100,
                step: 1,
                label: 'Diff Rear Accel',
                unit: '%',
                category: 'Drivetrain',
              },
              'differential-rear-decel': {
                min: 0,
                max: 100,
                step: 1,
                label: 'Diff Rear Decel',
                unit: '%',
                category: 'Drivetrain',
              },
              'brake-balance': {
                min: 40,
                max: 60,
                step: 1,
                label: 'Brake Balance',
                unit: '%',
                category: 'Brakes',
              },
              'brake-pressure': {
                min: 80,
                max: 100,
                step: 1,
                label: 'Brake Pressure',
                unit: '%',
                category: 'Brakes',
              },
              // Individual Gear Ratios (FH5 supports up to 10 gears)
              'gear-1': {
                min: 2.0,
                max: 5.5,
                step: 0.01,
                label: '1st Gear',
                unit: '',
                category: 'Gearing',
              },
              'gear-2': {
                min: 1.5,
                max: 3.5,
                step: 0.01,
                label: '2nd Gear',
                unit: '',
                category: 'Gearing',
              },
              'gear-3': {
                min: 1.0,
                max: 2.5,
                step: 0.01,
                label: '3rd Gear',
                unit: '',
                category: 'Gearing',
              },
              'gear-4': {
                min: 0.8,
                max: 2.0,
                step: 0.01,
                label: '4th Gear',
                unit: '',
                category: 'Gearing',
              },
              'gear-5': {
                min: 0.6,
                max: 1.5,
                step: 0.01,
                label: '5th Gear',
                unit: '',
                category: 'Gearing',
              },
              'gear-6': {
                min: 0.5,
                max: 1.2,
                step: 0.01,
                label: '6th Gear',
                unit: '',
                category: 'Gearing',
              },
              'gear-7': {
                min: 0.4,
                max: 1.0,
                step: 0.01,
                label: '7th Gear',
                unit: '',
                category: 'Gearing',
              },
              'gear-8': {
                min: 0.35,
                max: 0.9,
                step: 0.01,
                label: '8th Gear',
                unit: '',
                category: 'Gearing',
              },
              'gear-9': {
                min: 0.3,
                max: 0.8,
                step: 0.01,
                label: '9th Gear',
                unit: '',
                category: 'Gearing',
              },
              'gear-10': {
                min: 0.25,
                max: 0.7,
                step: 0.01,
                label: '10th Gear',
                unit: '',
                category: 'Gearing',
              },
              'final-drive': {
                min: 2.0,
                max: 5.0,
                step: 0.01,
                label: 'Final Drive',
                unit: '',
                category: 'Gearing',
              },

              // AWD/4WD Differentials (missing from original)
              'differential-front-accel': {
                min: 0,
                max: 100,
                step: 1,
                label: 'Diff Front Accel',
                unit: '%',
                category: 'Drivetrain',
              },
              'differential-front-decel': {
                min: 0,
                max: 100,
                step: 1,
                label: 'Diff Front Decel',
                unit: '%',
                category: 'Drivetrain',
              },
              'differential-center': {
                min: 0,
                max: 100,
                step: 1,
                label: 'Center Diff',
                unit: '%',
                category: 'Drivetrain',
              },

              // Tire Compound Selection
              'tire-compound-front': {
                min: 1,
                max: 7,
                step: 1,
                label: 'Front Tire Compound',
                unit: '',
                category: 'Tires',
              },
              'tire-compound-rear': {
                min: 1,
                max: 7,
                step: 1,
                label: 'Rear Tire Compound',
                unit: '',
                category: 'Tires',
              },

              // Tire Width (FH5 specific)
              'tire-width-front': {
                min: 155,
                max: 345,
                step: 5,
                label: 'Front Tire Width',
                unit: 'mm',
                category: 'Tires',
              },
              'tire-width-rear': {
                min: 155,
                max: 345,
                step: 5,
                label: 'Rear Tire Width',
                unit: 'mm',
                category: 'Tires',
              },

              // Stabilizer Bars (more accurate FH5 naming)
              'stabilizer-front': {
                min: 1,
                max: 65,
                step: 1,
                label: 'Front Stabilizer',
                unit: '',
                category: 'Suspension',
              },
              'stabilizer-rear': {
                min: 1,
                max: 65,
                step: 1,
                label: 'Rear Stabilizer',
                unit: '',
                category: 'Suspension',
              },

              // Aerodynamics
              'aero-front': {
                min: 50,
                max: 300,
                step: 5,
                label: 'Front Downforce',
                unit: ' kg',
                category: 'Aero',
              },
              'aero-rear': {
                min: 100,
                max: 400,
                step: 5,
                label: 'Rear Downforce',
                unit: ' kg',
                category: 'Aero',
              },

              // Launch Control (FH5 specific)
              'launch-control': {
                min: 0,
                max: 100,
                step: 1,
                label: 'Launch Control',
                unit: '%',
                category: 'Electronics',
              },

              // Traction Control
              'traction-control': {
                min: 0,
                max: 10,
                step: 1,
                label: 'Traction Control',
                unit: '',
                category: 'Electronics',
              },

              // Stability Control
              'stability-control': {
                min: 0,
                max: 10,
                step: 1,
                label: 'Stability Control',
                unit: '',
                category: 'Electronics',
              },
            }).filter(([key, config]) => {
              if (key.startsWith('gear-')) {
                const gNum = parseInt(key.replace('gear-', ''));
                return gNum <= gearCount && (advancedCategory === 'All' || advancedCategory === 'Gearing');
              }
              const drivetrain = selectedCar?.drivetrain || 'RWD'
              if (['differential-front-accel', 'differential-front-decel', 'differential-center'].includes(key)) {
                if (drivetrain !== 'AWD') return false
              }
              if (advancedCategory !== 'All' && (config as any).category !== advancedCategory) return false
              return true;
            }).map(([key, config]) => (
              <div key={key} className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium">{config.label}</label>
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
                    onChange={e => updateTuneValue(key, parseFloat(e.target.value))}
                    aria-label={config.label}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min={(config as any).isSpring ? displaySpringRate(config.min) : config.min}
                    max={(config as any).isSpring ? displaySpringRate(config.max) : config.max}
                    step={(config as any).isSpring ? (springUnit === 'lbf/in' ? 5 : 0.1) : config.step}
                    value={(config as any).isSpring
                      ? displaySpringRate(tuneData[key] || config.min)
                      : (tuneData[key] || config.min)}
                    onChange={e => {
                      const v = parseFloat(e.target.value)
                      if (!isNaN(v)) {
                        const raw = (config as any).isSpring ? parseSpringRate(v) : v
                        updateTuneValue(key, Math.max(config.min, Math.min(config.max, raw)))
                      }
                    }}
                    aria-label={`${config.label} value`}
                    className="w-20 text-right font-bold p-1 rounded bamboo-input text-sm text-[color:var(--bamboo-stalk)]"
                  />
                  {config.unit && <span className="text-xs opacity-50 shrink-0">{config.unit}</span>}
                </div>
              </div>
            ))}

            {/* Gear Ratio Visual */}
            {Object.keys(tuneData).some(k => k.startsWith('gear-')) && (
              <div className={`p-3 rounded mt-2 ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
                <div className="text-xs font-semibold opacity-60 mb-2">⚙️ Gear Ratio Spread</div>
                <div className="space-y-1">
                  {Array.from({length: gearCount}, (_, i) => {
                    const k = `gear-${i+1}`
                    const val = tuneData[k]
                    if (val === null || val === undefined) return null
                    const maxRatio = tuneData['gear-1'] || 4.0
                    const pct = Math.round((val / maxRatio) * 100)
                    return (
                      <div key={k} className="flex items-center gap-2 text-xs">
                        <span className="w-8 text-right opacity-60">{i+1}</span>
                        <div className="flex-1 rounded-full h-4 overflow-hidden" style={{background: 'rgba(205,187,151,0.15)'}}>
                          <div
                            className="h-4 rounded-full transition-all duration-300"
                            style={{
                              width: `${pct}%`,
                              background: 'linear-gradient(90deg, var(--bamboo-stalk) 0%, var(--bamboo-moss) 100%)',
                            }}
                          />
                        </div>
                        <span className="w-10 font-bold text-[color:var(--bamboo-stalk)]">{val.toFixed(2)}</span>
                      </div>
                    )
                  })}
                  {tuneData['final-drive'] !== null && tuneData['final-drive'] !== undefined && (
                    <div className="flex items-center gap-2 text-xs mt-1 border-t border-white/10 pt-1">
                      <span className="w-8 text-right opacity-60">FD</span>
                      <span className="opacity-60 text-xs flex-1">Final Drive</span>
                      <span className="w-10 font-bold text-[color:var(--bamboo-stalk)]">{tuneData['final-drive'].toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={saveTune}
                disabled={!selectedCar || Object.keys(tuneData).length === 0}
                className="py-3 px-4 bamboo-button rounded font-bold disabled:opacity-50"
              >
                Save Tune
              </button>
              <button
                onClick={exportTune}
                disabled={!selectedCar || Object.keys(tuneData).length === 0}
                className="py-3 px-4 bamboo-button rounded font-bold disabled:opacity-50"
              >
                Export
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={shareTune}
                disabled={!selectedCar || Object.keys(tuneData).length === 0}
                className="py-3 px-4 bamboo-button rounded font-bold disabled:opacity-50"
              >
                Share
              </button>
              <label className="py-3 px-4 bamboo-button rounded font-bold cursor-pointer text-center">
                Import
                <input type="file" accept=".json" onChange={importTune} className="hidden" />
              </label>
            </div>

            {savedTunes.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold">Saved Tunes ({savedTunes.length})</h4>
                  {savedTunes.length > 3 && (
                    <input
                      type="text"
                      placeholder="🔍 Search tunes..."
                      value={savedTuneSearch}
                      onChange={e => setSavedTuneSearch(e.target.value)}
                      className="p-1 text-xs bamboo-input rounded w-36"
                    />
                  )}
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {savedTunes
                    .filter(t =>
                      !savedTuneSearch ||
                      t.name.toLowerCase().includes(savedTuneSearch.toLowerCase()) ||
                      t.carFullName.toLowerCase().includes(savedTuneSearch.toLowerCase())
                    )
                    .map(tune => (
                    <div
                      key={tune.id}
                      className={`p-2 rounded border flex justify-between items-center ${
                        isDarkMode ? 'bamboo-surface-dark border-gray-600' : 'bamboo-surface border-gray-300'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{tune.name}</div>
                        <div className="text-xs opacity-75">{tune.carFullName}</div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => loadTune(tune)}
                          className="px-2 py-1 bamboo-button rounded text-xs"
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

        {activeTab === 'fixit' && (
          <div className="space-y-4">
            <div className={`p-4 rounded ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
              <h4 className="font-bold mb-1">🩺 Problem Solver</h4>
              <p className="text-xs opacity-60 mb-3">Select where in the corner the issue happens and what the car is doing — get targeted fix recommendations.</p>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {([
                  { v: 'entry', label: 'Corner Entry', icon: '↪️' },
                  { v: 'mid', label: 'Mid Corner', icon: '🔄' },
                  { v: 'exit', label: 'Corner Exit', icon: '↩️' },
                ] as const).map(c => (
                  <button
                    key={c.v}
                    onClick={() => setFixItCorner(c.v)}
                    className={`py-2 px-2 rounded text-sm text-center transition-all ${
                      fixItCorner === c.v ? 'bamboo-button font-bold' : 'bamboo-button-ghost'
                    }`}
                  >
                    <div>{c.icon}</div>
                    <div className="text-xs">{c.label}</div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {([
                  { v: 'understeer', label: 'Understeer', icon: '↗️', desc: 'Car pushes wide' },
                  { v: 'oversteer', label: 'Oversteer', icon: '↙️', desc: 'Rear slides out' },
                  { v: 'bounce', label: 'Bouncing', icon: '⬆️', desc: 'Unstable / bouncy' },
                  { v: 'slide', label: 'General Slide', icon: '💨', desc: 'Traction loss' },
                ] as const).map(p => (
                  <button
                    key={p.v}
                    onClick={() => setFixItProblem(p.v)}
                    className={`py-2 px-3 rounded text-left transition-all ${
                      fixItProblem === p.v ? 'bamboo-button font-bold' : 'bamboo-button-ghost'
                    }`}
                  >
                    <span className="mr-1">{p.icon}</span>
                    <span className="text-sm font-semibold">{p.label}</span>
                    <div className="text-xs opacity-60">{p.desc}</div>
                  </button>
                ))}
              </div>

              {/* Fix recommendations */}
              {(() => {
                type FixKey = 'entry-understeer'|'entry-oversteer'|'entry-bounce'|'entry-slide'|
                              'mid-understeer'|'mid-oversteer'|'mid-bounce'|'mid-slide'|
                              'exit-understeer'|'exit-oversteer'|'exit-bounce'|'exit-slide'
                const fixes: Record<FixKey, {text:string; delta: Record<string,number>}[]> = {
                  'entry-understeer': [
                    {text: 'Lower front springs (softer entry)',           delta: {'spring-rate-front': -15}},
                    {text: 'Soften front ARB (more body roll on entry)',   delta: {'anti-roll-bar-front': -3}},
                    {text: 'Increase front toe-out',                       delta: {'toe-front': 0.2}},
                    {text: 'Reduce diff decel lock (easier turn-in)',      delta: {'differential-rear-decel': -10}},
                  ],
                  'entry-oversteer': [
                    {text: 'Stiffen front springs (more front grip)',      delta: {'spring-rate-front': 15}},
                    {text: 'Stiffen front ARB',                            delta: {'anti-roll-bar-front': 3}},
                    {text: 'Reduce front toe-out',                         delta: {'toe-front': -0.1}},
                    {text: 'Increase diff decel lock (more rear stability)', delta: {'differential-rear-decel': 10}},
                  ],
                  'entry-bounce': [
                    {text: 'Soften bump damping (slower compression)',     delta: {'damping-bump-front': -1, 'damping-bump-rear': -1}},
                    {text: 'Raise ride height slightly',                   delta: {'ride-height-front': 0.3, 'ride-height-rear': 0.3}},
                    {text: 'Soften springs',                               delta: {'spring-rate-front': -10, 'spring-rate-rear': -10}},
                  ],
                  'entry-slide': [
                    {text: 'Drop tire pressure 1-2 PSI',                  delta: {'tire-pressure-front': -1.5, 'tire-pressure-rear': -1.5}},
                    {text: 'Add more front negative camber',               delta: {'camber-front': -0.3}},
                    {text: 'Increase brake bias rearward',                 delta: {'brake-balance': 2}},
                  ],
                  'mid-understeer': [
                    {text: 'Lower front ARB (reduce mid-corner push)',     delta: {'anti-roll-bar-front': -4}},
                    {text: 'Raise rear ARB (transfer load to front)',      delta: {'anti-roll-bar-rear': 4}},
                    {text: 'Lower front springs',                          delta: {'spring-rate-front': -12}},
                    {text: 'More front toe-out',                           delta: {'toe-front': 0.15}},
                  ],
                  'mid-oversteer': [
                    {text: 'Raise rear ARB',                               delta: {'anti-roll-bar-rear': 4}},
                    {text: 'Lower front ARB',                              delta: {'anti-roll-bar-front': -3}},
                    {text: 'Stiffen rear springs',                         delta: {'spring-rate-rear': 12}},
                    {text: 'Add rear toe-in',                              delta: {'toe-rear': 0.1}},
                  ],
                  'mid-bounce': [
                    {text: 'Stiffen rebound damping (slower extension)',   delta: {'damping-rebound-front': 1, 'damping-rebound-rear': 1}},
                    {text: 'Soften bump slightly',                         delta: {'damping-bump-front': -0.5, 'damping-bump-rear': -0.5}},
                  ],
                  'mid-slide': [
                    {text: 'Drop tire pressure 1 PSI',                    delta: {'tire-pressure-front': -1, 'tire-pressure-rear': -1}},
                    {text: 'Add negative camber both ends',                delta: {'camber-front': -0.2, 'camber-rear': -0.2}},
                  ],
                  'exit-understeer': [
                    {text: 'Reduce diff accel lock (less push on exit)',   delta: {'differential-rear-accel': -10}},
                    {text: 'Stiffen rear springs/ARB',                     delta: {'spring-rate-rear': 12, 'anti-roll-bar-rear': 3}},
                    {text: 'Move brake bias forward',                      delta: {'brake-balance': -2}},
                  ],
                  'exit-oversteer': [
                    {text: 'Raise diff accel lock (more traction on exit)',delta: {'differential-rear-accel': 10}},
                    {text: 'Lower rear springs/ARB',                       delta: {'spring-rate-rear': -12, 'anti-roll-bar-rear': -3}},
                    {text: 'Move brake bias rearward',                     delta: {'brake-balance': 2}},
                  ],
                  'exit-bounce': [
                    {text: 'Soften rear bump damping',                     delta: {'damping-bump-rear': -1}},
                    {text: 'Soften rear springs slightly',                 delta: {'spring-rate-rear': -8}},
                  ],
                  'exit-slide': [
                    {text: 'More rear tire pressure (sharper breakaway)',  delta: {'tire-pressure-rear': 1}},
                    {text: 'Add rear negative camber',                     delta: {'camber-rear': -0.2}},
                    {text: 'Raise diff accel lock',                        delta: {'differential-rear-accel': 8}},
                  ],
                }
                const key = `${fixItCorner}-${fixItProblem}` as FixKey
                const list = fixes[key] || []
                return (
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-[color:var(--bamboo-stalk)] mb-2">
                      Fixes for {fixItCorner.charAt(0).toUpperCase()+fixItCorner.slice(1)} {fixItProblem.charAt(0).toUpperCase()+fixItProblem.slice(1)}:
                    </div>
                    {list.map((fix, i) => (
                      <div key={i} className={`p-3 rounded flex items-center justify-between gap-2 ${isDarkMode ? 'bg-black/30' : 'bg-white/40'}`}>
                        <div className="flex-1 text-sm">{fix.text}</div>
                        {Object.keys(tuneData).length > 0 && (
                          <button
                            onClick={() => {
                              const updated = { ...tuneData }
                              Object.entries(fix.delta).forEach(([k, d]) => {
                                if (updated[k] !== null && updated[k] !== undefined) updated[k] = parseFloat((updated[k] + d).toFixed(2))
                              })
                              setTuneData(updated)
                              setFixAppliedIndex(i)
                              setTimeout(() => setFixAppliedIndex(null), 1500)
                            }}
                            className={`shrink-0 text-xs px-3 py-1 rounded transition-all ${
                              fixAppliedIndex === i ? 'bg-green-500 text-white' : 'bamboo-button'
                            }`}
                          >
                            {fixAppliedIndex === i ? '✓ Applied!' : 'Apply'}
                          </button>
                        )}
                      </div>
                    ))}
                    {Object.keys(tuneData).length === 0 && (
                      <p className="text-xs opacity-50 mt-2">
                        Calculate a base tune first, then come back here to apply targeted fixes.
                      </p>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-4">
            {/* Car context banner */}
            <div className={`p-3 rounded flex items-start justify-between gap-2 ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
              <div>
                <div className="text-sm font-bold flex items-center gap-1">🤖 AI Tuning Assistant</div>
                {selectedCar ? (
                  <p className="text-xs opacity-60 mt-0.5">
                    Tuning: <span className="text-[color:var(--bamboo-stalk)] font-medium">{selectedCar.year} {selectedCar.manufacturer} {selectedCar.model}</span>
                    {' '}· {selectedCar.pi.class}{selectedCar.pi.value} · {selectedCar.drivetrain}
                    {selectedCar.engine?.horsepower ? ` · ${selectedCar.engine.horsepower}hp` : ''}
                  </p>
                ) : (
                  <p className="text-xs opacity-50 mt-0.5">Select a car first, then describe what you want.</p>
                )}
              </div>
              {aiMessages.length > 0 && (
                <button
                  onClick={() => { setAiMessages([]); setAiResponse('') }}
                  className="text-xs bamboo-button-ghost px-2 py-1 rounded opacity-60 hover:opacity-100 shrink-0"
                  title="Clear chat history"
                >
                  🗑️ Clear
                </button>
              )}
            </div>

            {/* Quick-start presets */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { icon: '💨', label: 'Drift', prompt: 'Give me a full drift tune with maximum angle and control' },
                { icon: '🏁', label: 'Circuit', prompt: 'Optimise for circuit grip and fastest lap time on tarmac' },
                { icon: '🌧️', label: 'Wet', prompt: 'Set up for wet weather and rain for maximum traction' },
                { icon: '🗺️', label: 'Rally', prompt: 'Full rally and cross-country setup for mixed off-road surfaces' },
                { icon: '🚦', label: 'Drag', prompt: 'Drag racing tune for maximum straight-line acceleration and launch' },
                { icon: '🏆', label: 'Max Grip', prompt: 'Maximum grip setup for the fastest cornering on smooth tarmac' },
              ].map(p => (
                <button
                  key={p.label}
                  onClick={() => setAiQuery(p.prompt)}
                  disabled={!selectedCar}
                  className="py-2 px-2 bamboo-button-ghost rounded text-xs text-center disabled:opacity-40"
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>

            {/* Chat history */}
            {aiMessages.length > 0 && (
              <div className={`rounded p-3 space-y-3 max-h-[420px] overflow-y-auto ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
                {aiMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[92%] p-3 rounded-lg text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bamboo-button'
                          : isDarkMode ? 'bg-black/40 text-white/90' : 'bg-white/70 text-black/90'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="whitespace-pre-line">{msg.content}</div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex justify-start">
                    <div className={`p-3 rounded-lg text-sm ${isDarkMode ? 'bg-black/40' : 'bg-white/70'}`}>
                      <div className="flex items-center gap-2 opacity-60">
                        <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent shrink-0" />
                        <span>Analysing your car and building tune…</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty state hint */}
            {aiMessages.length === 0 && !aiLoading && (
              <div className={`p-4 rounded text-center ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
                <div className="text-2xl mb-2">🤖</div>
                <p className="text-sm font-semibold mb-1">Ask the AI for a complete tune</p>
                <p className="text-xs opacity-50">
                  {selectedCar
                    ? `Try: "I want to drift my ${selectedCar.manufacturer} ${selectedCar.model} at Goliath" or "give me a WRC rally setup"`
                    : 'Select a car from the list, then type what you want here.'}
                </p>
              </div>
            )}

            {/* Input area */}
            <div className="space-y-2">
              <textarea
                placeholder={
                  selectedCar
                    ? `e.g. "Full drift tune for ${selectedCar.manufacturer} ${selectedCar.model}" or "fastest lap time setup for circuit racing" or "I keep oversteering on corner exit, help"…`
                    : 'Select a car first, then describe what you want…'
                }
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey && !aiLoading && aiQuery.trim() && selectedCar) {
                    e.preventDefault()
                    getAITuningAdvice()
                  }
                }}
                disabled={!selectedCar}
                rows={3}
                className="w-full p-3 resize-none bamboo-input"
              />
              <button
                onClick={getAITuningAdvice}
                disabled={!aiQuery.trim() || !selectedCar || aiLoading}
                className="w-full py-3 px-4 bamboo-button rounded font-bold disabled:opacity-50"
              >
                {aiLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Thinking…
                  </span>
                ) : '🤖 Get AI Tune'}
              </button>
              <p className="text-[10px] opacity-40 text-center">Enter to send · Shift+Enter for new line · Powered by Gemini</p>
            </div>
          </div>
        )}

        {activeTab === 'telemetry' && (
          <div className="space-y-4">
            <div className={`p-4 rounded ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
              <h4 className="font-bold mb-3">📊 Telemetry Analysis</h4>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Front Tire Temp (°F)</label>
                  <input
                    type="number"
                    placeholder={`${(() => {
                      const tireType = upgrades.tires
                      const baseTemp =
                        tuneType === 'Drift'
                          ? 160
                          : tuneType === 'Rally'
                            ? 140
                            : tuneType === 'Track'
                              ? 200
                              : 180
                      const adjustment = tireType === 'Race' ? 20 : tireType === 'Sport' ? 10 : 0
                      return `${baseTemp + adjustment}-${baseTemp + adjustment + 20}`
                    })()} optimal`}
                    className="w-full p-2 bamboo-input text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Rear Tire Temp (°F)</label>
                  <input
                    type="number"
                    placeholder={`${(() => {
                      const tireType = upgrades.tires
                      const baseTemp =
                        tuneType === 'Drift'
                          ? 140
                          : tuneType === 'Rally'
                            ? 130
                            : tuneType === 'Track'
                              ? 190
                              : 180
                      const adjustment = tireType === 'Race' ? 20 : tireType === 'Sport' ? 10 : 0
                      return `${baseTemp + adjustment}-${baseTemp + adjustment + 20}`
                    })()} optimal`}
                    className="w-full p-2 bamboo-input text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center">
                  <div className="text-xs opacity-75">Lap Time</div>
                  <div className="font-bold text-lg text-[color:var(--bamboo-stalk)]">1:42.156</div>
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

              <button className="w-full mt-4 py-2 bamboo-button rounded font-bold">
                📊 Analyze Telemetry Data
              </button>
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => setGuideSubTab('tuning')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                  guideSubTab === 'tuning' ? 'bamboo-button' : 'bamboo-button-ghost opacity-70'
                }`}
              >
                🔧 Tuning Guide
              </button>
              <button
                onClick={() => setGuideSubTab('painting')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                  guideSubTab === 'painting' ? 'bamboo-button' : 'bamboo-button-ghost opacity-70'
                }`}
              >
                🎨 Painting Guide
              </button>
            </div>

            {guideSubTab === 'tuning' ? (
              <div className="space-y-2">
                <p className="text-xs opacity-50 pb-1">
                  FH5 tuning reference — tap any section to expand.
                </p>
                {[
                  {
                    title: '🌬️ Aerodynamics',
                    items: [
                      'Mainly affects top speed and high-speed-corner stability',
                      'More front downforce → snappier turn-in / tendency to oversteer',
                      'More rear downforce → more understeer, better cornering grip',
                      'Leave at base values until the rest of the suspension is dialled in',
                      'Set equal front/rear for balance; only adjust to counter persistent over/understeer',
                    ],
                  },
                  {
                    title: '〰️ Damping',
                    items: [
                      'Bump = compression (wheel hits bump). Rebound = extension (wheel drops).',
                      'Start with stock rebound as your base, then adjust bump from there',
                      'Bump stiffness should be 50–75 % of the corresponding rebound value',
                      'Start bump low; raise only if the car feels bouncy or unstable',
                      'Stiffer front bump → more rear grip (takes load off rear). Same logic for rear.',
                      'Lower bump settings suit off-road; higher suit smooth tarmac/circuit',
                      'Increase stiffness on the end NOT losing grip; decrease on the end that IS',
                    ],
                  },
                  {
                    title: '🔩 Springs',
                    items: [
                      'Lower front spring → oversteer. Lower rear spring → understeer.',
                      'Heavier / lower cars need stiffer springs for proper control',
                      'Softer springs = more compliance and grip, but body roll and slower response',
                      'FWD/AWD: start slightly softer front than rear (front-drive prone to understeer)',
                      'Stiffer rear springs can improve drift initiation on high-power RWD builds',
                      'Base natural frequency: 1.5 Hz street, 1.7 Hz rally, 2.0 Hz track/race',
                    ],
                  },
                  {
                    title: '📏 Ride Height',
                    items: [
                      'Lower centre of gravity = better stability and handling',
                      'Good base tune: set 2 clicks above the minimum',
                      'Drift builds: minimum ride height for lowest CoG',
                      'Off-road: raise for ground clearance over rough terrain',
                      'Changing ride height slightly affects effective spring rate — re-test after',
                    ],
                  },
                  {
                    title: '🔄 Anti-Roll Bars (ARBs)',
                    items: [
                      'Softer ARB lets suspension travel more, loading the outside tyre in corners',
                      'Lower front ARB → more oversteer. Lower rear ARB → more understeer.',
                      'FWD/AWD tuning requires more ARB attention than RWD',
                      'FWD/AWD base tune front: halfway between minimum and 50 %',
                      'FWD/AWD base tune rear: set at 50 %',
                      'RWD base tune: leave ARBs at stock',
                      'Stiffer rear ARB helps low-power builds initiate drift',
                      'Drift: lower rear ARB increases rear grip — only go lower with enough power',
                    ],
                  },
                  {
                    title: '📐 Alignment',
                    items: [
                      'Negative camber: bottom of tyre angled out — maximises contact patch in corners',
                      'Base tune: start a few clicks below stock; validate with telemetry heat map',
                      'Too much negative camber wears the inside shoulder and hurts straight-line grip',
                      'FWD/AWD base: 0.1–0.2 ° front toe-out creates slight oversteer to offset understeer',
                      'RWD base: 0.1–0.2 ° rear toe-in stabilises the rear in corners',
                      'Drift: max front negative camber, max caster (≤6 °), front toe-out ~2 °',
                      'Caster: 4–7 ° is a good base; affects steering feel but not lap times significantly',
                    ],
                  },
                  {
                    title: '⚙️ Gearing',
                    items: [
                      'Final drive: shift toward speed until the rightmost graph line just touches the right edge',
                      'High-power RWD: extend 1st and 2nd gear for gradualy power delivery off corners',
                      'Drift: default final drive works; find your drift gear then close others toward it',
                      'Drag: close all gears as tight as possible for maximum acceleration',
                    ],
                  },
                  {
                    title: '🛞 Tires',
                    items: [
                      'No tyre wear in FH5 — optimise grip and temperature management only',
                      'Higher PSI: more responsive, higher peak grip, but loss is more sudden',
                      'Lower PSI: heats faster, progressive grip loss (easier to catch slides)',
                      'Track base: 26–35 PSI. Slightly higher front PSI improves cornering.',
                      'Drift front: ~30 PSI. Drift rear: ~22 PSI (lower = smoother breakaway).',
                      'Raise rear PSI only if you need a more abrupt rear breakaway',
                    ],
                  },
                  {
                    title: '📊 Using Telemetry (press T on PC)',
                    items: [
                      'Suspension bar: should stay 20–80 % during normal cornering',
                      'Fully compressed (100 % pink) → raise ride height or soften springs/damping',
                      'Bar barely moving → too stiff; soften springs or damping',
                      'Tires & Misc: outside-tyre camber should never read positive mid-corner',
                      'If camber goes neutral or positive in a corner → add more negative camber',
                      'Heat view: tyres should be mustard/yellow at peak operating temperature',
                      'Inside tyre = hottest, outside = coolest, middle = in between',
                      'Inner-to-outer spread > 20 °F → reduce negative camber angle',
                      'Middle temp lower than inner/outer → increase PSI; middle too high → lower PSI',
                    ],
                  },
                  {
                    title: '⚙️ Differential',
                    items: [
                      'Higher accel lock → less wheelspin on throttle, more understeer on corner exit',
                      'Lower accel lock → more wheelspin, easier rotation, better turn-in',
                      'Higher decel lock → stable trail-braking, but can cause entry understeer',
                      'Base tune: 50 % accel, 20 % decel for RWD',
                      'Drift: lower accel to 20–40 % for easier initiation and smoother modulation',
                      'AWD centre diff: higher front split = more understeer; higher rear = more oversteer',
                    ],
                  },
                  {
                    title: '🛑 Brakes',
                    items: [
                      'Forward bias (more front braking) → better brake-to-turn-in, risk of front lock-up',
                      'Rearward bias → rotation aid on entry, risk of instability under heavy braking',
                      'Base tune: 52–55 % front bias; 90–100 % pressure',
                      'Drift entries: 48–50 % front (slight rear bias aids rotation)',
                      '⚠ FH5 slider is INVERTED — display value = 100 − target front%. Lower = more front.',
                    ],
                  },
                  {
                    title: '🔥 Drift-Specific Setup',
                    items: [
                      'More power makes drifting easier — upgrade engine first',
                      'Rear tyre compound: 1–2 grades softer than front for controlled breakaway',
                      'Front ~30 PSI for steering grip; rear ~22 PSI for smooth slides',
                      'RWD diff: accel 20–40 %, decel 10–20 %',
                      'Maximum front negative camber for grip while counter-steering',
                      'Max caster (≤6 °) improves self-centering and steering feel during slides',
                      'Front toe-out ~2 ° for easier entry and more steering angle',
                      'Rear toe: 0.1–0.2 ° in for base stability; neutral or slight out for initiation',
                    ],
                  },
                  {
                    title: '⚠️ Common Tuning Mistakes',
                    items: [
                      'Changing too many settings at once — isolate one variable, test, repeat',
                      'Ignoring telemetry data',
                      'Copying a tune without understanding the car\'s weight, drivetrain, and PI class',
                      'Over-tuning a car that is already well-balanced',
                      'Testing on a single corner type instead of a full circuit',
                      'Chasing lap times instead of consistency and feel',
                      'Neglecting tyre temperatures and PSI adjustments',
                    ],
                  },
                ].map(section => (
                  <details
                    key={section.title}
                    className={`rounded ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}
                  >
                    <summary className="px-3 py-2 font-bold text-sm cursor-pointer select-none">
                      {section.title}
                    </summary>
                    <ul className="px-3 pb-3 mt-1 space-y-1">
                      {section.items.map((item, i) => (
                        <li key={i} className="text-xs opacity-80 flex gap-1.5">
                          <span className="shrink-0 opacity-40 mt-0.5">▸</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs opacity-50 pb-1">
                  FH5 painting &amp; special colors guide — tap any section to expand.
                </p>
                {[
                  {
                    title: '🎨 The Basics: Understanding HSB',
                    items: [
                      'Forza uses the HSB (Hue, Saturation, Brightness) system on a scale of 0.00 to 1.00.',
                      'Hue (H): The actual color (0.00 is Red, moving through the rainbow back to 1.00 Red).',
                      'Saturation (S): How intense the color is (0.00 is grayscale/white, 1.00 is pure color).',
                      'Brightness (B): How light or dark the color is (0.00 is pitch black, 1.00 is fully bright).',
                      'Pro-Tip: Press X (on controller) or Space (on keyboard) when hovering over a color to open the Advanced Fine-Tune menu where you can input exact HSB values.',
                    ],
                  },
                  {
                    title: '🌓 1. Pearlescent & Color-Shift (Two-Tone)',
                    items: [
                      'Two-Tone paints transition between two different colors depending on the light/camera angle.',
                      'Go to Special Colors -> select Two-Tone Polished, and press X to Fine-Tune.',
                      'Base Color (Lowlight): Set this to a darker, richer color for shadows (e.g. Midnight Purple III base: H:0.65, S:1.00, B:0.25).',
                      'Highlight Color: Set this to a bright, highly saturated contrasting color for sunlight reflections (e.g. Midnight Purple III highlight: H:0.08, S:0.90, B:0.60).',
                      'Example (Ford Mystichrome): Base H:0.56 S:1.00 B:0.40 / Highlight H:0.76 S:1.00 B:0.55.',
                    ],
                  },
                  {
                    title: '✨ 2. Candy Coats & Deep Metallics (Metal Flake)',
                    items: [
                      'Consists of a solid base coat with tiny metallic flakes suspended in clear coat.',
                      'Go to Special Colors -> select Metal Flake, and press X to Fine-Tune.',
                      'Base Color: The underlying paint. For a "Candy" look, make this very dark (e.g. H:0.00, S:1.00, B:0.20).',
                      'Flake Color: The metallic sparkle. Make this the same Hue as the base, but with maximum Brightness and Saturation (e.g. H:0.00, S:1.00, B:1.00).',
                      'Result: A deep Candy Apple Red that looks dark in the shade but sparkles ruby red in direct sunlight.',
                    ],
                  },
                  {
                    title: '💿 3. Anodized Metals & Colored Chrome',
                    items: [
                      'Tint highly reflective metals to create custom anodized aluminum, colored chrome, or brass/copper.',
                      'Go to Special Colors -> select Chrome, Polished Aluminum, or Brushed Aluminum, and press X to tint.',
                      'Example (Anodized Blue): Material: Polished Aluminum, Tint: H:0.60 S:0.85 B:0.90.',
                      'Example (Realistic Bronze/Gold): Material: Semigloss Brass or Brushed Aluminum, Tint: H:0.12 S:0.65 B:0.75.',
                    ],
                  },
                  {
                    title: '🏁 4. Tinted Carbon Fiber (Transparent Vinyl Method)',
                    items: [
                      'Exposed, colored carbon fiber weaves found on Pagani or McLaren cars.',
                      'Paint the entire car in Carbon Fiber (Polished or Matte) from the Special Colors tab.',
                      'Go to Apply Decals / Vinyls and add a basic Square vinyl shape.',
                      'Scale the squares up massively until they completely cover the entire vehicle.',
                      'Change the color of the vinyls to your desired tint (e.g., Blood Red or Sapphire Blue).',
                      'The Secret Step: Change the Transparency (Opacity) of the vinyls to around 15% - 30%.',
                      'Result: Carbon fiber weave shines through the color clear-coat.',
                    ],
                  },
                  {
                    title: '🖤 5. Faux Custom Decal Finishes (Matte/Gloss Contrast)',
                    items: [
                      'Create stealth/ghost patterns with glossy decals on matte paint or vice versa.',
                      'Paint the car in Matte or Semigloss black.',
                      'Apply decals in the same black color.',
                      'While selecting the decals, Toggle Vinyl Material (usually Y on controller).',
                      'Set the vinyl to be Glossy while the car body remains Matte.',
                    ],
                  },
                  {
                    title: '🖌️ General Painting Tips',
                    items: [
                      'Wheels: Advanced painting allows you to paint Inner Barrel, Spokes, and Lip separately.',
                      'Brake Calipers: Calipers do not support Special Colors directly, but normal HSB can match your body highlights.',
                      'Lighting: Always take your car outside to natural daytime sunlight to check paint. Garage lighting is artificial and washes out colors.',
                    ],
                  },
                ].map(section => (
                  <details
                    key={section.title}
                    className={`rounded ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}
                  >
                    <summary className="px-3 py-2 font-bold text-sm cursor-pointer select-none">
                      {section.title}
                    </summary>
                    <ul className="px-3 pb-3 mt-1 space-y-1">
                      {section.items.map((item, i) => (
                        <li key={i} className="text-xs opacity-80 flex gap-1.5">
                          <span className="shrink-0 opacity-40 mt-0.5">▸</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      </main>
    </div>
  )
}
