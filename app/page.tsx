'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
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
import ResponsiveLayout from './components/ResponsiveLayout'
import TokyoBackground from './components/TokyoBackground'
import CreditsBackground from './components/CreditsBackground'
import { useAnalytics } from './hooks/useAnalytics'
import { usePerformance } from './hooks/usePerformance'
import { useOfflineStorage } from './hooks/useOfflineStorage'
import { useDeviceDetection } from './hooks/useDeviceDetection'
import { getSecureAssetUrl } from './lib/assetProtection'

import ProgressiveLoader from './components/ProgressiveLoader'
import GamingErrorBoundary from './components/GamingErrorBoundary'
import GamingSEO from './components/GamingSEO'
import MobileGamingOptimizer from './components/MobileGamingOptimizer'
import ForzaColorSheetSEO from './components/ForzaColorSheetSEO'
import StatusAlert from './components/StatusAlert'
import KeyboardShortcuts from './components/KeyboardShortcuts'
import OfflineIndicator from './components/OfflineIndicator'
import OptimizedStatsBar from './components/OptimizedStatsBar'
import ExportButton from './components/ExportButton'

// Heavy components loaded only when needed (reduces initial JS bundle ~40%)
const ImageColorExtractor = dynamic(() => import('./components/ImageColorExtractor'), { ssr: false })
const AdvancedTools = dynamic(() => import('./components/AdvancedTools'), { ssr: false })
  const ColorComparison = dynamic(() => import('./components/ColorComparison'), { ssr: false })
  const HSBPopup = dynamic(() => import('./components/HSBPopup'), { ssr: false })
  const ColorRouletteHarmony = dynamic(() => import('./components/ColorRouletteHarmony'), { ssr: false })
const HarmonyVisualizer = dynamic(() => import('./components/HarmonyVisualizer'), { ssr: false })
const ColorGenerator = dynamic(() => import('./components/ColorGenerator'), { ssr: false })
const PerformanceMonitor = dynamic(() => import('./components/PerformanceMonitor'), { ssr: false })
const ColorAnalyticsDashboard = dynamic(() => import('./components/ColorAnalyticsDashboard'), { ssr: false })
const CommunityTrends = dynamic(() => import('./components/CommunityTrends'), { ssr: false })

export default function HomePage() {
  const [colors, setColors] = useState<CarColor[]>([])
  const [trendingIds, setTrendingIds] = useState<Set<string>>(new Set())
  const [communityChoiceIds, setCommunityChoiceIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMake, setSelectedMake] = useState('')
  const [selectedColorType, setSelectedColorType] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [colorHistory, setColorHistory] = useState<string[]>([])
  const [selectedHSBColor, setSelectedHSBColor] = useState<CarColor | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([])
  const [harmonyColors, setHarmonyColors] = useState<CarColor[]>([])
  const [harmonyMode, setHarmonyMode] = useState('')
  const [allColors, setAllColors] = useState<CarColor[]>([]) // Original + Generated
  const [loadingProgress, setLoadingProgress] = useState<number>(0)
  const [showManufacturerBorders, setShowManufacturerBorders] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showComparison, setShowComparison] = useState(false)
  const [compareSelectedColors, setCompareSelectedColors] = useState<CarColor[]>([])
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [showInsightsPanel, setShowInsightsPanel] = useState(false)
  const deviceInfo: DeviceInfo = useDeviceDetection()

  useAnalytics()
  usePerformance()
  useOfflineStorage()

  // Track online/offline status
  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

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
        const rawColors = await getColorData()

        // Validate data
        if (!Array.isArray(rawColors)) {
          throw new Error('Invalid color data format')
        }

        // Strip entries with no HSB color data or out-of-range values (scraper junk, bad data)
        const originalColors = rawColors.filter((c: CarColor) => {
          const c1 = c.color1 as { h?: unknown; s?: unknown; b?: unknown } | null
          if (!c1 || typeof c1 !== 'object') return false
          return (
            typeof c1.h === 'number' && c1.h >= 0 && c1.h <= 1 &&
            typeof c1.s === 'number' && c1.s >= 0 && c1.s <= 1 &&
            typeof c1.b === 'number' && c1.b >= 0 && c1.b <= 1
          )
        })

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

  // Load Community Trends
  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await fetch('/api/analytics/community-trends')
        const data = await res.json()
        if (data.trends) {
          const trending = new Set<string>()
          const communityChoice = new Set<string>()
          
          data.trends.forEach((t: { color_id: string, score: number }) => {
            if (t.score > 50) communityChoice.add(t.color_id)
            else trending.add(t.color_id)
          })
          
          setTrendingIds(trending)
          setCommunityChoiceIds(communityChoice)
        }
      } catch (err) {
        console.error('Failed to fetch trends', err)
      }
    }
    fetchTrends()
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

  // Handle color selection with history tracking
  const handleColorSelect = useCallback(
    (color: CarColor) => {
      const colorId = `${color.make}-${color.colorName}-${color.year || 'unknown'}`
      setColorHistory(prev => {
        const filtered = prev.filter(id => id !== colorId)
        return [colorId, ...filtered.slice(0, 49)] // Keep last 50
      })
    },
    []
  )

  // Show color HSB/details (used by child components)
  const showColorHSB = useCallback((color: CarColor) => {
    handleColorSelect(color)
    setSelectedHSBColor(color)
  }, [handleColorSelect])

  if (isInitialLoad) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center relative overflow-hidden text-white">
        {/* Subtle green ambient glow */}
        <div className="absolute inset-0 bg-gradient-radial from-green-900/20 via-transparent to-transparent" />

        {/* Ctrl+Shift+R hint for PC users */}
        <div className="absolute top-4 left-4 z-20 hidden md:block">
          <p className="text-xs text-white/40 font-mono">
            <span className="inline-block px-1.5 py-0.5 rounded bg-white/10 text-white/50 mr-0.5">Ctrl</span>
            +
            <span className="inline-block px-1.5 py-0.5 rounded bg-white/10 text-white/50 mx-0.5">Shift</span>
            +
            <span className="inline-block px-1.5 py-0.5 rounded bg-white/10 text-white/50 ml-0.5">R</span>
            <span className="ml-2 text-white/30">to hard refresh</span>
          </p>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6 text-center px-4">
          {/* Wizard smoking the joint */}
          <div className="relative animate-wizard-bob" style={{ width: 200, height: 220 }}>
            {/* Extra smoke clouds from the wizard */}
            <span
              className="absolute text-white/50 text-2xl select-none animate-smoke"
              style={{ top: 10, left: '55%', animationDelay: '0.3s' }}
              aria-hidden
            >☁</span>
            <span
              className="absolute text-white/30 text-lg select-none animate-smoke-2"
              style={{ top: 15, left: '60%', animationDelay: '1.0s' }}
              aria-hidden
            >☁</span>
            <span
              className="absolute text-white/20 text-sm select-none animate-smoke"
              style={{ top: 20, left: '50%', animationDelay: '1.8s' }}
              aria-hidden
            >☁</span>

            {/* Wizard SVG */}
            <svg viewBox="0 0 200 220" width="200" height="220" aria-hidden className="animate-wizard-inhale">
              {/* Wizard hat */}
              <polygon points="100,5 70,75 130,75" fill="#4a2d8a" />
              <polygon points="100,5 70,75 130,75" fill="url(#hatSheen)" />
              <ellipse cx="100" cy="75" rx="40" ry="8" fill="#3a1d7a" />
              {/* Hat stars */}
              <text x="90" y="40" fontSize="10" fill="#ffd700" opacity="0.8">✦</text>
              <text x="105" y="55" fontSize="7" fill="#ffd700" opacity="0.6">✦</text>
              {/* Hat brim */}
              <ellipse cx="100" cy="75" rx="50" ry="10" fill="#5a3d9a" />

              {/* Face */}
              <circle cx="100" cy="100" r="28" fill="#f5d0a9" />
              {/* Eyes — squinting from the smoke */}
              <line x1="88" y1="95" x2="96" y2="95" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="104" y1="95" x2="112" y2="95" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
              {/* Rosy cheeks */}
              <circle cx="85" cy="102" r="5" fill="#ff9999" opacity="0.4" />
              <circle cx="115" cy="102" r="5" fill="#ff9999" opacity="0.4" />
              {/* Mouth area — slight grin */}
              <path d="M 93 108 Q 100 114 107 108" fill="none" stroke="#994433" strokeWidth="1.5" strokeLinecap="round" />

              {/* Beard */}
              <path d="M 75 110 Q 80 150 100 160 Q 120 150 125 110" fill="#cccccc" />
              <path d="M 80 115 Q 85 145 100 155 Q 115 145 120 115" fill="#e0e0e0" />

              {/* Robe / body */}
              <path d="M 65 128 L 55 210 L 145 210 L 135 128" fill="#5a3d9a" />
              <line x1="100" y1="128" x2="100" y2="210" stroke="#4a2d8a" strokeWidth="2" />

              {/* Arm reaching to mouth holding joint */}
              <path d="M 130 145 Q 140 130 138 110 Q 136 102 128 105" fill="none" stroke="#f5d0a9" strokeWidth="8" strokeLinecap="round" />
              {/* Hand */}
              <circle cx="137" cy="108" r="5" fill="#f5d0a9" />

              {/* The joint in hand */}
              <g transform="translate(137, 100) rotate(-30)">
                {/* Joint body */}
                <rect x="-2" y="-18" width="4" height="16" rx="1.5" fill="#f5f0e8" />
                <line x1="-2" y1="-12" x2="2" y2="-12" stroke="#e0d8cc" strokeWidth="0.5" />
                <line x1="-2" y1="-7" x2="2" y2="-7" stroke="#e0d8cc" strokeWidth="0.5" />
                {/* Filter */}
                <rect x="-2" y="-2" width="4" height="5" rx="1" fill="#c8a96a" />
                {/* Ember tip */}
                <circle cx="0" cy="-18" r="3" fill="#ff4500" className="animate-ember-glow" />
                <circle cx="0" cy="-18" r="1.5" fill="#ff8c00" />
                {/* Smoke from tip */}
                <g>
                  <circle cx="0" cy="-24" r="2" fill="white" opacity="0.3" className="animate-smoke" />
                  <circle cx="2" cy="-28" r="1.5" fill="white" opacity="0.2" className="animate-smoke-2" />
                </g>
              </g>

              {/* Gradient defs */}
              <defs>
                <linearGradient id="hatSheen" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="white" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h1 className="text-2xl font-bold tracking-wide text-green-300">
            🌿 Loading Paint Codes…
          </h1>

          <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            Loading colors. Progress {Math.round(loadingProgress)} percent.
          </div>

          {/* Loading bar */}
          <div className="w-56 h-2 rounded-full bg-gray-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>

          <p className="text-sm text-green-400/70">
            {loadingProgress < 30 && 'Sorting paint codes…'}
            {loadingProgress >= 30 && loadingProgress < 60 && 'Loading manufacturers…'}
            {loadingProgress >= 60 && loadingProgress < 90 && 'Filtering colors…'}
            {loadingProgress >= 90 && 'Almost ready…'}
          </p>

          <p className="text-xs text-white/30 mt-1">Rolling something special…</p>
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

        <OfflineIndicator isOnline={isOnline} />

        {/* Error Display */}
        {error && (
          <StatusAlert
            title="Unable to load colors"
            message={error}
            variant="error"
            isDarkMode={isDarkMode}
            onDismiss={() => setError(null)}
            onRetry={() => window.location.reload()}
          />
        )}

        <TokyoBackground isDarkMode={isDarkMode} getSecureAssetUrl={getSecureAssetUrl} />
        <CreditsBackground isDarkMode={isDarkMode} />
        <ProgressiveLoader
          progress={loadingProgress}
          isDarkMode={isDarkMode}
          deviceInfo={deviceInfo}
        />

        <ErrorBoundary
          onError={error => {
            setError(error.message)
          }}
        >
          <ResponsiveLayout>
            {/* Hero — value proposition for new visitors */}
            <p className={`mb-3 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {allColors.length > 0 ? (
                <>
                  <span className="font-bold" style={{color: 'var(--bamboo-stalk)'}}>
                    {allColors.length.toLocaleString()} Forza paint codes
                  </span>
                  {' '}across {makes.length} manufacturers — search, copy HSB values, apply in-game.
                </>
              ) : (
                <>The ultimate{' '}
                  <span className="font-bold" style={{color: 'var(--bamboo-stalk)'}}>Forza paint color database</span>
                  {' '}— search, copy HSB values, apply in-game.
                </>
              )}
            </p>

            {/* Search Controls — primary action */}
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

            <CommunityTrends 
              allColors={allColors} 
              isDarkMode={isDarkMode} 
              onColorSelect={showColorHSB} 
            />
          </ResponsiveLayout>

          {/* Tools — above gallery for easy access */}
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

            {/* Advanced Tools + Analytics (collapsible) */}
            {allColors.length > 0 && (
              <div
                className={`relative mb-6 rounded-xl overflow-hidden p-4 ${
                  isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🛠️</span>
                    <span
                      className="font-bold"
                      style={{color: "var(--bamboo-stalk)"}}
                    >
                      ADVANCED TOOLS & ANALYTICS
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowInsightsPanel(prev => !prev)}
                    className="bamboo-button-ghost px-3 py-2 rounded-lg text-sm font-semibold"
                    aria-expanded={showInsightsPanel}
                    aria-controls="insights-panel"
                  >
                    {showInsightsPanel ? 'Hide' : 'Show'}
                  </button>
                </div>

                {!showInsightsPanel && (
                  <div className="text-sm opacity-80">
                    Hidden by default to keep the homepage cleaner.
                  </div>
                )}

                {showInsightsPanel && (
                  <div id="insights-panel" className="mt-4">
                    <div className="mb-6">
                      <GamingErrorBoundary>
                        <AdvancedTools
                          colors={allColors}
                          isDarkMode={isDarkMode}
                          isMobile={deviceInfo.isMobile}
                          onColorSelect={showColorHSB}
                        />
                      </GamingErrorBoundary>
                    </div>

                    <div>
                      <ColorAnalyticsDashboard colors={allColors} isDarkMode={isDarkMode} />
                    </div>
                  </div>
                )}
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
                          aria-label={`Select ${color.colorName} from ${color.make}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </ResponsiveLayout>

          {/* Full-width Color Gallery — below tools */}
          <div className={`w-full ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
            {/* Gallery header bar */}
            <div className={`flex items-center gap-2 px-4 py-2 border-b ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200'}`}>
              <span className="text-xl">🏆</span>
              <span className={`font-bold text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                COLOR GALLERY
              </span>
              <div className="ml-auto flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                </div>
                <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  {filteredColors.length} colors
                </span>
              </div>
            </div>

            {filteredColors.length > 1000 ? (
              <VirtualColorGrid
                colors={filteredColors}
                onColorSelect={handleColorSelect}
                onShowInfo={showColorHSB}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                isDarkMode={isDarkMode}
              />
            ) : (
              <div className="p-1">
                <SimpleColorGrid
                  colors={filteredColors}
                  onColorSelect={handleColorSelect}
                  onShowInfo={showColorHSB}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  isDarkMode={isDarkMode}
                  trendingIds={trendingIds}
                  communityChoiceIds={communityChoiceIds}
                />
              </div>
            )}
          </div>
        </ErrorBoundary>

        <Footer isDarkMode={isDarkMode} />

        <PerformanceMonitor isDarkMode={isDarkMode} deviceInfo={deviceInfo} />

        <ColorComparison
          colors={allColors}
          isDarkMode={isDarkMode}
          isOpen={showComparison}
          onClose={() => setShowComparison(false)}
          selectedColors={compareSelectedColors}
          setSelectedColors={setCompareSelectedColors}
        />

        <HSBPopup
          color={selectedHSBColor! as CarColor}
          isOpen={!!selectedHSBColor}
          onClose={() => setSelectedHSBColor(null)}
          isDarkMode={isDarkMode}
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
