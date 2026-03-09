'use client'

import React, { useState } from 'react'

const HSBVisualizer = ({ colors, isDarkMode }) => {
  const [selectedAxis, setSelectedAxis] = useState('hue')

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

    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    bl = Math.round((bl + m) * 255)

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`
  }

  const getAxisValue = (color, axis) => {
    switch (axis) {
      case 'hue':
        return color.color1.h * 360
      case 'saturation':
        return color.color1.s * 100
      case 'brightness':
        return color.color1.b * 100
      default:
        return 0
    }
  }

  const sortedColors = colors
    .slice(0, 100) // Limit for performance
    .sort((a, b) => getAxisValue(a, selectedAxis) - getAxisValue(b, selectedAxis))

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        🌈 HSB Color Space
      </h3>

      <div className="mb-4">
        <div className="flex gap-2 mb-3">
          {['hue', 'saturation', 'brightness'].map(axis => (
            <button
              key={axis}
              onClick={() => setSelectedAxis(axis)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedAxis === axis
                  ? 'bg-blue-600 text-white'
                  : isDarkMode
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {axis.charAt(0).toUpperCase() + axis.slice(1)}
            </button>
          ))}
        </div>

        {/* Color spectrum bar */}
        <div className="relative h-8 rounded overflow-hidden mb-2">
          <div
            className="absolute inset-0"
            style={{
              background:
                selectedAxis === 'hue'
                  ? 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                  : selectedAxis === 'saturation'
                    ? 'linear-gradient(to right, #808080, #ff0000)'
                    : 'linear-gradient(to right, #000000, #ffffff)',
            }}
          />
        </div>

        {/* Value labels */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>0{selectedAxis === 'hue' ? '°' : '%'}</span>
          <span>{selectedAxis === 'hue' ? '360°' : '100%'}</span>
        </div>
      </div>

      {/* Color dots visualization */}
      <div className="grid grid-cols-10 gap-1 mb-4">
        {sortedColors.map((color, index) => (
          <div
            key={`${color.make}-${color.colorName}-${index}`}
            className="w-6 h-6 rounded-full border border-gray-300"
            style={{
              backgroundColor: hsbToHex(color.color1.h * 360, color.color1.s, color.color1.b),
            }}
            title={`${color.colorName} - ${selectedAxis}: ${Math.round(getAxisValue(color, selectedAxis))}${selectedAxis === 'hue' ? '°' : '%'}`}
          />
        ))}
      </div>

      {/* Statistics */}
      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        <p>
          Showing {sortedColors.length} colors sorted by {selectedAxis}
        </p>
        <p className="text-xs mt-1">
          Range: {Math.round(getAxisValue(sortedColors[0], selectedAxis))} -{' '}
          {Math.round(getAxisValue(sortedColors[sortedColors.length - 1], selectedAxis))}
          {selectedAxis === 'hue' ? '°' : '%'}
        </p>
      </div>
    </div>
  )
}

export default HSBVisualizer
