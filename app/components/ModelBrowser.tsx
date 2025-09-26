import React, { useMemo } from 'react'
import type { CarColor } from '../types/color'

interface ModelBrowserProps {
  colors: CarColor[]
  isDarkMode: boolean
  onModelSelect: (make: string, model: string) => void
}

const ModelBrowser: React.FC<ModelBrowserProps> = ({ colors, isDarkMode, onModelSelect }) => {
  const modelData = useMemo(() => {
    const modelMap = new Map<string, { models: Set<string>, colorCount: number }>()
    
    colors.forEach(color => {
      if (!color.model || color.model.trim() === '') return
      
      const key = color.make
      if (!modelMap.has(key)) {
        modelMap.set(key, { models: new Set(), colorCount: 0 })
      }
      
      const data = modelMap.get(key)!
      data.models.add(color.model)
      data.colorCount++
    })
    
    return Array.from(modelMap.entries())
      .map(([make, data]) => ({
        make,
        models: Array.from(data.models).sort(),
        colorCount: data.colorCount
      }))
      .filter(item => item.models.length > 0)
      .sort((a, b) => b.colorCount - a.colorCount)
  }, [colors])

  const popularModels = useMemo(() => {
    const modelCounts = new Map<string, number>()
    
    colors.forEach(color => {
      if (!color.model || color.model.trim() === '') return
      const key = `${color.make} ${color.model}`
      modelCounts.set(key, (modelCounts.get(key) || 0) + 1)
    })
    
    return Array.from(modelCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([model, count]) => ({ model, count }))
  }, [colors])

  if (modelData.length === 0) return null

  return (
    <div className={`p-6 rounded-lg border ${
      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-blue-100' : 'text-blue-900'}`}>
        🚗 Popular Car Models
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
            Most Colors Available
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {popularModels.slice(0, 10).map(({ model, count }) => (
              <button
                key={model}
                onClick={() => {
                  const [make, ...modelParts] = model.split(' ')
                  onModelSelect(make, modelParts.join(' '))
                }}
                className={`w-full text-left p-2 rounded transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-slate-700 text-slate-300' 
                    : 'hover:bg-blue-50 text-gray-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{model}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    isDarkMode ? 'bg-blue-600 text-blue-100' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {count} colors
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
            Browse by Manufacturer
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {modelData.slice(0, 10).map(({ make, models, colorCount }) => (
              <div key={make} className={`p-2 rounded ${
                isDarkMode ? 'bg-slate-700' : 'bg-gray-50'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-medium ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                    {make}
                  </span>
                  <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    {models.length} models
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {models.slice(0, 3).map(model => (
                    <button
                      key={model}
                      onClick={() => onModelSelect(make, model)}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        isDarkMode 
                          ? 'bg-blue-600 hover:bg-blue-500 text-blue-100' 
                          : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                      }`}
                    >
                      {model}
                    </button>
                  ))}
                  {models.length > 3 && (
                    <span className={`text-xs px-2 py-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      +{models.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModelBrowser