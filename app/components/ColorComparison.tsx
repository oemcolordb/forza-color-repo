'use client'

import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { CarColor } from '../types'
import ColorCard from './ColorCard'

interface ColorComparisonProps {
  colors: CarColor[]
  isDarkMode: boolean
  isOpen: boolean
  onClose: () => void
  selectedColors: CarColor[]
  setSelectedColors: Dispatch<SetStateAction<CarColor[]>>
}

const ColorComparison: React.FC<ColorComparisonProps> = ({
  colors,
  isDarkMode,
  isOpen,
  onClose,
  selectedColors,
  setSelectedColors,
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  const difference = useMemo(() => {
    if (selectedColors.length < 2) return null

    const colorA = selectedColors[0].color1
    const colorB = selectedColors[1].color1

    const hueDelta = Math.round((colorB.h - colorA.h) * 360)
    const satDelta = Math.round((colorB.s - colorA.s) * 100)
    const lightDelta = Math.round((colorB.b - colorA.b) * 100)

    return { hueDelta, satDelta, lightDelta }
  }, [selectedColors])

  const filteredColors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    return colors
      .filter(
        color =>
          color.colorName.toLowerCase().includes(q) ||
          color.make.toLowerCase().includes(q) ||
          (color.model && color.model.toLowerCase().includes(q))
      )
      .slice(0, 20)
  }, [colors, searchQuery])

  const addColor = (color: CarColor) => {
    setSelectedColors(prev => {
      if (prev.length >= 4) return prev
      if (prev.find(c => c.colorName === color.colorName && c.make === color.make)) return prev
      return [...prev, color]
    })
  }

  const removeColor = (index: number) => {
    setSelectedColors(prev => prev.filter((_, i) => i !== index))
  }

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`w-full max-w-6xl mx-4 rounded-xl shadow-2xl border ${
          isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-200 text-gray-900'
        }`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Color comparison dialog"
      >
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-3">
          <div className="text-lg font-semibold">🔍 Paint Comparison Studio</div>
          <div className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
            Select up to 4 swatches
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedColors([])}
              className={`tap-target px-3 py-2 rounded-lg text-sm ${
                isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`tap-target px-3 py-2 rounded-lg text-sm ${
                isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              aria-label="Close comparison"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <input
            type="text"
            placeholder="Search colors to add to comparison..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-full p-3 rounded-lg border mb-4 ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400'
                : 'bg-white border-gray-300 placeholder-gray-500'
            }`}
            aria-label="Search colors to add to comparison"
          />

          {searchQuery.trim() && (
            <div className="mb-5 max-h-40 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {filteredColors.map((color, index) => (
                  <button
                    key={`${color.make}-${color.colorName}-${color.year || 'unknown'}-${index}`}
                    type="button"
                    onClick={() => addColor(color)}
                    className={`text-left rounded-lg border px-3 py-2 transition-colors ${
                      isDarkMode
                        ? 'bg-slate-800/70 border-slate-700 hover:border-blue-500'
                        : 'bg-white border-gray-200 hover:border-blue-500'
                    }`}
                    title={`${color.colorName} - ${color.make}`}
                  >
                    <div className="text-xs font-semibold truncate">{color.colorName}</div>
                    <div className={`text-[11px] truncate ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                      {color.make}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => {
              const color = selectedColors[index]
              return (
                <div
                  key={index}
                  className={`rounded-xl border-2 border-dashed p-2 ${
                    color ? 'border-blue-500' : isDarkMode ? 'border-slate-700' : 'border-gray-300'
                  }`}
                >
                  {color ? (
                    <div className="relative">
                      <div className="absolute top-2 right-2 z-10">
                        <button
                          type="button"
                          onClick={() => removeColor(index)}
                          className={`px-2 py-1 rounded-md text-xs ${
                            isDarkMode
                              ? 'bg-slate-900/80 border border-slate-700 text-slate-200 hover:bg-slate-800'
                              : 'bg-white/90 border border-gray-200 hover:bg-gray-50'
                          }`}
                          aria-label={`Remove ${color.colorName} from comparison`}
                        >
                          Remove
                        </button>
                      </div>
                      <ColorCard
                        color={color}
                        onSelect={() => {}}
                        isDarkMode={isDarkMode}
                      />
                    </div>
                  ) : (
                    <div className={`p-8 text-center ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      <div className="text-3xl mb-2">+</div>
                      <div className="text-sm font-medium">Empty slot</div>
                      <div className="text-xs mt-1">Search above to add a color</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {difference && (
            <div
              className={`mt-5 rounded-xl border p-4 ${
                isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <h4 className="premium-title text-sm font-semibold mb-2">Difference Analysis (Slot A → Slot B)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                <div className="rounded-lg border border-white/10 px-3 py-2 mono-value">
                  Hue: {difference.hueDelta > 0 ? '+' : ''}
                  {difference.hueDelta}°
                </div>
                <div className="rounded-lg border border-white/10 px-3 py-2 mono-value">
                  Sat: {difference.satDelta > 0 ? '+' : ''}
                  {difference.satDelta}%
                </div>
                <div className="rounded-lg border border-white/10 px-3 py-2 mono-value">
                  Light: {difference.lightDelta > 0 ? '+' : ''}
                  {difference.lightDelta}%
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ColorComparison
