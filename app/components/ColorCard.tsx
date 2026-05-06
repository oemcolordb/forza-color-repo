import React, { useState, useCallback, useRef } from 'react'
import { createForzaGradient } from '../lib/colorUtils'
import { CarColor } from '../types'

// Musical note emojis mapped to 8 hue segments
const NOTE_EMOJIS = ['♩', '♪', '♫', '♬', '🎵', '🎶', '🎼', '🎹']
// Corresponding frequencies (C4–C5 pentatonic-ish)
const NOTE_FREQS = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25]

function playNoteForHue(hue: number) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const idx = Math.floor((hue / 360) * 8) % 8
    const freq = NOTE_FREQS[idx]
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    gain.gain.setValueAtTime(0.18, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.55)
    osc.onended = () => ctx.close()
  } catch {}
}

function getNoteEmojiForHue(hue: number): string {
  return NOTE_EMOJIS[Math.floor((hue / 360) * 8) % 8]
}

interface ColorCardProps {
  color: CarColor
  onSelect: (_color: CarColor) => void
  onShowInfo?: (_color: CarColor) => void
  isFavorite?: boolean
  onToggleFavorite?: () => void
  isDarkMode?: boolean
}

type PaintFinish =
  | 'matte'
  | 'semigloss'
  | 'gloss'
  | 'metallic'
  | 'chrome'
  | 'pearlescent'
  | 'default'

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
  ({ color, onSelect, onShowInfo, isFavorite = false, onToggleFavorite, isDarkMode = true }) => {
    const finish = React.useMemo(() => getFinishFromColorType(color.colorType), [color.colorType])
    const [noteAnim, setNoteAnim] = useState<{
      id: number
      emoji: string
      x: number
      y: number
    } | null>(null)
    const animIdRef = useRef(0)

    const handleSwatchClick = useCallback(
      (e: React.MouseEvent) => {
        const hue = (color.color1?.h ?? 0) * 360
        playNoteForHue(hue)
        const emoji = getNoteEmojiForHue(hue)
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const id = ++animIdRef.current
        setNoteAnim({ id, emoji, x: e.clientX - rect.left, y: e.clientY - rect.top })
        setTimeout(() => setNoteAnim(prev => (prev?.id === id ? null : prev)), 900)
        onSelect(color)
      },
      [color, onSelect]
    )

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
          {/* Color name overlay at top */}
          <div className="absolute top-0 left-0 right-0 px-2 py-1 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10">
            <div
              className="text-[10px] sm:text-xs font-semibold text-white truncate leading-tight"
              title={color.colorName}
            >
              {color.colorName}
            </div>
          </div>
          <button
            type="button"
            className="absolute inset-0"
            onClick={handleSwatchClick}
            aria-label={`Select ${color.colorName}`}
          />
          {noteAnim && (
            <span
              key={noteAnim.id}
              className="pointer-events-none absolute z-20 select-none text-white text-xl font-bold animate-note-float"
              style={{ left: noteAnim.x, top: noteAnim.y, transform: 'translate(-50%, -50%)' }}
            >
              {noteAnim.emoji}
            </span>
          )}

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
        <div className="px-2 pb-2 pt-1 flex justify-between items-center w-full relative z-10">
          <div className="truncate mr-2">
            {color.colorType ? (
              <div className={`text-[10px] uppercase tracking-wider font-semibold ${isDarkMode ? 'text-gray-400' : 'text-contrast-secondary'}`}>
                {color.colorType}
              </div>
            ) : (
              <div className="text-[10px] opacity-0">―</div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  onToggleFavorite()
                }}
                className={`transition-colors p-2 sm:p-1.5 rounded-full min-w-[44px] min-h-[44px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center bamboo-button-ghost relative z-10 active:scale-95 ${
                  isFavorite ? 'text-red-500' : ''
                }`}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <span className="text-xl sm:text-base">{isFavorite ? '❤️' : '🤍'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                if (onShowInfo) {
                  onShowInfo(color)
                } else {
                  onSelect(color)
                }
              }}
              className="transition-colors p-2 sm:p-1.5 rounded-full min-w-[44px] min-h-[44px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center bamboo-button-ghost relative z-10 active:scale-95"
              aria-label={`Learn more about ${color.colorName}`}
            >
              <span className="text-xl sm:text-base">ℹ️</span>
            </button>
          </div>
        </div>
      </div>
    )
  }
)

ColorCard.displayName = 'ColorCard'

export default ColorCard
