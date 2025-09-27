import React, { useState, useEffect, useRef, useMemo } from 'react'
import type { CarColor } from '../types/color'
import ColorCard from './ColorCard'

interface VirtualGridProps {
  colors: CarColor[]
  favorites: string[]
  onColorSelect: (color: CarColor) => void
  onToggleFavorite: (colorId: string) => void
  isDarkMode: boolean
}

const VirtualGrid: React.FC<VirtualGridProps> = React.memo(({
  colors,
  favorites,
  onColorSelect,
  onToggleFavorite,
  isDarkMode
}) => {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(800)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const ITEM_HEIGHT = 280
  const ITEMS_PER_ROW = 5
  const GAP = 24
  
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight)
      }
    }
    
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  const { visibleItems, totalHeight } = useMemo(() => {
    const totalRows = Math.ceil(colors.length / ITEMS_PER_ROW)
    const totalHeight = totalRows * (ITEM_HEIGHT + GAP)
    
    const startRow = Math.max(0, Math.floor(scrollTop / (ITEM_HEIGHT + GAP)) - 1)
    const endRow = Math.min(
      totalRows,
      startRow + Math.ceil(containerHeight / (ITEM_HEIGHT + GAP)) + 3
    )
    
    const visibleItems = []
    const startIndex = startRow * ITEMS_PER_ROW
    const endIndex = Math.min(colors.length, endRow * ITEMS_PER_ROW)
    
    for (let i = startIndex; i < endIndex; i++) {
      const row = Math.floor(i / ITEMS_PER_ROW)
      const col = i % ITEMS_PER_ROW
      visibleItems.push({
        color: colors[i],
        index: i,
        top: row * (ITEM_HEIGHT + GAP),
        left: col * (100 / ITEMS_PER_ROW)
      })
    }
    
    return { visibleItems, totalHeight }
  }, [colors.length, scrollTop, containerHeight])

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-auto"
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ color, index, top, left }) => {
          const colorId = `${color.make}-${color.model}-${color.colorName}-${color.year || 'unknown'}`
          return (
            <div
              key={index}
              className="absolute"
              style={{
                top: `${top}px`,
                left: `${left}%`,
                width: `${100 / ITEMS_PER_ROW - 2}%`,
                height: `${ITEM_HEIGHT}px`,
                transform: 'translateZ(0)' // Force GPU acceleration
              }}
            >
              <ColorCard
                color={color}
                onSelect={onColorSelect}
                isFavorite={favorites.includes(colorId)}
                onToggleFavorite={() => onToggleFavorite(colorId)}
                isDarkMode={isDarkMode}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
})

VirtualGrid.displayName = 'VirtualGrid'

export default VirtualGrid