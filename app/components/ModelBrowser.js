import React, { useMemo } from 'react'

const ColorTypeBrowser = ({ colors, isDarkMode, onColorTypeSelect }) => {
  const colorTypeData = useMemo(() => {
    const typeMap = new Map()
    
    colors.forEach(color => {
      const colorType = color.colorType || 'Unknown'
      typeMap.set(colorType, (typeMap.get(colorType) || 0) + 1)
    })
    
    return Array.from(typeMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
  }, [colors])

  const getTypeEmoji = (type) => {
    const emojiMap = {
      'Normal': '🎨',
      'Metal Flake': '✨',
      'Matte': '🌫️',
      'Two-Tone': '🎭',
      'Carbon Fiber': '🖤',
      'Chrome': '🪞',
      'Pearlescent': '🦪',
      'Metallic': '💎',
      'Satin': '🌟',
      'Unknown': '❓'
    }
    return emojiMap[type] || '🎨'
  }

  if (colorTypeData.length === 0) return null

  return (
    <div className={`p-6 rounded-lg border ${
      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-blue-100' : 'text-blue-900'}`}>
        🎨 Browse by Color Type
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {colorTypeData.map(({ type, count }) => (
          <button
            key={type}
            onClick={() => onColorTypeSelect(type)}
            className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
              isDarkMode 
                ? 'bg-slate-700 border-slate-600 hover:border-blue-500 text-slate-200' 
                : 'bg-gray-50 border-gray-200 hover:border-blue-400 text-gray-800'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">{getTypeEmoji(type)}</div>
              <div className="font-semibold text-sm mb-1">{type}</div>
              <div className={`text-xs ${
                isDarkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>
                {count.toLocaleString()} colors
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ColorTypeBrowser