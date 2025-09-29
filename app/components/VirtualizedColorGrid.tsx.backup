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
  // Group colors by manufacturer for separators
  const groupedColors = useMemo(() => {
    const groups: { [key: string]: CarColor[] } = {}
    colors.forEach(color => {
      if (!groups[color.make]) {
        groups[color.make] = []
      }
      groups[color.make].push(color)
    })
    return groups
  }, [colors])

  const manufacturers = Object.keys(groupedColors).sort()

  return (
    <div className="space-y-6">
      {manufacturers.map(make => (
        <div key={make}>
          <h3 className={`text-xl font-bold mb-4 pb-2 border-b-2 ${
            isDarkMode 
              ? 'text-white border-fuchsia-500' 
              : 'text-gray-900 border-blue-500'
          }`}>
            {make}
          </h3>
          <div className={`grid ${isMobile ? 'gap-2 grid-cols-2' : 'gap-3 grid-cols-4'}`}>
            {groupedColors[make].map((color, index) => {
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
        </div>
      ))}
    </div>
  )
}

export default VirtualizedColorGrid