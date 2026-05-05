'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Car } from '../types'
import { Car as BaseCar } from '../../types/car'

const estimateWeight = (type: string, piClass: string): number => {
  const typeBase: Record<string, number> = {
    'Hypercar': 1100, 'Track Car': 1050, 'Sports Car': 1300, 'Supercar': 1350,
    'Coupe': 1400, 'Convertible': 1450, 'Classic': 1500, 'Rally Car': 1350,
    'Sedan': 1600, 'Wagon': 1650, 'SUV': 2050, 'Truck': 2300,
  }
  const piAdj: Record<string, number> = { X: -250, S2: -200, S1: -150, A: -50, B: 0, C: 50, D: 100 }
  return (typeBase[type] ?? 1450) + (piAdj[piClass] ?? 0)
}

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

const estimateEngine = (piValue: number, accelStat: number) => {
  const horsepower = Math.round((piValue - 400) * 1.8 + accelStat * 18)
  const aspirated = piValue < 700
  const displacement = aspirated
    ? Math.round((2.4 + (horsepower / 400)) * 10) / 10
    : Math.round((1.8 + (horsepower / 600)) * 10) / 10
  const cylinders = horsepower < 300 ? 4 : horsepower < 500 ? 6 : horsepower < 700 ? 8 : 10
  return { displacement, cylinders, aspiration: aspirated ? 'NA' : 'Turbo', horsepower: Math.max(150, horsepower) }
}

export function useCars() {
  const [cars, setCars] = useState<Car[]>([])
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('manufacturer-az')
  const [displayCount, setDisplayCount] = useState(50)
  const [loadingStatus, setLoadingStatus] = useState('Loading car database...')
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadSampleCars()
  }, [])

  useEffect(() => {
    setDisplayCount(50)
  }, [searchQuery, sortBy])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) setDisplayCount(prev => prev + 50) },
      { root: null, rootMargin: '200px', threshold: 0.1 }
    )
    if (loadMoreRef.current) observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [])

  const loadSampleCars = async () => {
    try {
      setLoadingStatus('Loading car database...')
      const res = await fetch('/api/tuneforge/cars')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const allCars: BaseCar[] = await res.json()
      if (!allCars || allCars.length === 0) throw new Error('No car data available')

      const processedCars: Car[] = allCars.map((car: BaseCar) => ({
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
      setSelectedCar(processedCars.length > 0 ? processedCars[0] : null)
      setLoadingStatus(`${processedCars.length} cars loaded`)
    } catch (error) {
      console.error('TuneForge: Failed to load car database:', error)
      const fallback: Car[] = [{
        year: '2020', manufacturer: 'Porsche', model: '911 Turbo S', type: 'Sports Car',
        fullName: '2020 Porsche 911 Turbo S', price: 230000, rarity: 'Epic', country: 'Germany',
        stats: { speed: 9.2, handling: 8.5, acceleration: 9.0, launch: 8.8, braking: 8.7, offroad: 4.2 },
        pi: { class: 'S2', value: 998 }, drivetrain: 'AWD', weight: 1640,
        engine: { displacement: 3.8, cylinders: 6, aspiration: 'Turbo', horsepower: 640 },
        tags: ['German', 'Turbo', 'AWD'],
      }]
      setCars(fallback)
      setSelectedCar(fallback[0])
      setLoadingStatus('Using limited fallback data (1 car)')
    }
  }

  const filteredCars = useMemo(() => {
    return cars
      .filter(car => {
        const q = searchQuery.toLowerCase()
        return !q ||
          car.fullName?.toLowerCase().includes(q) ||
          car.manufacturer.toLowerCase().includes(q) ||
          car.model.toLowerCase().includes(q)
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

  const visibleCars = filteredCars.slice(0, displayCount)
  const hasMore = displayCount < filteredCars.length

  return {
    cars, selectedCar, setSelectedCar,
    searchQuery, setSearchQuery,
    sortBy, setSortBy,
    loadingStatus,
    filteredCars, visibleCars, hasMore,
    loadMoreRef,
  }
}
