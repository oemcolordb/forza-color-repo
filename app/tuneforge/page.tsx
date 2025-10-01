'use client'

import { useState, useEffect } from 'react'
import { Metadata } from 'next'

export default function TuneForge() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [selectedColor, setSelectedColor] = useState({ h: 0.5, s: 0.7, b: 0.8 })
  const [variations, setVariations] = useState<any[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved) setIsDarkMode(saved === 'dark')
  }, [])

  const generateVariations = () => {
    const base = selectedColor
    const newVariations = [
      { ...base, name: 'Original', s: base.s, b: base.b },
      { ...base, name: 'Lighter', b: Math.min(1, base.b + 0.2) },
      { ...base, name: 'Darker', b: Math.max(0, base.b - 0.2) },
      { ...base, name: 'Vibrant', s: Math.min(1, base.s + 0.3) },
      { ...base, name: 'Muted', s: Math.max(0, base.s - 0.3) },
      { ...base, name: 'Warm', h: (base.h + 0.05) % 1 },
      { ...base, name: 'Cool', h: (base.h - 0.05 + 1) % 1 },
      { ...base, name: 'Complement', h: (base.h + 0.5) % 1 }
    ]
    setVariations(newVariations)
  }

  useEffect(() => {
    generateVariations()
  }, [selectedColor])

  const hslToCSS = (h: number, s: number, b: number) => 
    `hsl(${h * 360}, ${s * 100}%, ${b * 100}%)`

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">🔧 TuneForge</h1>
            <p className="text-lg opacity-80">Advanced Color Tuning & Customization Lab</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-yellow-500 text-black' : 'bg-blue-900 text-white'}`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <a 
              href="/"
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              ← Back to Colors
            </a>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Color Picker */}
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
            <h2 className="text-xl font-semibold mb-4">🎨 Color Tuner</h2>
            
            <div className="space-y-4">
              <div 
                className="w-full h-32 rounded-lg border-2 border-gray-300"
                style={{ background: hslToCSS(selectedColor.h, selectedColor.s, selectedColor.b) }}
              />
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Hue: {Math.round(selectedColor.h * 360)}°</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={selectedColor.h}
                    onChange={(e) => setSelectedColor({...selectedColor, h: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Saturation: {Math.round(selectedColor.s * 100)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={selectedColor.s}
                    onChange={(e) => setSelectedColor({...selectedColor, s: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Brightness: {Math.round(selectedColor.b * 100)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={selectedColor.b}
                    onChange={(e) => setSelectedColor({...selectedColor, b: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-300 dark:border-gray-600">
                <h3 className="font-medium mb-2">Color Values</h3>
                <div className="text-sm space-y-1 font-mono">
                  <div>HSB: {selectedColor.h.toFixed(3)}, {selectedColor.s.toFixed(3)}, {selectedColor.b.toFixed(3)}</div>
                  <div>HSL: {Math.round(selectedColor.h * 360)}°, {Math.round(selectedColor.s * 100)}%, {Math.round(selectedColor.b * 100)}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Variations */}
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
            <h2 className="text-xl font-semibold mb-4">🎯 Color Variations</h2>
            
            <div className="grid grid-cols-2 gap-3">
              {variations.map((variation, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(variation)}
                  className="p-3 rounded-lg border-2 border-gray-300 hover:border-blue-500 transition-colors"
                >
                  <div 
                    className="w-full h-16 rounded mb-2"
                    style={{ background: hslToCSS(variation.h, variation.s, variation.b) }}
                  />
                  <div className="text-sm font-medium">{variation.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
          <h2 className="text-xl font-semibold mb-4">⚡ Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedColor({ h: Math.random(), s: 0.7, b: 0.8 })}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'
              } text-white`}
            >
              🎲 Random Color
            </button>
            <button
              onClick={() => navigator.clipboard?.writeText(`hsl(${Math.round(selectedColor.h * 360)}, ${Math.round(selectedColor.s * 100)}%, ${Math.round(selectedColor.b * 100)}%)`)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
              } text-white`}
            >
              📋 Copy HSL
            </button>
            <button
              onClick={() => setSelectedColor({ h: 0.5, s: 0.7, b: 0.8 })}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'
              } text-white`}
            >
              🔄 Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}