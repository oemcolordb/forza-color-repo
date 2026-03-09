'use client'

import React from 'react'
import { CarColor } from '../types'

interface ColorExportProps {
  colors: CarColor[]
  isDarkMode: boolean
}

const ColorExport: React.FC<ColorExportProps> = ({ colors, isDarkMode }) => {
  const exportToCSV = () => {
    const headers = [
      'Color Name',
      'Make',
      'Model',
      'Year',
      'Color Type',
      'Hue',
      'Saturation',
      'Brightness',
      'HEX',
    ]
    const csvData = colors.map(color => [
      color.colorName,
      color.make,
      color.model || '',
      color.year || '',
      color.colorType,
      Math.round(color.color1.h * 360),
      Math.round(color.color1.s * 100),
      Math.round(color.color1.b * 100),
      hsbToHex(color.color1.h * 360, color.color1.s, color.color1.b),
    ])

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n')
    downloadFile(csv, 'forza-colors.csv', 'text/csv')
  }

  const exportToJSON = () => {
    const jsonData = colors.map(color => ({
      colorName: color.colorName,
      make: color.make,
      model: color.model,
      year: color.year,
      colorType: color.colorType,
      hsb: {
        h: Math.round(color.color1.h * 360),
        s: Math.round(color.color1.s * 100),
        b: Math.round(color.color1.b * 100),
      },
      hex: hsbToHex(color.color1.h * 360, color.color1.s, color.color1.b),
    }))

    downloadFile(JSON.stringify(jsonData, null, 2), 'forza-colors.json', 'application/json')
  }

  const exportToPalette = () => {
    const palette = colors
      .slice(0, 16)
      .map(color => hsbToHex(color.color1.h * 360, color.color1.s, color.color1.b))
      .join('\n')

    downloadFile(palette, 'forza-palette.txt', 'text/plain')
  }

  const hsbToHex = (h: number, s: number, b: number) => {
    const c = b * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = b - c
    let r = 0,
      g = 0,
      bl = 0

    if (h >= 0 && h < 60) {
      r = c
      g = x
      bl = 0
    } else if (h >= 60 && h < 120) {
      r = x
      g = c
      bl = 0
    } else if (h >= 120 && h < 180) {
      r = 0
      g = c
      bl = x
    } else if (h >= 180 && h < 240) {
      r = 0
      g = x
      bl = c
    } else if (h >= 240 && h < 300) {
      r = x
      g = 0
      bl = c
    } else if (h >= 300 && h < 360) {
      r = c
      g = 0
      bl = x
    }

    return `#${Math.round((r + m) * 255)
      .toString(16)
      .padStart(2, '0')}${Math.round((g + m) * 255)
      .toString(16)
      .padStart(2, '0')}${Math.round((bl + m) * 255)
      .toString(16)
      .padStart(2, '0')}`
  }

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        📁 Export Colors ({colors.length})
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={exportToCSV}
          className="flex items-center justify-center gap-2 p-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          📊 CSV Export
        </button>

        <button
          onClick={exportToJSON}
          className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          📋 JSON Export
        </button>

        <button
          onClick={exportToPalette}
          className="flex items-center justify-center gap-2 p-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          🎨 Palette Export
        </button>
      </div>

      <div className={`mt-3 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Export formats: CSV (spreadsheet), JSON (developers), Palette (design tools)
      </div>
    </div>
  )
}

export default ColorExport
