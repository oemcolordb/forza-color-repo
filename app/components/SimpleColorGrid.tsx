'use client'

import React, { useState, useEffect, useCallback } from 'react'
import ColorCard from './ColorCard'
import { CarColor } from '../types'

interface SimpleColorGridProps {
  colors: CarColor[]
  favorites: string[]
  onColorSelect: (color: CarColor) => void
  onToggleFavorite: (colorId: string) => void
  isDarkMode: boolean
}

const SimpleColorGrid: React.FC<SimpleColorGridProps> = ({
  colors,
  favorites,
  onColorSelect,
  onToggleFavorite,
  isDarkMode
}) => {
  const [displayCount, setDisplayCount] = useState(100)
  const [isLoading, setIsLoading] = useState(false)

  const loadMore = useCallback(() => {
    if (isLoading || displayCount >= colors.length) return
    
    setIsLoading(true)
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + 100, colors.length))
      setIsLoading(false)
    }, 100)
  }, [colors.length, displayCount, isLoading])

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMore()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadMore])

  useEffect(() => {
    setDisplayCount(100)
  }, [colors])

  if (colors.length === 0) {
    return (
      <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        No colors to display
      </div>
    )
  }

  const displayedColors = colors.slice(0, displayCount)

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {displayedColors.map((color, index) => {
          const colorId = `${color.make}-${color.colorName}-${color.year || 'unknown'}`
          const uniqueKey = `${colorId}-${index}`
          const isFavorite = favorites.includes(colorId)
          
          return (
            <ColorCard
              key={uniqueKey}
              color={color}
              onSelect={onColorSelect}
              isFavorite={isFavorite}
              onToggleFavorite={() => onToggleFavorite(colorId)}
              isDarkMode={isDarkMode}
            />
          )
        })}
      </div>
      
      {displayCount < colors.length && (
        <div className="text-center py-6">
          {isLoading ? (
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading more colors...
            </div>
          ) : (
            <>
              <div className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing {displayCount} of {colors.length} colors
              </div>
              <button
                onClick={loadMore}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Load More Colors
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}

export default SimpleColorGrid