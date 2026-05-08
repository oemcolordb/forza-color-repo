 'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

export interface CarStats {
  speed: number
  handling: number
  acceleration: number
  launch: number
  braking: number
  offroad: number
}

export interface CarPI {
  class: 'D' | 'C' | 'B' | 'A' | 'S1' | 'S2' | 'X'
  value: number
}

export interface Car {
  year: string
  manufacturer: string
  model: string
  type: string
  price: number
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary'
  country: string
  stats: CarStats
  pi: CarPI
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

interface CarContextType {
  selectedCar: Car | null
  setSelectedCar: (car: Car | null) => void
  clearSelectedCar: () => void
}

const CarContext = createContext<CarContextType | undefined>(undefined)

export function CarProvider({ children }: { children: ReactNode }) {
  const [selectedCar, setSelectedCarState] = useState<Car | null>(null)

  // Load selected car from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('selectedCar')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSelectedCarState(parsed)
      } catch {
        // Invalid saved data, ignore
      }
    }
  }, [])

  const setSelectedCar = useCallback((car: Car | null) => {
    setSelectedCarState(car)
    if (car) {
      localStorage.setItem('selectedCar', JSON.stringify(car))
    } else {
      localStorage.removeItem('selectedCar')
    }
  }, [])

  const clearSelectedCar = useCallback(() => {
    setSelectedCarState(null)
    localStorage.removeItem('selectedCar')
  }, [])

  return (
    <CarContext.Provider value={{ selectedCar, setSelectedCar, clearSelectedCar }}>
      {children}
    </CarContext.Provider>
  )
}

export function useCarContext() {
  const context = useContext(CarContext)
  if (context === undefined) {
    throw new Error('useCarContext must be used within a CarProvider')
  }
  return context
}
