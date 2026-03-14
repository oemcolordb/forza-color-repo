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

    const inputClasses = React.useMemo(() => {
      return `flex-1 bamboo-input backdrop-blur-sm text-sm ${
        isDarkMode ? 'placeholder-slate-400' : 'placeholder-gray-600'
      }`
    }, [isDarkMode])

    const selectClasses = React.useMemo(() => {
      return `bamboo-input backdrop-blur-sm text-sm`
    }, [isDarkMode])

    const buttonClasses = React.useMemo(() => {
      return `rounded-lg font-medium transition-colors focus:outline-none px-3 py-2 text-sm ${
        showFavoritesOnly ? 'bg-red-600 text-white' : 'bamboo-button-ghost'
      }`
    }, [showFavoritesOnly])

    return (
      <div className="mb-4 animate-fade-in">
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search colors, makes, models..."
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
          <div className="grid grid-cols-2 gap-2">
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
          </div>
        </div>
      </div>
    )
  }
)

OptimizedSearchControls.displayName = 'OptimizedSearchControls'

export default OptimizedSearchControls
