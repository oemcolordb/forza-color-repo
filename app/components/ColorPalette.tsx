import React, { useState, useMemo, useCallback } from 'react'
import type { CarColor } from '../types/color'

interface ColorPaletteProps {
  colors: CarColor[]
  isDarkMode: boolean
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ colors, isDarkMode }) => {
  const [selectedColor, setSelectedColor] = useState<CarColor | null>(null)

  const generatePalette = useCallback((baseColor: CarColor) => {
    const baseH = baseColor.color1.h

    // Find complementary and analogous colors
    const complementaryH = (baseH + 0.5) % 1
    const analogous1H = (baseH + 0.083) % 1 // +30 degrees
    const analogous2H = (baseH - 0.083 + 1) % 1 // -30 degrees
    const triadicH = (baseH + 0.333) % 1 // +120 degrees

    const findClosestColor = (targetH: number, excludeColors: CarColor[] = []) => {
      if (colors.length === 0) return baseColor
      
      // Filter out the base color and already selected colors to avoid duplicates
      const availableColors = colors.filter(c => 
        !(c.make === baseColor.make && c.model === baseColor.model && c.colorName === baseColor.colorName) &&
        !excludeColors.some(exc => exc.make === c.make && exc.model === c.model && exc.colorName === c.colorName) &&
        c.color1.s > 0.1 && c.color1.b > 0.2 // Avoid very desaturated or dark colors
      )
      
      if (availableColors.length === 0) return baseColor
      
      // Find colors with good hue match and visual distinction
      const candidates = availableColors.map(color => {
        const colorH = color.color1.h
        const hueDiff = Math.min(Math.abs(colorH - targetH), 1 - Math.abs(colorH - targetH))
        const saturation = color.color1.s
        const brightness = color.color1.b
        
        // Score based on hue match, but prefer more saturated and brighter colors
        const score = (1 - hueDiff) * 0.6 + saturation * 0.2 + brightness * 0.2
        
        return { color, score, hueDiff }
      })
      
      // Sort by score and return the best match
      candidates.sort((a, b) => b.score - a.score)
      return candidates[0]?.color || baseColor
    }

    const complementary = findClosestColor(complementaryH)
    const analogous1 = findClosestColor(analogous1H, [complementary])
    const analogous2 = findClosestColor(analogous2H, [complementary, analogous1])
    const triadic = findClosestColor(triadicH, [complementary, analogous1, analogous2])

    return {
      base: baseColor,
      complementary,
      analogous1,
      analogous2,
      triadic
    }
  }, [colors])

  const palette = useMemo(() => {
    if (!selectedColor) return null
    return generatePalette(selectedColor)
  }, [selectedColor, generatePalette])

  const hsbToHsl = (h: number, s: number, b: number) => {
    const l = b * (1 - s / 2)
    const newS = l === 0 || l === 1 ? 0 : (b - l) / Math.min(l, 1 - l)
    return `hsl(${h * 360}, ${newS * 100}%, ${l * 100}%)`
  }

  const getRandomColor = () => {
    if (colors.length === 0) return
    const randomIndex = Math.floor(Math.random() * colors.length)
    setSelectedColor(colors[randomIndex])
  }

  return (
    <div className={`p-6 rounded-xl border-2 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30' 
        : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
    }`}>
      <h3 className={`text-xl font-bold mb-4 text-center ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
        🎨 Color Harmony Generator
      </h3>

      <div className="text-center mb-4">
        <button
          onClick={getRandomColor}
          disabled={colors.length === 0}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            colors.length === 0
              ? 'bg-gray-400 cursor-not-allowed text-gray-600'
              : isDarkMode
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } transform hover:scale-105`}
        >
          🌈 Generate Palette
        </button>
      </div>

      {palette && (
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(palette).map(([type, color]) => (
              <div key={type} className="text-center">
                <div
                  className="w-16 h-16 mx-auto rounded-lg border-2 border-white shadow-md mb-2 transition-transform hover:scale-110"
                  style={{ backgroundColor: hsbToHsl(color.color1.h, color.color1.s, color.color1.b) }}
                  title={`${color.colorName} - ${color.make}`}
                />
                <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {type === 'base' ? '🎯 Base' : 
                   type === 'complementary' ? '🔄 Complement' :
                   type === 'analogous1' ? '➡️ Analog 1' :
                   type === 'analogous2' ? '⬅️ Analog 2' : '🔺 Triadic'}
                </p>
              </div>
            ))}
          </div>

          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'}`}>
            <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Base Color: {palette.base.colorName}
            </h4>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {palette.base.make} {palette.base.model} {palette.base.year && `(${palette.base.year})`}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ColorPalette