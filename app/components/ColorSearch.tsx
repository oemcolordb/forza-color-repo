'use client'

import React, { useState, useMemo } from 'react'
import { CarColor } from '../types'

interface ColorSearchProps {
  colors: CarColor[]
  onColorsFound: (colors: CarColor[]) => void
  isDarkMode: boolean
}

const ColorSearch: React.FC<ColorSearchProps> = ({ colors, onColorsFound, isDarkMode }) => {
  const [hexSearch, setHexSearch] = useState('')
  const [rgbSearch, setRgbSearch] = useState({ r: '', g: '', b: '' })
  const [hsbSearch, setHsbSearch] = useState({ h: '', s: '', b: '' })

  const hexToHsb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const diff = max - min
    
    let h = 0
    if (diff !== 0) {
      if (max === r) h = ((g - b) / diff) % 6
      else if (max === g) h = (b - r) / diff + 2
      else h = (r - g) / diff + 4
    }
    h = Math.round(h * 60)
    if (h < 0) h += 360
    
    const s = max === 0 ? 0 : diff / max
    return { h: h / 360, s, b: max }
  }

  const findSimilarColors = (targetHsb: { h: number; s: number; b: number }, tolerance = 0.1) => {
    return colors.filter(color => {
      const hDiff = Math.min(Math.abs(color.color1.h - targetHsb.h), 1 - Math.abs(color.color1.h - targetHsb.h))
      const sDiff = Math.abs(color.color1.s - targetHsb.s)
      const bDiff = Math.abs(color.color1.b - targetHsb.b)
      
      return hDiff <= tolerance && sDiff <= tolerance && bDiff <= tolerance
    }).slice(0, 20)
  }

  const searchByHex = () => {
    if (hexSearch.match(/^#[0-9A-Fa-f]{6}$/)) {
      const hsb = hexToHsb(hexSearch)
      const similar = findSimilarColors(hsb)
      onColorsFound(similar)
    }
  }

  const searchByRgb = () => {
    const r = parseInt(rgbSearch.r) / 255
    const g = parseInt(rgbSearch.g) / 255  
    const b = parseInt(rgbSearch.b) / 255
    
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      const hsb = hexToHsb(`#${Math.round(r*255).toString(16).padStart(2,'0')}${Math.round(g*255).toString(16).padStart(2,'0')}${Math.round(b*255).toString(16).padStart(2,'0')}`)
      const similar = findSimilarColors(hsb)
      onColorsFound(similar)
    }
  }

  const searchByHsb = () => {
    const h = parseFloat(hsbSearch.h) / 360
    const s = parseFloat(hsbSearch.s) / 100
    const b = parseFloat(hsbSearch.b) / 100
    
    if (!isNaN(h) && !isNaN(s) && !isNaN(b)) {
      const similar = findSimilarColors({ h, s, b })
      onColorsFound(similar)
    }
  }

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        🎯 Advanced Color Search
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Search by HEX
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="#FF0000"
              value={hexSearch}
              onChange={(e) => setHexSearch(e.target.value)}
              className={`flex-1 p-2 rounded border ${
                isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
            <button
              onClick={searchByHex}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Search by RGB
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="R"
              min="0"
              max="255"
              value={rgbSearch.r}
              onChange={(e) => setRgbSearch({...rgbSearch, r: e.target.value})}
              className={`w-20 p-2 rounded border ${
                isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
            <input
              type="number"
              placeholder="G"
              min="0"
              max="255"
              value={rgbSearch.g}
              onChange={(e) => setRgbSearch({...rgbSearch, g: e.target.value})}
              className={`w-20 p-2 rounded border ${
                isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
            <input
              type="number"
              placeholder="B"
              min="0"
              max="255"
              value={rgbSearch.b}
              onChange={(e) => setRgbSearch({...rgbSearch, b: e.target.value})}
              className={`w-20 p-2 rounded border ${
                isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
            <button
              onClick={searchByRgb}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Search by HSB
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="H"
              min="0"
              max="360"
              value={hsbSearch.h}
              onChange={(e) => setHsbSearch({...hsbSearch, h: e.target.value})}
              className={`w-20 p-2 rounded border ${
                isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
            <input
              type="number"
              placeholder="S"
              min="0"
              max="100"
              value={hsbSearch.s}
              onChange={(e) => setHsbSearch({...hsbSearch, s: e.target.value})}
              className={`w-20 p-2 rounded border ${
                isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
            <input
              type="number"
              placeholder="B"
              min="0"
              max="100"
              value={hsbSearch.b}
              onChange={(e) => setHsbSearch({...hsbSearch, b: e.target.value})}
              className={`w-20 p-2 rounded border ${
                isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
            <button
              onClick={searchByHsb}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ColorSearch