import React, { memo, useMemo } from 'react'
import type { CarColor } from '../types/color'
import ColorCard from './ColorCard'

interface LazyColorGridProps {
  colors: CarColor[]
  favorites: string[]
  onColorSelect: (color: CarColor) => void
  onToggleFavorite: (colorId: string) => void
  isDarkMode: boolean
}

const LazyColorGrid: React.FC<LazyColorGridProps> = memo(({
  colors,
  favorites,
  onColorSelect,
  onToggleFavorite,
  isDarkMode
}) => {
  const colorItems = useMemo(() => 
    colors.map((color, index) => {
      const colorId = `${color.make}-${color.model}-${color.colorName}-${color.year || 'unknown'}`
      const uniqueKey = `${colorId}-${index}`
      return (
        <ColorCard
          key={uniqueKey}
          color={color}
          onSelect={onColorSelect}
          isFavorite={favorites.includes(colorId)}
          onToggleFavorite={() => onToggleFavorite(colorId)}
          isDarkMode={isDarkMode}
        />
      )
    }), [colors, favorites, onColorSelect, onToggleFavorite, isDarkMode]
  )

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
      {colorItems}
    </div>
  )
})

LazyColorGrid.displayName = 'LazyColorGrid'

export default LazyColorGrid