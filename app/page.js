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
import { getSecureAssetUrl } from './lib/assetProtection'
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
import { ConsoleCleanup } from './components/ConsoleCleanup'

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
    
    if (!searchQuery && !selectedMake && !selectedColorType) {
      return allColors
    }
    
    const searchLower = searchQuery.toLowerCase()
    return allColors.filter(color => {
      const matchesSearch = !searchQuery || 
        color.colorName.toLowerCase().includes(searchLower) ||
        color.make.toLowerCase().includes(searchLower) ||
        (color.model && color.model.toLowerCase().includes(searchLower))
      
      const matchesMake = !selectedMake || color.make === selectedMake
      const matchesType = !selectedColorType || color.colorType === selectedColorType
      
      return matchesSearch && matchesMake && matchesType
    })
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
    
    // Fallback timeout
    const timeout = setTimeout(() => {
      setLoading(false)
      setIsInitialLoad(false)
    }, 10000)
    
    loadColors()
    
    return () => clearTimeout(timeout)
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
    const loadingVideos = [
      'Mp 4 H 280 3 Q Nlf 3 J O Aem 8 Kv Cu Uuya AN Cr O Du C Qs 63 S Vq Z Rad 6 O 11 BZ.mp4',
      'Mp 4 H 280 C Baj X 2 Z 9 R 9 E Fr 1 Gh W Ai RTFM 6 Xbt BSZ 76 N 6 Ywb BAE Dic 4 R.mp4',
      'Mp 4 H 280 J 9 IY 9 U GBZ Mp Lle M Zd 6 S Zybj Yh 3 F 6 G VI 46 Cr Uf 0 PN 3 Dq TU.mp4'
    ]
    const randomVideo = loadingVideos[Math.floor(Math.random() * loadingVideos.length)]
    const videoUrl = `/${randomVideo}`
    
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
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/> 
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Engine Block */}
                <rect x="10" y="30" width="100" height="40" rx="5" fill="url(#engineGradient)" filter="url(#engineGlow)" />
                
                {/* Cylinder Heads */}
                <rect x="15" y="25" width="15" height="10" rx="2" fill="#4b5563" />
                <rect x="35" y="25" width="15" height="10" rx="2" fill="#4b5563" />
                <rect x="55" y="25" width="15" height="10" rx="2" fill="#4b5563" />
                <rect x="75" y="25" width="15" height="10" rx="2" fill="#4b5563" />
                <rect x="95" y="25" width="10" height="10" rx="2" fill="#4b5563" />
                
                {/* Animated Pistons */}
                {[0, 1, 2, 3, 4].map((i) => {
                  const x = 17.5 + (i * 20)
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
                          transformOrigin: 'center bottom'
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
                          animationDelay: `${delay}s`
                        }}
                      />
                    </g>
                  )
                })}
                
                {/* Crankshaft */}
                <ellipse cx="60" cy="55" rx="45" ry="3" fill="#1f2937" opacity="0.8" />
                <rect x="15" y="53" width="90" height="4" rx="2" fill="#374151" />
                
                {/* Engine Details */}
                <circle cx="25" cy="50" r="3" fill="#ef4444" opacity="0.8" className="animate-pulse" />
                <circle cx="95" cy="50" r="3" fill="#10b981" opacity="0.8" className="animate-pulse" style={{animationDelay: '0.5s'}} />
                
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
                    right: `${i * 2}px`
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
                  style={{animationDuration: '0.5s', transformOrigin: '20px 20px'}}
                />
                <circle cx="20" cy="20" r="2" fill="#ef4444" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-yellow-400 to-red-400 text-transparent bg-clip-text animate-pulse">
            🔧 TuneForge Loading...
          </h1>
          <p className="text-lg text-slate-300 mb-4">Forging your automotive experience...</p>
          
          {/* Loading Bar */}
          <div className="w-64 h-3 bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full animate-pulse" style={{width: `${loadingProgress}%`, transition: 'width 0.3s ease'}}></div>
          </div>
          
          {/* Sparks Animation */}
          <div className="flex justify-center items-center gap-1 mt-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-1 bg-yellow-400 rounded-full animate-ping"
                style={{animationDelay: `${i * 200}ms`, animationDuration: '1s'}}
              ></div>
            ))}
          </div>
          
          <p className="text-sm text-orange-300 mt-2 opacity-75">
            {loadingProgress < 30 && "Heating the forge..."}
            {loadingProgress >= 30 && loadingProgress < 60 && "Shaping the gears..."}
            {loadingProgress >= 60 && loadingProgress < 90 && "Tempering the steel..."}
            {loadingProgress >= 90 && "Almost ready..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <AuthProvider>
      <ConsoleCleanup />
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
        
        <TokyoBackground isDarkMode={isDarkMode} getSecureAssetUrl={getSecureAssetUrl} />
        <ProgressiveLoader progress={loadingProgress} isDarkMode={isDarkMode} deviceInfo={deviceInfo} />
        
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
        
        <ResponsiveLayout>
          {/* Engine Bay - Header Stats */}
          <div className={`relative mb-6 rounded-xl overflow-hidden ${
            isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-gray-100 to-gray-200'
          } border-2 ${isDarkMode ? 'border-orange-500/30' : 'border-orange-400/40'}`}>
            <div className="absolute top-2 left-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className={`text-xs font-mono ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>ENGINE</span>
              </div>
            </div>
            <OptimizedStatsBar
              totalColors={allColors.length}
              totalMakes={makes.length}
              favorites={favorites.length}
              colorHistory={colorHistory.length}
              filteredCount={filteredColors.length}
              isDarkMode={isDarkMode}
              deviceInfo={deviceInfo}
            />
          </div>
          
          {/* Dashboard - Tool Sections */}
          <div className={`relative mb-6 rounded-xl overflow-hidden ${
            isDarkMode ? 'bg-gradient-to-r from-slate-800 to-slate-900' : 'bg-gradient-to-r from-slate-100 to-slate-200'
          } border-2 ${isDarkMode ? 'border-blue-500/30' : 'border-blue-400/40'} p-4`}>
            <div className="absolute top-2 left-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className={`text-xs font-mono ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>DASHBOARD</span>
              </div>
            </div>
            <div className="mt-6">
              <GamingErrorBoundary>
                <div className={`grid gap-3 ${
                  deviceInfo.isMobile 
                    ? 'grid-cols-1' 
                    : deviceInfo.isTablet 
                    ? 'grid-cols-2' 
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                }`}>
                  <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-300'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">📸</span>
                      <span className={`text-sm font-semibold ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>PAINT SCANNER</span>
                    </div>
                    <ImageColorExtractor
                      colors={allColors}
                      onColorsExtracted={setExtractedColors}
                      onColorsFound={() => {}}
                      onColorSelect={handleColorSelect}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  
                  <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-300'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🎰</span>
                      <span className={`text-sm font-semibold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>COLOR ROULETTE</span>
                    </div>
                    <ColorRouletteHarmony
                      colors={allColors}
                      isDarkMode={isDarkMode}
                      onColorSelect={handleColorSelect}
                      onHarmonyGenerated={(colors, mode) => {
                        setHarmonyColors(colors)
                        setHarmonyMode(mode)
                      }}
                    />
                  </div>
                  
                  {!deviceInfo.isMobile && (
                    <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-300'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🎨</span>
                        <span className={`text-sm font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>HARMONY DISPLAY</span>
                      </div>
                      <HarmonyVisualizer
                        currentHarmony={harmonyColors}
                        harmonyMode={harmonyMode}
                        isDarkMode={isDarkMode}
                        onColorSelect={handleColorSelect}
                      />
                    </div>
                  )}
                </div>
              </GamingErrorBoundary>
            </div>
          </div>
          
          {/* Paint Booth - Color Generator */}
          <div className={`relative mb-6 rounded-xl overflow-hidden ${
            isDarkMode ? 'bg-gradient-to-r from-purple-800 to-purple-900' : 'bg-gradient-to-r from-purple-100 to-purple-200'
          } border-2 ${isDarkMode ? 'border-purple-500/30' : 'border-purple-400/40'} p-4`}>
            <div className="absolute top-2 left-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <span className={`text-xs font-mono ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>PAINT BOOTH</span>
              </div>
            </div>
            <div className="mt-6">
              <GamingErrorBoundary>
                <ColorGenerator
                  colors={colors}
                  isDarkMode={isDarkMode}
                  onColorsGenerated={handleColorsGenerated}
                  isMobile={deviceInfo.isMobile}
                />
              </GamingErrorBoundary>
            </div>
          </div>
          
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

          {/* Control Panel - Search Controls */}
          <div className={`relative mb-6 rounded-xl overflow-hidden border-2 ${isDarkMode ? 'border-green-500/30' : 'border-green-400/40'} p-4`} style={{
            background: isDarkMode 
              ? 'linear-gradient(135deg, rgba(20,20,20,0.95) 0%, rgba(40,40,40,0.9) 50%, rgba(20,20,20,0.95) 100%), radial-gradient(circle at 20% 30%, rgba(0,255,0,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,0,0,0.1) 0%, transparent 50%)'
              : 'linear-gradient(135deg, rgba(60,60,60,0.95) 0%, rgba(80,80,80,0.9) 50%, rgba(60,60,60,0.95) 100%), radial-gradient(circle at 20% 30%, rgba(0,255,0,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,0,0,0.15) 0%, transparent 50%)'
          }}>
            <div className="absolute top-2 left-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg" style={{boxShadow: '0 0 8px rgba(0,255,0,0.6)'}}></div>
                <span className={`text-xs font-mono ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>DASHBOARD</span>
              </div>
            </div>
            {/* Dashboard Elements */}
            <div className="absolute top-2 right-4 flex gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{boxShadow: '0 0 4px rgba(255,0,0,0.6)'}}></div>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '0.5s', boxShadow: '0 0 4px rgba(255,255,0,0.6)'}}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '1s', boxShadow: '0 0 4px rgba(0,0,255,0.6)'}}></div>
            </div>
            {/* Dashboard Gauges */}
            <div className="absolute inset-4 grid grid-cols-5 gap-4">
              {/* RPM Gauge */}
              <div className="w-24 h-24 border-4 border-gray-300 rounded-full bg-black/80 flex items-center justify-center relative">
                <div className="absolute inset-2 border border-gray-500 rounded-full">
                  <div className="absolute top-1 left-1/2 w-0.5 h-3 bg-red-500 transform -translate-x-1/2"></div>
                  <div className="absolute bottom-1 left-1/2 w-0.5 h-3 bg-white transform -translate-x-1/2"></div>
                  <div className="absolute left-1 top-1/2 w-3 h-0.5 bg-white transform -translate-y-1/2"></div>
                  <div className="absolute right-1 top-1/2 w-3 h-0.5 bg-white transform -translate-y-1/2"></div>
                </div>
                <div className="w-1 h-8 bg-red-400 rounded transform rotate-45 origin-bottom shadow-lg"></div>
                <div className="absolute bottom-1 text-xs text-white font-mono">RPM</div>
              </div>
              
              {/* Turbo Gauge */}
              <div className="w-24 h-24 border-4 border-gray-300 rounded-full bg-black/80 flex items-center justify-center relative">
                <div className="absolute inset-2 border border-gray-500 rounded-full">
                  <div className="absolute top-1 left-1/2 w-0.5 h-3 bg-green-500 transform -translate-x-1/2"></div>
                  <div className="absolute bottom-1 left-1/2 w-0.5 h-3 bg-white transform -translate-x-1/2"></div>
                  <div className="absolute left-1 top-1/2 w-3 h-0.5 bg-white transform -translate-y-1/2"></div>
                  <div className="absolute right-1 top-1/2 w-3 h-0.5 bg-white transform -translate-y-1/2"></div>
                </div>
                <div className="w-1 h-8 bg-green-400 rounded transform -rotate-12 origin-bottom shadow-lg"></div>
                <div className="absolute bottom-1 text-xs text-white font-mono">PSI</div>
              </div>
              
              {/* Digital Speedometer */}
              <div className="w-32 h-24 border-2 border-gray-400 bg-black/90 rounded flex flex-col items-center justify-center relative">
                <div className="text-2xl font-mono text-cyan-400 font-bold">187</div>
                <div className="text-xs text-white font-mono">MPH</div>
                <div className="absolute top-1 left-1 w-1 h-1 bg-green-500 rounded-full"></div>
                <div className="absolute top-1 right-1 w-1 h-1 bg-red-500 rounded-full"></div>
              </div>
              
              {/* Dynometer */}
              <div className="w-32 h-24 border-2 border-gray-400 bg-black/90 rounded flex flex-col items-center justify-center relative">
                <div className="text-lg font-mono text-orange-400 font-bold">542</div>
                <div className="text-xs text-white font-mono">HP</div>
                <div className="w-full h-1 bg-gray-700 mt-1 rounded">
                  <div className="w-3/4 h-1 bg-orange-500 rounded"></div>
                </div>
              </div>
              
              {/* Temp Gauge */}
              <div className="w-24 h-24 border-4 border-gray-300 rounded-full bg-black/80 flex items-center justify-center relative">
                <div className="absolute inset-2 border border-gray-500 rounded-full">
                  <div className="absolute top-1 left-1/2 w-0.5 h-3 bg-blue-500 transform -translate-x-1/2"></div>
                  <div className="absolute bottom-1 left-1/2 w-0.5 h-3 bg-red-500 transform -translate-x-1/2"></div>
                  <div className="absolute left-1 top-1/2 w-3 h-0.5 bg-white transform -translate-y-1/2"></div>
                  <div className="absolute right-1 top-1/2 w-3 h-0.5 bg-white transform -translate-y-1/2"></div>
                </div>
                <div className="w-1 h-8 bg-yellow-400 rounded transform rotate-12 origin-bottom shadow-lg"></div>
                <div className="absolute bottom-1 text-xs text-white font-mono">TEMP</div>
              </div>
            </div>
            <div className="mt-6">
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
            </div>
          </div>
          
          {/* Showroom - Color Display */}
          <div className={`relative rounded-xl overflow-hidden border-2 ${isDarkMode ? 'border-yellow-500/30' : 'border-yellow-400/40'} p-4`} style={{
            background: isDarkMode 
              ? 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, rgba(192,192,192,0.3) 30%, rgba(169,169,169,0.2) 60%, rgba(105,105,105,0.1) 100%), conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,0.5) 0deg, rgba(192,192,192,0.4) 60deg, rgba(255,255,255,0.5) 120deg, rgba(192,192,192,0.4) 180deg, rgba(255,255,255,0.5) 240deg, rgba(192,192,192,0.4) 300deg, rgba(255,255,255,0.5) 360deg)'
              : 'radial-gradient(circle at 50% 50%, rgba(255,165,0,0.6) 0%, rgba(255,140,0,0.5) 30%, rgba(255,69,0,0.3) 60%, rgba(255,99,71,0.2) 100%), conic-gradient(from 0deg at 50% 50%, rgba(255,165,0,0.7) 0deg, rgba(255,140,0,0.6) 60deg, rgba(255,165,0,0.7) 120deg, rgba(255,140,0,0.6) 180deg, rgba(255,165,0,0.7) 240deg, rgba(255,140,0,0.6) 300deg, rgba(255,165,0,0.7) 360deg)'
          }}>
            <div className="absolute top-2 left-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-white to-gray-400 rounded-full animate-spin shadow-lg" style={{animationDuration: '3s', boxShadow: '0 0 8px rgba(255,255,255,0.6)'}}></div>
                <span className={`text-xs font-mono ${isDarkMode ? 'text-gray-300' : 'text-orange-700'}`}>ROTARY SHOWROOM</span>
              </div>
            </div>
            {/* Car Shop Background */}
            <div className="absolute inset-0 pointer-events-none opacity-75">
              {/* Car Tools */}
              <div className="absolute left-6 top-12 w-3 h-16 bg-gradient-to-b from-red-500 to-red-700 rounded shadow-lg">
                <div className="absolute top-0 w-full h-2 bg-black rounded-t"></div>
                <div className="absolute bottom-0 w-1 h-4 bg-gray-300 left-1/2 transform -translate-x-1/2"></div>
              </div>
              <div className="absolute right-6 top-12 w-12 h-2 bg-gradient-to-r from-gray-300 to-gray-500 rounded shadow-lg">
                <div className="absolute left-0 w-3 h-2 bg-gray-600 rounded-l"></div>
                <div className="absolute right-0 w-3 h-2 bg-gray-600 rounded-r"></div>
              </div>
              <div className="absolute left-12 bottom-20 w-2 h-12 bg-gradient-to-b from-blue-400 to-blue-600 rounded shadow-lg">
                <div className="absolute top-0 w-full h-2 bg-black rounded-t"></div>
              </div>
              <div className="absolute right-12 bottom-20 w-8 h-2 bg-gradient-to-r from-gray-400 to-gray-600 rounded shadow-lg">
                <div className="absolute left-1 top-0 w-1 h-2 bg-black"></div>
                <div className="absolute right-1 top-0 w-1 h-2 bg-black"></div>
              </div>
              
              {/* Car Hoists with JDM Cars */}
              <div className="absolute left-1/4 bottom-8 w-24 h-4 bg-gray-600 rounded">
                {/* Hoist Base */}
                <div className="absolute -top-16 left-1/2 w-1 h-16 bg-gray-500 transform -translate-x-1/2"></div>
                {/* Nissan Skyline R34 */}
                <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
                  <div className="w-20 h-6 bg-gradient-to-r from-purple-600 to-purple-800 rounded-sm shadow-lg">
                    <div className="absolute top-1 left-2 w-2 h-1 bg-yellow-400 rounded-full"></div>
                    <div className="absolute top-1 right-2 w-2 h-1 bg-red-500 rounded-full"></div>
                    <div className="absolute -bottom-1 left-1 w-2 h-2 bg-black rounded-full"></div>
                    <div className="absolute -bottom-1 right-1 w-2 h-2 bg-black rounded-full"></div>
                  </div>
                </div>
              </div>
              
              <div className="absolute right-1/4 bottom-8 w-24 h-4 bg-gray-600 rounded">
                {/* Hoist Base */}
                <div className="absolute -top-16 left-1/2 w-1 h-16 bg-gray-500 transform -translate-x-1/2"></div>
                {/* Toyota Supra */}
                <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
                  <div className="w-20 h-6 bg-gradient-to-r from-orange-500 to-orange-700 rounded-sm shadow-lg">
                    <div className="absolute top-1 left-2 w-2 h-1 bg-white rounded-full"></div>
                    <div className="absolute top-1 right-2 w-2 h-1 bg-red-500 rounded-full"></div>
                    <div className="absolute -bottom-1 left-1 w-2 h-2 bg-black rounded-full"></div>
                    <div className="absolute -bottom-1 right-1 w-2 h-2 bg-black rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Spinning Tire with Rim */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                {/* Tire */}
                <div className="w-80 h-80 rounded-full border-8 border-black animate-spin" style={{
                  background: 'radial-gradient(circle, rgba(40,40,40,0.9) 0%, rgba(20,20,20,0.8) 70%, rgba(10,10,10,0.9) 100%)',
                  boxShadow: 'inset 0 0 60px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.6)',
                  animationDuration: '3s'
                }}>
                  {/* Spinner Rim */}
                  <div className="absolute top-1/2 left-1/2 w-48 h-48 transform -translate-x-1/2 -translate-y-1/2 animate-spin" style={{
                    background: 'conic-gradient(from 0deg, rgba(255,215,0,0.9) 0deg, rgba(255,255,255,0.8) 30deg, rgba(255,215,0,0.9) 60deg, rgba(255,255,255,0.8) 90deg, rgba(255,215,0,0.9) 120deg, rgba(255,255,255,0.8) 150deg, rgba(255,215,0,0.9) 180deg, rgba(255,255,255,0.8) 210deg, rgba(255,215,0,0.9) 240deg, rgba(255,255,255,0.8) 270deg, rgba(255,215,0,0.9) 300deg, rgba(255,255,255,0.8) 330deg, rgba(255,215,0,0.9) 360deg)',
                    borderRadius: '50%',
                    boxShadow: '0 0 20px rgba(255,215,0,0.6), inset 0 0 30px rgba(255,255,255,0.3)',
                    animationDuration: '2s'
                  }}>
                    {/* Rim Spokes */}
                    <div className="absolute top-1/2 left-1/2 w-1 h-20 bg-gradient-to-t from-yellow-400 to-white transform -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute top-1/2 left-1/2 w-1 h-20 bg-gradient-to-t from-yellow-400 to-white transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                    <div className="absolute top-1/2 left-1/2 w-1 h-20 bg-gradient-to-t from-yellow-400 to-white transform -translate-x-1/2 -translate-y-1/2 rotate-90"></div>
                    <div className="absolute top-1/2 left-1/2 w-1 h-20 bg-gradient-to-t from-yellow-400 to-white transform -translate-x-1/2 -translate-y-1/2" style={{transform: 'translate(-50%, -50%) rotate(135deg)'}}></div>
                  </div>
                  {/* Center Cap */}
                  <div className="absolute top-1/2 left-1/2 w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg border-2 border-white"></div>
                </div>
              </div>
            </div>
            <div className="mt-6">
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
            </div>
          </div>
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