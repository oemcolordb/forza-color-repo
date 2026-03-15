'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { CarColor, DeviceInfo, ExtractedColor } from './types'
import { ErrorBoundary } from './lib/errorBoundary'
import { cache } from './lib/cache'
import { sanitizeSearchQuery, handleError } from './lib/validation'

import Header from './components/Header'
import Footer from './components/Footer'
import SimpleColorGrid from './components/SimpleColorGrid'
import VirtualColorGrid from './components/VirtualColorGrid'
import { indexedDBManager } from './lib/indexedDB'
import OptimizedSearchControls from './components/OptimizedSearchControls'
import ImageColorExtractor from './components/ImageColorExtractor'
import ResponsiveLayout from './components/ResponsiveLayout'
import TokyoBackground from './components/TokyoBackground'
import { useAnalytics } from './hooks/useAnalytics'
import { usePerformance } from './hooks/usePerformance'
import { useOfflineStorage } from './hooks/useOfflineStorage'
import { useDeviceDetection } from './hooks/useDeviceDetection'
import { getSecureAssetUrl } from './lib/assetProtection'

import ProgressiveLoader from './components/ProgressiveLoader'
import ColorRouletteHarmony from './components/ColorRouletteHarmony'
import HarmonyVisualizer from './components/HarmonyVisualizer'
import ColorGenerator from './components/ColorGenerator'
import PerformanceMonitor from './components/PerformanceMonitor'
import GamingErrorBoundary from './components/GamingErrorBoundary'
import GamingSEO from './components/GamingSEO'
import MobileGamingOptimizer from './components/MobileGamingOptimizer'
import HSBPopup from './components/HSBPopup'
import AdvancedTools from './components/AdvancedTools'
import ForzaColorSheetSEO from './components/ForzaColorSheetSEO'
import ColorComparison from './components/ColorComparison'

import KeyboardShortcuts from './components/KeyboardShortcuts'
import ColorAnalyticsDashboard from './components/ColorAnalyticsDashboard'
import ZoomResponsiveContainer from './components/ZoomResponsiveContainer'

export default function HomePage() {
  const [colors, setColors] = useState<CarColor[]>([])
  const [loading, setLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMake, setSelectedMake] = useState('')
  const [selectedColorType, setSelectedColorType] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([])
  const [harmonyColors, setHarmonyColors] = useState<CarColor[]>([])
  const [harmonyMode, setHarmonyMode] = useState('')
  const [allColors, setAllColors] = useState<CarColor[]>([]) // Original + Generated
  const [loadingProgress, setLoadingProgress] = useState<number>(0)
  const [showManufacturerBorders, setShowManufacturerBorders] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hsbPopupColor, setHsbPopupColor] = useState<CarColor | null>(null)
  const [showHsbPopup, setShowHsbPopup] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [compareSelectedColors, setCompareSelectedColors] = useState<CarColor[]>([])
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const deviceInfo: DeviceInfo = useDeviceDetection()

  useAnalytics()
  usePerformance()
  useOfflineStorage()

  // Create favorites set for O(1) lookup
  const favoritesSet = useMemo(() => new Set(favorites), [favorites])

  // Handle generated colors with error handling
  const handleColorsGenerated = useCallback(
    (newColors: CarColor[]) => {
      try {
        const updatedColors = [...colors, ...newColors]
        setColors(updatedColors)
        setAllColors(updatedColors)
        cache.set('generated-colors', updatedColors)
      } catch (err) {
        const error = handleError(err)
        setError(error.message)
      }
    },
    [colors]
  )

  // Filter colors with caching and sanitization
  const filteredColors = useMemo(() => {
    const cacheKey = `filtered-${selectedMake}-${selectedColorType}-${searchQuery}-${showFavoritesOnly ? 'fav' : 'all'}`
    const cached = cache.get<CarColor[]>(cacheKey)
    if (cached && allColors.length > 0) {
      return cached
    }

    let result: CarColor[]

    if (!searchQuery && !selectedMake && !selectedColorType && !showFavoritesOnly) {
      result = allColors
    } else {
      const sanitizedQuery = sanitizeSearchQuery(searchQuery)
      const searchLower = sanitizedQuery.toLowerCase()

      result = allColors.filter(color => {
        const matchesSearch =
          !sanitizedQuery ||
          color.colorName.toLowerCase().includes(searchLower) ||
          color.make.toLowerCase().includes(searchLower) ||
          (color.model && color.model.toLowerCase().includes(searchLower))

        const matchesMake = !selectedMake || color.make === selectedMake
        const matchesType = !selectedColorType || color.colorType === selectedColorType

        const colorId = `${color.make}-${color.colorName}-${color.year || 'unknown'}`
        const matchesFavorites = !showFavoritesOnly || favoritesSet.has(colorId)

        return matchesSearch && matchesMake && matchesType && matchesFavorites
      })
    }

    if (allColors.length > 0) {
      cache.set(cacheKey, result, 2 * 60 * 1000) // Cache for 2 minutes
    }
    return result
  }, [allColors, searchQuery, selectedMake, selectedColorType, favoritesSet, showFavoritesOnly])

  useEffect(() => {
    const loadColors = async () => {
      try {
        // Check cache first
        const cachedColors = cache.get<CarColor[]>('color-data')
        if (cachedColors) {
          setColors(cachedColors)
          setAllColors(cachedColors)
          setLoadingProgress(100)
          setLoading(false)
          setIsInitialLoad(false)
          return
        }

        const { getColorData } = await import('../services/colorDataLazy')
        const originalColors = await getColorData()

        // Validate data
        if (!Array.isArray(originalColors)) {
          throw new Error('Invalid color data format')
        }

        setColors(originalColors)
        setAllColors(originalColors)
        cache.set('color-data', originalColors, 10 * 60 * 1000) // Cache for 10 minutes
        setLoadingProgress(100)
        setLoading(false)
        setIsInitialLoad(false)
      } catch (err) {
        const error = handleError(err)
        setError(error.message)
        setColors([])
        setAllColors([])
        setLoading(false)
        setIsInitialLoad(false)
      }
    }

    // Fallback timeout
    const timeout = setTimeout(() => {
      if (loading) {
        setError('Loading timeout - please refresh the page')
        setLoading(false)
        setIsInitialLoad(false)
      }
    }, 15000)

    loadColors()

    return () => clearTimeout(timeout)
  }, [loading])

  // Memoized data for performance
  const makes = useMemo(() => {
    if (!allColors || !Array.isArray(allColors)) return []
    return Array.from(new Set(allColors.map(c => c.make))).sort()
  }, [allColors])

  const colorTypes = useMemo(() => {
    if (!allColors || !Array.isArray(allColors)) return []
    return Array.from(
      new Set(allColors.map(c => c.colorType).filter(type => type && type.trim()))
    ).sort()
  }, [allColors])

  // Load favorites from IndexedDB with localStorage fallback
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        // Try IndexedDB first
        const dbFavorites = await indexedDBManager.getFavorites()
        if (dbFavorites.length > 0) {
          setFavorites(dbFavorites)
          return
        }

        // Fallback to localStorage
        const saved = localStorage.getItem('forza-favorites')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            setFavorites(parsed)
            // Migrate to IndexedDB
            await indexedDBManager.storeFavorites(parsed)
          }
        }
      } catch (err) {
        handleError(err)
        setFavorites([])
      }
    }

    loadFavorites()
  }, [])

  // Save favorites to IndexedDB and localStorage
  useEffect(() => {
    const saveFavorites = async () => {
      try {
        // Save to IndexedDB
        await indexedDBManager.storeFavorites(favorites)
        // Keep localStorage as backup
        localStorage.setItem('forza-favorites', JSON.stringify(favorites))
      } catch (err) {
        handleError(err)
        setError('Failed to save favorites')
      }
    }

    if (favorites.length > 0) {
      saveFavorites()
    }
  }, [favorites])

  // Toggle favorite function
  const toggleFavorite = useCallback((colorId: string) => {
    setFavorites(prev => {
      if (prev.includes(colorId)) {
        return prev.filter(id => id !== colorId)
      } else {
        return [...prev, colorId]
      }
    })
  }, [])

  // Show HSB popup for color data
  const showColorHSB = useCallback((color: CarColor) => {
    setHsbPopupColor(color)
    setShowHsbPopup(true)
  }, [])

  // Handle color selection with history tracking
  const handleColorSelect = useCallback(
    (color: CarColor) => {
      const colorId = `${color.make}-${color.colorName}-${color.year || 'unknown'}`
      setExpandedColorId(expandedColorId === colorId ? null : colorId)
      setColorHistory(prev => {
        const filtered = prev.filter(id => id !== colorId)
        return [colorId, ...filtered.slice(0, 49)] // Keep last 50
      })
    },
    [expandedColorId]
  )

  if (isInitialLoad) {
    const videoUrl =
      '/Mp%204%20H%20280%203%20Q%20Nlf%203%20J%20O%20Aem%208%20Kv%20Cu%20Uuya%20AN%20Cr%20O%20Du%20C%20Qs%2063%20S%20Vq%20Z%20Rad%206%20O%2011%20BZ.mp4'

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Background Video */}
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={videoUrl} type="video/mp4" />
        </video>

        {/* Forge Background Glow */}
        <div className="absolute inset-0 bg-gradient-radial from-orange-600/20 via-red-600/10 to-transparent animate-pulse"></div>

        {/* Anvil Background */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 opacity-20">
          <svg width="200" height="120" viewBox="0 0 200 120" className="fill-gray-600">
            <path d="M20 80 L180 80 L180 90 L170 100 L30 100 L20 90 Z" />
            <path d="M40 60 L160 60 L160 80 L40 80 Z" />
            <path d="M160 50 L180 50 L185 60 L180 70 L160 70 Z" />
            <circle cx="100" cy="40" r="8" className="fill-gray-500" />
          </svg>
        </div>

        <div className="text-center z-10">
          <div className="relative mb-8">
            {/* Engine Block */}
            <div className="w-32 h-24 mx-auto relative">
              <svg className="w-full h-full" viewBox="0 0 120 80">
                <defs>
                  <linearGradient id="engineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6b7280" />
                    <stop offset="50%" stopColor="#4b5563" />
                    <stop offset="100%" stopColor="#374151" />
                  </linearGradient>
                  <linearGradient id="pistonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                  <filter id="engineGlow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Engine Block */}
                <rect
                  x="10"
                  y="30"
                  width="100"
                  height="40"
                  rx="5"
                  fill="url(#engineGradient)"
                  filter="url(#engineGlow)"
                />

                {/* Cylinder Heads */}
                <rect x="15" y="25" width="15" height="10" rx="2" fill="#4b5563" />
                <rect x="35" y="25" width="15" height="10" rx="2" fill="#4b5563" />
                <rect x="55" y="25" width="15" height="10" rx="2" fill="#4b5563" />
                <rect x="75" y="25" width="15" height="10" rx="2" fill="#4b5563" />
                <rect x="95" y="25" width="10" height="10" rx="2" fill="#4b5563" />

                {/* Animated Pistons */}
                {[0, 1, 2, 3, 4].map(i => {
                  const x = 17.5 + i * 20
                  const delay = i * 0.2
                  return (
                    <g key={i}>
                      <rect
                        x={x}
                        y="15"
                        width="5"
                        height="15"
                        rx="1"
                        fill="url(#pistonGradient)"
                        filter="url(#engineGlow)"
                        className="animate-bounce"
                        style={{
                          animationDuration: '1s',
                          animationDelay: `${delay}s`,
                          transformOrigin: 'center bottom',
                        }}
                      />
                      {/* Connecting Rod */}
                      <line
                        x1={x + 2.5}
                        y1="30"
                        x2={x + 2.5}
                        y2="15"
                        stroke="#9ca3af"
                        strokeWidth="1.5"
                        className="animate-pulse"
                        style={{
                          animationDuration: '1s',
                          animationDelay: `${delay}s`,
                        }}
                      />
                    </g>
                  )
                })}

                {/* Crankshaft */}
                <ellipse cx="60" cy="55" rx="45" ry="3" fill="#1f2937" opacity="0.8" />
                <rect x="15" y="53" width="90" height="4" rx="2" fill="#374151" />

                {/* Engine Details */}
                <circle
                  cx="25"
                  cy="50"
                  r="3"
                  fill="#ef4444"
                  opacity="0.8"
                  className="animate-pulse"
                />
                <circle
                  cx="95"
                  cy="50"
                  r="3"
                  fill="#10b981"
                  opacity="0.8"
                  className="animate-pulse"
                  style={{ animationDelay: '0.5s' }}
                />

                {/* Exhaust Pipes */}
                <rect x="110" y="35" width="8" height="3" rx="1" fill="#6b7280" />
                <rect x="110" y="42" width="8" height="3" rx="1" fill="#6b7280" />
                <rect x="110" y="49" width="8" height="3" rx="1" fill="#6b7280" />
              </svg>
            </div>

            {/* Exhaust Smoke */}
            <div className="absolute top-0 right-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-gray-400 rounded-full opacity-60 animate-ping"
                  style={{
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: '2s',
                    position: 'absolute',
                    top: `${i * 8}px`,
                    right: `${i * 2}px`,
                  }}
                />
              ))}
            </div>

            {/* RPM Gauge */}
            <div className="absolute top-2 left-8 w-8 h-8">
              <svg className="w-full h-full" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="none" stroke="#374151" strokeWidth="2" />
                <circle cx="20" cy="20" r="15" fill="#1f2937" />
                <line
                  x1="20"
                  y1="20"
                  x2="20"
                  y2="8"
                  stroke="#ef4444"
                  strokeWidth="2"
                  className="animate-spin"
                  style={{ animationDuration: '0.5s', transformOrigin: '20px 20px' }}
                />
                <circle cx="20" cy="20" r="2" fill="#ef4444" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-yellow-400 to-red-400 text-transparent bg-clip-text animate-pulse">
            🔧 TuneForge Loading...
          </h1>
          <p className="text-lg mb-4" style={{color: "var(--bamboo-paper)"}}>Forging your automotive experience...</p>

          {/* Loading Bar */}
          <div className="w-64 h-3 rounded-full mx-auto mb-4 overflow-hidden bamboo-surface-dark">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full animate-pulse"
              style={{ width: `${loadingProgress}%`, transition: 'width 0.3s ease' }}
            ></div>
          </div>

          {/* Sparks Animation */}
          <div className="flex justify-center items-center gap-1 mt-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-1 bg-yellow-400 rounded-full animate-ping"
                style={{ animationDelay: `${i * 200}ms`, animationDuration: '1s' }}
              ></div>
            ))}
          </div>

          <p className="text-sm text-orange-300 mt-2 opacity-75">
            {loadingProgress < 30 && 'Heating the forge...'}
            {loadingProgress >= 30 && loadingProgress < 60 && 'Shaping the gears...'}
            {loadingProgress >= 60 && loadingProgress < 90 && 'Tempering the steel...'}
            {loadingProgress >= 90 && 'Almost ready...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <GamingErrorBoundary>
        <GamingSEO isDarkMode={isDarkMode} deviceInfo={deviceInfo} />
        <ForzaColorSheetSEO
          colorCount={allColors.length}
          manufacturerCount={makes.length}
          isDarkMode={isDarkMode}
        />
        <MobileGamingOptimizer deviceInfo={deviceInfo} />
      </GamingErrorBoundary>
      <div
        className={`font-sans min-h-screen ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}
      >
        <Header
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        />

        {/* Error Display */}
        {error && (
          <div
            className={`mx-4 mb-4 p-3 rounded-lg border ${
              isDarkMode
                ? 'bg-red-900/30 border-red-700 text-red-200'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span className="font-medium">Error:</span>
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className={`ml-auto px-2 py-1 text-xs rounded ${
                  isDarkMode ? 'bg-red-800 hover:bg-red-700' : 'bg-red-200 hover:bg-red-300'
                }`}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <TokyoBackground isDarkMode={isDarkMode} getSecureAssetUrl={getSecureAssetUrl} />
        <ProgressiveLoader
          progress={loadingProgress}
          isDarkMode={isDarkMode}
          deviceInfo={deviceInfo}
        />

        {/* TuneForge Quick Access */}
        <div className="fixed bottom-6 right-6 z-40">
          <a
            href="/tuneforge"
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-full shadow-lg transition-all transform hover:scale-105"
            title="Open TuneForge Lab"
          >
            🔧 TuneForge
          </a>
        </div>

        <ErrorBoundary
          onError={error => {
            setError(error.message)
          }}
        >
          <ResponsiveLayout>
            {/* Garage Stats */}
            <div
              className={`relative mb-6 rounded-xl overflow-hidden p-4 ${
                isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🏁</span>
                <span className="font-bold" style={{color: "var(--bamboo-stalk)"}}>
                  FORZA GARAGE
                </span>
              </div>
              <div className="text-sm opacity-90">
                {allColors.length} colors • {makes.length} manufacturers • {favorites.length}{' '}
                favorites
              </div>
            </div>

            {/* Tuning Tools */}
            <div
              className={`relative mb-6 rounded-xl overflow-hidden p-4 ${
                isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🔧</span>
                <span className="font-bold" style={{color: "var(--bamboo-stalk)"}}>
                  TUNING TOOLS
                </span>
              </div>
              <GamingErrorBoundary>
                <div
                  className={`grid gap-3 ${
                    deviceInfo.isMobile
                      ? 'grid-cols-1'
                      : deviceInfo.isTablet
                        ? 'grid-cols-2'
                        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg border ${isDarkMode ? 'bamboo-surface-dark border-gray-700' : 'bamboo-surface border-gray-300'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">📸</span>
                      <span
                        className="text-sm font-semibold"
                        style={{color: "var(--bamboo-stalk)"}}
                      >
                        PAINT SCANNER
                      </span>
                    </div>
                    <ImageColorExtractor
                      colors={allColors}
                      onColorsExtracted={setExtractedColors}
                      onColorsFound={() => {}}
                      onColorSelect={showColorHSB}
                      isDarkMode={isDarkMode}
                    />
                    <div className="mt-2 text-xs text-center">
                      <a href="/image-match" className="hover:underline" style={{color: "var(--bamboo-stalk)"}}>
                        Try standalone image‑to‑paint tool
                      </a>
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-lg border ${isDarkMode ? 'bamboo-surface-dark border-gray-700' : 'bamboo-surface border-gray-300'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🎰</span>
                      <span
                        className="text-sm font-semibold"
                        style={{color: "var(--bamboo-stalk)"}}
                      >
                        COLOR ROULETTE
                      </span>
                    </div>
                    <ColorRouletteHarmony
                      colors={allColors}
                      isDarkMode={isDarkMode}
                      onColorSelect={showColorHSB}
                      onHarmonyGenerated={(colors: CarColor[], mode: string) => {
                        setHarmonyColors(colors)
                        setHarmonyMode(mode)
                      }}
                    />
                  </div>

                  <div
                    className={`p-3 rounded-lg border ${isDarkMode ? 'bamboo-surface-dark border-gray-700' : 'bamboo-surface border-gray-300'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🎨</span>
                      <span
                        className="text-sm font-semibold"
                        style={{color: "var(--bamboo-stalk)"}}
                      >
                        HARMONY DISPLAY
                      </span>
                    </div>
                    <HarmonyVisualizer
                      currentHarmony={harmonyColors}
                      harmonyMode={harmonyMode}
                      isDarkMode={isDarkMode}
                      onColorSelect={showColorHSB}
                    />
                  </div>
                </div>
              </GamingErrorBoundary>
            </div>

            {/* Paint Booth */}
            <div
              className={`relative mb-6 rounded-xl overflow-hidden p-4 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-green-900/50 to-teal-900/50'
                  : 'bg-gradient-to-r from-green-100 to-teal-100'
              } border-2 ${isDarkMode ? 'border-green-500/30' : 'border-green-400/40'}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🎨</span>
                <span className={`font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  PAINT BOOTH
                </span>
              </div>
              <GamingErrorBoundary>
                <ColorGenerator
                  colors={colors}
                  isDarkMode={isDarkMode}
                  onColorsGenerated={handleColorsGenerated}
                  isMobile={deviceInfo.isMobile}
                />
              </GamingErrorBoundary>
            </div>

            {/* Advanced Tools */}
            {allColors.length > 0 && (
              <div
                className={`relative mb-6 rounded-xl overflow-hidden p-4 ${
                  isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🛠️</span>
                  <span
                    className="font-bold"
                    style={{color: "var(--bamboo-stalk)"}}
                  >
                    ADVANCED TOOLS
                  </span>
                </div>
                <GamingErrorBoundary>
                  <AdvancedTools
                    colors={allColors}
                    isDarkMode={isDarkMode}
                    isMobile={deviceInfo.isMobile}
                    onColorSelect={showColorHSB}
                  />
                </GamingErrorBoundary>
              </div>
            )}

            {/* Color Analytics */}
            {allColors.length > 0 && (
              <div className="mb-6">
                <ColorAnalyticsDashboard colors={allColors} isDarkMode={isDarkMode} />
              </div>
            )}

            {/* Results Display */}
            {(extractedColors.length > 0 || harmonyColors.length > 0) && (
              <div
                className={`mb-4 rounded-lg backdrop-blur-sm shadow-lg animate-slide-up ${
                  isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'
                } ${deviceInfo.isMobile ? 'p-2' : 'p-3'}`}
              >
                {extractedColors.length > 0 && (
                  <div className={deviceInfo.isMobile ? 'mb-2' : 'mb-3'}>
                    <h3
                      className={`font-semibold mb-2 text-readable ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                        deviceInfo.isMobile ? 'text-sm' : 'text-sm'
                      }`}
                    >
                      🎨 Extracted Colors
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {extractedColors.slice(0, deviceInfo.isMobile ? 6 : 8).map((color, index) => (
                        <button
                          key={index}
                          onClick={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            const rgbToHsb = (r: number, g: number, b: number) => {
                              r /= 255
                              g /= 255
                              b /= 255
                              const max = Math.max(r, g, b),
                                min = Math.min(r, g, b)
                              const diff = max - min
                              const brightness = max
                              const saturation = max === 0 ? 0 : diff / max
                              let hue = 0
                              if (diff !== 0) {
                                switch (max) {
                                  case r:
                                    hue = (g - b) / diff + (g < b ? 6 : 0)
                                    break
                                  case g:
                                    hue = (b - r) / diff + 2
                                    break
                                  case b:
                                    hue = (r - g) / diff + 4
                                    break
                                }
                                hue /= 6
                              }
                              return { h: hue, s: saturation, b: brightness }
                            }
                            const hsb = rgbToHsb(color.rgb[0], color.rgb[1], color.rgb[2])
                            const fakeColor: CarColor = {
                              colorName: `Extracted Color ${index + 1}`,
                              make: 'Image Extract',
                              model: '',
                              year: null,
                              colorType: 'Extracted',
                              color1: hsb,
                              color2: hsb,
                            }
                            showColorHSB(fakeColor)
                          }}
                          className={`rounded border border-gray-300 hover:border-blue-500 transition-colors cursor-pointer gpu-accelerated ${
                            deviceInfo.isMobile ? 'w-6 h-6' : 'w-8 h-8'
                          }`}
                          style={{
                            backgroundColor: `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`,
                          }}
                          title={`${color.percentage}% - Click to view`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {harmonyColors.length > 0 && (
                  <div>
                    <h3
                      className={`font-semibold mb-2 text-readable ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                        deviceInfo.isMobile ? 'text-sm' : 'text-sm'
                      }`}
                    >
                      🎰 Harmony Colors
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {harmonyColors.slice(0, deviceInfo.isMobile ? 4 : 6).map((color, index) => (
                        <button
                          key={index}
                          onClick={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            showColorHSB(color)
                          }}
                          className={`rounded border border-gray-300 hover:border-blue-500 transition-colors gpu-accelerated focus-visible ${
                            deviceInfo.isMobile ? 'w-6 h-6' : 'w-8 h-8'
                          }`}
                          style={{
                            background: `hsl(${color.color1.h * 360}, ${color.color1.s * 100}%, ${color.color1.b * 100}%)`,
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
              onSearchChange={setSearchQuery}
              selectedMake={selectedMake}
              onMakeChange={setSelectedMake}
              selectedColorType={selectedColorType}
              onColorTypeChange={setSelectedColorType}
              makes={makes}
              colorTypes={colorTypes.filter((t): t is string => typeof t === 'string')}
              isDarkMode={isDarkMode}
              showManufacturerBorders={showManufacturerBorders}
              onToggleManufacturerBorders={() =>
                setShowManufacturerBorders(!showManufacturerBorders)
              }
              favoritesCount={favorites.length}
              showFavoritesOnly={showFavoritesOnly}
              onToggleShowFavoritesOnly={() => setShowFavoritesOnly(prev => !prev)}
            />

            {/* Color Gallery with Zoom-Responsive Container */}
            <ZoomResponsiveContainer isDarkMode={isDarkMode}>
              <div
                className={`relative rounded-xl overflow-hidden p-4 ${
                  isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🏆</span>
                  <span className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    COLOR GALLERY
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    </div>
                    <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      {filteredColors.length} colors
                    </span>
                  </div>
                </div>

                {/* Simple car decoration */}
                <div className="absolute top-4 right-16 opacity-20">
                  <svg
                    width="60"
                    height="20"
                    viewBox="0 0 60 20"
                    className={isDarkMode ? 'fill-blue-400' : 'fill-blue-600'}
                  >
                    <path d="M5 15 Q8 10 15 12 L25 10 Q35 8 45 10 L50 12 Q52 15 50 16 L45 17 L15 17 L10 16 Q5 15 5 15 Z" />
                    <circle cx="15" cy="17" r="2" />
                    <circle cx="45" cy="17" r="2" />
                  </svg>
                </div>

                {filteredColors.length > 1000 ? (
                  <VirtualColorGrid
                    colors={filteredColors}
                    onColorSelect={handleColorSelect}
                    onShowInfo={showColorHSB}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                    isDarkMode={isDarkMode}
                    expandedColorId={expandedColorId}
                  />
                ) : (
                  <SimpleColorGrid
                    colors={filteredColors}
                    onColorSelect={handleColorSelect}
                    onShowInfo={showColorHSB}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                    isDarkMode={isDarkMode}
                    expandedColorId={expandedColorId}
                  />
                )}
              </div>
            </ZoomResponsiveContainer>
          </ResponsiveLayout>
        </ErrorBoundary>

        <Footer isDarkMode={isDarkMode} />

        <PerformanceMonitor isDarkMode={isDarkMode} deviceInfo={deviceInfo} />

        <HSBPopup
          color={hsbPopupColor}
          isOpen={showHsbPopup}
          onClose={() => setShowHsbPopup(false)}
          isDarkMode={isDarkMode}
        />

        <ColorComparison
          colors={allColors}
          isDarkMode={isDarkMode}
          isOpen={showComparison}
          onClose={() => setShowComparison(false)}
          selectedColors={compareSelectedColors}
          setSelectedColors={setCompareSelectedColors}
        />

        <KeyboardShortcuts
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          onToggleSearch={() => setShowAdvancedSearch(!showAdvancedSearch)}
          onToggleComparison={() => setShowComparison(!showComparison)}
          isDarkMode={isDarkMode}
        />
      </div>
    </>
  )
}
