import React from 'react'
import type { CarColor } from '../types/color'
import { createForzaGradient } from '../lib/colorUtils'

interface ColorCardProps {
  color: CarColor
  onSelect: (color: CarColor) => void
  isFavorite?: boolean
  onToggleFavorite?: () => void
  isDarkMode?: boolean
  isMobile?: boolean
}

const ColorCard: React.FC<ColorCardProps> = React.memo(({ 
  color, 
  onSelect, 
  isFavorite = false, 
  onToggleFavorite,
  isDarkMode = true,
  isMobile = false
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
    <div className={`rounded-lg shadow-lg overflow-hidden flex flex-col ${isMobile ? 'mobile-card' : ''} ${
      isDarkMode 
        ? 'bg-slate-800 border border-slate-700' 
        : 'bg-white border border-gray-200'
    }`}>
      <div className={`w-full ${isMobile ? 'h-20' : 'h-24 sm:h-32'}`} style={{ background: gradient }} />
      <div className={`${isMobile ? 'p-2' : 'p-4'} flex-grow flex flex-col justify-between`}>
        <div>
          <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-bold truncate ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
            {color.colorName}
          </h3>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} truncate ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            {displayText}
          </p>
        </div>
        <div className={`flex justify-between items-center ${isMobile ? 'mt-2' : 'mt-4'} min-h-[26px]`}>
          {color.colorType && !isMobile && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              isDarkMode ? 'bg-slate-700 text-cyan-400' : 'bg-gray-100 text-blue-600'
            }`}>
              {color.colorType}
            </span>
          )}
          <div className={`flex items-center gap-2 ${isMobile && !color.colorType ? '' : 'ml-auto'}`}>
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavorite()
                }}
                className={`transition-colors ${isMobile ? 'text-lg' : ''} ${
                  isFavorite ? 'text-red-500 hover:text-red-600' : 
                  isDarkMode ? 'text-slate-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
                }`}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite ? '❤️' : '🤍'}
              </button>
            )}
            <button
              onClick={() => onSelect(color)}
              className={`transition-colors ${isMobile ? 'text-lg' : ''} ${
                isDarkMode ? 'text-slate-500 hover:text-fuchsia-400' : 'text-gray-500 hover:text-blue-600'
              }`}
              aria-label={`Learn more about ${color.colorName}`}
            >
              ℹ️
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

ColorCard.displayName = 'ColorCard'

export default ColorCard