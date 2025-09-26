'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import type { CarColor } from './types/color'
import Header from './components/Header'
import ColorCard from './components/ColorCard'

const ITEMS_PER_PAGE = 50

export default function HomePage() {
  const [colors, setColors] = useState<CarColor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMake, setSelectedMake] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedColor, setSelectedColor] = useState<CarColor | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    const loadColors = async () => {
      try {
        const { default: colorData } = await import('../services/colorData')
        setColors(colorData)
      } catch (error) {
        console.error('Failed to load colors:', error)
      } finally {
        setLoading(false)
      }
    }
    loadColors()
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('forza-favorites')
    if (saved) setFavorites(JSON.parse(saved))
    
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
    const uniqueMakes = [...new Set(colors.map(color => color.make))]
    return uniqueMakes.sort()
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

      return matchesSearch && matchesMake
    })
  }, [colors, searchQuery, selectedMake])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedMake])

  const totalPages = Math.ceil(filteredColors.length / ITEMS_PER_PAGE)
  const paginatedColors = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredColors.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredColors, currentPage])

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
      <Header isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
      
      {/* Filter Controls */}
      <div className={`p-4 ${isDarkMode ? 'bg-slate-900/50' : 'bg-white/80'} backdrop-blur-sm sticky top-0 z-10`}>
        <div className="container mx-auto flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:w-1/2">
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
          <div className="relative w-full sm:w-1/2">
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
        </div>
      </div>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {paginatedColors.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {paginatedColors.map((color, index) => {
                const colorId = `${color.make}-${color.model}-${color.colorName}-${color.year}`
                return (
                  <ColorCard 
                    key={`${colorId}-${index}-${currentPage}`} 
                    color={color} 
                    onSelect={setSelectedColor}
                    isFavorite={favorites.includes(colorId)}
                    onToggleFavorite={() => toggleFavorite(colorId)}
                    isDarkMode={isDarkMode}
                  />
                )
              })}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 py-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    currentPage === 1
                      ? 'opacity-50 cursor-not-allowed'
                      : isDarkMode
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-100'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Previous
                </button>
                <span className={isDarkMode ? 'text-slate-300' : 'text-gray-600'}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    currentPage === totalPages
                      ? 'opacity-50 cursor-not-allowed'
                      : isDarkMode
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-100'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Next
                </button>
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

      {/* Simple Modal */}
      {selectedColor && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedColor(null)}
        >
          <div 
            className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-8 border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedColor(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
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