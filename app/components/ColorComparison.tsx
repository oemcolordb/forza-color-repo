'use client'

import React, { useState } from 'react'
import { CarColor } from '../types'

interface ColorComparisonProps {
  colors: CarColor[]
  isDarkMode: boolean
}

const ColorComparison: React.FC<ColorComparisonProps> = ({ colors, isDarkMode }) => {
  const [selectedColors, setSelectedColors] = useState<CarColor[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const filteredColors = colors.filter(color =>
    color.colorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    color.make.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 20)

  const addColor = (color: CarColor) => {
    if (selectedColors.length < 4 && !selectedColors.find(c => c.colorName === color.colorName && c.make === color.make)) {
      setSelectedColors([...selectedColors, color])
    }
  }

  const removeColor = (index: number) => {
    setSelectedColors(selectedColors.filter((_, i) => i !== index))
  }

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        🔍 Color Comparison Tool
      </h3>
      
      <input
        type="text"
        placeholder="Search colors to compare..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={`w-full p-2 mb-4 rounded border ${
          isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
        }`}
      />

      {searchQuery && (
        <div className="mb-4 max-h-32 overflow-y-auto">
          <div className="grid grid-cols-4 gap-2">
            {filteredColors.map((color, index) => (
              <button
                key={index}
                onClick={() => addColor(color)}
                className="p-2 text-xs rounded border hover:border-blue-500"
                style={{ backgroundColor: `hsl(${color.color1.h * 360}, ${color.color1.s * 100}%, ${color.color1.b * 100}%)` }}
                title={`${color.colorName} - ${color.make}`}
              >
                <div className="text-white drop-shadow font-bold">{color.colorName}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => {
          const color = selectedColors[index]
          return (
            <div key={index} className={`border-2 border-dashed rounded-lg p-4 ${
              color ? 'border-blue-500' : isDarkMode ? 'border-slate-600' : 'border-gray-300'
            }`}>
              {color ? (
                <div>
                  <div 
                    className="w-full h-20 rounded mb-2"
                    style={{ backgroundColor: `hsl(${color.color1.h * 360}, ${color.color1.s * 100}%, ${color.color1.b * 100}%)` }}
                  />
                  <div className="text-sm font-medium">{color.colorName}</div>
                  <div className="text-xs opacity-75">{color.make}</div>
                  <div className="text-xs font-mono mt-1">
                    H:{Math.round(color.color1.h * 360)} S:{Math.round(color.color1.s * 100)} B:{Math.round(color.color1.b * 100)}
                  </div>
                  <button
                    onClick={() => removeColor(index)}
                    className="mt-2 text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className={`text-center ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  <div className="text-2xl mb-2">+</div>
                  <div className="text-xs">Add Color {index + 1}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ColorComparison