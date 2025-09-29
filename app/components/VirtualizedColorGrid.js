'use client'

import React, { useMemo } from 'react'
import ColorCard from './ColorCard'

const VirtualizedColorGrid = React.memo(({
  colors,
  favorites,
  onColorSelect,
  onToggleFavorite,
  isDarkMode,
  isMobile
}) => {
  // Group colors by manufacturer for separators
  const groupedColors = useMemo(() => {
    const groups = {}
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
    <div className="space-y-3 sm:space-y-4">
      {manufacturers.map(make => (
        <div key={make}>
          <h3 className={`text-xl font-bold mb-4 pb-2 border-b-2 ${
            isDarkMode 
              ? 'text-white border-fuchsia-500' 
              : 'text-gray-900 border-blue-500'
          }`}>
            {make}
          </h3>
          <div className={`grid ${isMobile ? 'gap-1 grid-cols-3' : 'gap-2 grid-cols-4 lg:grid-cols-6'}`}>
            {groupedColors[make].map((color, index) => {
              const colorId = `${color.make}-${color.colorName}-${color.year || 'unknown'}`
              const isFavorite = favorites.includes(colorId)
              return (
                <ColorCard
                  key={`${colorId}-${index}`}
                  color={color}
                  onSelect={onColorSelect}
                  isFavorite={isFavorite}
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
})

export default VirtualizedColorGrid