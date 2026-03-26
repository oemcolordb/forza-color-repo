'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { CarColor, DeviceInfo, AppTheme } from './types'
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
import NFSBackground from './components/NFSBackground'
import NFSThemeWrapper from './components/NFSThemeWrapper'
import { useAnalytics } from './hooks/useAnalytics'
import { usePerformance } from './hooks/usePerformance'
import { useOfflineStorage } from './hooks/useOfflineStorage'
import { useDeviceDetection } from './hooks/useDeviceDetection'
import { getSecureAssetUrl } from './lib/assetProtection'
import { copyTextToClipboard } from './lib/clipboard'

import ProgressiveLoader from './components/ProgressiveLoader'
import PerformanceMonitor from './components/PerformanceMonitor'
import GamingErrorBoundary from './components/GamingErrorBoundary'
import MobileGamingOptimizer from './components/MobileGamingOptimizer'
import HSBPopup from './components/HSBPopup'
import ForzaColorSheetSEO from './components/ForzaColorSheetSEO'
import ColorComparison from './components/ColorComparison'
import KeyboardShortcuts from './components/KeyboardShortcuts'
import ZoomResponsiveContainer from './components/ZoomResponsiveContainer'
import CollectionsTools from './components/CollectionsTools'
import VirtualPaintPreview from './components/VirtualPaintPreview'
import NFSSwatchRail from './components/NFSSwatchRail'

export default function HomePage() {
  const [colors, setColors] = useState<CarColor[]>([])
  const [loading, setLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMake, setSelectedMake] = useState('')
  const [selectedColorType, setSelectedColorType] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'az' | 'random'>('newest')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [, setColorHistory] = useState<string[]>([])
  const [theme, setTheme] = useState<AppTheme>(() => {
    if (typeof window === 'undefined') return 'dark'
    const saved = localStorage.getItem('forza-theme') as AppTheme | null
    if (saved === 'light' || saved === 'dark' || saved === 'nfs') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const isDarkMode = theme === 'dark' || theme === 'nfs'
  const isNFS = theme === 'nfs'
  const [expandedColorId, setExpandedColorId] = useState<string | null>(null)
  const [allColors, setAllColors] = useState<CarColor[]>([])
  const [loadingProgress, setLoadingProgress] = useState<number>(0)
  const [showManufacturerBorders, setShowManufacturerBorders] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hsbPopupColor, setHsbPopupColor] = useState<CarColor | null>(null)
  const [showHsbPopup, setShowHsbPopup] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [compareSelectedColors, setCompareSelectedColors] = useState<CarColor[]>([])
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [previewColor, setPreviewColor] = useState<CarColor | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const deviceInfo: DeviceInfo = useDeviceDetection()

  useAnalytics()
  usePerformance()
  useOfflineStorage()

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark', 'nfs')
    root.classList.add(theme)
    localStorage.setItem('forza-theme', theme)
  }, [theme])

  const cycleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : prev === 'dark' ? 'nfs' : 'light')
  }, [])

  const favoritesSet = useMemo(() => new Set(favorites), [favorites])

  const filteredColors = useMemo(() => {
    const cacheKey = `filtered-${selectedMake}-${selectedColorType}-${selectedYear}-${searchQuery}-${showFavoritesOnly ? 'fav' : 'all'}-${sortBy}`
    const cached = cache.get<CarColor[]>(cacheKey)
    if (cached && allColors.length > 0) return cached

    let result: CarColor[]
    if (!searchQuery && !selectedMake && !selectedColorType && !showFavoritesOnly) {
      result = [...allColors]
    } else {
      const sanitizedQuery = sanitizeSearchQuery(searchQuery)
      const searchLower = sanitizedQuery.toLowerCase()
      result = allColors.filter(color => {
        const matchesSearch =
          !sanitizedQuery ||
          color.colorName.toLowerCase().includes(searchLower) ||
          color.make.toLowerCase().includes(searchLower) ||
          (color.model && color.model.toLowerCase().includes(searchLower)) ||
          (searchLower.startsWith('#') && `${color.make}-${color.colorName}`.toLowerCase().includes(searchLower.replace('#', '')))
        const matchesMake = !selectedMake || color.make === selectedMake
        const matchesType = !selectedColorType || color.colorType === selectedColorType
        const matchesYear = !selectedYear || String(color.year || '') === selectedYear
        const colorId = `${color.make}-${color.colorName}-${color.year || 'unknown'}`
        const matchesFavorites = !showFavoritesOnly || favoritesSet.has(colorId)
        return matchesSearch && matchesMake && matchesType && matchesYear && matchesFavorites
      })
    }

    if (sortBy === 'az') {
      result.sort((a, b) => a.colorName.localeCompare(b.colorName))
    } else if (sortBy === 'newest') {
      result.sort((a, b) => (b.year || 0) - (a.year || 0))
    } else if (sortBy === 'random') {
      result.sort(() => Math.random() - 0.5)
    }

    if (allColors.length > 0) cache.set(cacheKey, result, 2 * 60 * 1000)
    return result
  }, [allColors, searchQuery, selectedMake, selectedColorType, selectedYear, favoritesSet, showFavoritesOnly, sortBy])

  useEffect(() => {
    const loadColors = async () => {
      try {
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
        if (!Array.isArray(originalColors)) throw new Error('Invalid color data format')
        setColors(originalColors)
        setAllColors(originalColors)
        cache.set('color-data', originalColors, 10 * 60 * 1000)
        setLoadingProgress(100)
        setLoading(false)
        setIsInitialLoad(false)
      } catch (err) {
        const e = handleError(err)
        setError(e.message)
        setColors([])
        setAllColors([])
        setLoading(false)
        setIsInitialLoad(false)
      }
    }
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

  const makes = useMemo(() => {
    if (!allColors || !Array.isArray(allColors)) return []
    return Array.from(new Set(allColors.map(c => c.make))).sort()
  }, [allColors])

  const colorTypes = useMemo(() => {
    if (!allColors || !Array.isArray(allColors)) return []
    return Array.from(new Set(allColors.map(c => c.colorType).filter(type => type && type.trim()))).sort()
  }, [allColors])

  const years = useMemo(() => {
    if (!allColors || !Array.isArray(allColors)) return []
    return Array.from(new Set(allColors.map(c => c.year).filter(y => typeof y === 'number')))
      .sort((a, b) => Number(b) - Number(a))
      .map(y => String(y))
  }, [allColors])

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const dbFavorites = await indexedDBManager.getFavorites()
        if (dbFavorites.length > 0) { setFavorites(dbFavorites); return }
        const saved = localStorage.getItem('forza-favorites')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            setFavorites(parsed)
            await indexedDBManager.storeFavorites(parsed)
          }
        }
      } catch (err) { handleError(err); setFavorites([]) }
    }
    loadFavorites()
  }, [])

  useEffect(() => {
    const saveFavorites = async () => {
      try {
        await indexedDBManager.storeFavorites(favorites)
        localStorage.setItem('forza-favorites', JSON.stringify(favorites))
      } catch (err) { handleError(err); setError('Failed to save favorites') }
    }
    if (favorites.length > 0) saveFavorites()
  }, [favorites])

  const toggleFavorite = useCallback((colorId: string) => {
    setFavorites(prev =>
      prev.includes(colorId) ? prev.filter(id => id !== colorId) : [...prev, colorId]
    )
  }, [])

  const showColorHSB = useCallback((color: CarColor) => {
    setHsbPopupColor(color)
    setShowHsbPopup(true)
  }, [])

  const handleColorSelect = useCallback((color: CarColor) => {
    const colorId = `${color.make}-${color.colorName}-${color.year || 'unknown'}`
    setExpandedColorId(expandedColorId === colorId ? null : colorId)
    setPreviewColor(color)
    setColorHistory(prev => {
      const filtered = prev.filter(id => id !== colorId)
      return [colorId, ...filtered.slice(0, 49)]
    })
  }, [expandedColorId])

  const favoriteColorObjects = useMemo(() => {
    if (favorites.length === 0 || allColors.length === 0) return []
    const idSet = new Set(favorites)
    return allColors.filter(color => idSet.has(`${color.make}-${color.colorName}-${color.year || 'unknown'}`))
  }, [favorites, allColors])

  const downloadTextFile = useCallback((filename: string, text: string, contentType: string) => {
    const blob = new Blob([text], { type: contentType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }, [])

  const announceStatus = useCallback((message: string) => {
    setStatusMessage(message)
    window.setTimeout(() => setStatusMessage(null), 2400)
  }, [])

  const handleShareFavorites = useCallback(async () => {
    if (favorites.length === 0) {
      announceStatus('No favorites selected to share.')
      return
    }

    const encoded = encodeURIComponent(JSON.stringify(favorites))
    const url = `${window.location.origin}${window.location.pathname}?collection=${encoded}`

    try {
      const copied = await copyTextToClipboard(url)
      if (copied) {
        announceStatus('Collection link copied to clipboard.')
        return
      }
      announceStatus('Unable to copy collection link.')
    } catch {
      announceStatus('Unable to copy collection link.')
    }
  }, [favorites, announceStatus])

  const handleExportFavoritesJson = useCallback(() => {
    if (favoriteColorObjects.length === 0) {
      announceStatus('No favorites available to export.')
      return
    }
    downloadTextFile(
      'forza-favorite-collection.json',
      JSON.stringify(favoriteColorObjects, null, 2),
      'application/json'
    )
    announceStatus('Exported favorites as JSON.')
  }, [favoriteColorObjects, downloadTextFile, announceStatus])

  const handleExportFavoritesCss = useCallback(() => {
    if (favoriteColorObjects.length === 0) {
      announceStatus('No favorites available to export.')
      return
    }

    const lines = favoriteColorObjects.slice(0, 24).map((color, index) => {
      const hue = Math.round(color.color1.h * 360)
      const sat = Math.round(color.color1.s * 100)
      const light = Math.max(18, Math.round(color.color1.b * 65))
      return `  --favorite-color-${index + 1}: hsl(${hue}, ${sat}%, ${light}%);`
    })

    downloadTextFile('forza-favorite-palette.css', [':root {', ...lines, '}'].join('\n'), 'text/css')
    announceStatus('Exported favorites as CSS variables.')
  }, [favoriteColorObjects, downloadTextFile, announceStatus])

  const handleImportFavorites = useCallback(async (file: File) => {
    try {
      const text = await file.text()
      const imported = JSON.parse(text)

      if (Array.isArray(imported) && imported.length > 0 && typeof imported[0] === 'string') {
        setFavorites(imported)
        announceStatus('Imported favorite IDs from collection file.')
        return
      }

      if (Array.isArray(imported)) {
        const importedIds = imported
          .map((color: CarColor) => `${color.make}-${color.colorName}-${color.year || 'unknown'}`)
          .filter(Boolean)
        setFavorites(importedIds)
        announceStatus('Imported favorite colors from JSON.')
        return
      }

      announceStatus('Unsupported JSON format for import.')
    } catch {
      announceStatus('Failed to import collection file.')
    }
  }, [announceStatus])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const encodedCollection = params.get('collection')
    if (!encodedCollection) return

    try {
      const parsed = JSON.parse(decodeURIComponent(encodedCollection))
      if (Array.isArray(parsed) && parsed.length > 0) {
        setFavorites(parsed.filter(item => typeof item === 'string'))
        announceStatus('Imported shared collection from URL.')
      }
      params.delete('collection')
      const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
      window.history.replaceState({}, '', nextUrl)
    } catch {
      announceStatus('Unable to parse shared collection link.')
    }
  }, [announceStatus])

  if (isInitialLoad) {
    const videoUrl = '/Mp%204%20H%20280%203%20Q%20Nlf%203%20J%20O%20Aem%208%20Kv%20Cu%20Uuya%20AN%20Cr%20O%20Du%20C%20Qs%2063%20S%20Vq%20Z%20Rad%206%20O%2011%20BZ.mp4'
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        <video className="absolute inset-0 w-full h-full object-cover opacity-30" autoPlay muted loop playsInline>
          <source src={videoUrl} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-radial from-orange-600/20 via-red-600/10 to-transparent animate-pulse" />
        <div className="text-center z-10">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-yellow-400 to-red-400 text-transparent bg-clip-text animate-pulse">
            🔧 TuneForge Loading...
          </h1>
          <p className="text-lg mb-4" style={{ color: 'var(--bamboo-paper)' }}>Forging your automotive experience...</p>
          <div className="w-64 h-3 rounded-full mx-auto mb-4 overflow-hidden bamboo-surface-dark">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full animate-pulse"
              style={{ width: `${loadingProgress}%`, transition: 'width 0.3s ease' }}
            />
          </div>
          <div className="flex justify-center items-center gap-1 mt-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-1 h-1 bg-yellow-400 rounded-full animate-ping"
                style={{ animationDelay: `${i * 200}ms`, animationDuration: '1s' }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <NFSThemeWrapper enabled={isNFS}>
      <>
        <GamingErrorBoundary>
          <ForzaColorSheetSEO colorCount={allColors.length} manufacturerCount={makes.length} isDarkMode={isDarkMode} />
          <MobileGamingOptimizer deviceInfo={deviceInfo} />
        </GamingErrorBoundary>

        <div className={`font-sans min-h-screen ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Header
            isDarkMode={isDarkMode}
            theme={theme}
            onToggleTheme={cycleTheme}
            colorCount={allColors.length}
            manufacturerCount={makes.length}
            gameLabel="FH5 + Motorsport"
          />

          {error && (
            <div className={`mx-4 mb-4 p-3 rounded-lg border ${isDarkMode ? 'bg-red-900/30 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-700'}`}>
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span className="font-medium">Error:</span>
                <span>{error}</span>
                <button onClick={() => setError(null)} className={`ml-auto px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-red-800 hover:bg-red-700' : 'bg-red-200 hover:bg-red-300'}`}>✕</button>
              </div>
            </div>
          )}

          {isNFS
            ? <NFSBackground isDarkMode={true} />
            : <>
                <TokyoBackground isDarkMode={isDarkMode} getSecureAssetUrl={getSecureAssetUrl} />
                <CreditsBackground isDarkMode={isDarkMode} />
              </>
          }

          <ProgressiveLoader progress={loadingProgress} isDarkMode={isDarkMode} deviceInfo={deviceInfo} />

          <ErrorBoundary onError={e => setError(e.message)}>
            <ResponsiveLayout>
              {/* Stats bar */}
              <div className={`flex items-center gap-3 mb-4 px-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                <span>{allColors.length.toLocaleString()} colors</span>
                <span>·</span>
                <span>{makes.length} makes</span>
                <span>·</span>
                <span>{favorites.length} favorites</span>
                <a href="/tools" className={`ml-auto text-xs px-3 py-1 rounded-lg bamboo-button-ghost`}>🛠️ Tools</a>
              </div>

              <CollectionsTools
                isDarkMode={isDarkMode}
                favoritesCount={favorites.length}
                onOpenComparison={() => {
                  setCompareSelectedColors(favoriteColorObjects.slice(0, 4))
                  setShowComparison(true)
                }}
                onShareFavorites={handleShareFavorites}
                onExportFavoritesJson={handleExportFavoritesJson}
                onExportFavoritesCss={handleExportFavoritesCss}
                onImportFavorites={handleImportFavorites}
              />

              <VirtualPaintPreview color={previewColor} isDarkMode={isDarkMode} />

              <OptimizedSearchControls
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedMake={selectedMake}
                onMakeChange={setSelectedMake}
                selectedColorType={selectedColorType}
                onColorTypeChange={setSelectedColorType}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                years={years}
                sortBy={sortBy}
                onSortChange={setSortBy}
                makes={makes}
                colorTypes={colorTypes.filter((t): t is string => typeof t === 'string')}
                isDarkMode={isDarkMode}
                showManufacturerBorders={showManufacturerBorders}
                onToggleManufacturerBorders={() => setShowManufacturerBorders(!showManufacturerBorders)}
                favoritesCount={favorites.length}
                showFavoritesOnly={showFavoritesOnly}
                onToggleShowFavoritesOnly={() => setShowFavoritesOnly(prev => !prev)}
              />

              {isNFS && (
                <NFSSwatchRail
                  colors={allColors}
                  selectedColorId={expandedColorId}
                  onSelectColor={handleColorSelect}
                />
              )}

              <ZoomResponsiveContainer isDarkMode={isDarkMode}>
                <div id="color-gallery" className={`relative rounded-xl overflow-hidden p-4 ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🏆</span>
                    <span className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>COLOR GALLERY</span>
                    <span className={`ml-auto text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      {filteredColors.length.toLocaleString()} colors
                    </span>
                  </div>

                  {!isNFS && filteredColors.length > 1000 ? (
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
                      useNFSCard={isNFS}
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
            onToggleTheme={cycleTheme}
            onToggleSearch={() => setShowAdvancedSearch(!showAdvancedSearch)}
            onToggleComparison={() => setShowComparison(!showComparison)}
            isDarkMode={isDarkMode}
          />

          {statusMessage && (
            <div
              className="status-toast fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-white/15 bg-[#141824]/95 px-4 py-2 text-sm text-white shadow-xl"
              role="status"
              aria-live="polite"
            >
              {statusMessage}
            </div>
          )}
        </div>
      </>
    </NFSThemeWrapper>
  )
}
