import React, { useMemo, useState, useEffect } from 'react'
import { fetchTrendPrediction } from '../lib/pythonApi'

const ColorTrends = ({ colors, favorites, isDarkMode }) => {
  const [prediction, setPrediction] = useState(null)

  const trends = useMemo(() => {
    // Color type distribution
    const colorTypes = colors.reduce((acc, color) => {
      const type = color.colorType || 'Unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    // Most popular makes by color count
    const makeStats = colors.reduce((acc, color) => {
      acc[color.make] = (acc[color.make] || 0) + 1
      return acc
    }, {})

    // Decade analysis
    const decades = colors.reduce((acc, color) => {
      if (color.year && color.year > 0) {
        const decade = Math.floor(color.year / 10) * 10
        acc[decade] = (acc[decade] || 0) + 1
      }
      return acc
    }, {})

    // Color name patterns
    const colorPatterns = colors.reduce((acc, color) => {
      const words = color.colorName.toLowerCase().split(/[\s-]+/)
      words.forEach(word => {
        if (word.length > 3) {
          acc[word] = (acc[word] || 0) + 1
        }
      })
      return acc
    }, {})

    return {
      totalColors: colors.length,
      colorTypes: Object.entries(colorTypes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      topMakes: Object.entries(makeStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      decades: Object.entries(decades)
        .sort(([a], [b]) => Number(b) - Number(a))
        .slice(0, 6),
      popularWords: Object.entries(colorPatterns)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
    }
  }, [colors])

  const getRandomEmoji = () => {
    const emojis = ['🎨', '🌈', '✨', '🎯', '🔥', '💎', '🌟', '🎪']
    return emojis[Math.floor(Math.random() * emojis.length)]
  }

  return (
    <div className={`p-6 rounded-xl border-2 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-500/30' 
        : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'
    }`}>
      <h3 className={`text-xl font-bold mb-6 text-center ${isDarkMode ? 'text-emerald-200' : 'text-emerald-800'}`}>
        📊 Color Universe Stats
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Stats */}
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'}`}>
          <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🎯 Quick Stats
          </h4>
          <div className="space-y-2 text-sm">
            <div className={`flex justify-between ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <span>Total Colors:</span>
              <span className="font-bold text-emerald-500">{trends.totalColors.toLocaleString()}</span>
            </div>
            <div className={`flex justify-between ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <span>Your Favorites:</span>
              <span className="font-bold text-pink-500">{favorites.length}</span>
            </div>
            <div className={`flex justify-between ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <span>Manufacturers:</span>
              <span className="font-bold text-blue-500">{trends.topMakes.length}+</span>
            </div>
          </div>
        </div>

        {/* Color Types */}
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'}`}>
          <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🎨 Color Types
          </h4>
          <div className="space-y-2">
            {trends.colorTypes.map(([type, count]) => (
              <div key={type} className="flex justify-between items-center text-sm">
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {getRandomEmoji()} {type}
                </span>
                <span className="font-bold text-purple-500">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Manufacturers */}
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'}`}>
          <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🏆 Top Manufacturers
          </h4>
          <div className="space-y-2">
            {trends.topMakes.map(([make, count], index) => (
              <div key={make} className="flex justify-between items-center text-sm">
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'} {make}
                </span>
                <span className="font-bold text-orange-500">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Color Words */}
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'}`}>
          <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🔥 Trending Words
          </h4>
          <div className="flex flex-wrap gap-2">
            {trends.popularWords.map(([word, count]) => (
              <span
                key={word}
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                }`}
                title={`${count} colors`}
              >
                {word} ({count})
              </span>
            ))}
          </div>
        </div>

        {/* Predicted Colors */}
        {prediction && prediction.forecast && (
          <div className={`p-4 rounded-lg mt-6 ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'}`}>
            <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              🔮 Predicted Trends ({prediction.next_year})
            </h4>
            <div className="flex flex-wrap gap-2">
              {prediction.forecast.map(item => (
                <span
                  key={item.colorName}
                  className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-pink-500 to-yellow-500 text-white"
                  title={`slope: ${item.slope.toFixed(2)}, count: ${item.predicted_count.toFixed(0)}`}
                >
                  {item.colorName}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ColorTrends