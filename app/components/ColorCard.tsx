import React from 'react'
import { createForzaGradient } from '../lib/colorUtils'
import { CarColor } from '../types'

interface ColorCardProps {
  color: CarColor
  onSelect: (color: CarColor) => void
  onShowInfo?: (color: CarColor) => void
  isFavorite?: boolean
  onToggleFavorite?: () => void
  isDarkMode?: boolean
}

const ColorCard: React.FC<ColorCardProps> = React.memo(({ 
  color, 
  onSelect, 
  onShowInfo,
  isFavorite = false, 
  onToggleFavorite,
  isDarkMode = true
}) => {
  const gradient = React.useMemo(() => {
    // Create finish-specific visual effects
    const baseGradient = createForzaGradient(color.color1, color.color2)
    const colorType = color.colorType?.toLowerCase() || ''
    
    if (colorType.includes('chrome')) {
      return `linear-gradient(135deg, 
        hsl(${color.color1.h * 360}, 20%, 85%) 0%,
        hsl(${color.color1.h * 360}, 30%, 95%) 25%,
        hsl(${color.color1.h * 360}, 10%, 75%) 50%,
        hsl(${color.color1.h * 360}, 25%, 90%) 75%,
        hsl(${color.color1.h * 360}, 15%, 80%) 100%)`
    }
    
    if (colorType.includes('metallic')) {
      return `linear-gradient(135deg, 
        hsl(${color.color1.h * 360}, ${color.color1.s * 100}%, ${color.color1.b * 100}%) 0%,
        hsl(${color.color1.h * 360}, ${Math.min(100, color.color1.s * 120)}%, ${Math.min(100, color.color1.b * 110)}%) 30%,
        hsl(${color.color1.h * 360}, ${color.color1.s * 80}%, ${color.color1.b * 90}%) 70%,
        hsl(${color.color1.h * 360}, ${color.color1.s * 100}%, ${color.color1.b * 100}%) 100%)`
    }
    
    if (colorType.includes('matte')) {
      return `hsl(${color.color1.h * 360}, ${color.color1.s * 70}%, ${color.color1.b * 85}%)`
    }
    
    if (colorType.includes('gloss') || colorType.includes('semigloss')) {
      return `linear-gradient(135deg, 
        hsl(${color.color1.h * 360}, ${color.color1.s * 100}%, ${color.color1.b * 100}%) 0%,
        hsl(${color.color1.h * 360}, ${Math.min(100, color.color1.s * 110)}%, ${Math.min(100, color.color1.b * 120)}%) 50%,
        hsl(${color.color1.h * 360}, ${color.color1.s * 100}%, ${color.color1.b * 100}%) 100%)`
    }
    
    if (colorType.includes('pearlescent') || colorType.includes('pearl')) {
      return `linear-gradient(135deg, 
        hsl(${color.color1.h * 360}, ${color.color1.s * 100}%, ${color.color1.b * 100}%) 0%,
        hsl(${(color.color1.h + 0.1) % 1 * 360}, ${Math.min(100, color.color1.s * 130)}%, ${Math.min(100, color.color1.b * 115)}%) 25%,
        hsl(${(color.color1.h + 0.05) % 1 * 360}, ${color.color1.s * 90}%, ${color.color1.b * 95}%) 50%,
        hsl(${(color.color1.h - 0.05) % 1 * 360}, ${Math.min(100, color.color1.s * 120)}%, ${Math.min(100, color.color1.b * 110)}%) 75%,
        hsl(${color.color1.h * 360}, ${color.color1.s * 100}%, ${color.color1.b * 100}%) 100%)`
    }
    
    return baseGradient
  }, [color.color1, color.color2, color.colorType])
  
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
        className={`w-full h-20 sm:h-24 relative overflow-hidden ${
          color.colorType?.toLowerCase().includes('matte') ? '' : 'shadow-inner'
        }`}
        style={{ background: gradient }}
        role="img"
        aria-label={`Color preview for ${color.colorName}`}
      >
        {/* Add shine effect for glossy finishes */}
        {(color.colorType?.toLowerCase().includes('gloss') || 
          color.colorType?.toLowerCase().includes('chrome') ||
          color.colorType?.toLowerCase().includes('metallic')) && (
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.6) 45%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.6) 55%, transparent 100%)'
            }}
          />
        )}
        
        {/* Add sparkle effect for pearlescent */}
        {color.colorType?.toLowerCase().includes('pearl') && (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 left-4 w-1 h-1 bg-white rounded-full animate-pulse" />
            <div className="absolute top-6 right-6 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{animationDelay: '0.5s'}} />
            <div className="absolute bottom-4 left-8 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{animationDelay: '1s'}} />
            <div className="absolute bottom-2 right-4 w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '1.5s'}} />
          </div>
        )}
      </div>
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
              if (onShowInfo) {
                onShowInfo(color)
              } else {
                onSelect(color)
              }
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