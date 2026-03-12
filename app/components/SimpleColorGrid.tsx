'use client'

import React, { useState, useEffect, useCallback } from 'react'
import ColorCard from './ColorCard'
import { CarColor } from '../types'

interface SimpleColorGridProps {
  colors: CarColor[]
  favorites: string[]
  onColorSelect: (color: CarColor) => void
  onShowInfo?: (color: CarColor) => void
  onToggleFavorite: (colorId: string) => void
  isDarkMode: boolean
  expandedColorId?: string | null
}

const SimpleColorGrid: React.FC<SimpleColorGridProps> = ({
  colors,
  favorites,
  onColorSelect,
  onShowInfo,
  onToggleFavorite,
  isDarkMode,
  expandedColorId,
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
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-1">
        {displayedColors.map((color, index) => {
          const colorId = `${color.make}-${color.colorName}-${color.year || 'unknown'}`
          const uniqueKey = `${colorId}-${index}`
          const isFavorite = favorites.includes(colorId)
          const isExpanded = expandedColorId === colorId

          return (
            <React.Fragment key={uniqueKey}>
              <ColorCard
                color={color}
                onSelect={onColorSelect}
                onShowInfo={onShowInfo}
                isFavorite={isFavorite}
                onToggleFavorite={() => onToggleFavorite(colorId)}
                isDarkMode={isDarkMode}
              />
              {isExpanded && (
                <div
                  className={`col-span-full p-4 rounded-lg border-2 ${isDarkMode ? 'bg-slate-800 border-blue-500' : 'bg-gray-50 border-blue-400'}`}
                >
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <div
                        className="w-full h-16 rounded border mb-1"
                        style={{
                          background: `rgb(${Math.round(255 * color.color1.b * (1 - color.color1.s + color.color1.s * Math.cos((color.color1.h * 360 * Math.PI) / 180)))}, ${Math.round(255 * color.color1.b * (1 - color.color1.s + color.color1.s * Math.cos(((color.color1.h * 360 - 120) * Math.PI) / 180)))}, ${Math.round(255 * color.color1.b * (1 - color.color1.s + color.color1.s * Math.cos(((color.color1.h * 360 - 240) * Math.PI) / 180)))})`,
                        }}
                      />
                      <div className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                        Color 1
                      </div>
                      <div
                        className={`text-xs font-mono ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`}
                      >
                        {color.color1.h.toFixed(2)} {color.color1.s.toFixed(2)}{' '}
                        {color.color1.b.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="w-full h-16 rounded border mb-1"
                        style={{
                          background: `rgb(${Math.round(255 * color.color2.b * (1 - color.color2.s + color.color2.s * Math.cos((color.color2.h * 360 * Math.PI) / 180)))}, ${Math.round(255 * color.color2.b * (1 - color.color2.s + color.color2.s * Math.cos(((color.color2.h * 360 - 120) * Math.PI) / 180)))}, ${Math.round(255 * color.color2.b * (1 - color.color2.s + color.color2.s * Math.cos(((color.color2.h * 360 - 240) * Math.PI) / 180)))})`,
                        }}
                      />
                      <div className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                        Color 2
                      </div>
                      <div
                        className={`text-xs font-mono ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`}
                      >
                        {color.color2.h.toFixed(2)} {color.color2.s.toFixed(2)}{' '}
                        {color.color2.b.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="w-full h-16 rounded border mb-1"
                        style={{
                          background: `linear-gradient(45deg, rgb(${Math.round(255 * color.color1.b * (1 - color.color1.s + color.color1.s * Math.cos((color.color1.h * 360 * Math.PI) / 180)))}, ${Math.round(255 * color.color1.b * (1 - color.color1.s + color.color1.s * Math.cos(((color.color1.h * 360 - 120) * Math.PI) / 180)))}, ${Math.round(255 * color.color1.b * (1 - color.color1.s + color.color1.s * Math.cos(((color.color1.h * 360 - 240) * Math.PI) / 180)))}), rgb(${Math.round(255 * color.color2.b * (1 - color.color2.s + color.color2.s * Math.cos((color.color2.h * 360 * Math.PI) / 180)))}, ${Math.round(255 * color.color2.b * (1 - color.color2.s + color.color2.s * Math.cos(((color.color2.h * 360 - 120) * Math.PI) / 180)))}, ${Math.round(255 * color.color2.b * (1 - color.color2.s + color.color2.s * Math.cos(((color.color2.h * 360 - 240) * Math.PI) / 180)))}))`,
                        }}
                      />
                      <div className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                        Blend
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-slate-300' : 'text-gray-600'}>Make:</span>
                      <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                        {color.make}
                      </span>
                    </div>
                    {color.model && (
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-slate-300' : 'text-gray-600'}>
                          Model:
                        </span>
                        <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                          {color.model}
                        </span>
                      </div>
                    )}
                    {color.year && (
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-slate-300' : 'text-gray-600'}>
                          Year:
                        </span>
                        <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                          {color.year}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-slate-300' : 'text-gray-600'}>Type:</span>
                      <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                        {color.colorType}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleFavorite(colorId)}
                    className={`w-full rounded-lg font-medium transition-colors py-2 px-4 text-sm ${
                      favorites.includes(colorId)
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : isDarkMode
                          ? 'bg-slate-700 hover:bg-slate-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                  >
                    {favorites.includes(colorId) ? '❤️ Favorited' : '🤍 Add to Favorites'}
                  </button>
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {displayCount < colors.length && (
        <div className={`flex flex-col items-center gap-3 py-6 mt-2 rounded-xl border ${
          isDarkMode ? 'border-slate-700/50 bg-slate-800/40' : 'border-gray-200 bg-gray-50'
        }`}>
          <p className={`text-sm font-medium ${
            isDarkMode ? 'text-slate-400' : 'text-gray-500'
          }`}>
            {isLoading ? 'Loading more colors…' : `Showing ${displayCount} of ${colors.length} colors`}
          </p>
          {!isLoading && (
            <button
              onClick={loadMore}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'
                  : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'
              }`}
            >
              Load More
            </button>
          )}
        </div>
      )}
    </>
  )
}

export default SimpleColorGrid
