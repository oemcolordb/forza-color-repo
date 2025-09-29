'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import type { CarColor } from './types/color'
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
import ModelBrowser from './components/ModelBrowser'
import LoadingSpinner from './components/LoadingSpinner'
import ImageColorExtractor from './components/ImageColorExtractor'
import Breadcrumbs from './components/Breadcrumbs'
import ColorRandomizer from './components/ColorRandomizer'
import ColorPalette from './components/ColorPalette'
import ColorTrends from './components/ColorTrends'
import TokyoBackground from './components/TokyoBackground'
import MobileOptimizedBackground from './components/MobileOptimizedBackground'
import MusicPlayer from './components/MusicPlayer'
import PaletteGenerator from './components/PaletteGenerator'
import HSBVisualizer from './components/HSBVisualizer'
import ColorRouletteHarmony from './components/ColorRouletteHarmony'
import { AuthProvider } from './components/AuthProvider'
import AuthModal from './components/AuthModal'
import CollapsibleSection from './components/CollapsibleSection'
import Car3DViewer from './components/Car3DViewer'
import PaintEffect3D from './components/PaintEffect3D'
import DiscordIntegration from './components/DiscordIntegration'
import OfflineIndicator from './components/OfflineIndicator'
import { useOfflineStorage } from './hooks/useOfflineStorage'

export default function HomePage() {
  const [colors, setColors] = useState<CarColor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMake, setSelectedMake] = useState('')
  const [selectedColorType, setSelectedColorType] = useState('')
  const [displayedColors, setDisplayedColors] = useState<CarColor[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [selectedColor, setSelectedColor] = useState<CarColor | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [colorHistory, setColorHistory] = useState<CarColor[]>([])
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [tokyoBackground, setTokyoBackground] = useState('')
  const [page, setPage] = useState(1)
  const [imageMatchedColors, setImageMatchedColors] = useState<CarColor[]>([])
  const [showImageExtractor, setShowImageExtractor] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const ITEMS_PER_PAGE = isMobile ? 30 : 60
  const { track } = useAnalytics()
  const { measureAsync } = usePerformance()
  const { isOnline, cacheColors, getOfflineColors } = useOfflineStorage()

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || (typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)))
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    const loadColors = async () => {
      try {
        const colorData = await measureAsync('Load Color Data', async () => {
          try {
            // Check if running in Electron
            if (typeof window !== 'undefined' && (window as any).electronAPI) {
              return await (window as any).electronAPI.loadColorData()
            }
            
            // Try online first, fallback to offline
            if (isOnline) {
              const { default: data } = await import('../services/colorData')
              // Cache colors for offline use
              await cacheColors(data)
              return data
            } else {
              // Load from offline cache
              const cachedData = await getOfflineColors()
              if (cachedData.length > 0) {
                return cachedData
              }
              // Last resort - try to load anyway
              const { default: data } = await import('../services/colorData')
              return data
            }
          } catch (error) {
            console.error('Failed to load color data:', error)
            // Try offline cache as final fallback
            const cachedData = await getOfflineColors()
            return cachedData.length > 0 ? cachedData : []
          }
        })
        
        setColors(colorData)
        setDisplayedColors(colorData.slice(0, ITEMS_PER_PAGE))
        setHasMore(colorData.length > ITEMS_PER_PAGE)
        
        // Generate Tokyo-style dynamic background
        const generateTokyoBackground = () => {
          const tokyoThemes = [
            // Neon Tokyo Night
            'radial-gradient(circle at 20% 80%, #ff0080 0%, transparent 50%), radial-gradient(circle at 80% 20%, #00ffff 0%, transparent 50%), radial-gradient(circle at 40% 40%, #ff4000 0%, transparent 50%), linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 50%, #0a1a1a 100%)',
            // Cyberpunk Skyline
            'linear-gradient(180deg, #ff006e 0%, #8338ec 25%, #3a86ff 50%, #06ffa5 75%, #ffbe0b 100%), linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%)',
            // Tokyo Sunset
            'radial-gradient(ellipse at top, #ff9a9e 0%, #fecfef 50%, #fecfef 100%), linear-gradient(180deg, #ff9a9e 0%, #fad0c4 100%)',
            // Shibuya Lights
            'conic-gradient(from 180deg at 50% 50%, #ff0080, #00ffff, #ff4000, #8000ff, #ff0080), radial-gradient(circle, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 100%)',
            // Harajuku Dreams
            'linear-gradient(45deg, #ff9a9e 0%, #fecfef 25%, #fecfef 50%, #ff9a9e 75%, #fad0c4 100%)',
            // Tokyo Rain
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%), radial-gradient(circle at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            // Akihabara Electric
            'radial-gradient(circle at 25% 25%, #ff0080 0%, transparent 50%), radial-gradient(circle at 75% 75%, #00ff80 0%, transparent 50%), linear-gradient(45deg, #000428 0%, #004e92 100%)',
            // Tokyo Tower Night
            'linear-gradient(180deg, #ff416c 0%, #ff4b2b 100%), radial-gradient(circle at 50% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)',
            // Shinjuku Neon
            'conic-gradient(from 90deg at 50% 50%, #ff0080, #8000ff, #0080ff, #00ff80, #ff8000, #ff0080), linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8))',
            // Cherry Blossom Tech
            'radial-gradient(circle at 20% 80%, #ffecd2 0%, transparent 50%), radial-gradient(circle at 80% 20%, #fcb69f 0%, transparent 50%), linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          ]
          
          // Change background every 30 minutes based on timestamp
          const now = new Date()
          const thirtyMinuteSlots = Math.floor(now.getTime() / (30 * 60 * 1000))
          const themeIndex = thirtyMinuteSlots % tokyoThemes.length
          
          return tokyoThemes[themeIndex]
        }
        
        setTokyoBackground(generateTokyoBackground())
        
        // Set up interval to change background every 30 minutes
        const backgroundInterval = setInterval(() => {
          setTokyoBackground(generateTokyoBackground())
        }, 30 * 60 * 1000) // 30 minutes
        
        // Cleanup interval on unmount
        return () => {
          clearInterval(backgroundInterval)
          window.removeEventListener('resize', checkMobile)
        }
      } catch (error) {
        console.error('Failed to load colors:', error)
      } finally {
        setLoading(false)
      }
    }
    loadColors()
    
    // Register service worker for offline support
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered:', registration)
        })
        .catch(error => {
          console.log('SW registration failed:', error)
        })
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

  const colorTypes = useMemo(() => {
    const uniqueTypes = Array.from(new Set(colors.map(color => color.colorType || 'Unknown')))
    return uniqueTypes.sort()
  }, [colors])

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
      const matchesColorType = !selectedColorType || color.colorType === selectedColorType

      return matchesSearch && matchesMake && matchesColorType
    })
  }, [colors, searchQuery, selectedMake, selectedColorType])

  useEffect(() => {
    setSelectedColorType('') // Reset color type when make changes
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
  }, [filteredColors, imageMatchedColors, page, hasMore, loading, ITEMS_PER_PAGE])

  useEffect(() => {
    const handleScroll = () => {
      const threshold = isMobile ? 500 : 800
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - threshold) {
        loadMore()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadMore, isMobile])

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

  const handleColorTypeSelect = useCallback((colorType: string) => {
    setSelectedColorType(colorType)
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
    background: tokyoBackground || (isDarkMode ? '#0a0a0a' : '#ffffff'),
    minHeight: '100vh',
    backgroundAttachment: 'fixed',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
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
    <AuthProvider>
      <div className={`font-sans transition-all duration-500 ${themeClasses} relative ${isMobile ? 'mobile-optimized' : ''}`} style={backgroundStyle}>
      {isMobile ? (
        <MobileOptimizedBackground isDarkMode={isDarkMode} />
      ) : (
        <TokyoBackground isDarkMode={isDarkMode} />
      )}
      <div className="relative z-10">
        <SecurityHeaders />
      <Header isDarkMode={isDarkMode} onToggleTheme={toggleTheme} onShowAuth={() => setShowAuthModal(true)} />
      
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
              value={selectedColorType}
              onChange={(e) => setSelectedColorType(e.target.value)}
              aria-label="Filter by color type"
              className={`w-full ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-slate-100' 
                  : 'bg-white border-gray-300 text-gray-900'
              } border-2 rounded-md py-2 px-4 focus:outline-none focus:ring-2 ${
                isDarkMode ? 'focus:ring-fuchsia-500 focus:border-fuchsia-500' : 'focus:ring-blue-500 focus:border-blue-500'
              } transition-colors`}
            >
              <option value="">All Color Types</option>
              {colorTypes.map(type => (
                <option key={type} value={type}>{type}</option>
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
          <CollapsibleSection 
            title="Recently Viewed Colors" 
            icon="🕒" 
            isDarkMode={isDarkMode}
            defaultOpen={false}
          >
            <div className="flex gap-3 overflow-x-auto pb-2">
              {colorHistory.slice(0, 10).map((color, index) => {
                const gradient = createForzaGradient(color.color1, color.color2)
                
                return (
                  <button
                    key={`${color.make}-${color.colorName}-${color.year || 'unknown'}-${index}`}
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
          </CollapsibleSection>
        )}
        
        {/* Image Color Extractor */}
        {showImageExtractor && (
          <CollapsibleSection 
            title="Image Color Matching Tool" 
            icon="🎨" 
            isDarkMode={isDarkMode}
          >
            <ImageColorExtractor
              colors={colors}
              onColorsFound={handleImageColorsFound}
              onColorSelect={handleColorSelect}
              isDarkMode={isDarkMode}
              showTutorial={showTutorial}
              onTutorialClose={handleTutorialClose}
            />
          </CollapsibleSection>
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
          <CollapsibleSection 
            title="Color Database Statistics" 
            icon="📊" 
            isDarkMode={isDarkMode}
            defaultOpen={false}
          >
            {isMobile ? (
              <MobileColorStats 
                colors={colors}
                favorites={favorites}
                colorHistory={colorHistory}
                isDarkMode={isDarkMode}
              />
            ) : (
              <ColorStats 
                colors={colors}
                favorites={favorites}
                colorHistory={colorHistory}
                isDarkMode={isDarkMode}
              />
            )}
          </CollapsibleSection>
        )}
        
        {/* Fun Features Section - Hide on mobile */}
        {!isMobile && (
          <>
            <CollapsibleSection 
              title="Color Tools & Analytics" 
              icon="🎲" 
              isDarkMode={isDarkMode}
            >
              <div className="grid lg:grid-cols-3 gap-6">
                <ColorRouletteHarmony 
                  colors={filteredColors}
                  isDarkMode={isDarkMode}
                  onColorSelect={(color) => {
                    setSelectedColor(color)
                    track({ action: 'view', colorName: color.colorName, make: color.make })
                  }}
                  onHarmonyGenerated={(harmony) => {
                    setDisplayedColors(harmony)
                    setHasMore(false)
                    setPage(1)
                    track({ action: 'view', colorName: `harmony_${harmony.length}_colors`, make: 'Generated' })
                  }}
                />
                <ColorPalette colors={colors} isDarkMode={isDarkMode} />
                <ColorTrends colors={colors} favorites={favorites} isDarkMode={isDarkMode} />
              </div>
            </CollapsibleSection>
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <CollapsibleSection 
                title="HSB Color Space Visualization" 
                icon="🌈" 
                isDarkMode={isDarkMode}
                defaultOpen={false}
              >
                <HSBVisualizer colors={filteredColors} isDarkMode={isDarkMode} />
              </CollapsibleSection>
              
              <CollapsibleSection 
                title="3D Paint Effects" 
                icon="🎨" 
                isDarkMode={isDarkMode}
                defaultOpen={false}
              >
                <PaintEffect3D colors={filteredColors} isDarkMode={isDarkMode} />
              </CollapsibleSection>
            </div>
          </>
        )}

        {/* Color Type Browser - Hide on mobile */}
        {!loading && colors.length > 0 && !isMobile && (
          <CollapsibleSection 
            title="Browse Colors by Type" 
            icon="🏷️" 
            isDarkMode={isDarkMode}
            defaultOpen={false}
          >
            <ModelBrowser 
              colors={colors}
              isDarkMode={isDarkMode}
              onColorTypeSelect={handleColorTypeSelect}
            />
          </CollapsibleSection>
        )}
        
        {displayedColors.length > 0 ? (
          <>
            <VirtualizedColorGrid
              colors={displayedColors}
              favorites={favorites}
              onColorSelect={handleColorSelect}
              onToggleFavorite={toggleFavorite}
              isDarkMode={isDarkMode}
              isMobile={isMobile}
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
      
      {/* Music Player - Hide on mobile */}
      {!isMobile && <MusicPlayer isDarkMode={isDarkMode} />}

      {/* Enhanced Color Modal */}
      {selectedColor && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setSelectedColor(null)}
        >
          <div 
            className={`bg-slate-900 rounded-xl shadow-2xl w-full max-h-[90vh] overflow-y-auto relative border border-slate-700 animate-bounce-in ${
              isMobile ? 'max-w-sm p-3' : 'max-w-3xl p-8'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`absolute ${isMobile ? 'top-2 right-2' : 'top-4 right-4'} flex gap-2`}>
              {!isMobile && <ShareButton color={selectedColor} isDarkMode={isDarkMode} />}
              <button 
                onClick={() => setSelectedColor(null)}
                className={`text-slate-400 hover:text-white transition-colors ${isMobile ? 'text-lg' : ''}`}
              >
                ✕
              </button>
            </div>
            <h2 className={`font-bold text-slate-100 bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-transparent bg-clip-text mb-2 ${isMobile ? 'text-lg pr-8' : 'text-3xl'}`}>
              {selectedColor.colorName}
            </h2>
            <p className={`text-slate-400 mb-3 ${isMobile ? 'text-xs' : 'text-lg'}`}>
              {selectedColor.make} {selectedColor.model} {selectedColor.year && `(${selectedColor.year})`}
            </p>
            
            {/* Color Swatches */}
            <div className={`mb-3 ${isMobile ? 'mb-2' : 'mb-6'}`}>
              <h4 className={`font-semibold text-cyan-400 mb-2 ${isMobile ? 'text-sm' : 'text-lg'}`}>🎨 Color Preview</h4>
              <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-2'}`}>
                {/* Color 1 Swatch */}
                <div className="space-y-1">
                  <div 
                    className={`w-full rounded-lg border-2 border-slate-600 shadow-lg ${isMobile ? 'h-12' : 'h-24'}`}
                    style={{ 
                      backgroundColor: hsbToCSS(selectedColor.color1)
                    }}
                  />
                  <p className={`text-slate-300 text-center font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>Primary</p>
                </div>
                
                {/* Color 2 Swatch */}
                <div className="space-y-1">
                  <div 
                    className={`w-full rounded-lg border-2 border-slate-600 shadow-lg ${isMobile ? 'h-12' : 'h-24'}`}
                    style={{ 
                      backgroundColor: hsbToCSS(selectedColor.color2)
                    }}
                  />
                  <p className={`text-slate-300 text-center font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>Secondary</p>
                </div>
              </div>
              
              {/* Combined Gradient */}
              <div className="mt-2">
                <div 
                  className={`w-full rounded-lg border-2 border-slate-600 shadow-lg ${isMobile ? 'h-8' : 'h-16'}`}
                  style={{ 
                    background: createForzaGradient(selectedColor.color1, selectedColor.color2)
                  }}
                />
                <p className={`text-slate-300 text-center font-medium mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>Mixed Color</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {selectedColor.colorType && (
                <p className={`text-slate-300 ${isMobile ? 'text-sm' : ''}`}>
                  <span className="font-semibold text-slate-100">Type:</span> {selectedColor.colorType}
                </p>
              )}
              
              {/* Forza 5 HSB Color Values */}
              <div>
                <h4 className={`font-semibold text-cyan-400 mb-2 ${isMobile ? 'text-sm' : 'text-lg'}`}>📊 Color Values</h4>
                <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                  {/* Color 1 Values */}
                  <div className={`bg-slate-800 rounded-lg ${isMobile ? 'p-2' : 'p-4'}`}>
                    <h5 className={`font-semibold text-fuchsia-400 mb-1 ${isMobile ? 'text-xs' : 'text-base'}`}>Primary Color</h5>
                    <div className={`space-y-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      <div className="text-center">
                        <div className={`font-mono text-slate-200 ${isMobile ? 'text-sm' : 'text-lg'}`}>
                          {formatHSBValues(selectedColor.color1)}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-center">
                        <div>
                          <div className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-xs'}`}>Hue</div>
                          <div className={`font-bold text-fuchsia-400 ${isMobile ? 'text-xs' : 'text-lg'}`}>{Math.round(selectedColor.color1.h * 360)}</div>
                        </div>
                        <div>
                          <div className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-xs'}`}>Sat</div>
                          <div className={`font-bold text-cyan-400 ${isMobile ? 'text-xs' : 'text-lg'}`}>{Math.round(selectedColor.color1.s * 100)}</div>
                        </div>
                        <div>
                          <div className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-xs'}`}>Bright</div>
                          <div className={`font-bold text-yellow-400 ${isMobile ? 'text-xs' : 'text-lg'}`}>{Math.round(selectedColor.color1.b * 100)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Color 2 Values */}
                  <div className={`bg-slate-800 rounded-lg ${isMobile ? 'p-2' : 'p-4'}`}>
                    <h5 className={`font-semibold text-cyan-400 mb-1 ${isMobile ? 'text-xs' : 'text-base'}`}>Secondary Color</h5>
                    <div className={`space-y-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      <div className="text-center">
                        <div className={`font-mono text-slate-200 ${isMobile ? 'text-sm' : 'text-lg'}`}>
                          {formatHSBValues(selectedColor.color2)}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-center">
                        <div>
                          <div className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-xs'}`}>Hue</div>
                          <div className={`font-bold text-fuchsia-400 ${isMobile ? 'text-xs' : 'text-lg'}`}>{Math.round(selectedColor.color2.h * 360)}</div>
                        </div>
                        <div>
                          <div className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-xs'}`}>Sat</div>
                          <div className={`font-bold text-cyan-400 ${isMobile ? 'text-xs' : 'text-lg'}`}>{Math.round(selectedColor.color2.s * 100)}</div>
                        </div>
                        <div>
                          <div className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-xs'}`}>Bright</div>
                          <div className={`font-bold text-yellow-400 ${isMobile ? 'text-xs' : 'text-lg'}`}>{Math.round(selectedColor.color2.b * 100)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 3D Car Viewer */}
              <div className="mb-4">
                <h4 className={`font-semibold text-cyan-400 mb-2 ${isMobile ? 'text-sm' : 'text-lg'}`}>🚗 3D Preview</h4>
                <Car3DViewer color={selectedColor} isDarkMode={isDarkMode} />
              </div>
              
              {/* Discord & Share Buttons */}
              <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-between items-center'} pt-2`}>
                <DiscordIntegration selectedColor={selectedColor} isDarkMode={isDarkMode} />
                <ShareButton color={selectedColor} isDarkMode={isDarkMode} />
              </div>
            </div>
          </div>
        </div>
      )}
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          isDarkMode={isDarkMode} 
        />
        
        <OfflineIndicator isDarkMode={isDarkMode} />
      </div>
    </div>
    </AuthProvider>
  )
}