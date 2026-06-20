'use client'

import React, { useState, useEffect, useCallback } from 'react'
import ColorCard from '@/components/color/ColorCard'
import { CarColor } from '@/types'
import { useZoomDetection, ZoomLevel } from '@/hooks/useZoomDetection'

interface SimpleColorGridProps {
  colors: CarColor[]
  favorites: string[]
  onColorSelect: (_color: CarColor) => void
  onShowInfo?: (_color: CarColor) => void
  onToggleFavorite: (_colorId: string) => void
  isDarkMode: boolean
  trendingIds?: Set<string>
  communityChoiceIds?: Set<string>
  zoomInfo?: ZoomLevel & { isTransitioning: boolean }
}

const SimpleColorGrid: React.FC<SimpleColorGridProps> = ({
  colors,
  favorites,
  onColorSelect,
  onShowInfo,
  onToggleFavorite,
  isDarkMode,
  trendingIds,
  communityChoiceIds,
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
    
    // Adjust columns based on zoom scale for desktop — goes to screen edge
    const columnClasses = {
      xs: 'grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 2xl:grid-cols-16',
      sm: 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-14',
      md: 'grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-11 2xl:grid-cols-12',
      lg: 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9 2xl:grid-cols-10',
      xl: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8',
      xxl: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7',
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

          return (
            <ColorCard
              key={uniqueKey}
              color={color}
              onSelect={onColorSelect}
              onShowInfo={onShowInfo}
              isFavorite={isFavorite}
              onToggleFavorite={() => onToggleFavorite(colorId)}
              isTrending={trendingIds?.has(colorId)}
              isCommunityChoice={communityChoiceIds?.has(colorId)}
              isDarkMode={isDarkMode}
            />
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
