'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { CarColor } from '../types/color'

interface ColorRouletteHarmonyProps {
  colors: CarColor[]
  isDarkMode: boolean
  onColorSelect: (color: CarColor) => void
  onHarmonyGenerated: (colors: CarColor[]) => void
}

const HARMONY_MODES = {
  'Monochromatic': { icon: '🎯', desc: 'Same hue, different saturation/brightness' },
  'Complementary': { icon: '⚖️', desc: 'Opposite colors on color wheel' },
  'Triadic': { icon: '🔺', desc: 'Three evenly spaced colors' },
  'Analogous': { icon: '🌈', desc: 'Adjacent colors on wheel' },
  'Split-Complementary': { icon: '🎪', desc: 'Base + two adjacent to complement' },
  'Tetradic': { icon: '⬜', desc: 'Four colors forming rectangle' },
  'Random Roulette': { icon: '🎰', desc: 'Pure random selection' },
  'Brand Harmony': { icon: '🏷️', desc: 'Colors from same manufacturer' }
}

const CATEGORIES = {
  'All Colors': { makes: [], colors: [] },
  'Supercars': { makes: ['Ferrari', 'Lamborghini', 'McLaren', 'Bugatti'], colors: [] },
  'Luxury': { makes: ['Mercedes-Benz', 'BMW', 'Audi', 'Porsche'], colors: [] },
  'JDM': { makes: ['Honda', 'Toyota', 'Nissan', 'Mazda', 'Subaru'], colors: [] },
  'American': { makes: ['Ford', 'Chevrolet', 'Dodge'], colors: [] },
  'Racing Colors': { makes: [], colors: ['racing', 'sport', 'competition'] }
}

const ColorRouletteHarmony: React.FC<ColorRouletteHarmonyProps> = ({
  colors,
  isDarkMode,
  onColorSelect,
  onHarmonyGenerated
}) => {
  const [harmonyMode, setHarmonyMode] = useState<keyof typeof HARMONY_MODES>('Random Roulette')
  const [category, setCategory] = useState<keyof typeof CATEGORIES>('All Colors')
  const [harmonySize, setHarmonySize] = useState(5)
  const [isSpinning, setIsSpinning] = useState(false)
  const [currentHarmony, setCurrentHarmony] = useState<CarColor[]>([])
  const [spinHistory, setSpinHistory] = useState<CarColor[][]>([])

  const filteredColors = useMemo(() => {
    const config = CATEGORIES[category]
    return colors.filter(color => {
      const makeMatch = config.makes.length === 0 || config.makes.includes(color.make)
      const colorMatch = config.colors.length === 0 || 
        config.colors.some(c => color.colorName.toLowerCase().includes(c))
      return makeMatch && (config.colors.length === 0 || colorMatch)
    })
  }, [colors, category])

  const generateHarmony = useCallback(() => {
    if (filteredColors.length === 0) return []

    const baseColor = filteredColors[Math.floor(Math.random() * filteredColors.length)]
    const baseHue = baseColor.color1.h * 360

    let harmony: CarColor[] = [baseColor]

    switch (harmonyMode) {
      case 'Monochromatic':
        harmony = filteredColors
          .filter(c => Math.abs((c.color1.h * 360) - baseHue) < 30)
          .sort(() => Math.random() - 0.5)
          .slice(0, harmonySize)
        break

      case 'Complementary':
        const compHue = (baseHue + 180) % 360
        const complementary = filteredColors
          .filter(c => Math.abs((c.color1.h * 360) - compHue) < 30)
          .sort(() => Math.random() - 0.5)[0]
        harmony = [baseColor, complementary].filter(Boolean)
        break

      case 'Triadic':
        const tri1 = (baseHue + 120) % 360
        const tri2 = (baseHue + 240) % 360
        const triad1 = filteredColors.find(c => Math.abs((c.color1.h * 360) - tri1) < 30)
        const triad2 = filteredColors.find(c => Math.abs((c.color1.h * 360) - tri2) < 30)
        harmony = [baseColor, triad1, triad2].filter(Boolean)
        break

      case 'Analogous':
        harmony = filteredColors
          .filter(c => {
            const hue = c.color1.h * 360
            return Math.abs(hue - baseHue) < 60 || Math.abs(hue - baseHue) > 300
          })
          .sort(() => Math.random() - 0.5)
          .slice(0, harmonySize)
        break

      case 'Brand Harmony':
        harmony = filteredColors
          .filter(c => c.make === baseColor.make)
          .sort(() => Math.random() - 0.5)
          .slice(0, harmonySize)
        break

      default: // Random Roulette
        harmony = filteredColors
          .sort(() => Math.random() - 0.5)
          .slice(0, harmonySize)
    }

    return harmony.length > 0 ? harmony : [baseColor]
  }, [filteredColors, harmonyMode, harmonySize])

  const spinRoulette = useCallback(async () => {
    setIsSpinning(true)
    
    // Animate spinning effect
    for (let i = 0; i < 10; i++) {
      const tempHarmony = generateHarmony()
      setCurrentHarmony(tempHarmony)
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    const finalHarmony = generateHarmony()
    setCurrentHarmony(finalHarmony)
    setSpinHistory(prev => [finalHarmony, ...prev.slice(0, 4)])
    onHarmonyGenerated(finalHarmony)
    setIsSpinning(false)
  }, [generateHarmony, onHarmonyGenerated])

  const hsbToHex = (h: number, s: number, b: number) => {
    const c = b * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = b - c
    let r = 0, g = 0, bl = 0

    if (h >= 0 && h < 60) { r = c; g = x; bl = 0 }
    else if (h >= 60 && h < 120) { r = x; g = c; bl = 0 }
    else if (h >= 120 && h < 180) { r = 0; g = c; bl = x }
    else if (h >= 180 && h < 240) { r = 0; g = x; bl = c }
    else if (h >= 240 && h < 300) { r = x; g = 0; bl = c }
    else if (h >= 300 && h < 360) { r = c; g = 0; bl = x }

    return `#${Math.round((r + m) * 255).toString(16).padStart(2, '0')}${Math.round((g + m) * 255).toString(16).padStart(2, '0')}${Math.round((bl + m) * 255).toString(16).padStart(2, '0')}`
  }

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        🎰 Color Roulette Harmony
      </h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Harmony Mode
            </label>
            <select
              value={harmonyMode}
              onChange={(e) => setHarmonyMode(e.target.value as keyof typeof HARMONY_MODES)}
              className={`w-full p-2 text-sm rounded border ${
                isDarkMode 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {Object.entries(HARMONY_MODES).map(([mode, config]) => (
                <option key={mode} value={mode}>{config.icon} {mode}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as keyof typeof CATEGORIES)}
              className={`w-full p-2 text-sm rounded border ${
                isDarkMode 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {Object.keys(CATEGORIES).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Colors: {harmonySize}
          </label>
          <input
            type="range"
            min="2"
            max="8"
            value={harmonySize}
            onChange={(e) => setHarmonySize(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <button
          onClick={spinRoulette}
          disabled={isSpinning || filteredColors.length === 0}
          className={`w-full py-3 px-4 rounded font-medium transition-all ${
            isSpinning
              ? 'bg-gray-400 cursor-not-allowed animate-pulse'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transform hover:scale-105'
          }`}
        >
          {isSpinning ? '🎰 Spinning...' : '🎰 Spin Roulette'}
        </button>

        {currentHarmony.length > 0 && (
          <div>
            <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Current Harmony ({currentHarmony.length} colors)
            </h4>
            <div className="grid grid-cols-4 gap-1 mb-2">
              {currentHarmony.map((color, index) => (
                <button
                  key={index}
                  onClick={() => onColorSelect(color)}
                  className="aspect-square rounded border-2 border-gray-300 hover:border-blue-500 transition-colors"
                  style={{
                    background: hsbToHex(color.color1.h * 360, color.color1.s, color.color1.b)
                  }}
                  title={`${color.colorName} - ${color.make}`}
                />
              ))}
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {HARMONY_MODES[harmonyMode].desc}
            </p>
          </div>
        )}

        {spinHistory.length > 0 && (
          <div>
            <h4 className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Recent Spins
            </h4>
            <div className="space-y-1">
              {spinHistory.slice(0, 3).map((harmony, historyIndex) => (
                <button
                  key={historyIndex}
                  onClick={() => {
                    setCurrentHarmony(harmony)
                    onHarmonyGenerated(harmony)
                  }}
                  className="w-full flex gap-1 p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  {harmony.slice(0, 6).map((color, colorIndex) => (
                    <div
                      key={colorIndex}
                      className="w-4 h-4 rounded border"
                      style={{
                        background: hsbToHex(color.color1.h * 360, color.color1.s, color.color1.b)
                      }}
                    />
                  ))}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ColorRouletteHarmony