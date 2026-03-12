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
      <div className="px-1 py-1 sm:px-2">
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
                    className={`col-span-full mt-1 rounded-xl border p-4 ${
                      isDarkMode
                        ? 'border-blue-500/70 bg-slate-800/95'
                        : 'border-blue-400/70 bg-white/90'
                    }`}
                  >
                    <div className="mb-4 grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div
                          className="mb-1 h-16 w-full rounded-md border"
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
                          className="mb-1 h-16 w-full rounded-md border"
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
                          className="mb-1 h-16 w-full rounded-md border"
                          style={{
                            background: `linear-gradient(45deg, rgb(${Math.round(255 * color.color1.b * (1 - color.color1.s + color.color1.s * Math.cos((color.color1.h * 360 * Math.PI) / 180)))}, ${Math.round(255 * color.color1.b * (1 - color.color1.s + color.color1.s * Math.cos(((color.color1.h * 360 - 120) * Math.PI) / 180)))}, ${Math.round(255 * color.color1.b * (1 - color.color1.s + color.color1.s * Math.cos(((color.color1.h * 360 - 240) * Math.PI) / 180)))}), rgb(${Math.round(255 * color.color2.b * (1 - color.color2.s + color.color2.s * Math.cos((color.color2.h * 360 * Math.PI) / 180)))}, ${Math.round(255 * color.color2.b * (1 - color.color2.s + color.color2.s * Math.cos(((color.color2.h * 360 - 120) * Math.PI) / 180)))}, ${Math.round(255 * color.color2.b * (1 - color.color2.s + color.color2.s * Math.cos(((color.color2.h * 360 - 240) * Math.PI) / 180)))}))`,
                          }}
                        />
                        <div className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                          Blend
                        </div>
                      </div>
                    </div>
                    <div className="mb-4 space-y-1 text-sm">
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
                      className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        favorites.includes(colorId)
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : isDarkMode
                            ? 'bg-slate-700 text-white hover:bg-slate-600'
                            : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
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
