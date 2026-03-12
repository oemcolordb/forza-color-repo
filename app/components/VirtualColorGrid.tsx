'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
  expandedColorId,
}) => {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate grid dimensions
  const CARD_WIDTH = 280
  const CARD_HEIGHT = 200
  const GAP = 16

  const columnsCount = Math.max(1, Math.floor((containerSize.width + GAP) / (CARD_WIDTH + GAP)))
  const rowsCount = Math.ceil(colors.length / columnsCount)

  // Resize observer for responsive grid
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
    ({ columnIndex, rowIndex, style }: any) => {
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
    <div ref={containerRef} className="w-full h-[600px] p-2 sm:p-3">
      {containerSize.width > 0 && (
        <Grid
          columnCount={columnsCount}
          columnWidth={CARD_WIDTH + GAP}
          height={Math.min(600, containerSize.height)}
          rowCount={rowsCount}
          rowHeight={CARD_HEIGHT + GAP}
          width={containerSize.width}
          overscanRowCount={2}
          overscanColumnCount={1}
        >
          {Cell}
        </Grid>
      )}
    </div>
  )
}

export default VirtualColorGrid
