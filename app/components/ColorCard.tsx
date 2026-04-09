import React from 'react'
import { createForzaGradient } from '../lib/colorUtils'
import { CarColor } from '../types'

interface ColorCardProps {
  color: CarColor
  onSelect: (_color: CarColor) => void
  isFavorite?: boolean
  onToggleFavorite?: () => void
  isDarkMode?: boolean
}

type PaintFinish = 'matte' | 'semigloss' | 'gloss' | 'metallic' | 'chrome' | 'pearlescent' | 'default'

function getFinishFromColorType(colorType?: string): PaintFinish {
  const t = (colorType || '').toLowerCase()

  if (t.includes('chrome')) return 'chrome'
  if (t.includes('pearl')) return 'pearlescent'
  if (t.includes('metallic')) return 'metallic'
  if (t.includes('semi') && t.includes('gloss')) return 'semigloss'
  if (t.includes('gloss')) return 'gloss'
  if (t.includes('matte')) return 'matte'

  return 'default'
}

const ColorCard: React.FC<ColorCardProps> = React.memo(
  ({ color, onSelect, isFavorite = false, onToggleFavorite, isDarkMode = true }) => {
    const finish = React.useMemo(() => getFinishFromColorType(color.colorType), [color.colorType])

    const gradient = React.useMemo(() => {
      const c1 = color.color1 ?? { h: 0, s: 0, b: 0.5 }
      const c2 = color.color2 ?? { h: 0, s: 0, b: 0.5 }
      return createForzaGradient(c1, c2)
    }, [color.color1, color.color2])

    return (
      <div
        className={`group rounded-lg overflow-hidden flex flex-col hover:shadow-xl ${
          isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'
        }`}
        style={{
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
        }}
      >
        <div
          className={`w-full h-20 sm:h-24 relative overflow-hidden ${
            finish === 'matte' ? '' : 'shadow-inner'
          } ${finish === 'chrome' || finish === 'pearlescent' ? 'glow-effect' : ''}`}
          style={{ background: gradient }}
          role="img"
          aria-label={`Color preview for ${color.colorName}`}
        >
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => onSelect(color)}
            aria-label={`Select ${color.colorName}`}
          />

          {(finish === 'gloss' || finish === 'semigloss') && (
            <div
              className={`absolute inset-0 pointer-events-none ${finish === 'gloss' ? 'opacity-35' : 'opacity-25'}`}
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.55) 38%, rgba(255,255,255,0.85) 48%, rgba(255,255,255,0.55) 58%, rgba(255,255,255,0.0) 100%)',
              }}
            />
          )}

          {finish === 'metallic' && (
            <>
              <div
                className="absolute inset-0 opacity-25 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.0) 35%, rgba(0,0,0,0.18) 70%, rgba(255,255,255,0.2) 100%)',
                  mixBlendMode: 'overlay',
                }}
              />
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(rgba(255,255,255,0.45) 1px, rgba(255,255,255,0) 1.2px)',
                  backgroundSize: '4px 4px',
                  mixBlendMode: 'overlay',
                }}
              />
            </>
          )}

          {finish === 'chrome' && (
            <>
              <div
                className="absolute inset-0 opacity-35 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.15) 22%, rgba(0,0,0,0.25) 50%, rgba(255,255,255,0.25) 78%, rgba(255,255,255,0.75) 100%)',
                  mixBlendMode: 'overlay',
                }}
              />
              <div
                className="absolute inset-0 opacity-25 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.9) 48%, rgba(255,255,255,0.0) 100%)',
                }}
              />
            </>
          )}

          {finish === 'pearlescent' && (
            <>
              <div
                className="absolute inset-0 opacity-25 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,0,200,0.22) 0%, rgba(0,180,255,0.18) 35%, rgba(255,255,255,0.0) 55%, rgba(0,255,170,0.18) 75%, rgba(255,240,120,0.22) 100%)',
                  mixBlendMode: 'screen',
                }}
              />
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-2 left-4 w-1 h-1 bg-white rounded-full animate-pulse" />
                <div
                  className="absolute top-6 right-6 w-0.5 h-0.5 bg-white rounded-full animate-pulse"
                  style={{ animationDelay: '0.5s' }}
                />
                <div
                  className="absolute bottom-4 left-8 w-0.5 h-0.5 bg-white rounded-full animate-pulse"
                  style={{ animationDelay: '1s' }}
                />
                <div
                  className="absolute bottom-2 right-4 w-1 h-1 bg-white rounded-full animate-pulse"
                  style={{ animationDelay: '1.5s' }}
                />
              </div>
            </>
          )}

          {finish === 'matte' && (
            <>
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.0) 35%, rgba(255,255,255,0.08) 100%)',
                  mixBlendMode: 'multiply',
                }}
              />
              <div
                className="absolute inset-0 opacity-18 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(rgba(255,255,255,0.20) 1px, rgba(255,255,255,0) 1.5px)',
                  backgroundSize: '3px 3px',
                  mixBlendMode: 'soft-light',
                }}
              />
            </>
          )}

        </div>
        <div className="px-2 pb-2 pt-1 flex justify-center items-center gap-3">
          {onToggleFavorite && (
            <button
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                onToggleFavorite()
              }}
              className={`transition-colors p-2 rounded-full min-w-[32px] min-h-[32px] flex items-center justify-center bamboo-button-ghost ${
                isFavorite ? 'text-red-500' : ''
              }`}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          )}
        </div>
      </div>
    )
  }
)

ColorCard.displayName = 'ColorCard'

export default ColorCard
