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

const VirtualGrid: React.FC<VirtualGridProps> = ({
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
    
    const startRow = Math.floor(scrollTop / (ITEM_HEIGHT + GAP))
    const endRow = Math.min(
      totalRows,
      startRow + Math.ceil(containerHeight / (ITEM_HEIGHT + GAP)) + 2
    )
    
    const visibleItems = []
    for (let row = Math.max(0, startRow - 1); row < endRow; row++) {
      for (let col = 0; col < ITEMS_PER_ROW; col++) {
        const index = row * ITEMS_PER_ROW + col
        if (index < colors.length) {
          visibleItems.push({
            color: colors[index],
            index,
            top: row * (ITEM_HEIGHT + GAP),
            left: col * (100 / ITEMS_PER_ROW)
          })
        }
      }
    }
    
    return { visibleItems, totalHeight }
  }, [colors, scrollTop, containerHeight])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-auto"
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ color, index, top, left }) => {
          const colorId = `${color.make}-${color.model}-${color.colorName}-${color.year}`
          return (
            <div
              key={`${colorId}-${index}`}
              className="absolute animate-fade-in"
              style={{
                top: `${top}px`,
                left: `${left}%`,
                width: `${100 / ITEMS_PER_ROW - 2}%`,
                height: `${ITEM_HEIGHT}px`
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
}

export default VirtualGrid