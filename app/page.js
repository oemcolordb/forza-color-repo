'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { createForzaGradient, hsbToCSS, formatHSBValues } from './lib/colorUtils'
import Header from './components/Header'
import Footer from './components/Footer'
import ColorStats from './components/ColorStats'
import MobileColorStats from './components/MobileColorStats'
import ShareButton from './components/ShareButton'
import ExportButton from './components/ExportButton'
import { SecurityHeaders } from './components/SecurityHeaders'
import { useAnalytics } from './hooks/useAnalytics'
import { usePerformance } from './hooks/usePerformance'
import VirtualizedColorGrid from './components/VirtualizedColorGrid'
import OptimizedVirtualGrid from './components/OptimizedVirtualGrid'
import OptimizedStatsBar from './components/OptimizedStatsBar'
import OptimizedSearchControls from './components/OptimizedSearchControls'
import ResponsiveLayout from './components/ResponsiveLayout'
import ModelBrowser from './components/ModelBrowser'
import LoadingSpinner from './components/LoadingSpinner'
import ImageColorExtractor from './components/ImageColorExtractor'
import ColorRouletteHarmony from './components/ColorRouletteHarmony'

import TokyoBackground from './components/TokyoBackground'
import { AuthProvider } from './components/AuthProvider'
import AuthModal from './components/AuthModal'
import CollapsibleSection from './components/CollapsibleSection'
import Car3DViewer from './components/Car3DViewer'
import PaintEffect3D from './components/PaintEffect3D'
import DiscordIntegration from './components/DiscordIntegration'
import OfflineIndicator from './components/OfflineIndicator'
import PerformanceMonitor from './components/PerformanceMonitor'
import ProgressiveLoader from './components/ProgressiveLoader'
import CriticalCSS from './components/CriticalCSS'
import { useOfflineStorage } from './hooks/useOfflineStorage'
import { useDeviceDetection } from './hooks/useDeviceDetection'
import HarmonyVisualizer from './components/HarmonyVisualizer'
import ColorGenerator from './components/ColorGenerator'
import GamingSEO from './components/GamingSEO'
import MobileGamingOptimizer from './components/MobileGamingOptimizer'
import GamingErrorBoundary from './components/GamingErrorBoundary'

export default function HomePage() {
  const [colors, setColors] = useState([])
  const [loading, setLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMake, setSelectedMake] = useState('')
  const [selectedColorType, setSelectedColorType] = useState('')
  const [displayedColors, setDisplayedColors] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [selectedColor, setSelectedColor] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [colorHistory, setColorHistory] = useState([])
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [tokyoBackground, setTokyoBackground] = useState('')
  const [page, setPage] = useState(1)
  const [imageMatchedColors, setImageMatchedColors] = useState([])
  const [showImageExtractor, setShowImageExtractor] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [extractedColors, setExtractedColors] = useState([])
  const [harmonyColors, setHarmonyColors] = useState([])
  const [harmonyMode, setHarmonyMode] = useState('')
  const [allColors, setAllColors] = useState([]) // Original + Generated
  const [loadingProgress, setLoadingProgress] = useState(0)
  const deviceInfo = useDeviceDetection()
  const ITEMS_PER_PAGE = deviceInfo.isMobile ? 30 : 60
  const { track } = useAnalytics()
  const { measureAsync } = usePerformance()
  const { isOnline, cacheColors, getOfflineColors } = useOfflineStorage()

  // Create favorites set for O(1) lookup
  const favoritesSet = useMemo(() => new Set(favorites), [favorites])

  // Handle generated colors
  const handleColorsGenerated = (newColors) => {
    const updatedColors = [...colors, ...newColors]
    setColors(updatedColors)
    setAllColors(updatedColors)
  }

  // Filter colors based on search and selections
  const filteredColors = useMemo(() => {
    if (selectedMake === 'FAVORITES') {
      return allColors.filter(color => {
        const colorId = `${color.make}-${color.colorName}-${color.year || 'unknown'}`
        return favoritesSet.has(colorId)
      })
    }
    
    const filtered = allColors.filter(color => {
      const matchesSearch = !searchQuery || 
        color.colorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        color.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (color.model && color.model.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesMake = !selectedMake || color.make === selectedMake
      const matchesType = !selectedColorType || color.colorType === selectedColorType
      
      return matchesSearch && matchesMake && matchesType
    })
    
    return filtered
  }, [allColors, searchQuery, selectedMake, selectedColorType, favoritesSet])


  
  useEffect(() => {
    const loadColors = async () => {
      try {
        const { getColorData } = await import('../services/colorDataLazy.js')
        const originalColors = await getColorData()
        setColors(originalColors)
        setAllColors(originalColors)
        setLoadingProgress(100)
        setLoading(false)
        setIsInitialLoad(false)
      } catch (error) {
        console.error('Failed to load colors:', error)
        setColors([])
        setAllColors([])
        setLoading(false)
        setIsInitialLoad(false)
      }
    }
    
    loadColors()
  }, [])

  // Memoized data for performance
  const makes = useMemo(() => {
    return Array.from(new Set(allColors.map(c => c.make))).sort()
  }, [allColors])
  
  const colorTypes = useMemo(() => {
    return Array.from(new Set(allColors.map(c => c.colorType).filter(type => type && type.trim())))
      .sort()
  }, [allColors])

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('forza-favorites')
      if (saved) {
        setFavorites(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Failed to load favorites:', error)
    }
  }, [])

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('forza-favorites', JSON.stringify(favorites))
    } catch (error) {
      console.error('Failed to save favorites:', error)
    }
  }, [favorites])



  // Toggle favorite function
  const toggleFavorite = useCallback((colorId) => {
    setFavorites(prev => {
      if (prev.includes(colorId)) {
        return prev.filter(id => id !== colorId)
      } else {
        return [...prev, colorId]
      }
    })
  }, [])

  // Handle color selection with history tracking
  const handleColorSelect = useCallback((color) => {
    setSelectedColor(color)
    setColorHistory(prev => {
      const colorId = `${color.make}-${color.colorName}-${color.year || 'unknown'}`
      const filtered = prev.filter(id => id !== colorId)
      return [colorId, ...filtered.slice(0, 49)] // Keep last 50
    })
  }, [])

  if (isInitialLoad) {
    return (
      <div className="critical-loading">
        <div className="text-center">
          <div className="critical-spinner mb-4 mx-auto"></div>
          <p className="text-xl font-semibold mb-2">🎨 OEMColorDB</p>
          <p className="opacity-70">Preparing your color universe...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthProvider>
      <CriticalCSS />
      <GamingErrorBoundary>
        <GamingSEO isDarkMode={isDarkMode} deviceInfo={deviceInfo} />
        <MobileGamingOptimizer deviceInfo={deviceInfo} />
      </GamingErrorBoundary>
      <div className={`font-sans min-h-screen ${
        isDarkMode 
          ? 'bg-gray-900 text-gray-100' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        <SecurityHeaders />
        <Header isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} onShowAuth={() => setShowAuthModal(true)} />
        
        <TokyoBackground isDarkMode={isDarkMode} />
        <ProgressiveLoader progress={loadingProgress} isDarkMode={isDarkMode} deviceInfo={deviceInfo} />
        
        <ResponsiveLayout>
          {/* Header Stats Bar */}
          <OptimizedStatsBar
            totalColors={allColors.length}
            totalMakes={makes.length}
            favorites={favorites.length}
            colorHistory={colorHistory.length}
            filteredCount={filteredColors.length}
            isDarkMode={isDarkMode}
            deviceInfo={deviceInfo}
          />
          
          {/* Tool Sections */}
          <GamingErrorBoundary>
            <div className={`grid gap-3 mb-4 ${
              deviceInfo.isMobile 
                ? 'grid-cols-1' 
                : deviceInfo.isTablet 
                ? 'grid-cols-2' 
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}>
              <ImageColorExtractor
                colors={allColors}
                onColorsExtracted={setExtractedColors}
                onColorsFound={() => {}}
                onColorSelect={handleColorSelect}
                isDarkMode={isDarkMode}
              />
              
              <ColorRouletteHarmony
                colors={allColors}
                isDarkMode={isDarkMode}
                onColorSelect={handleColorSelect}
                onHarmonyGenerated={(colors, mode) => {
                  setHarmonyColors(colors)
                  setHarmonyMode(mode)
                }}
              />
              
              {!deviceInfo.isMobile && (
                <HarmonyVisualizer
                  currentHarmony={harmonyColors}
                  harmonyMode={harmonyMode}
                  isDarkMode={isDarkMode}
                  onColorSelect={handleColorSelect}
                />
              )}
            </div>
          </GamingErrorBoundary>
          
          {/* Color Generator - Full Width */}
          <GamingErrorBoundary>
            <ColorGenerator
              colors={colors}
              isDarkMode={isDarkMode}
              onColorsGenerated={handleColorsGenerated}
              isMobile={deviceInfo.isMobile}
            />
          </GamingErrorBoundary>
          
          {/* Results Display */}
          {(extractedColors.length > 0 || harmonyColors.length > 0) && (
            <div className={`mb-4 rounded-lg backdrop-blur-sm shadow-lg animate-slide-up ${
              isDarkMode ? 'bg-slate-800/90' : 'bg-gray-50/95'
            } ${
              deviceInfo.isMobile ? 'p-2' : 'p-3'
            }`}>
              {extractedColors.length > 0 && (
                <div className={deviceInfo.isMobile ? 'mb-2' : 'mb-3'}>
                  <h3 className={`font-semibold mb-2 text-readable ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                    deviceInfo.isMobile ? 'text-sm' : 'text-sm'
                  }`}>
                    🎨 Extracted Colors
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {extractedColors.slice(0, deviceInfo.isMobile ? 6 : 8).map((color, index) => (
                      <div
                        key={index}
                        className={`rounded border border-gray-300 gpu-accelerated ${
                          deviceInfo.isMobile ? 'w-6 h-6' : 'w-8 h-8'
                        }`}
                        style={{
                          backgroundColor: `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`
                        }}
                        title={`${color.percentage}%`}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {harmonyColors.length > 0 && (
                <div>
                  <h3 className={`font-semibold mb-2 text-readable ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                    deviceInfo.isMobile ? 'text-sm' : 'text-sm'
                  }`}>
                    🎰 Harmony Colors
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {harmonyColors.slice(0, deviceInfo.isMobile ? 4 : 6).map((color, index) => (
                      <button
                        key={index}
                        onClick={() => handleColorSelect(color)}
                        className={`rounded border border-gray-300 hover:border-blue-500 transition-colors gpu-accelerated focus-visible ${
                          deviceInfo.isMobile ? 'w-6 h-6' : 'w-8 h-8'
                        }`}
                        style={{
                          background: `hsl(${color.color1.h * 360}, ${color.color1.s * 100}%, ${color.color1.b * 100}%)`
                        }}
                        title={`${color.colorName} - ${color.make}`}
                        aria-label={`Select ${color.colorName} from ${color.make}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search Controls */}
          <OptimizedSearchControls
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedMake={selectedMake}
            setSelectedMake={setSelectedMake}
            selectedColorType={selectedColorType}
            setSelectedColorType={setSelectedColorType}
            favorites={favorites}
            makes={makes}
            colorTypes={colorTypes}
            isDarkMode={isDarkMode}
            deviceInfo={deviceInfo}
          />
          
          {filteredColors.length > 0 ? (
            deviceInfo.isDesktop && filteredColors.length > 100 ? (
              <OptimizedVirtualGrid
                colors={filteredColors}
                favorites={favorites}
                onColorSelect={handleColorSelect}
                onToggleFavorite={toggleFavorite}
                isDarkMode={isDarkMode}
                deviceInfo={deviceInfo}
              />
            ) : (
              <VirtualizedColorGrid
                colors={filteredColors}
                favorites={favorites}
                onColorSelect={handleColorSelect}
                onToggleFavorite={toggleFavorite}
                isDarkMode={isDarkMode}
                isMobile={deviceInfo.isMobile}
              />
            )
          ) : (
            <div className={`text-center ${deviceInfo.isMobile ? 'py-8' : 'py-12'}`}>
              <p className={`text-readable ${deviceInfo.isMobile ? 'text-base' : 'text-lg'} ${
                isDarkMode ? 'text-slate-300' : 'text-gray-600'
              }`}>
                {colors.length === 0 ? 'Loading colors...' : 'No colors found matching your search.'}
              </p>
              {searchQuery || selectedMake || selectedColorType ? (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedMake('')
                    setSelectedColorType('')
                  }}
                  className={`mt-4 px-4 py-2 rounded-lg transition-colors focus-visible ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Clear Filters
                </button>
              ) : null}
            </div>
          )}
        </ResponsiveLayout>

        {/* Color Info Modal */}
        {selectedColor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedColor(null)}>
            <div 
              className={`w-full rounded-lg shadow-xl animate-scale-in gpu-accelerated ${
                deviceInfo.isMobile ? 'max-w-sm' : 'max-w-md'
              } ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={deviceInfo.isMobile ? 'p-3' : 'p-4'}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className={`font-bold text-readable ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                    deviceInfo.isMobile ? 'text-base' : 'text-lg'
                  }`}>
                    {selectedColor.colorName}
                  </h3>
                  <button
                    onClick={() => setSelectedColor(null)}
                    className={`transition-colors focus-visible ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'} ${
                      deviceInfo.isMobile ? 'text-lg' : 'text-xl'
                    }`}
                    aria-label="Close modal"
                  >
                    ×
                  </button>
                </div>
                
                <div className={`grid grid-cols-3 mb-4 ${deviceInfo.isMobile ? 'gap-1' : 'gap-2'}`}>
                  <div className="text-center">
                    <div 
                      className={`w-full rounded border-2 border-gray-300 mb-1 gpu-accelerated ${
                        deviceInfo.isMobile ? 'h-12' : 'h-16'
                      }`}
                      style={{ background: `hsl(${selectedColor.color1.h * 360}, ${selectedColor.color1.s * 100}%, ${selectedColor.color1.b * 100}%)` }}
                      role="img"
                      aria-label="Primary color"
                    />
                    <div className={`text-readable-tight ${isDarkMode ? 'text-slate-300' : 'text-gray-600'} ${
                      deviceInfo.isMobile ? 'text-2xs' : 'text-xs'
                    }`}>Color 1</div>
                    <div className={`font-mono text-readable-tight ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} ${
                      deviceInfo.isMobile ? 'text-2xs' : 'text-xs'
                    }`}>
                      {selectedColor.color1.h.toFixed(2)} {selectedColor.color1.s.toFixed(2)} {selectedColor.color1.b.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div 
                      className={`w-full rounded border-2 border-gray-300 mb-1 gpu-accelerated ${
                        deviceInfo.isMobile ? 'h-12' : 'h-16'
                      }`}
                      style={{ background: `hsl(${selectedColor.color2.h * 360}, ${selectedColor.color2.s * 100}%, ${selectedColor.color2.b * 100}%)` }}
                      role="img"
                      aria-label="Secondary color"
                    />
                    <div className={`text-readable-tight ${isDarkMode ? 'text-slate-300' : 'text-gray-600'} ${
                      deviceInfo.isMobile ? 'text-2xs' : 'text-xs'
                    }`}>Color 2</div>
                    <div className={`font-mono text-readable-tight ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} ${
                      deviceInfo.isMobile ? 'text-2xs' : 'text-xs'
                    }`}>
                      {selectedColor.color2.h.toFixed(2)} {selectedColor.color2.s.toFixed(2)} {selectedColor.color2.b.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div 
                      className={`w-full rounded border-2 border-gray-300 mb-1 gpu-accelerated ${
                        deviceInfo.isMobile ? 'h-12' : 'h-16'
                      }`}
                      style={{ background: createForzaGradient(selectedColor.color1, selectedColor.color2) }}
                      role="img"
                      aria-label="Blended color"
                    />
                    <div className={`text-readable-tight ${isDarkMode ? 'text-slate-300' : 'text-gray-600'} ${
                      deviceInfo.isMobile ? 'text-2xs' : 'text-xs'
                    }`}>Blend</div>
                  </div>
                </div>
                
                <div className={`space-y-2 text-readable ${deviceInfo.isMobile ? 'text-sm' : 'text-sm'}`}>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-slate-300' : 'text-gray-600'}>Make:</span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedColor.make}</span>
                  </div>
                  {selectedColor.model && (
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-slate-300' : 'text-gray-600'}>Model:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedColor.model}</span>
                    </div>
                  )}
                  {selectedColor.year && (
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-slate-300' : 'text-gray-600'}>Year:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedColor.year}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-slate-300' : 'text-gray-600'}>Type:</span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedColor.colorType}</span>
                  </div>
                </div>
                
                <div className={`flex gap-2 ${deviceInfo.isMobile ? 'mt-3' : 'mt-4'}`}>
                  <button
                    onClick={() => {
                      const colorId = `${selectedColor.make}-${selectedColor.colorName}-${selectedColor.year || 'unknown'}`
                      toggleFavorite(colorId)
                    }}
                    className={`flex-1 rounded-lg font-medium transition-colors focus-visible ${
                      deviceInfo.isMobile ? 'py-2 px-3 text-sm' : 'py-2 px-4'
                    } ${
                      favorites.includes(`${selectedColor.make}-${selectedColor.colorName}-${selectedColor.year || 'unknown'}`)
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : isDarkMode
                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                    aria-label={favorites.includes(`${selectedColor.make}-${selectedColor.colorName}-${selectedColor.year || 'unknown'}`) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {favorites.includes(`${selectedColor.make}-${selectedColor.colorName}-${selectedColor.year || 'unknown'}`) ? '❤️ Favorited' : '🤍 Add to Favorites'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Footer isDarkMode={isDarkMode} />
        
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          isDarkMode={isDarkMode} 
        />
        
        <PerformanceMonitor isDarkMode={isDarkMode} deviceInfo={deviceInfo} />
      </div>
    </AuthProvider>
  )
}