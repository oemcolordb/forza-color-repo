'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import type { CarColor } from './types/color'
import Header from './components/Header'
import Footer from './components/Footer'
import ColorStats from './components/ColorStats'
import ShareButton from './components/ShareButton'
import ExportButton from './components/ExportButton'
import { SecurityHeaders } from './components/SecurityHeaders'
import { useAnalytics } from './hooks/useAnalytics'
import { usePerformance } from './hooks/usePerformance'
import LazyColorGrid from './components/LazyColorGrid'
import ModelBrowser from './components/ModelBrowser'
import LoadingSpinner from './components/LoadingSpinner'
import ImageColorExtractor from './components/ImageColorExtractor'
import Breadcrumbs from './components/Breadcrumbs'
import ColorRandomizer from './components/ColorRandomizer'
import ColorPalette from './components/ColorPalette'
import ColorTrends from './components/ColorTrends'

export default function HomePage() {
  const [colors, setColors] = useState<CarColor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMake, setSelectedMake] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [displayedColors, setDisplayedColors] = useState<CarColor[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [selectedColor, setSelectedColor] = useState<CarColor | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [colorHistory, setColorHistory] = useState<CarColor[]>([])
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [backgroundColors, setBackgroundColors] = useState({ dark: '', light: '' })
  const [page, setPage] = useState(1)
  const [imageMatchedColors, setImageMatchedColors] = useState<CarColor[]>([])
  const [showImageExtractor, setShowImageExtractor] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const ITEMS_PER_PAGE = 50
  const { track } = useAnalytics()
  const { measureAsync } = usePerformance()

  useEffect(() => {
    const loadColors = async () => {
      try {
        const colorData = await measureAsync('Load Color Data', async () => {
          const { default: data } = await import('../services/colorData')
          return data
        })
        
        setColors(colorData)
        setDisplayedColors(colorData.slice(0, ITEMS_PER_PAGE))
        setHasMore(colorData.length > ITEMS_PER_PAGE)
        
        // Generate random background colors from color data
        const randomColor1 = colorData[Math.floor(Math.random() * colorData.length)]
        const randomColor2 = colorData[Math.floor(Math.random() * colorData.length)]
        
        const hsbToHsl = (h: number, s: number, b: number): [number, number, number] => {
          const l = b * (1 - s / 2)
          const newS = l === 0 || l === 1 ? 0 : (b - l) / Math.min(l, 1 - l)
          return [h * 360, newS * 100, l * 100]
        }
        
        const [h1, s1, l1] = hsbToHsl(randomColor1.color1.h, randomColor1.color1.s, randomColor1.color1.b)
        const [h2, s2, l2] = hsbToHsl(randomColor2.color1.h, randomColor2.color1.s, randomColor2.color1.b)
        
        setBackgroundColors({
          dark: `hsl(${h1}, ${Math.min(s1, 30)}%, ${Math.min(l1, 15)}%)`,
          light: `linear-gradient(135deg, hsl(${h1}, ${Math.min(s1, 60)}%, ${Math.max(l1, 85)}%), hsl(${h2}, ${Math.min(s2, 60)}%, ${Math.max(l2, 85)}%))`
        })
      } catch (error) {
        console.error('Failed to load colors:', error)
      } finally {
        setLoading(false)
      }
    }
    loadColors()
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
    }
  }, [measureAsync])

  useEffect(() => {
    const saved = localStorage.getItem('forza-favorites')
    if (saved) setFavorites(JSON.parse(saved))
    
    const history = localStorage.getItem('forza-history')
    if (history) setColorHistory(JSON.parse(history))
    
    const theme = localStorage.getItem('forza-theme')
    setIsDarkMode(theme === 'dark')
    
    // Show tutorial on first image extractor use
    const hasSeenTutorial = localStorage.getItem('forza-image-tutorial')
    if (!hasSeenTutorial) {
      setShowTutorial(true)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('forza-favorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    localStorage.setItem('forza-theme', isDarkMode ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  const makes = useMemo(() => {
    const uniqueMakes = Array.from(new Set(colors.map(color => color.make)))
    return uniqueMakes.sort()
  }, [colors])

  const models = useMemo(() => {
    const filteredByMake = selectedMake ? colors.filter(color => color.make === selectedMake) : colors
    const uniqueModels = Array.from(new Set(filteredByMake.map(color => color.model)))
    return uniqueModels.sort()
  }, [colors, selectedMake])

  const filteredColors = useMemo(() => {
    return colors.filter(color => {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = !searchQuery ||
        color.colorName.toLowerCase().includes(searchLower) ||
        color.make.toLowerCase().includes(searchLower) ||
        color.model.toLowerCase().includes(searchLower) ||
        (color.year && color.year.toString().includes(searchLower)) ||
        (color.colorType && color.colorType.toLowerCase().includes(searchLower))

      const matchesMake = !selectedMake || color.make === selectedMake
      const matchesModel = !selectedModel || color.model === selectedModel

      return matchesSearch && matchesMake && matchesModel
    })
  }, [colors, searchQuery, selectedMake, selectedModel])

  useEffect(() => {
    setSelectedModel('') // Reset model when make changes
  }, [selectedMake])

  useEffect(() => {
    if (imageMatchedColors.length === 0) {
      setPage(1)
      setDisplayedColors(filteredColors.slice(0, ITEMS_PER_PAGE))
      setHasMore(filteredColors.length > ITEMS_PER_PAGE)
    }
  }, [filteredColors, imageMatchedColors.length])

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return
    
    const nextPage = page + 1
    const startIndex = (nextPage - 1) * ITEMS_PER_PAGE
    const sourceColors = imageMatchedColors.length > 0 ? imageMatchedColors : filteredColors
    const newColors = sourceColors.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    
    if (newColors.length > 0) {
      setDisplayedColors(prev => [...prev, ...newColors])
      setPage(nextPage)
      setHasMore(startIndex + ITEMS_PER_PAGE < sourceColors.length)
    } else {
      setHasMore(false)
    }
  }, [filteredColors, imageMatchedColors, page, hasMore, loading])

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMore()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadMore])

  const toggleFavorite = useCallback((colorId: string) => {
    setFavorites(prev => 
      prev.includes(colorId) 
        ? prev.filter(id => id !== colorId)
        : [...prev, colorId]
    )
  }, [])

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev)
  }, [])

  const addToHistory = useCallback((color: CarColor) => {
    setColorHistory(prev => {
      const filtered = prev.filter(c => 
        !(c.make === color.make && c.model === color.model && c.colorName === color.colorName && c.year === color.year)
      )
      const newHistory = [color, ...filtered].slice(0, 20) // Keep last 20
      localStorage.setItem('forza-history', JSON.stringify(newHistory))
      return newHistory
    })
  }, [])

  const handleColorSelect = useCallback((color: CarColor) => {
    addToHistory(color)
    setSelectedColor(color)
    track({ action: 'view', colorName: color.colorName, make: color.make })
  }, [addToHistory, track])

  const handleModelSelect = useCallback((make: string, model: string) => {
    setSelectedMake(make)
    setSelectedModel(model)
    setSearchQuery('')
  }, [])

  const handleImageColorsFound = useCallback((matchedColors: CarColor[]) => {
    setImageMatchedColors(matchedColors)
    setDisplayedColors(matchedColors.slice(0, ITEMS_PER_PAGE))
    setHasMore(matchedColors.length > ITEMS_PER_PAGE)
    setPage(1)
    track({ action: 'search', query: `image_match_${matchedColors.length}_colors` })
  }, [track])

  const clearImageResults = useCallback(() => {
    setImageMatchedColors([])
    setDisplayedColors(filteredColors.slice(0, ITEMS_PER_PAGE))
    setHasMore(filteredColors.length > ITEMS_PER_PAGE)
    setPage(1)
  }, [filteredColors])

  const handleTutorialClose = useCallback(() => {
    setShowTutorial(false)
    localStorage.setItem('forza-image-tutorial', 'seen')
  }, [])

  const toggleImageExtractor = useCallback(() => {
    const newState = !showImageExtractor
    setShowImageExtractor(newState)
    
    // Show tutorial when opening for first time
    if (newState && !localStorage.getItem('forza-image-tutorial')) {
      setShowTutorial(true)
    }
  }, [showImageExtractor])

  const themeClasses = isDarkMode 
    ? 'text-blue-100' 
    : 'text-blue-900'
    
  const backgroundStyle = {
    background: isDarkMode ? backgroundColors.dark : backgroundColors.light,
    minHeight: '100vh'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <LoadingSpinner 
          size="lg" 
          color="white" 
          text="Loading 10,000+ colors..." 
        />
      </div>
    )
  }

  return (
    <div className={`font-sans transition-all duration-500 ${themeClasses}`} style={backgroundStyle}>
      <SecurityHeaders />
      <Header isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
      
      {/* SEO Content */}
      <section className="sr-only">
        <h1>Forza Color Universe - Official Automotive Paint Colors Database</h1>
        <p>Explore over 10,000 official automotive paint colors from Forza racing games. Search by manufacturer like Ferrari, Porsche, BMW, Mercedes, and more. Find exact HSB color values, upload images for color matching, and discover the perfect automotive paint for your project.</p>
      </section>
      
      {/* Filter Controls */}
      <nav className={`p-4 ${isDarkMode ? 'bg-slate-900/50' : 'bg-white/80'} backdrop-blur-sm sticky top-0 z-10`} role="search" aria-label="Color search and filters">
        <div className="container mx-auto flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:w-1/3">
            <input
              type="text"
              placeholder="Search by color, make, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } border-2 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 ${
                isDarkMode ? 'focus:ring-fuchsia-500 focus:border-fuchsia-500' : 'focus:ring-blue-500 focus:border-blue-500'
              } transition-colors`}
            />
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              isDarkMode ? 'text-slate-400' : 'text-gray-500'
            }`}>🔍</span>
          </div>
          <div className="relative w-full sm:w-1/3">
            <select
              value={selectedMake}
              onChange={(e) => setSelectedMake(e.target.value)}
              aria-label="Filter by car manufacturer"
              className={`w-full ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-slate-100' 
                  : 'bg-white border-gray-300 text-gray-900'
              } border-2 rounded-md py-2 px-4 focus:outline-none focus:ring-2 ${
                isDarkMode ? 'focus:ring-fuchsia-500 focus:border-fuchsia-500' : 'focus:ring-blue-500 focus:border-blue-500'
              } transition-colors`}
            >
              <option value="">All Manufacturers</option>
              {makes.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
          </div>
          <div className="relative w-full sm:w-1/3">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={!selectedMake}
              aria-label="Filter by car model"
              className={`w-full ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-slate-100' 
                  : 'bg-white border-gray-300 text-gray-900'
              } border-2 rounded-md py-2 px-4 focus:outline-none focus:ring-2 ${
                isDarkMode ? 'focus:ring-fuchsia-500 focus:border-fuchsia-500' : 'focus:ring-blue-500 focus:border-blue-500'
              } transition-colors disabled:opacity-50`}
            >
              <option value="">{selectedMake ? 'All Models' : 'Select Make First'}</option>
              {models.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
          <ExportButton favorites={favorites} isDarkMode={isDarkMode} />
          <button
            onClick={toggleImageExtractor}
            className={`px-4 py-2 rounded-md transition-colors ${
              showImageExtractor
                ? isDarkMode
                  ? 'bg-fuchsia-600 text-white'
                  : 'bg-fuchsia-500 text-white'
                : isDarkMode
                  ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🎨 Image Match
          </button>
        </div>
      </nav>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8" role="main">
        <Breadcrumbs 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Automotive Colors', current: true }
          ]}
          isDarkMode={isDarkMode}
        />
        {/* Recently Viewed Colors */}
        {colorHistory.length > 0 && (
          <section className="mb-8" aria-labelledby="recent-colors-heading">
            <h2 id="recent-colors-heading" className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>
              🕒 Recently Viewed Colors
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {colorHistory.slice(0, 10).map((color, index) => {
                const hsbToHsl = (h: number, s: number, b: number): [number, number, number] => {
                  const l = b * (1 - s / 2)
                  const newS = l === 0 || l === 1 ? 0 : (b - l) / Math.min(l, 1 - l)
                  return [h * 360, newS * 100, l * 100]
                }
                const [h1, s1, l1] = hsbToHsl(color.color1.h, color.color1.s, color.color1.b)
                const [h2, s2, l2] = hsbToHsl(color.color2.h, color.color2.s, color.color2.b)
                const gradient = `linear-gradient(45deg, hsl(${h1}, ${s1}%, ${l1}%), hsl(${h2}, ${s2}%, ${l2}%))`
                
                return (
                  <button
                    key={`history-${index}`}
                    onClick={() => handleColorSelect(color)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 transition-all hover:scale-110 ${
                      isDarkMode ? 'border-slate-600 hover:border-fuchsia-400' : 'border-gray-300 hover:border-fuchsia-500'
                    }`}
                    style={{ background: gradient }}
                    title={`${color.colorName} - ${color.make}`}
                  />
                )
              })}
            </div>
          </section>
        )}
        
        {/* Image Color Extractor */}
        {showImageExtractor && (
          <section className="mb-8" aria-labelledby="image-extractor-heading">
            <h2 id="image-extractor-heading" className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>
              🎨 Image Color Matching Tool
            </h2>
            <ImageColorExtractor
              colors={colors}
              onColorsFound={handleImageColorsFound}
              isDarkMode={isDarkMode}
              showTutorial={showTutorial}
              onTutorialClose={handleTutorialClose}
            />
          </section>
        )}
        
        {/* Image Match Results */}
        {imageMatchedColors.length > 0 && (
          <section className="mb-8" aria-labelledby="matched-colors-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="matched-colors-heading" className={`text-xl font-semibold ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>
                🎯 Matched Automotive Colors ({imageMatchedColors.length} found)
              </h2>
              <button
                onClick={clearImageResults}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  isDarkMode
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Clear Results
              </button>
            </div>
          </section>
        )}
        
        {/* Color Statistics */}
        {!loading && colors.length > 0 && (
          <section className="mb-8" aria-labelledby="color-stats-heading">
            <h2 id="color-stats-heading" className="sr-only">Color Database Statistics</h2>
            <ColorStats 
              colors={colors}
              favorites={favorites}
              colorHistory={colorHistory}
              isDarkMode={isDarkMode}
            />
          </section>
        )}
        
        {/* Fun Features Section */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <ColorRandomizer 
              colors={filteredColors} 
              onColorSelect={(color) => {
                setSelectedColor(color)
                track({ action: 'view', colorName: color.colorName, make: color.make })
              }}
              isDarkMode={isDarkMode} 
            />
            <ColorPalette colors={colors} isDarkMode={isDarkMode} />
            <ColorTrends colors={colors} favorites={favorites} isDarkMode={isDarkMode} />
          </div>

          {/* Model Browser */}
        {!loading && colors.length > 0 && (
          <section className="mb-8" aria-labelledby="model-browser-heading">
            <h2 id="model-browser-heading" className="sr-only">Browse Colors by Vehicle Model</h2>
            <ModelBrowser 
              colors={colors}
              isDarkMode={isDarkMode}
              onModelSelect={handleModelSelect}
            />
          </section>
        )}
        
        {displayedColors.length > 0 ? (
          <>
            <LazyColorGrid
              colors={displayedColors}
              favorites={favorites}
              onColorSelect={handleColorSelect}
              onToggleFavorite={toggleFavorite}
              isDarkMode={isDarkMode}
            />
            
            {/* Loading indicator */}
            {hasMore && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-500"></div>
                <span className={`ml-3 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  Loading more colors...
                </span>
              </div>
            )}
            
            {!hasMore && displayedColors.length > 0 && (
              <div className="text-center py-8">
                <p className={`${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  🎨 You've seen all {displayedColors.length} colors!
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              No Colors Found
            </h2>
            <p className={`mt-2 ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </main>
      
      <Footer isDarkMode={isDarkMode} />

      {/* Simple Modal */}
      {selectedColor && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setSelectedColor(null)}
        >
          <div 
            className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-8 border border-slate-700 animate-bounce-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 flex gap-2">
              <ShareButton color={selectedColor} isDarkMode={isDarkMode} />
              <button 
                onClick={() => setSelectedColor(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <h2 className="text-3xl font-bold text-slate-100 bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-transparent bg-clip-text mb-2">
              {selectedColor.colorName}
            </h2>
            <p className="text-lg text-slate-400 mb-6">
              {selectedColor.make} {selectedColor.model} {selectedColor.year && `(${selectedColor.year})`}
            </p>
            <div className="space-y-4">
              {selectedColor.colorType && (
                <p className="text-slate-300">
                  <span className="font-semibold text-slate-100">Type:</span> {selectedColor.colorType}
                </p>
              )}
              <div>
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">Color Values</h4>
                <div className="grid grid-cols-2 gap-4 text-sm bg-slate-800 p-3 rounded-md">
                  <div>
                    <strong>Color 1:</strong><br/>
                    H: {selectedColor.color1.h.toFixed(3)}<br/>
                    S: {selectedColor.color1.s.toFixed(3)}<br/>
                    B: {selectedColor.color1.b.toFixed(3)}
                  </div>
                  <div>
                    <strong>Color 2:</strong><br/>
                    H: {selectedColor.color2.h.toFixed(3)}<br/>
                    S: {selectedColor.color2.s.toFixed(3)}<br/>
                    B: {selectedColor.color2.b.toFixed(3)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}