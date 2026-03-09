'use client'

import React, { useState, useMemo, useCallback } from 'react'

const HARMONY_MODES = {
  Monochromatic: { icon: '🎯', desc: 'Same hue, different saturation/brightness' },
  Complementary: { icon: '⚖️', desc: 'Opposite colors on color wheel' },
  Triadic: { icon: '🔺', desc: 'Three evenly spaced colors' },
  Analogous: { icon: '🌈', desc: 'Adjacent colors on wheel' },
  'Split-Complementary': { icon: '🎪', desc: 'Base + two adjacent to complement' },
  Tetradic: { icon: '⬜', desc: 'Four colors forming rectangle' },
  'Warm Temperature': { icon: '🔥', desc: 'Warm colors (reds, oranges, yellows)' },
  'Cool Temperature': { icon: '❄️', desc: 'Cool colors (blues, greens, purples)' },
  'High Saturation': { icon: '💎', desc: 'Vibrant, intense colors' },
  'Medium Saturation': { icon: '🎨', desc: 'Balanced, natural colors' },
  'Low Saturation': { icon: '🌫️', desc: 'Muted, subtle colors' },
  'Light Brightness': { icon: '☀️', desc: 'Bright, light colors' },
  'Medium Brightness': { icon: '🌤️', desc: 'Balanced brightness colors' },
  'Dark Brightness': { icon: '🌙', desc: 'Deep, dark colors' },
  'Spring Palette': { icon: '🌸', desc: 'Fresh, light, vibrant colors' },
  'Summer Palette': { icon: '🌞', desc: 'Bright, saturated, warm colors' },
  'Fall Palette': { icon: '🍂', desc: 'Warm, earthy, rich colors' },
  'Winter Palette': { icon: '❄️', desc: 'Cool, crisp, high contrast colors' },
  'Random Roulette': { icon: '🎰', desc: 'Pure random selection' },
  'Brand Harmony': { icon: '🏷️', desc: 'Colors from same manufacturer' },
}

const CATEGORIES = {
  'All Colors': { makes: [], colors: [] },
  Supercars: { makes: ['Ferrari', 'Lamborghini', 'McLaren', 'Bugatti'], colors: [] },
  Luxury: { makes: ['Mercedes-Benz', 'BMW', 'Audi', 'Porsche'], colors: [] },
  JDM: { makes: ['Honda', 'Toyota', 'Nissan', 'Mazda', 'Subaru'], colors: [] },
  American: { makes: ['Ford', 'Chevrolet', 'Dodge'], colors: [] },
  'Racing Colors': { makes: [], colors: ['racing', 'sport', 'competition'] },
}

const ColorRouletteHarmony = ({ colors, isDarkMode, onColorSelect, onHarmonyGenerated }) => {
  const [harmonyMode, setHarmonyMode] = useState('Random Roulette')
  const [category, setCategory] = useState('All Colors')
  const [harmonySize, setHarmonySize] = useState(5)
  const [isSpinning, setIsSpinning] = useState(false)
  const [currentHarmony, setCurrentHarmony] = useState([])
  const [spinHistory, setSpinHistory] = useState([])

  const filteredColors = useMemo(() => {
    const config = CATEGORIES[category]
    return colors.filter(color => {
      const makeMatch = config.makes.length === 0 || config.makes.includes(color.make)
      const colorMatch =
        config.colors.length === 0 ||
        config.colors.some(c => color.colorName.toLowerCase().includes(c))
      return makeMatch && (config.colors.length === 0 || colorMatch)
    })
  }, [colors, category])

  const isWarmColor = hue => (hue >= 0 && hue <= 60) || (hue >= 300 && hue <= 360)
  const isCoolColor = hue => hue >= 120 && hue <= 300

  const getSeasonalColors = (season, colors) => {
    return colors.filter(color => {
      const h = color.color1.h * 360
      const s = color.color1.s
      const b = color.color1.b

      switch (season) {
        case 'Spring':
          return b > 0.6 && s > 0.3 && (isCoolColor(h) || (h >= 60 && h <= 120))
        case 'Summer':
          return b > 0.5 && s > 0.5 && isWarmColor(h)
        case 'Fall':
          return b < 0.7 && s > 0.4 && ((h >= 15 && h <= 45) || (h >= 300 && h <= 360))
        case 'Winter':
          return (b > 0.7 || b < 0.3) && s > 0.4 && isCoolColor(h)
        default:
          return true
      }
    })
  }

  const generateHarmony = useCallback(() => {
    if (filteredColors.length === 0) return []

    const baseColor = filteredColors[Math.floor(Math.random() * filteredColors.length)]
    const baseHue = baseColor.color1.h * 360

    let harmony = [baseColor]

    switch (harmonyMode) {
      case 'Monochromatic':
        harmony = filteredColors
          .filter(c => Math.abs(c.color1.h * 360 - baseHue) < 15)
          .sort((a, b) => a.color1.s - b.color1.s)
          .slice(0, harmonySize)
        if (harmony.length === 0) harmony = [baseColor]
        break

      case 'Complementary':
        const compHue = (baseHue + 180) % 360
        const complementary = filteredColors
          .filter(c => Math.abs(c.color1.h * 360 - compHue) < 20)
          .sort(() => Math.random() - 0.5)[0]
        harmony = complementary ? [baseColor, complementary] : [baseColor]
        break

      case 'Triadic':
        const tri1 = (baseHue + 120) % 360
        const tri2 = (baseHue + 240) % 360
        const triad1 = filteredColors.find(c => Math.abs(c.color1.h * 360 - tri1) < 20)
        const triad2 = filteredColors.find(c => Math.abs(c.color1.h * 360 - tri2) < 20)
        harmony = [baseColor, ...(triad1 ? [triad1] : []), ...(triad2 ? [triad2] : [])]
        break

      case 'Split-Complementary':
        const splitComp1 = (baseHue + 150) % 360
        const splitComp2 = (baseHue + 210) % 360
        const split1Colors = filteredColors.filter(
          c => Math.abs(c.color1.h * 360 - splitComp1) < 30
        )
        const split2Colors = filteredColors.filter(
          c => Math.abs(c.color1.h * 360 - splitComp2) < 30
        )
        harmony = [
          baseColor,
          ...split1Colors.slice(0, Math.floor((harmonySize - 1) / 2)),
          ...split2Colors.slice(0, Math.ceil((harmonySize - 1) / 2)),
        ]
        if (harmony.length < harmonySize) {
          const additional = filteredColors
            .filter(c => !harmony.includes(c))
            .sort(() => Math.random() - 0.5)
            .slice(0, harmonySize - harmony.length)
          harmony = [...harmony, ...additional]
        }
        break

      case 'Tetradic':
        const tet1 = (baseHue + 90) % 360
        const tet2 = (baseHue + 180) % 360
        const tet3 = (baseHue + 270) % 360
        const tetColors = [
          ...filteredColors.filter(c => Math.abs(c.color1.h * 360 - tet1) < 30),
          ...filteredColors.filter(c => Math.abs(c.color1.h * 360 - tet2) < 30),
          ...filteredColors.filter(c => Math.abs(c.color1.h * 360 - tet3) < 30),
        ]
        harmony = [baseColor, ...tetColors.slice(0, harmonySize - 1)]
        if (harmony.length < harmonySize) {
          const additional = filteredColors
            .filter(c => !harmony.includes(c))
            .sort(() => Math.random() - 0.5)
            .slice(0, harmonySize - harmony.length)
          harmony = [...harmony, ...additional]
        }
        break

      case 'Analogous':
        harmony = filteredColors
          .filter(c => {
            const hue = c.color1.h * 360
            const diff = Math.min(Math.abs(hue - baseHue), 360 - Math.abs(hue - baseHue))
            return diff <= 30 && diff > 0
          })
          .sort((a, b) => {
            const aDiff = Math.min(
              Math.abs(a.color1.h * 360 - baseHue),
              360 - Math.abs(a.color1.h * 360 - baseHue)
            )
            const bDiff = Math.min(
              Math.abs(b.color1.h * 360 - baseHue),
              360 - Math.abs(b.color1.h * 360 - baseHue)
            )
            return aDiff - bDiff
          })
          .slice(0, harmonySize - 1)
        harmony = [baseColor, ...harmony]
        break

      case 'Warm Temperature':
        harmony = filteredColors
          .filter(c => isWarmColor(c.color1.h * 360))
          .sort(() => Math.random() - 0.5)
          .slice(0, harmonySize)
        break

      case 'Cool Temperature':
        harmony = filteredColors
          .filter(c => isCoolColor(c.color1.h * 360))
          .sort(() => Math.random() - 0.5)
          .slice(0, harmonySize)
        break

      case 'High Saturation':
        harmony = filteredColors
          .filter(c => c.color1.s > 0.7)
          .sort(() => Math.random() - 0.5)
          .slice(0, harmonySize)
        break

      case 'Medium Saturation':
        harmony = filteredColors
          .filter(c => c.color1.s >= 0.3 && c.color1.s <= 0.7)
          .sort(() => Math.random() - 0.5)
          .slice(0, harmonySize)
        break

      case 'Low Saturation':
        harmony = filteredColors
          .filter(c => c.color1.s < 0.3)
          .sort(() => Math.random() - 0.5)
          .slice(0, harmonySize)
        break

      case 'Light Brightness':
        harmony = filteredColors
          .filter(c => c.color1.b > 0.7)
          .sort(() => Math.random() - 0.5)
          .slice(0, harmonySize)
        break

      case 'Medium Brightness':
        harmony = filteredColors
          .filter(c => c.color1.b >= 0.3 && c.color1.b <= 0.7)
          .sort(() => Math.random() - 0.5)
          .slice(0, harmonySize)
        break

      case 'Dark Brightness':
        harmony = filteredColors
          .filter(c => c.color1.b < 0.3)
          .sort(() => Math.random() - 0.5)
          .slice(0, harmonySize)
        break

      case 'Spring Palette':
        harmony = getSeasonalColors('Spring', filteredColors)
          .sort(() => Math.random() - 0.5)
          .slice(0, harmonySize)
        break

      case 'Summer Palette':
        harmony = getSeasonalColors('Summer', filteredColors)
          .sort(() => Math.random() - 0.5)
          .slice(0, harmonySize)
        break

      case 'Fall Palette':
        harmony = getSeasonalColors('Fall', filteredColors)
          .sort(() => Math.random() - 0.5)
          .slice(0, harmonySize)
        break

      case 'Winter Palette':
        harmony = getSeasonalColors('Winter', filteredColors)
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
        harmony = filteredColors.sort(() => Math.random() - 0.5).slice(0, harmonySize)
    }

    return harmony.length > 0 ? harmony : [baseColor]
  }, [filteredColors, harmonyMode, harmonySize])

  const spinRoulette = useCallback(async () => {
    setIsSpinning(true)

    // Animate spinning effect
    for (let i = 0; i < 10; i++) {
      const tempHarmony = generateHarmony()
      setCurrentHarmony(tempHarmony)
      await new Promise(resolve => setTimeout(resolve, Math.min(100, 200)))
    }

    const finalHarmony = generateHarmony()
    setCurrentHarmony(finalHarmony)
    setSpinHistory(prev => [finalHarmony, ...prev.slice(0, 4)])
    onHarmonyGenerated(finalHarmony, harmonyMode)
    setIsSpinning(false)
  }, [generateHarmony, onHarmonyGenerated])

  const hsbToHex = (h, s, b) => {
    const c = b * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = b - c
    let r = 0,
      g = 0,
      bl = 0

    if (h >= 0 && h < 60) {
      r = c
      g = x
      bl = 0
    } else if (h >= 60 && h < 120) {
      r = x
      g = c
      bl = 0
    } else if (h >= 120 && h < 180) {
      r = 0
      g = c
      bl = x
    } else if (h >= 180 && h < 240) {
      r = 0
      g = x
      bl = c
    } else if (h >= 240 && h < 300) {
      r = x
      g = 0
      bl = c
    } else if (h >= 300 && h < 360) {
      r = c
      g = 0
      bl = x
    }

    return `#${Math.round((r + m) * 255)
      .toString(16)
      .padStart(2, '0')}${Math.round((g + m) * 255)
      .toString(16)
      .padStart(2, '0')}${Math.round((bl + m) * 255)
      .toString(16)
      .padStart(2, '0')}`
  }

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        🎰 Color Roulette Harmony
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Harmony Mode
            </label>
            <select
              value={harmonyMode}
              onChange={e => setHarmonyMode(e.target.value)}
              className={`w-full p-2 text-sm rounded border ${
                isDarkMode
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {Object.entries(HARMONY_MODES).map(([mode, config]) => (
                <option key={mode} value={mode}>
                  {config.icon} {mode}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className={`w-full p-2 text-sm rounded border ${
                isDarkMode
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {Object.keys(CATEGORIES).map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
          >
            Colors: {harmonySize}
          </label>
          <input
            type="range"
            min="2"
            max="8"
            value={harmonySize}
            onChange={e => setHarmonySize(Number(e.target.value))}
            aria-label={`Number of colors in harmony: ${harmonySize}`}
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
            <h4
              className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Current Harmony ({currentHarmony.length} colors)
            </h4>

            <div className="grid grid-cols-4 gap-1 mb-2">
              {currentHarmony.map((color, index) => (
                <button
                  key={index}
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    onColorSelect?.(color)
                  }}
                  className={`aspect-square rounded border-2 hover:border-blue-500 transition-colors cursor-pointer ${
                    index === 0 ? 'border-white' : 'border-gray-300'
                  }`}
                  style={{
                    background: `rgb(${Math.round(255 * color.color1.b * (1 - color.color1.s + color.color1.s * Math.cos((color.color1.h * 360 * Math.PI) / 180)))}, ${Math.round(255 * color.color1.b * (1 - color.color1.s + color.color1.s * Math.cos(((color.color1.h * 360 - 120) * Math.PI) / 180)))}, ${Math.round(255 * color.color1.b * (1 - color.color1.s + color.color1.s * Math.cos(((color.color1.h * 360 - 240) * Math.PI) / 180)))})`,
                  }}
                  title={`${color.colorName} - ${color.make} (H:${(color.color1.h * 360).toFixed(0)} S:${(color.color1.s * 100).toFixed(0)} B:${(color.color1.b * 100).toFixed(0)})`}
                />
              ))}
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {HARMONY_MODES[harmonyMode].desc}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ColorRouletteHarmony
