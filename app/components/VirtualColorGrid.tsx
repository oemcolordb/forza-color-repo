'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { FixedSizeGrid as Grid } from 'react-window'
import ColorCard from './ColorCard'
import { CarColor } from '../types'

interface VirtualColorGridProps {
  colors: CarColor[]
  favorites: string[]
  onColorSelect: (color: CarColor) => void
  onShowInfo?: (color: CarColor) => void
  onToggleFavorite: (colorId: string) => void
  isDarkMode: boolean
  expandedColorId?: string | null
}

const VirtualColorGrid: React.FC<VirtualColorGridProps> = ({
  colors,
  favorites,
  onColorSelect,
  onShowInfo,
  onToggleFavorite,
  isDarkMode,
  expandedColorId: _expandedColorId,
}) => {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [gridHeight, setGridHeight] = useState(600)
  const containerRef = useRef<HTMLDivElement>(null)

  // Smaller, denser cards to maximize swatches visible on screen
  const CARD_WIDTH = 175
  const CARD_HEIGHT = 160
  const GAP = 6

  const columnsCount = Math.max(1, Math.floor((containerSize.width + GAP) / (CARD_WIDTH + GAP)))
  const rowsCount = Math.ceil(colors.length / columnsCount)

  // Set grid height based on viewport so it fills the visible area
  useEffect(() => {
    const updateHeight = () => {
      setGridHeight(Math.max(420, window.innerHeight - 220))
    }
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  // Resize observer for responsive column count
  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setContainerSize({ width, height })
      }
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [])

  // Memoized cell renderer for performance
  const Cell = useCallback(
    ({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
      const index = rowIndex * columnsCount + columnIndex
      const color = colors[index]

      if (!color) return null

      const colorId = `${color.make}-${color.colorName}-${color.year || 'unknown'}`
      const isFavorite = favorites.includes(colorId)

      return (
        <div style={style}>
          <div style={{ padding: GAP / 2 }}>
            <ColorCard
              color={color}
              onSelect={onColorSelect}
              onShowInfo={onShowInfo}
              isFavorite={isFavorite}
              onToggleFavorite={() => onToggleFavorite(colorId)}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      )
    },
    [colors, favorites, onColorSelect, onShowInfo, onToggleFavorite, isDarkMode, columnsCount]
  )

  if (colors.length === 0) {
    return (
      <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        No colors to display
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full" style={{ height: `${gridHeight}px` }}>
      {containerSize.width > 0 && (
        <Grid
          columnCount={columnsCount}
          columnWidth={CARD_WIDTH + GAP}
          height={gridHeight}
          rowCount={rowsCount}
          rowHeight={CARD_HEIGHT + GAP}
          width={containerSize.width}
          overscanRowCount={3}
          overscanColumnCount={2}
        >
          {Cell}
        </Grid>
      )}
    </div>
  )
}

export default VirtualColorGrid
