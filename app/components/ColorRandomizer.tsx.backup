import React, { useState, useCallback } from 'react'
import type { CarColor } from '../types/color'

interface ColorRandomizerProps {
  colors: CarColor[]
  onColorSelect: (color: CarColor) => void
  isDarkMode: boolean
}

const ColorRandomizer: React.FC<ColorRandomizerProps> = ({ colors, onColorSelect, isDarkMode }) => {
  const [currentColor, setCurrentColor] = useState<CarColor | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)

  const getRandomColor = useCallback(() => {
    if (colors.length === 0) return
    
    setIsSpinning(true)
    
    let count = 0
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * colors.length)
      setCurrentColor(colors[randomIndex])
      count++
      
      if (count >= 8) {
        clearInterval(interval)
        setIsSpinning(false)
      }
    }, 100)
  }, [colors])

  const hsbToHsl = (h: number, s: number, b: number) => {
    const l = b * (1 - s / 2)
    const newS = l === 0 || l === 1 ? 0 : (b - l) / Math.min(l, 1 - l)
    return `hsl(${h * 360}, ${newS * 100}%, ${l * 100}%)`
  }

  return (
    <div className={`p-6 rounded-xl border-2 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30' 
        : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
    }`}>
      <div className="text-center">
        <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-purple-200' : 'text-purple-800'}`}>
          🎲 Color Roulette
        </h3>
        
        {currentColor && (
          <div className={`mb-4 p-4 rounded-lg transition-all duration-300 ${
            isSpinning ? 'animate-pulse scale-105' : 'scale-100'
          }`}>
            <div 
              className="w-24 h-24 mx-auto rounded-full border-4 border-white shadow-lg mb-3"
              style={{ backgroundColor: hsbToHsl(currentColor.color1.h, currentColor.color1.s, currentColor.color1.b) }}
            />
            <h4 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {currentColor.colorName}
            </h4>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {currentColor.make} {currentColor.model} {currentColor.year && `(${currentColor.year})`}
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={getRandomColor}
            disabled={isSpinning}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              isSpinning
                ? 'bg-gray-400 cursor-not-allowed'
                : isDarkMode
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg hover:shadow-xl'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
            } transform hover:scale-105`}
          >
            {isSpinning ? '🎰 Spinning...' : '🎲 Surprise Me!'}
          </button>
          
          {currentColor && !isSpinning && (
            <button
              onClick={() => onColorSelect(currentColor)}
              className={`block mx-auto px-4 py-2 rounded-lg text-sm transition-colors ${
                isDarkMode
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              ✨ Explore This Color
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ColorRandomizer