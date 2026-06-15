'use client'

import React, { useMemo, useState } from 'react'
import { CarColor } from '@/types'

interface ColorAnalyticsDashboardProps {
  colors: CarColor[]
  isDarkMode: boolean
}

// Gradient colors for bars
const barGradients = [
  'from-amber-400 via-orange-500 to-red-500',
  'from-blue-400 via-indigo-500 to-purple-500',
  'from-emerald-400 via-teal-500 to-cyan-500',
  'from-pink-400 via-rose-500 to-red-500',
  'from-violet-400 via-purple-500 to-fuchsia-500',
  'from-cyan-400 via-sky-500 to-blue-500',
  'from-lime-400 via-green-500 to-emerald-500',
  'from-yellow-400 via-amber-500 to-orange-500',
  'from-red-400 via-rose-500 to-pink-500',
  'from-indigo-400 via-violet-500 to-purple-500',
]

// Medal colors for top 3
const medalColors = ['🥇', '🥈', '🥉']

export default function ColorAnalyticsDashboard({
  colors,
  isDarkMode,
}: ColorAnalyticsDashboardProps) {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null)

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
      uniqueMakes: new Set(colors.map(c => c.make)).size,
    }
  }, [colors])

  return (
    <div
      className={`p-6 rounded-xl ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}
    >
      <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <span className="text-3xl">📊</span>
        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Color Analytics
        </span>
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border border-blue-500/30' : 'bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200'}`}>
          <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {analytics.total.toLocaleString()}
          </div>
          <div className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
            Total Colors
          </div>
        </div>
        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-pink-100 border border-purple-200'}`}>
          <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {analytics.uniqueMakes}
          </div>
          <div className={`text-sm font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>
            Manufacturers
          </div>
        </div>
      </div>

      {/* Top Manufacturers - Enhanced Bar Chart */}
      <div className="mb-8">
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <span className="text-xl">🏆</span>
          Top Manufacturers
        </h3>
        <div className="space-y-3">
          {analytics.topMakes.map(([make, count], index) => {
            const percentage = (count / analytics.topMakes[0][1]) * 100
            const isHovered = hoveredBar === make
            
            return (
              <div 
                key={make} 
                className={`group relative transition-all duration-300 ${isHovered ? 'scale-[1.02]' : ''}`}
                onMouseEnter={() => setHoveredBar(make)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm ${
                    index < 3 
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/30' 
                      : isDarkMode 
                        ? 'bg-slate-700 text-slate-300' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index < 3 ? medalColors[index] : `#${index + 1}`}
                  </div>
                  
                  {/* Bar Container */}
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} ${isHovered ? 'text-blue-400' : ''} transition-colors`}>
                        {make}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
                          {percentage.toFixed(1)}%
                        </span>
                        <span className={`font-bold tabular-nums ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
                          {count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className={`h-4 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-200'} relative`}>
                      {/* Background glow effect */}
                      <div 
                        className={`absolute inset-0 bg-gradient-to-r ${barGradients[index]} opacity-20 blur-sm`}
                        style={{ width: `${percentage}%` }}
                      />
                      {/* Main bar */}
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${barGradients[index]} relative overflow-hidden transition-all duration-500 ease-out`}
                        style={{ 
                          width: `${percentage}%`,
                          boxShadow: isHovered ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none'
                        }}
                      >
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                        {/* Animated shimmer */}
                        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 ${isHovered ? 'animate-shimmer' : ''}`} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Color Types - Enhanced Grid */}
      <div className="mb-8">
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <span className="text-xl">🎨</span>
          Color Types
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {analytics.topTypes.slice(0, 6).map(([type, count], index) => {
            const typeGradients = [
              'from-rose-500 to-pink-600',
              'from-violet-500 to-purple-600',
              'from-blue-500 to-indigo-600',
              'from-cyan-500 to-teal-600',
              'from-emerald-500 to-green-600',
              'from-amber-500 to-orange-600',
            ]
            const percentage = ((count / analytics.total) * 100).toFixed(1)
            
            return (
              <div
                key={type}
                className={`group p-4 rounded-xl transition-all duration-300 hover:scale-105 cursor-default ${
                  isDarkMode 
                    ? 'bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 hover:border-slate-500' 
                    : 'bg-gray-50 hover:bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg'
                }`}
              >
                <div className={`text-2xl font-bold bg-gradient-to-r ${typeGradients[index % typeGradients.length]} bg-clip-text text-transparent`}>
                  {count.toLocaleString()}
                </div>
                <div className={`text-sm font-medium mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {type}
                </div>
                <div className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  {percentage}% of total
                </div>
                {/* Mini progress bar */}
                <div className={`h-1 rounded-full mt-2 ${isDarkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${typeGradients[index % typeGradients.length]}`}
                    style={{ width: `${Math.min(100, (count / analytics.topTypes[0][1]) * 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Most Common Colors - Enhanced List */}
      <div>
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <span className="text-xl">⭐</span>
          Most Popular Color Names
        </h3>
        <div className={`rounded-xl overflow-hidden ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
          {analytics.mostCommon.map(([name, count], index) => (
            <div
              key={name}
              className={`flex items-center justify-between p-3 transition-colors ${
                isDarkMode 
                  ? 'hover:opacity-95 border-b border-slate-700/50 last:border-0' 
                  : 'hover:opacity-95 border-b border-gray-100 last:border-0'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                  index < 3 
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' 
                    : isDarkMode 
                      ? 'bg-slate-600 text-slate-300' 
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </span>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                  isDarkMode 
                    ? 'bg-cyan-500/20 text-cyan-400' 
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {count}x
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
