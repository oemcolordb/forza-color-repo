'use client'

import React, { useState } from 'react'

const EnhancedColorWheel = ({ currentHarmony, harmonyMode, isDarkMode, onColorSelect }) => {
  const [showHelp, setShowHelp] = useState(false)

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

  const getHarmonyExplanation = mode => {
    const explanations = {
      Monochromatic: 'Same hue, different brightness/saturation',
      Complementary: 'Opposite colors (180° apart)',
      Triadic: 'Three colors evenly spaced (120° apart)',
      Analogous: 'Adjacent colors (within 30°)',
      'Split-Complementary': 'Base + two colors near its complement',
      Tetradic: 'Four colors forming a rectangle',
      'Warm Temperature': 'Reds, oranges, yellows (energetic)',
      'Cool Temperature': 'Blues, greens, purples (calming)',
      'Spring Palette': 'Fresh, light colors',
      'Summer Palette': 'Bright, saturated colors',
      'Fall Palette': 'Warm, earthy colors',
      'Winter Palette': 'Cool, crisp, high contrast',
    }
    return explanations[mode] || 'Random color selection'
  }

  if (!currentHarmony || currentHarmony.length === 0) {
    return (
      <div
        className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg h-full`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🎯 Color Harmony Wheel
          </h3>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className={`text-sm px-2 py-1 rounded ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            ?
          </button>
        </div>

        {showHelp && (
          <div
            className={`mb-4 p-3 rounded text-sm ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-blue-50 text-blue-800'}`}
          >
            <p className="font-medium mb-2">How to use:</p>
            <ul className="space-y-1 text-xs">
              <li>• Choose a harmony mode from the dropdown</li>
              <li>• Click "Spin Roulette" to generate colors</li>
              <li>• See how colors relate on the wheel</li>
              <li>• Lines show geometric relationships</li>
            </ul>
          </div>
        )}

        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className={`text-6xl mb-4 ${isDarkMode ? 'text-slate-600' : 'text-gray-300'}`}>
              🎨
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              Generate a harmony to see the color wheel
            </p>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
              Click the ? button above for help
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg h-full`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          🎯 Color Harmony Wheel
        </h3>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className={`text-sm px-2 py-1 rounded ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          ?
        </button>
      </div>

      {/* Harmony explanation */}
      <div
        className={`mb-3 p-2 rounded text-xs ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-blue-50 text-blue-700'}`}
      >
        <span className="font-medium">{harmonyMode}:</span> {getHarmonyExplanation(harmonyMode)}
      </div>

      {showHelp && (
        <div
          className={`mb-4 p-3 rounded text-sm ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-blue-50 text-blue-800'}`}
        >
          <p className="font-medium mb-2">Understanding the wheel:</p>
          <ul className="space-y-1 text-xs">
            <li>
              • <span className="inline-block w-3 h-3 bg-white border rounded-full mr-1"></span>
              White border = base color
            </li>
            <li>
              • <span className="inline-block w-3 h-3 bg-gray-400 rounded-full mr-1"></span>Dotted
              lines = color relationships
            </li>
            <li>
              •{' '}
              <span className="inline-block w-3 h-3 bg-gradient-to-r from-red-500 to-blue-500 rounded-full mr-1"></span>
              Outer ring = hue spectrum (0-360°)
            </li>
            <li>• Click any color swatch to view details</li>
          </ul>
        </div>
      )}

      <div className="flex flex-col items-center h-full">
        {/* Large Color Wheel */}
        <div className="relative mb-6">
          <svg width="240" height="240" viewBox="0 0 240 240" className="transform -rotate-90">
            {/* Color wheel background with gradient */}
            <defs>
              <radialGradient id="wheelGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="white" stopOpacity="0.1" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              {/* Hue gradient around the wheel */}
              <linearGradient id="hueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff0000" />
                <stop offset="16.66%" stopColor="#ffff00" />
                <stop offset="33.33%" stopColor="#00ff00" />
                <stop offset="50%" stopColor="#00ffff" />
                <stop offset="66.66%" stopColor="#0000ff" />
                <stop offset="83.33%" stopColor="#ff00ff" />
                <stop offset="100%" stopColor="#ff0000" />
              </linearGradient>
            </defs>

            {/* Outer ring with hue spectrum */}
            <circle
              cx="120"
              cy="120"
              r="110"
              fill="none"
              stroke="url(#hueGradient)"
              strokeWidth="20"
              opacity="0.3"
            />
            <circle
              cx="120"
              cy="120"
              r="100"
              fill="none"
              stroke={isDarkMode ? '#374151' : '#d1d5db'}
              strokeWidth="2"
            />

            {/* Degree markers */}
            {[0, 90, 180, 270].map(degree => {
              const angle = (degree - 90) * (Math.PI / 180)
              const x1 = 120 + 105 * Math.cos(angle)
              const y1 = 120 + 105 * Math.sin(angle)
              const x2 = 120 + 115 * Math.cos(angle)
              const y2 = 120 + 115 * Math.sin(angle)
              const textX = 120 + 125 * Math.cos(angle)
              const textY = 120 + 125 * Math.sin(angle)
              return (
                <g key={degree}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isDarkMode ? '#6b7280' : '#9ca3af'}
                    strokeWidth="2"
                  />
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    className={`text-xs ${isDarkMode ? 'fill-gray-400' : 'fill-gray-500'}`}
                    transform={`rotate(90 ${textX} ${textY})`}
                  >
                    {degree}°
                  </text>
                </g>
              )
            })}

            {/* Harmony relationship lines */}
            {currentHarmony.length > 1 &&
              ![
                'Random Roulette',
                'Brand Harmony',
                'Warm Temperature',
                'Cool Temperature',
                'High Saturation',
                'Medium Saturation',
                'Low Saturation',
                'Light Brightness',
                'Medium Brightness',
                'Dark Brightness',
                'Spring Palette',
                'Summer Palette',
                'Fall Palette',
                'Winter Palette',
              ].includes(harmonyMode) && (
                <g>
                  {currentHarmony.slice(1).map((color, index) => {
                    // Use original angles for lines, not adjusted ones
                    const baseAngle = currentHarmony[0].color1.h * 360 * (Math.PI / 180)
                    const colorAngle = color.color1.h * 360 * (Math.PI / 180)
                    const baseX = 120 + 85 * Math.cos(baseAngle)
                    const baseY = 120 + 85 * Math.sin(baseAngle)
                    const colorX = 120 + 95 * Math.cos(colorAngle)
                    const colorY = 120 + 95 * Math.sin(colorAngle)
                    return (
                      <line
                        key={`${color.colorName}-${index}`}
                        x1={baseX}
                        y1={baseY}
                        x2={colorX}
                        y2={colorY}
                        stroke={isDarkMode ? '#6b7280' : '#9ca3af'}
                        strokeWidth="2"
                        strokeDasharray="4,4"
                        opacity="0.7"
                      />
                    )
                  })}
                </g>
              )}

            {/* Color dots on wheel with smart positioning */}
            {currentHarmony.map((color, index) => {
              let angle = color.color1.h * 360 * (Math.PI / 180)

              // Adjust angle slightly for overlapping colors to make them visible
              const overlaps = currentHarmony.filter(
                (c, i) => i !== index && Math.abs(c.color1.h * 360 - color.color1.h * 360) < 15
              )
              if (overlaps.length > 0) {
                angle += index * 0.2 - 0.1 // Spread overlapping dots
              }

              const radius = index === 0 ? 85 : 95 // Base color closer to center
              const x = 120 + radius * Math.cos(angle)
              const y = 120 + radius * Math.sin(angle)

              return (
                <g key={index} className="cursor-pointer" onClick={() => onColorSelect?.(color)}>
                  {/* Hover area */}
                  <circle
                    cx={x}
                    cy={y}
                    r="15"
                    fill="transparent"
                    className="hover:fill-white hover:fill-opacity-10"
                  />
                  {/* Outer glow */}
                  <circle
                    cx={x}
                    cy={y}
                    r="12"
                    fill={hsbToHex(color.color1.h * 360, color.color1.s, color.color1.b)}
                    opacity="0.3"
                    className="transition-all duration-200 hover:opacity-50"
                  />
                  {/* Main dot */}
                  <circle
                    cx={x}
                    cy={y}
                    r={index === 0 ? '10' : '8'}
                    fill={hsbToHex(color.color1.h * 360, color.color1.s, color.color1.b)}
                    stroke={index === 0 ? '#ffffff' : isDarkMode ? '#374151' : '#d1d5db'}
                    strokeWidth={index === 0 ? '3' : '2'}
                    className="transition-all duration-200 hover:stroke-white hover:stroke-4"
                  />
                  {/* Center highlight */}
                  <circle cx={x} cy={y} r="3" fill="white" opacity="0.6" />
                  {/* Color number */}
                  <text
                    x={x}
                    y={y + 25}
                    textAnchor="middle"
                    className={`text-xs font-bold ${isDarkMode ? 'fill-white' : 'fill-gray-900'} pointer-events-none`}
                    transform={`rotate(90 ${x} ${y + 25})`}
                  >
                    {index + 1}
                  </text>
                </g>
              )
            })}

            {/* Center label */}
            <circle
              cx="120"
              cy="120"
              r="25"
              fill={isDarkMode ? '#1f2937' : '#f9fafb'}
              stroke={isDarkMode ? '#374151' : '#d1d5db'}
              strokeWidth="2"
            />
            <text
              x="120"
              y="125"
              textAnchor="middle"
              className={`text-xs font-medium ${isDarkMode ? 'fill-white' : 'fill-gray-900'}`}
              transform="rotate(90 120 120)"
            >
              {harmonyMode.split(' ')[0]}
            </text>
          </svg>
        </div>

        {/* Color swatches with details */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Colors ({currentHarmony.length})
            </h4>
            <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Click to view
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {currentHarmony.map((color, index) => (
              <button
                key={index}
                onClick={() => onColorSelect?.(color)}
                className={`flex items-center space-x-2 p-2 rounded hover:bg-opacity-10 hover:bg-gray-500 transition-colors text-left w-full`}
                title={`Click to view ${color.colorName} details`}
              >
                <div className="relative">
                  <div
                    className={`w-8 h-8 rounded-full border-2 ${index === 0 ? 'border-white' : 'border-gray-300'} flex-shrink-0`}
                    style={{
                      background: hsbToHex(color.color1.h * 360, color.color1.s, color.color1.b),
                    }}
                  />
                  {index === 0 && (
                    <div
                      className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'} text-white text-xs flex items-center justify-center`}
                    >
                      1
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    {color.colorName}
                  </p>
                  <p
                    className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {Math.round(color.color1.h * 360)}° • {color.make}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedColorWheel
