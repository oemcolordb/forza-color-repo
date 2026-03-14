import React from 'react'
import { createForzaGradient } from '../lib/colorUtils'
import { CarColor } from '../types'

interface ColorCardProps {
  color: CarColor
  onSelect: (_color: CarColor) => void
  onShowInfo?: (_color: CarColor) => void
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

function hsbToRgb(h: number, s: number, b: number): { r: number; g: number; b: number } {
  const c = b * s
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
  const m = b - c

  let r = 0
  let g = 0
  let bl = 0

  if (h >= 0 && h < 1 / 6) {
    r = c
    g = x
    bl = 0
  } else if (h >= 1 / 6 && h < 2 / 6) {
    r = x
    g = c
    bl = 0
  } else if (h >= 2 / 6 && h < 3 / 6) {
    r = 0
    g = c
    bl = x
  } else if (h >= 3 / 6 && h < 4 / 6) {
    r = 0
    g = x
    bl = c
  } else if (h >= 4 / 6 && h < 5 / 6) {
    r = x
    g = 0
    bl = c
  } else if (h >= 5 / 6 && h < 1) {
    r = c
    g = 0
    bl = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((bl + m) * 255),
  }
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function rgbToHsl({ r, g, b }: { r: number; g: number; b: number }): { h: number; s: number; l: number } {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255

  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min

  const l = (max + min) / 2

  if (delta === 0) {
    return { h: 0, s: 0, l: Math.round(l * 100) }
  }

  const s = delta / (1 - Math.abs(2 * l - 1))

  let h = 0
  switch (max) {
    case rn:
      h = ((gn - bn) / delta) % 6
      break
    case gn:
      h = (bn - rn) / delta + 2
      break
    default:
      h = (rn - gn) / delta + 4
      break
  }

  h = Math.round(((h * 60 + 360) % 360) * 10) / 10
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) }
}

const ColorCard: React.FC<ColorCardProps> = React.memo(
  ({ color, onSelect, onShowInfo, isFavorite = false, onToggleFavorite, isDarkMode = true }) => {
    const finish = React.useMemo(() => getFinishFromColorType(color.colorType), [color.colorType])

    const [copiedKey, setCopiedKey] = React.useState<string | null>(null)

    const gradient = React.useMemo(
      () => createForzaGradient(color.color1, color.color2),
      [color.color1, color.color2]
    )

    const primaryRgb = React.useMemo(
      () => hsbToRgb(color.color1.h, color.color1.s, color.color1.b),
      [color.color1.h, color.color1.s, color.color1.b]
    )

    const primaryHex = React.useMemo(() => rgbToHex(primaryRgb), [primaryRgb])
    const primaryHsl = React.useMemo(() => rgbToHsl(primaryRgb), [primaryRgb])

    const copyToClipboard = React.useCallback(async (key: string, value: string) => {
      try {
        await navigator.clipboard.writeText(value)
        setCopiedKey(key)
        window.setTimeout(() => setCopiedKey(prev => (prev === key ? null : prev)), 900)
      } catch {
        setCopiedKey(null)
      }
    }, [])

    const displayText = React.useMemo(() => {
      const modelDisplay = color.model ? ` ${color.model}` : ''
      const yearDisplay = color.year && color.year > 0 ? ` (${color.year})` : ''
      return `${color.make}${modelDisplay}${yearDisplay}`
    }, [color.make, color.model, color.year])

    return (
      <div
        className={`group rounded-lg overflow-hidden flex flex-col transition-all duration-300 hover:scale-105 hover:shadow-xl hover-lift ${
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

          <div
            className={`absolute left-2 right-2 top-2 z-10 rounded-md border backdrop-blur-sm transition-opacity duration-150 opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 group-hover:pointer-events-auto group-focus-within:pointer-events-auto ${
              isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'
            }`}
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onMouseDown={e => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <div className="p-2">
              <div className="flex items-start gap-2">
                <div className="relative w-14 h-14 rounded overflow-hidden border border-white/10" style={{ background: gradient }}>
                  {(finish === 'gloss' || finish === 'semigloss') && (
                    <div
                      className={`absolute inset-0 ${finish === 'gloss' ? 'opacity-35' : 'opacity-25'}`}
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.55) 38%, rgba(255,255,255,0.85) 48%, rgba(255,255,255,0.55) 58%, rgba(255,255,255,0.0) 100%)',
                      }}
                    />
                  )}

                  {finish === 'metallic' && (
                    <>
                      <div
                        className="absolute inset-0 opacity-25"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.0) 35%, rgba(0,0,0,0.18) 70%, rgba(255,255,255,0.2) 100%)',
                          mixBlendMode: 'overlay',
                        }}
                      />
                      <div
                        className="absolute inset-0 opacity-15"
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
                        className="absolute inset-0 opacity-35"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.15) 22%, rgba(0,0,0,0.25) 50%, rgba(255,255,255,0.25) 78%, rgba(255,255,255,0.75) 100%)',
                          mixBlendMode: 'overlay',
                        }}
                      />
                      <div
                        className="absolute inset-0 opacity-25"
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
                        className="absolute inset-0 opacity-25"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(255,0,200,0.22) 0%, rgba(0,180,255,0.18) 35%, rgba(255,255,255,0.0) 55%, rgba(0,255,170,0.18) 75%, rgba(255,240,120,0.22) 100%)',
                          mixBlendMode: 'screen',
                        }}
                      />
                    </>
                  )}

                  {finish === 'matte' && (
                    <>
                      <div
                        className="absolute inset-0 opacity-15"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.0) 35%, rgba(255,255,255,0.08) 100%)',
                          mixBlendMode: 'multiply',
                        }}
                      />
                      <div
                        className="absolute inset-0 opacity-18"
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

                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-semibold ${isDarkMode ? 'text-slate-200' : 'text-gray-900'}`}>
                    {primaryHex.toUpperCase()}
                  </div>
                  <div className={`mt-1 grid grid-cols-1 gap-1 text-[11px] ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono truncate">rgb({primaryRgb.r}, {primaryRgb.g}, {primaryRgb.b})</span>
                      <button
                        type="button"
                        className="px-2 py-0.5 rounded text-[10px] bamboo-button-ghost"
                        onClick={e => {
                          e.preventDefault()
                          e.stopPropagation()
                          copyToClipboard('rgb', `rgb(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b})`)
                        }}
                        aria-label="Copy RGB"
                      >
                        {copiedKey === 'rgb' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono truncate">hsl({primaryHsl.h}, {primaryHsl.s}%, {primaryHsl.l}%)</span>
                      <button
                        type="button"
                        className="px-2 py-0.5 rounded text-[10px] bamboo-button-ghost"
                        onClick={e => {
                          e.preventDefault()
                          e.stopPropagation()
                          copyToClipboard('hsl', `hsl(${primaryHsl.h}, ${primaryHsl.s}%, ${primaryHsl.l}%)`)
                        }}
                        aria-label="Copy HSL"
                      >
                        {copiedKey === 'hsl' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono truncate">{primaryHex.toUpperCase()}</span>
                      <button
                        type="button"
                        className="px-2 py-0.5 rounded text-[10px] bamboo-button-ghost"
                        onClick={e => {
                          e.preventDefault()
                          e.stopPropagation()
                          copyToClipboard('hex', primaryHex.toUpperCase())
                        }}
                        aria-label="Copy HEX"
                      >
                        {copiedKey === 'hex' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-3 flex-grow flex flex-col color-info-area relative">
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => onSelect(color)}
            aria-label={`Select ${color.colorName}`}
          />
          <div className="flex-grow relative z-10">
            <h3
              className={`text-sm font-bold truncate leading-tight ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}
            >
              {color.colorName}
            </h3>
            <p
              className={`text-sm truncate leading-tight ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}
            >
              {displayText}
            </p>
            {color.colorType && (
              <div
                className="text-xs font-semibold mt-1 text-[color:var(--bamboo-stalk)]"
              >
                {color.colorType}
              </div>
            )}
          </div>
          <div className="flex justify-center items-center gap-3 mt-3 relative z-10">
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
            <button
              onClick={e => {
                e.stopPropagation()
                if (onShowInfo) {
                  onShowInfo(color)
                } else {
                  onSelect(color)
                }
              }}
              className="transition-colors p-2 rounded-full min-w-[32px] min-h-[32px] flex items-center justify-center bamboo-button-ghost"
              aria-label={`Learn more about ${color.colorName}`}
            >
              ℹ️
            </button>
          </div>
        </div>
      </div>
    )
  }
)

ColorCard.displayName = 'ColorCard'

export default ColorCard
