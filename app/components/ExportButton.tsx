import React from 'react'

interface ExportButtonProps {
  favorites: string[]
  isDarkMode: boolean
}

const ExportButton: React.FC<ExportButtonProps> = ({ favorites, isDarkMode }) => {
  const exportFavorites = async (format: string) => {
    try {
      const params = new URLSearchParams({ format, favorites: favorites.join(',') })
      const response = await fetch(`/api/export-colors?${params}`)
      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `forza-favorites.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  if (favorites.length === 0) return null

  return (
    <div className="flex gap-2">
      <button
        onClick={() => exportFavorites('json')}
        className={`px-3 py-1 rounded text-sm transition-colors ${
          isDarkMode
            ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
        }`}
      >
        📄 Export JSON
      </button>
      <button
        onClick={() => exportFavorites('csv')}
        className={`px-3 py-1 rounded text-sm transition-colors ${
          isDarkMode
            ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
        }`}
      >
        📊 Export CSV
      </button>
    </div>
  )
}

export default ExportButton
