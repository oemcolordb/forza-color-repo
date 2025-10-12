import React from 'react'
import { createForzaGradient } from '../lib/colorUtils'
import { CarColor } from '../types'

interface ColorCardProps {
  color: CarColor
  onSelect: (color: CarColor) => void
  isFavorite?: boolean
  onToggleFavorite?: () => void
  isDarkMode?: boolean
}

const ColorCard: React.FC<ColorCardProps> = React.memo(({ 
  color, 
  onSelect, 
  isFavorite = false, 
  onToggleFavorite,
  isDarkMode = true
}) => {
  const gradient = React.useMemo(() => {
    return createForzaGradient(color.color1, color.color2)
  }, [color.color1, color.color2])
  
  const displayText = React.useMemo(() => {
    const modelDisplay = color.model ? ` ${color.model}` : ''
    const yearDisplay = color.year && color.year > 0 ? ` (${color.year})` : ''
    return `${color.make}${modelDisplay}${yearDisplay}`
  }, [color.make, color.model, color.year])

  return (
    <div 
      className={`rounded-lg shadow-lg overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
        isDarkMode 
          ? 'bg-slate-800 border border-slate-700 hover:border-slate-500' 
          : 'bg-white border border-gray-200 hover:border-gray-400'
      }`} 
      onClick={(e) => {
        // Only trigger if clicking on the card itself, not buttons
        if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.color-info-area')) {
          onSelect(color)
        }
      }}
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
    >
      <div 
        className="w-full h-20 sm:h-24" 
        style={{ background: gradient }}
        role="img"
        aria-label={`Color preview for ${color.colorName}`}
      />
      <div className="p-3 flex-grow flex flex-col color-info-area">
        <div className="flex-grow">
          <h3 className={`text-sm font-bold truncate leading-tight ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
            {color.colorName}
          </h3>
          <p className={`text-sm truncate leading-tight ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            {displayText}
          </p>
          {color.colorType && (
            <div className={`text-xs font-semibold mt-1 ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
              {color.colorType}
            </div>
          )}
        </div>
        <div className="flex justify-center items-center gap-3 mt-3">
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onToggleFavorite()
              }}
              className={`transition-colors p-2 rounded-full min-w-[32px] min-h-[32px] flex items-center justify-center ${
                isFavorite ? 'text-red-500 hover:text-red-600' : 
                isDarkMode ? 'text-slate-300 hover:text-red-400 hover:bg-slate-700' : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
              }`}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSelect(color)
            }}
            className={`transition-colors p-2 rounded-full min-w-[32px] min-h-[32px] flex items-center justify-center ${
              isDarkMode ? 'text-slate-300 hover:text-blue-400 hover:bg-slate-700' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
            }`}
            aria-label={`Learn more about ${color.colorName}`}
          >
            ℹ️
          </button>
        </div>
      </div>
    </div>
  )
})

ColorCard.displayName = 'ColorCard'

export default ColorCard