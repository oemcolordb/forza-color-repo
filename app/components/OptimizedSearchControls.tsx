'use client'

import React, { useCallback } from 'react'
import { Dispatch, SetStateAction } from 'react'

interface OptimizedSearchControlsProps {
  searchQuery: string
  onSearchChange: Dispatch<SetStateAction<string>>
  selectedMake: string
  onMakeChange: Dispatch<SetStateAction<string>>
  selectedColorType: string
  onColorTypeChange: Dispatch<SetStateAction<string>>
  selectedYear: string
  onYearChange: Dispatch<SetStateAction<string>>
  years: string[]
  sortBy: 'newest' | 'az' | 'random'
  onSortChange: Dispatch<SetStateAction<'newest' | 'az' | 'random'>>
  makes: string[]
  colorTypes: string[]
  isDarkMode: boolean
  showManufacturerBorders: boolean
  onToggleManufacturerBorders: () => void
  favoritesCount?: number
  showFavoritesOnly: boolean
  onToggleShowFavoritesOnly: () => void
}

const OptimizedSearchControls: React.FC<OptimizedSearchControlsProps> = React.memo(
  ({
    searchQuery,
    onSearchChange,
    selectedMake,
    onMakeChange,
    selectedColorType,
    onColorTypeChange,
    selectedYear,
    onYearChange,
    years,
    sortBy,
    onSortChange,
    makes,
    colorTypes,
    isDarkMode,
    showManufacturerBorders: _showManufacturerBorders,
    onToggleManufacturerBorders: _onToggleManufacturerBorders,
    favoritesCount = 0,
    showFavoritesOnly,
    onToggleShowFavoritesOnly,
  }) => {

    const handleFavoritesToggle = useCallback(() => {
      onToggleShowFavoritesOnly()
    }, [onToggleShowFavoritesOnly])

    const clearFilters = useCallback(() => {
      onSearchChange('')
      onMakeChange('')
      onColorTypeChange('')
      onYearChange('')
      onSortChange('newest')
    }, [onColorTypeChange, onMakeChange, onSearchChange, onSortChange, onYearChange])

    const inputClasses = React.useMemo(() => {
      return `flex-1 bamboo-input backdrop-blur-sm text-sm ${
        isDarkMode ? 'placeholder-slate-400' : 'placeholder-gray-600'
      }`
    }, [isDarkMode])

    const selectClasses = React.useMemo(() => {
      return `bamboo-input backdrop-blur-sm text-sm`
    }, [])

    const buttonClasses = React.useMemo(() => {
      return `rounded-lg font-medium transition-colors focus:outline-none px-3 py-2 text-sm ${
        showFavoritesOnly ? 'bg-rose-500 text-white border border-rose-300/40' : 'bamboo-button-ghost'
      }`
    }, [showFavoritesOnly])

    return (
      <div id="color-search" className="mb-5 animate-fade-in">
        <div className="bamboo-surface rounded-2xl p-4 md:p-5 space-y-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="premium-title text-lg font-bold text-white">Advanced Search</h2>
              <p className="text-xs text-white/60">Find colors by name, make, model, or paint type</p>
            </div>
            <button
              onClick={clearFilters}
              className="self-start rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10"
              aria-label="Clear all filters"
            >
              Clear All Filters
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by color name, hex, or car..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className={inputClasses}
              aria-label="Search colors"
            />
            <button
              onClick={handleFavoritesToggle}
              className={buttonClasses}
              aria-label={showFavoritesOnly ? 'Show all colors' : 'Show favorites only'}
              style={{
                position: 'relative',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  transform: `scale(${Math.min(1 + favoritesCount * 0.02, 2)})`,
                  transition: 'transform 0.3s ease',
                }}
              >
                ❤️
              </span>
              <span
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '0.7em',
                  fontWeight: 'bold',
                  color: 'white',
                  textShadow: '0 0 2px rgba(0,0,0,0.8)',
                  pointerEvents: 'none',
                }}
              >
                {favoritesCount > 0 ? favoritesCount : ''}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <select
              value={selectedMake}
              onChange={e => onMakeChange(e.target.value)}
              className={selectClasses}
              aria-label="Filter by manufacturer"
            >
              <option value="">All Makes</option>
              {makes.map(make => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
            </select>
            <select
              value={selectedColorType}
              onChange={e => onColorTypeChange(e.target.value)}
              className={selectClasses}
              aria-label="Filter by color type"
            >
              <option value="">All Types</option>
              {colorTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={e => onYearChange(e.target.value)}
              className={selectClasses}
              aria-label="Filter by year"
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={e => onSortChange(e.target.value as 'newest' | 'az' | 'random')}
              className={selectClasses}
              aria-label="Sort results"
            >
              <option value="newest">Sort: Newest</option>
              <option value="az">Sort: A-Z</option>
              <option value="random">Sort: Random</option>
            </select>
          </div>

          <div className="text-xs text-white/55">
            Filters: Manufacturer • Year • Color Type • Favorites • Sort
          </div>
        </div>
      </div>
    )
  }
)

OptimizedSearchControls.displayName = 'OptimizedSearchControls'

export default OptimizedSearchControls
