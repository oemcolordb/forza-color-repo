import React, { memo, useMemo } from 'react'
import type { CarColor } from '../types/color'

const ColorCard = React.lazy(() => import('./ColorCard'))

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
      const colorId = `${color.make}-${color.model}-${color.colorName}-${color.year}`
      return (
        <div 
          key={colorId}
          className="animate-fade-in"
          style={{ animationDelay: `${(index % 50) * 20}ms` }}
        >
          <React.Suspense fallback={<div className="h-64 bg-gray-200 rounded-lg animate-pulse" />}>
            <ColorCard
              color={color}
              onSelect={onColorSelect}
              isFavorite={favorites.includes(colorId)}
              onToggleFavorite={() => onToggleFavorite(colorId)}
              isDarkMode={isDarkMode}
            />
          </React.Suspense>
        </div>
      )
    }), [colors, favorites, onColorSelect, onToggleFavorite, isDarkMode]
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {colorItems}
    </div>
  )
})

LazyColorGrid.displayName = 'LazyColorGrid'

export default LazyColorGrid