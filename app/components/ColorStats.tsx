import React, { useMemo } from 'react'
import type { CarColor } from '../types/color'

interface ColorStatsProps {
  colors: CarColor[]
  favorites: string[]
  colorHistory: CarColor[]
  isDarkMode: boolean
}

const ColorStats: React.FC<ColorStatsProps> = ({ colors, favorites, colorHistory, isDarkMode }) => {
  const stats = useMemo(() => {
    const makeCount = colors.reduce((acc, color) => {
      acc[color.make] = (acc[color.make] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const typeCount = colors.reduce((acc, color) => {
      if (color.colorType) {
        acc[color.colorType] = (acc[color.colorType] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const topMakes = Object.entries(makeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    const topTypes = Object.entries(typeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)

    return {
      totalColors: colors.length,
      totalMakes: Object.keys(makeCount).length,
      totalFavorites: favorites.length,
      totalViewed: colorHistory.length,
      topMakes,
      topTypes
    }
  }, [colors, favorites, colorHistory])

  return (
    <div className={`p-6 rounded-lg border ${
      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
        📊 Color Statistics
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-fuchsia-500">{stats.totalColors.toLocaleString()}</div>
          <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Total Colors</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-cyan-500">{stats.totalMakes}</div>
          <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Manufacturers</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-500">{stats.totalFavorites}</div>
          <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Favorites</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500">{stats.totalViewed}</div>
          <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Viewed</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>
            Top Manufacturers
          </h3>
          {stats.topMakes.map(([make, count]) => (
            <div key={make} className="flex justify-between items-center mb-1">
              <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>{make}</span>
              <span className={`text-sm font-mono ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>{count}</span>
            </div>
          ))}
        </div>
        
        <div>
          <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>
            Popular Types
          </h3>
          {stats.topTypes.map(([type, count]) => (
            <div key={type} className="flex justify-between items-center mb-1">
              <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>{type}</span>
              <span className={`text-sm font-mono ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ColorStats