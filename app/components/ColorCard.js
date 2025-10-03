import React from 'react'
import { createForzaGradient } from '../lib/colorUtils'

const ColorCard = React.memo(({ 
  color, 
  onSelect, 
  isFavorite = false, 
  onToggleFavorite,
  isDarkMode = true,
  isMobile = false,
  isOptimized = false
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
      className={`rounded-lg shadow-lg overflow-hidden flex flex-col cursor-pointer ${isMobile ? 'mobile-card' : ''} ${
        isOptimized 
          ? 'transition-transform duration-200 hover:scale-[1.02]' 
          : 'transition-all duration-300 hover:scale-105 hover:shadow-xl'
      } ${
        isDarkMode 
          ? 'bg-slate-800 border border-slate-700 hover:border-slate-500' 
          : 'bg-white border border-gray-200 hover:border-gray-400'
      }`} 
      onClick={(e) => {
        // Only trigger if clicking on the card itself, not buttons
        if (e.target === e.currentTarget || e.target.closest('.color-info-area')) {
          onSelect(color)
        }
      }}
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
    >
      <div 
        className={`w-full ${isMobile ? 'h-16' : 'h-20 sm:h-24'}`} 
        style={{ background: gradient }}
        role="img"
        aria-label={`Color preview for ${color.colorName}`}
      />
      <div className={`${isMobile ? 'p-1.5' : 'p-3'} flex-grow flex flex-col justify-between color-info-area`}>
        <div className="min-h-0">
          <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold truncate leading-tight ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
            {color.colorName}
          </h3>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} truncate leading-tight ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            {displayText}
          </p>
        </div>
        <div className={`flex justify-between items-center ${isMobile ? 'mt-1' : 'mt-4'} min-h-[32px]`}>
          {color.colorType && !isMobile && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              isDarkMode ? 'bg-slate-700 text-cyan-400' : 'bg-gray-100 text-blue-600'
            }`}>
              {color.colorType}
            </span>
          )}
          <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'} ${isMobile && !color.colorType ? '' : 'ml-auto'}`}>
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onToggleFavorite()
                }}
                onTouchStart={(e) => {
                  e.stopPropagation()
                }}
                className={`transition-colors touch-manipulation select-none ${isMobile ? 'text-lg p-1' : 'p-0.5'} ${
                  isFavorite ? 'text-red-500 hover:text-red-600 active:text-red-700' : 
                  isDarkMode ? 'text-slate-500 hover:text-red-400 active:text-red-500' : 'text-gray-400 hover:text-red-500 active:text-red-600'
                }`}
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  minHeight: isMobile ? '36px' : 'auto',
                  minWidth: isMobile ? '36px' : 'auto'
                }}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite ? '❤️' : '🤍'}
              </button>
            )}
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Info button clicked for:', color.colorName)
                onSelect(color)
              }}
              onTouchStart={(e) => {
                e.stopPropagation()
              }}
              className={`transition-colors touch-manipulation select-none ${isMobile ? 'text-lg p-1' : 'p-0.5'} ${
                isDarkMode ? 'text-slate-500 hover:text-fuchsia-400 active:text-fuchsia-500' : 'text-gray-500 hover:text-blue-600 active:text-blue-700'
              }`}
              style={{
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                minHeight: isMobile ? '36px' : 'auto',
                minWidth: isMobile ? '36px' : 'auto'
              }}
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