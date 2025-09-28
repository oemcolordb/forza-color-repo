'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import type { CarColor } from '../types/color'
import ColorCard from './ColorCard'

interface VirtualizedColorGridProps {
  colors: CarColor[]
  favorites: string[]
  onColorSelect: (color: CarColor) => void
  onToggleFavorite: (colorId: string) => void
  isDarkMode: boolean
  isMobile: boolean
}

const VirtualizedColorGrid: React.FC<VirtualizedColorGridProps> = ({
  colors,
  favorites,
  onColorSelect,
  onToggleFavorite,
  isDarkMode,
  isMobile
}) => {
  // Simplified - just render all colors since we're using pagination
  const visibleColors = colors

  return (
    <div className={`grid ${isMobile ? 'gap-2 grid-cols-2' : 'gap-3 grid-cols-4'}`}>
      {visibleColors.map((color, index) => {
        const colorId = `${color.make}-${color.colorName}-${color.year || 'unknown'}`
        return (
          <ColorCard
            key={`${colorId}-${index}`}
            color={color}
            onSelect={onColorSelect}
            isFavorite={favorites.includes(colorId)}
            onToggleFavorite={() => onToggleFavorite(colorId)}
            isDarkMode={isDarkMode}
            isMobile={isMobile}
          />
        )
      })}
    </div>
  )
}

export default VirtualizedColorGrid