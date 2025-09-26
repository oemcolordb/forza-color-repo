'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import type { CarColor } from './types/color'
import Header from './components/Header'
import ColorCard from './components/ColorCard'
import Footer from './components/Footer'
import ColorStats from './components/ColorStats'
import ShareButton from './components/ShareButton'
import ExportButton from './components/ExportButton'
import { SecurityHeaders } from './components/SecurityHeaders'
import { useAnalytics } from './hooks/useAnalytics'
import LazyColorGrid from './components/LazyColorGrid'

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
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 50
  const { track } = useAnalytics()

  useEffect(() => {
    const loadColors = async () => {
      try {
        const { default: colorData } = await import('../services/colorData')
        setColors(colorData)
        setDisplayedColors(colorData.slice(0, ITEMS_PER_PAGE))
        setHasMore(colorData.length > ITEMS_PER_PAGE)
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
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('forza-favorites')
    if (saved) setFavorites(JSON.parse(saved))
    
    const history = localStorage.getItem('forza-history')
    if (history) setColorHistory(JSON.parse(history))
    
    const theme = localStorage.getItem('forza-theme')
    setIsDarkMode(theme === 'dark')
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
  }, [colors, searchQuery, selectedMake])

  useEffect(() => {
    setSelectedModel('') // Reset model when make changes
  }, [selectedMake])

  useEffect(() => {
    setPage(1)
    setDisplayedColors(filteredColors.slice(0, ITEMS_PER_PAGE))
    setHasMore(filteredColors.length > ITEMS_PER_PAGE)
  }, [filteredColors])

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return
    
    const nextPage = page + 1
    const startIndex = (nextPage - 1) * ITEMS_PER_PAGE
    const newColors = filteredColors.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    
    if (newColors.length > 0) {
      setDisplayedColors(prev => [...prev, ...newColors])
      setPage(nextPage)
      setHasMore(startIndex + ITEMS_PER_PAGE < filteredColors.length)
    } else {
      setHasMore(false)
    }
  }, [filteredColors, page, hasMore, loading])

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

  const themeClasses = isDarkMode 
    ? 'bg-slate-900 text-white' 
    : 'bg-gray-50 text-gray-900'

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500 mx-auto mb-4"></div>
          <p>Loading colors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${themeClasses}`}>
      <SecurityHeaders />
      <Header isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
      
      {/* Filter Controls */}
      <div className={`p-4 ${isDarkMode ? 'bg-slate-900/50' : 'bg-white/80'} backdrop-blur-sm sticky top-0 z-10`}>
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
        </div>
      </div>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Recently Viewed Colors */}
        {colorHistory.length > 0 && (
          <div className="mb-8">
            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>
              🕒 Recently Viewed
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
          </div>
        )}
        
        {/* Color Statistics */}
        {!loading && colors.length > 0 && (
          <div className="mb-8">
            <ColorStats 
              colors={colors}
              favorites={favorites}
              colorHistory={colorHistory}
              isDarkMode={isDarkMode}
            />
          </div>
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