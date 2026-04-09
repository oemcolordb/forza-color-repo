'use client'

import React from 'react'

const HarmonyVisualizer = ({ currentHarmony, harmonyMode, isDarkMode, onColorSelect }) => {
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

  if (!currentHarmony || currentHarmony.length === 0) {

  const safeHarmony = currentHarmony.filter(c => c?.color1 && c?.color2)

  const safeHarmony = currentHarmony.filter(c => c?.color1 && c?.color2)

    return (
      <div
        className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg h-full flex items-center justify-center`}
      >
        <div className="text-center">
          <div className={`text-6xl mb-4 ${isDarkMode ? 'text-slate-600' : 'text-gray-300'}`}>
            🎨
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            Generate a harmony to see the palette
          </p>
        </div>
      </div>
    )
  }

  const safeHarmony = currentHarmony.filter(c => c?.color1 && c?.color2)

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg h-full hover-lift`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        🎨 Color Harmony
      </h3>

      {/* Harmony mode info */}
      <div className={`mb-4 p-3 rounded glass-effect ${isDarkMode ? 'bg-slate-700/60' : 'bg-gray-50/80'}`}>
        <h4 className={`font-medium text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {harmonyMode}
        </h4>
        <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
          {safeHarmony.length} colors generated
        </p>
      </div>

      {/* Large color swatches */}
      <div className="space-y-3 mb-4">
        {safeHarmony.map((color, index) => (
          <button
            key={index}
            onClick={() => onColorSelect?.(color)}
            className={`w-full p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg hover-lift ${
              index === 0 ? 'border-white' : isDarkMode ? 'border-slate-600' : 'border-gray-300'
            }`}
            style={{
              background: `linear-gradient(135deg, ${hsbToHex(color.color1.h * 360, color.color1.s, color.color1.b)} 0%, ${hsbToHex(color.color2.h * 360, color.color2.s, color.color2.b)} 100%)`,
            }}
          >
            <div className="flex items-center justify-between text-white">
              <div className="text-left">
                <div className="font-medium text-sm drop-shadow-lg">
                  {index === 0 ? '🎯 ' : ''}
                  {color.colorName}
                </div>
                <div className="text-xs opacity-90 drop-shadow">
                  {color.make} • {Math.round(color.color1.h * 360)}°
                </div>
              </div>
              <div
                className={`px-2 py-1 rounded text-xs font-bold ${
                  index === 0 ? 'bg-white text-gray-900 animate-glow-pulse' : 'bg-black bg-opacity-30'
                }`}
              >
                {index === 0 ? 'BASE' : index + 1}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Color strip visualization */}
      <div className="mb-4">
        <h5
          className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
        >
          Palette Preview
        </h5>
        <div className="flex rounded-lg overflow-hidden h-8 shadow-inner">
          {safeHarmony.map((color, index) => (
            <div
              key={index}
              className="flex-1 cursor-pointer hover:scale-105 transition-transform"
              style={{
                background: hsbToHex(color.color1.h * 360, color.color1.s, color.color1.b),
              }}
              onClick={() => onColorSelect?.(color)}
              title={`${color.colorName} - ${color.make}`}
            />
          ))}
        </div>
      </div>

      {/* Color relationships */}
      <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
        <div className="flex items-center justify-between">
          <span>Hue Range:</span>
          <span>
            {Math.min(...safeHarmony.map(c => Math.round(c.color1.h * 360)))}° -{' '}
            {Math.max(...safeHarmony.map(c => Math.round(c.color1.h * 360)))}°
          </span>
        </div>
      </div>
    </div>
  )
}

export default HarmonyVisualizer
