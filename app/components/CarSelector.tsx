import React, { useState, useEffect } from 'react'
import { Car } from '../types/car'
import { useCars, useModelsByManufacturer } from '../hooks/useCars'
import { getCountryFlag, formatPrice } from '../lib/countryFlags'

interface CarSelectorProps {
  selectedCar?: Car | null
  onCarSelect: (car: Car | null) => void
  className?: string
}

const CarSelector: React.FC<CarSelectorProps> = ({ selectedCar, onCarSelect, className = '' }) => {
  const { manufacturers, loading: manufacturersLoading } = useCars()
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('')
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [availableCars, setAvailableCars] = useState<Car[]>([])

  const { models, loading: modelsLoading } = useModelsByManufacturer(selectedManufacturer)
  const { searchCars, cars, loading: carsLoading } = useCars()

  // Load cars when manufacturer and model are selected
  useEffect(() => {
    if (selectedManufacturer && selectedModel) {
      searchCars({
        filters: {
          manufacturer: selectedManufacturer,
          model: selectedModel,
        },
      })
    }
  }, [selectedManufacturer, selectedModel, searchCars])

  // Update available cars when search results change
  useEffect(() => {
    setAvailableCars(cars)
  }, [cars])

  // Get unique years for selected manufacturer and model
  const availableYears = React.useMemo(() => {
    return Array.from(new Set(availableCars.map(car => car.year))).sort()
  }, [availableCars])

  const handleManufacturerChange = (manufacturer: string) => {
    setSelectedManufacturer(manufacturer)
    setSelectedModel('')
    setSelectedYear('')
    setAvailableCars([])
    onCarSelect(null)
  }

  const handleModelChange = (model: string) => {
    setSelectedModel(model)
    setSelectedYear('')
    onCarSelect(null)
  }

  const handleYearChange = (year: string) => {
    setSelectedYear(year)

    if (year && selectedManufacturer && selectedModel) {
      const car = availableCars.find(
        c => c.manufacturer === selectedManufacturer && c.model === selectedModel && c.year === year
      )
      onCarSelect(car || null)
    } else {
      onCarSelect(null)
    }
  }

  // Set initial values if selectedCar is provided
  useEffect(() => {
    if (selectedCar) {
      setSelectedManufacturer(selectedCar.manufacturer)
      setSelectedModel(selectedCar.model)
      setSelectedYear(selectedCar.year)
    }
  }, [selectedCar])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Manufacturer Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Manufacturer
        </label>
        <select
          value={selectedManufacturer}
          onChange={e => handleManufacturerChange(e.target.value)}
          disabled={manufacturersLoading}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">
            {manufacturersLoading ? 'Loading manufacturers...' : 'Select Manufacturer'}
          </option>
          {manufacturers.map(manufacturer => (
            <option key={manufacturer} value={manufacturer}>
              {manufacturer}
            </option>
          ))}
        </select>
      </div>

      {/* Model Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Model
        </label>
        <select
          value={selectedModel}
          onChange={e => handleModelChange(e.target.value)}
          disabled={!selectedManufacturer || modelsLoading}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
        >
          <option value="">
            {!selectedManufacturer
              ? 'Select manufacturer first'
              : modelsLoading
                ? 'Loading models...'
                : 'Select Model'}
          </option>
          {models.map(model => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>

      {/* Year Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Year
        </label>
        <select
          value={selectedYear}
          onChange={e => handleYearChange(e.target.value)}
          disabled={!selectedModel || carsLoading || availableYears.length === 0}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
        >
          <option value="">
            {!selectedModel
              ? 'Select model first'
              : carsLoading
                ? 'Loading years...'
                : availableYears.length === 0
                  ? 'No years available'
                  : 'Select Year'}
          </option>
          {availableYears.map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Car Display */}
      {selectedCar && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
            <span>{getCountryFlag(selectedCar.country)}</span>
            <span>Selected Car</span>
          </h3>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <span className="font-medium">Make:</span> {selectedCar.manufacturer}
            </p>
            <p>
              <span className="font-medium">Model:</span> {selectedCar.model}
            </p>
            <p>
              <span className="font-medium">Year:</span> {selectedCar.year}
            </p>
            <p>
              <span className="font-medium">Type:</span> {selectedCar.type}
            </p>
            <p>
              <span className="font-medium">PI:</span> {selectedCar.pi.class} {selectedCar.pi.value}
            </p>
            <p>
              <span className="font-medium">Rarity:</span> {selectedCar.rarity}
            </p>
            <p>
              <span className="font-medium">Price:</span> {formatPrice(selectedCar.price)}
            </p>
            <p className="flex items-center gap-1">
              <span className="font-medium">Country:</span>
              <span>
                {getCountryFlag(selectedCar.country)} {selectedCar.country}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CarSelector
