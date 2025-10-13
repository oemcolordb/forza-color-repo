'use client'

import React, { useState, useEffect } from 'react'
import { CarColor } from '../types'

interface ColorHistoryProps {
  isDarkMode: boolean
  onColorSelect: (color: CarColor) => void
}

const ColorHistory: React.FC<ColorHistoryProps> = ({ isDarkMode, onColorSelect }) => {
  const [history, setHistory] = useState<CarColor[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('forza-color-history')
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch (e) {
        setHistory([])
      }
    }
  }, [])

  const addToHistory = (color: CarColor) => {
    const newHistory = [color, ...history.filter(c => 
      !(c.colorName === color.colorName && c.make === color.make)
    )].slice(0, 20)
    
    setHistory(newHistory)
    localStorage.setItem('forza-color-history', JSON.stringify(newHistory))
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('forza-color-history')
  }

  // Expose addToHistory function globally
  useEffect(() => {
    (window as any).addColorToHistory = addToHistory
  }, [history])

  if (history.length === 0) {
    return (
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
        <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          🕒 Recently Viewed
        </h3>
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          No colors viewed yet
        </div>
      </div>
    )
  }

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          🕒 Recently Viewed ({history.length})
        </h3>
        <button
          onClick={clearHistory}
          className={`text-xs px-2 py-1 rounded ${
            isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Clear
        </button>
      </div>
      
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
        {history.map((color, index) => (
          <button
            key={index}
            onClick={() => onColorSelect(color)}
            className="aspect-square rounded border-2 border-gray-300 hover:border-blue-500 transition-colors"
            style={{ backgroundColor: `hsl(${color.color1.h * 360}, ${color.color1.s * 100}%, ${color.color1.b * 100}%)` }}
            title={`${color.colorName} - ${color.make}`}
          />
        ))}
      </div>
    </div>
  )
}

export default ColorHistory