'use client'

import React, { useMemo } from 'react'
import { CarColor } from '../types'

interface ColorAnalyticsDashboardProps {
  colors: CarColor[]
  isDarkMode: boolean
}

export default function ColorAnalyticsDashboard({
  colors,
  isDarkMode,
}: ColorAnalyticsDashboardProps) {
  const analytics = useMemo(() => {
    const makeCount = new Map<string, number>()
    const typeCount = new Map<string, number>()
    const colorFrequency = new Map<string, number>()

    colors.forEach(color => {
      makeCount.set(color.make, (makeCount.get(color.make) || 0) + 1)
      const colorType = color.colorType || 'Unknown'
      typeCount.set(colorType, (typeCount.get(colorType) || 0) + 1)
      colorFrequency.set(color.colorName, (colorFrequency.get(color.colorName) || 0) + 1)
    })

    return {
      topMakes: Array.from(makeCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      topTypes: Array.from(typeCount.entries()).sort((a, b) => b[1] - a[1]),
      mostCommon: Array.from(colorFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      total: colors.length,
    }
  }, [colors])

  return (
    <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        📊 Color Analytics
      </h2>

      {/* Total Colors */}
      <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
        <div className="text-4xl font-bold text-blue-500">{analytics.total.toLocaleString()}</div>
        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Total Colors
        </div>
      </div>

      {/* Top Manufacturers */}
      <div className="mb-6">
        <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          🏆 Top Manufacturers
        </h3>
        <div className="space-y-2">
          {analytics.topMakes.map(([make, count], index) => (
            <div key={make} className="flex items-center gap-2">
              <span
                className={`text-sm font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                #{index + 1}
              </span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {make}
                  </span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {count}
                  </span>
                </div>
                <div className={`h-2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${(count / analytics.topMakes[0][1]) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Color Types */}
      <div className="mb-6">
        <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          🎨 Color Types
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {analytics.topTypes.map(([type, count]) => (
            <div
              key={type}
              className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}
            >
              <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {count}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {type}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Most Common Colors */}
      <div>
        <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          ⭐ Most Common Colors
        </h3>
        <div className="space-y-1">
          {analytics.mostCommon.map(([name, count]) => (
            <div
              key={name}
              className={`flex justify-between text-sm p-2 rounded ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
            >
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{name}</span>
              <span className={`font-mono ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {count}x
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
