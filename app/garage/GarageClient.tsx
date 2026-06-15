'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Car } from '@/types/car'
import { countryFlags } from '@/lib/utils/countryFlags'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import GamingErrorBoundary from '@/components/error/GamingErrorBoundary'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const PI_CLASS_COLORS: Record<string, string> = {
  D: 'bg-gray-500 text-white',
  C: 'bg-yellow-600 text-white',
  B: 'bg-blue-600 text-white',
  A: 'bg-green-600 text-white',
  S1: 'bg-purple-600 text-white',
  S2: 'bg-red-600 text-white',
  X: 'bg-pink-600 text-white',
}

const RARITY_COLORS: Record<string, string> = {
  Common: 'text-gray-400',
  Rare: 'text-blue-400',
  Epic: 'text-purple-400',
  Legendary: 'text-orange-400',
  Forzathon: 'text-green-400',
  Seasonal: 'text-red-400',
}

export default function GarageClient() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [isDarkMode, _setIsDarkMode] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMake, setSelectedMake] = useState<string>('')
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedRarity, setSelectedRarity] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('name')

  useEffect(() => {
    async function loadCars() {
      try {
        const response = await fetch('/api/cars')
        const data = await response.json()
        setCars(data)
      } catch (error) {
        console.error('Failed to load cars:', error)
      } finally {
        setLoading(false)
      }
    }
    loadCars()
  }, [])

  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      const matchesSearch = searchTerm === '' ||
        car.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesMake = selectedMake === '' || car.manufacturer === selectedMake
      const matchesClass = selectedClass === '' || car.pi?.class === selectedClass
      const matchesRarity = selectedRarity === '' || car.rarity === selectedRarity
      return matchesSearch && matchesMake && matchesClass && matchesRarity
    })
  }, [cars, searchTerm, selectedMake, selectedClass, selectedRarity])

  const sortedCars = useMemo(() => {
    return [...filteredCars].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.manufacturer.localeCompare(b.manufacturer) || a.model.localeCompare(b.model)
        case 'pi':
          return (b.pi?.value || 0) - (a.pi?.value || 0)
        case 'rarity':
          const rarityOrder = ['Legendary', 'Forzathon', 'Seasonal', 'Epic', 'Rare', 'Common']
          return rarityOrder.indexOf(a.rarity || '') - rarityOrder.indexOf(b.rarity || '')
        default:
          return 0
      }
    })
  }, [filteredCars, sortBy])

  const makes = useMemo(() => {
    return Array.from(new Set(cars.map(car => car.manufacturer))).sort()
  }, [cars])

  const classes = useMemo(() => {
    return Array.from(new Set(cars.map(car => car.pi?.class).filter(Boolean))).sort()
  }, [cars])

  const rarities = useMemo(() => {
    return Array.from(new Set(cars.map(car => car.rarity).filter(Boolean))).sort()
  }, [cars])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <GamingErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Breadcrumbs isDarkMode={isDarkMode} />

          <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
            🚗 Forza Garage
          </h1>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search cars..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Make
                </label>
                <select
                  value={selectedMake}
                  onChange={(e) => setSelectedMake(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Makes</option>
                  {makes.map(make => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  PI Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Classes</option>
                  {classes.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rarity
                </label>
                <select
                  value={selectedRarity}
                  onChange={(e) => setSelectedRarity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Rarities</option>
                  {rarities.map(rarity => (
                    <option key={rarity} value={rarity}>{rarity}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="name">Name</option>
                  <option value="pi">PI Value</option>
                  <option value="rarity">Rarity</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-4 text-gray-600 dark:text-gray-400">
            Showing {sortedCars.length} of {cars.length} cars
          </div>

          {/* Car grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedCars.map((car, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">
                      {countryFlags[car.manufacturer] || '🚗'}
                    </span>
                    {car.pi && (
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${PI_CLASS_COLORS[car.pi.class] || 'bg-gray-500'}`}>
                        {car.pi.class} {car.pi.value}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {car.manufacturer}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {car.model}
                  </p>

                  {car.rarity && (
                    <span className={`text-xs font-medium ${RARITY_COLORS[car.rarity] || 'text-gray-400'}`}>
                      {car.rarity}
                    </span>
                  )}

                  {car.year && (
                    <span className="text-xs text-gray-500 dark:text-gray-500 ml-2">
                      {car.year}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {sortedCars.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-xl mb-2">No cars found</p>
              <p>Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </GamingErrorBoundary>
  )
}
