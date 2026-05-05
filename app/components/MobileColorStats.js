import React, { useMemo } from 'react'

const MobileColorStats = ({ colors, favorites, colorHistory, isDarkMode }) => {
  const stats = useMemo(() => {
    const makeCount = colors.reduce((acc, color) => {
      acc[color.make] = (acc[color.make] || 0) + 1
      return acc
    }, {})

    return {
      totalColors: colors.length,
      totalMakes: Object.keys(makeCount).length,
      totalFavorites: favorites.length,
      totalViewed: colorHistory.length,
    }
  }, [colors, favorites, colorHistory])

  return (
    <div
      className={`p-3 rounded-lg border ${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}
    >
      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <div className="text-lg font-bold text-fuchsia-500">
            {(stats.totalColors / 1000).toFixed(1)}K
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Colors</div>
        </div>
        <div>
          <div className="text-lg font-bold text-cyan-500">{stats.totalMakes}</div>
          <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Makes</div>
        </div>
        <div>
          <div className="text-lg font-bold text-red-500">{stats.totalFavorites}</div>
          <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Favs</div>
        </div>
        <div>
          <div className="text-lg font-bold text-green-500">{stats.totalViewed}</div>
          <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Viewed</div>
        </div>
      </div>
    </div>
  )
}

export default MobileColorStats
