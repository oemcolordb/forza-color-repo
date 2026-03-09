import React, { useState, useEffect } from 'react'
import { Car, CarFilters } from '../types/car'
import { useCars } from '../hooks/useCars'
import { getCountryFlag, formatPrice } from '../lib/countryFlags'
import CarSelector from './CarSelector'

interface CarBrowserProps {
  onCarSelect?: (car: Car) => void
  className?: string
}

const CarBrowser: React.FC<CarBrowserProps> = ({ onCarSelect, className = '' }) => {
  const { cars, manufacturers, types, loading, error, searchCars, getRandomCars } = useCars()

  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<CarFilters>({})
  const [viewMode, setViewMode] = useState<'selector' | 'search' | 'random'>('selector')

  // Load random cars on initial mount
  useEffect(() => {
    if (viewMode === 'random') {
      getRandomCars(20)
    }
  }, [viewMode, getRandomCars])

  const handleSearch = () => {
    searchCars({
      query: searchQuery,
      filters,
      limit: 50,
    })
  }

  const handleCarSelect = (car: Car | null) => {
    setSelectedCar(car)
    if (car && onCarSelect) {
      onCarSelect(car)
    }
  }

  const handleFilterChange = (key: keyof CarFilters, value: string) => {
    const newFilters = { ...filters }
    if (value) {
      ;(newFilters as any)[key] = value
    } else {
      delete newFilters[key]
    }
    setFilters(newFilters)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* View Mode Selector */}
      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setViewMode('selector')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            viewMode === 'selector'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Car Selector
        </button>
        <button
          onClick={() => setViewMode('search')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            viewMode === 'search'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Search & Filter
        </button>
        <button
          onClick={() => setViewMode('random')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            viewMode === 'random'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Random Cars
        </button>
      </div>

      {/* Car Selector Mode */}
      {viewMode === 'selector' && (
        <CarSelector selectedCar={selectedCar} onCarSelect={handleCarSelect} />
      )}

      {/* Search & Filter Mode */}
      {viewMode === 'search' && (
        <div className="space-y-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Cars
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by manufacturer, model, or year..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Manufacturer
              </label>
              <select
                value={filters.manufacturer || ''}
                onChange={e => handleFilterChange('manufacturer', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Manufacturers</option>
                {manufacturers.map(manufacturer => (
                  <option key={manufacturer} value={manufacturer}>
                    {manufacturer}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={filters.type || ''}
                onChange={e => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                PI Class
              </label>
              <select
                value={filters.piClass || ''}
                onChange={e => handleFilterChange('piClass', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Classes</option>
                <option value="D">D Class</option>
                <option value="C">C Class</option>
                <option value="B">B Class</option>
                <option value="A">A Class</option>
                <option value="S1">S1 Class</option>
                <option value="S2">S2 Class</option>
                <option value="X">X Class</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Random Cars Mode */}
      {viewMode === 'random' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Random Cars</h3>
            <button
              onClick={() => getRandomCars(20)}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Get New Random Cars'}
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Cars Grid */}
      {(viewMode === 'search' || viewMode === 'random') && cars.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cars.map((car, index) => (
            <div
              key={`${car.manufacturer}-${car.model}-${car.year}-${index}`}
              onClick={() => handleCarSelect(car)}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            >
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span>{getCountryFlag(car.country)}</span>
                <span>
                  {car.year} {car.manufacturer} {car.model}
                </span>
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {car.type} • {car.pi.class} {car.pi.value} • {car.rarity}
              </p>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-500 flex items-center justify-between">
                <span>{formatPrice(car.price)}</span>
                <span className="flex items-center gap-1">
                  {getCountryFlag(car.country)} {car.country}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {(viewMode === 'search' || viewMode === 'random') && !loading && cars.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No cars found. Try adjusting your search or filters.
        </div>
      )}
    </div>
  )
}

export default CarBrowser
