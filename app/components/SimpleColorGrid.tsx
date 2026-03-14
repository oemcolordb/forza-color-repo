'use client'

import React, { useState, useEffect, useCallback } from 'react'
import ColorCard from './ColorCard'
import { CarColor } from '../types'
import { useZoomDetection, ZoomLevel } from '../hooks/useZoomDetection'

interface SimpleColorGridProps {
  colors: CarColor[]
  favorites: string[]
  onColorSelect: (color: CarColor) => void
  onShowInfo?: (color: CarColor) => void
  onToggleFavorite: (colorId: string) => void
  isDarkMode: boolean
  expandedColorId?: string | null
  zoomInfo?: ZoomLevel & { isTransitioning: boolean }
}

const SimpleColorGrid: React.FC<SimpleColorGridProps> = ({
  colors,
  favorites,
  onColorSelect,
  onShowInfo,
  onToggleFavorite,
  isDarkMode,
  expandedColorId,
  zoomInfo: externalZoomInfo,
}) => {
  const [displayCount, setDisplayCount] = useState(100)
  const [isLoading, setIsLoading] = useState(false)
  const internalZoomInfo = useZoomDetection()
  const zoomInfo = externalZoomInfo || internalZoomInfo

  // Dynamic grid classes based on zoom level
  const getGridClasses = () => {
    // Use faster transitions on mobile, skip transitions on touch for better performance
    const transitionClass = zoomInfo.isMobile || zoomInfo.isTouch 
      ? 'transition-none' 
      : 'transition-all duration-500 ease-out'
    
    const baseClasses = `grid ${transitionClass} p-2`
    
    // Mobile-optimized: use simpler grid on touch devices
    if (zoomInfo.isMobile || zoomInfo.isTouch) {
      return `${baseClasses} grid-cols-2 sm:grid-cols-3 gap-3`
    }
    
    // Adjust columns based on zoom scale for desktop
    const columnClasses = {
      xs: 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12',
      sm: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10',
      md: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
      lg: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5',
      xl: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4',
      xxl: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3',
    }

    const gapClasses = {
      xs: 'gap-2',
      sm: 'gap-3',
      md: 'gap-5',
      lg: 'gap-6',
      xl: 'gap-7',
      xxl: 'gap-8',
    }

    return `${baseClasses} ${columnClasses[zoomInfo.scale]} ${gapClasses[zoomInfo.scale]}`
  }

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
      <div className="text-center py-8 opacity-75">
        No colors to display
      </div>
    )
  }

  const displayedColors = colors.slice(0, displayCount)

  return (
    <>
      <div className={getGridClasses()}>
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
                  className={`col-span-full p-4 rounded-lg border-2 ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}
                  style={{borderColor: 'var(--bamboo-stalk)'}}
                >
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <div
                        className="w-full h-16 rounded border mb-1"
                        style={{
                          background: `rgb(${Math.round(255 * color.color1.b * (1 - color.color1.s + color.color1.s * Math.cos((color.color1.h * 360 * Math.PI) / 180)))}, ${Math.round(255 * color.color1.b * (1 - color.color1.s + color.color1.s * Math.cos(((color.color1.h * 360 - 120) * Math.PI) / 180)))}, ${Math.round(255 * color.color1.b * (1 - color.color1.s + color.color1.s * Math.cos(((color.color1.h * 360 - 240) * Math.PI) / 180)))})`,
                        }}
                      />
                      <div className="text-xs opacity-75">
                        Color 1
                      </div>
                      <div
                        className="text-xs font-mono"
                        style={{color: 'var(--bamboo-stalk)'}}
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
                      <div className="text-xs opacity-75">
                        Color 2
                      </div>
                      <div
                        className="text-xs font-mono"
                        style={{color: 'var(--bamboo-stalk)'}}
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
                      <div className="text-xs opacity-75">
                        Blend
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="opacity-75">Make:</span>
                      <span className="font-medium">
                        {color.make}
                      </span>
                    </div>
                    {color.model && (
                      <div className="flex justify-between">
                        <span className="opacity-75">
                          Model:
                        </span>
                        <span className="font-medium">
                          {color.model}
                        </span>
                      </div>
                    )}
                    {color.year && (
                      <div className="flex justify-between">
                        <span className="opacity-75">
                          Year:
                        </span>
                        <span className="font-medium">
                          {color.year}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="opacity-75">Type:</span>
                      <span className="font-medium">
                        {color.colorType}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleFavorite(colorId)}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      favorites.includes(colorId)
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bamboo-button-ghost'
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
        <div className="text-center py-8 mt-4">
          {isLoading ? (
            <div className="text-sm opacity-75">
              Loading more colors...
            </div>
          ) : (
            <>
              <div className="text-sm mb-3 opacity-75">
                Showing {displayCount} of {colors.length} colors
              </div>
              <button
                onClick={loadMore}
                className="px-6 py-2 rounded-lg font-medium transition-colors bamboo-button"
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
