'use client'

import React, { useCallback } from 'react'

const OptimizedSearchControls = React.memo(({
  searchQuery,
  setSearchQuery,
  selectedMake,
  setSelectedMake,
  selectedColorType,
  setSelectedColorType,
  favorites,
  makes,
  colorTypes,
  isDarkMode,
  deviceInfo
}) => {
  const handleFavoritesToggle = useCallback(() => {
    if (selectedMake === 'FAVORITES') {
      setSelectedMake('')
    } else {
      setSelectedMake('FAVORITES')
      setSearchQuery('')
      setSelectedColorType('')
    }
  }, [selectedMake, setSelectedMake, setSearchQuery, setSelectedColorType])

  const handleClearFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedMake('')
    setSelectedColorType('')
  }, [setSearchQuery, setSelectedMake, setSelectedColorType])

  const inputClasses = React.useMemo(() => {
    const base = `flex-1 rounded-lg border backdrop-blur-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      isDarkMode 
        ? 'bg-slate-800/90 border-slate-600 text-white placeholder-slate-400' 
        : 'bg-white/90 border-gray-300 text-gray-900 placeholder-gray-500'
    }`
    
    if (deviceInfo.isMobile) {
      return `${base} px-3 py-2 text-sm`
    } else {
      return `${base} px-3 py-2 text-sm`
    }
  }, [isDarkMode, deviceInfo])

  const selectClasses = React.useMemo(() => {
    const base = `rounded-lg border backdrop-blur-sm transition-colors ${
      selectedMake === 'FAVORITES' ? 'opacity-50 cursor-not-allowed' : ''
    } ${
      isDarkMode 
        ? 'bg-slate-800/90 border-slate-600 text-white' 
        : 'bg-white/90 border-gray-300 text-gray-900'
    }`
    
    if (deviceInfo.isMobile) {
      return `${base} px-2 py-2 text-sm`
    } else {
      return `${base} px-3 py-2 text-sm`
    }
  }, [isDarkMode, deviceInfo, selectedMake])

  const buttonClasses = React.useMemo(() => {
    const base = `rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
      selectedMake === 'FAVORITES'
        ? 'bg-red-500 text-white focus:ring-red-500'
        : isDarkMode
        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 focus:ring-slate-500'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500'
    }`
    
    if (deviceInfo.isMobile) {
      return `${base} px-2 py-2 text-sm`
    } else {
      return `${base} px-3 py-2 text-sm`
    }
  }, [isDarkMode, deviceInfo, selectedMake])

  return (
    <div className="mb-4 animate-fade-in">
      <div className="space-y-2">
        <div className={`flex ${deviceInfo.isMobile ? 'gap-1' : 'gap-2'}`}>
          <input
            type="text"
            placeholder="Search colors, makes, models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={inputClasses}
            aria-label="Search colors"
          />
          <button
            onClick={handleFavoritesToggle}
            className={buttonClasses}
            aria-label={selectedMake === 'FAVORITES' ? 'Show all colors' : 'Show favorites only'}
          >
            ❤️ {favorites.length}
          </button>
        </div>
        <div className={`grid grid-cols-2 ${deviceInfo.isMobile ? 'gap-1' : 'gap-2'}`}>
          <select
            value={selectedMake === 'FAVORITES' ? '' : selectedMake}
            onChange={(e) => setSelectedMake(e.target.value)}
            disabled={selectedMake === 'FAVORITES'}
            className={selectClasses}
            aria-label="Filter by manufacturer"
          >
            <option value="">All Makes</option>
            {makes.map(make => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>
          <select
            value={selectedMake === 'FAVORITES' ? '' : selectedColorType}
            onChange={(e) => setSelectedColorType(e.target.value)}
            disabled={selectedMake === 'FAVORITES'}
            className={selectClasses}
            aria-label="Filter by color type"
          >
            <option value="">All Types</option>
            {colorTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
})

OptimizedSearchControls.displayName = 'OptimizedSearchControls'

export default OptimizedSearchControls