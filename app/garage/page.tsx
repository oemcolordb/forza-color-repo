'use client'

import React, { useState, useEffect } from 'react'
import { CarColor } from '../types'

export default function GaragePage() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [trending, setTrending] = useState<CarColor[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('trending-colors')
    if (saved) setTrending(JSON.parse(saved))
  }, [])

  return (
    <div
      className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'}`}
    >
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8">🏆 Community Garage</h1>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">🔥 Trending Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trending.slice(0, 12).map((color, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}
              >
                <div
                  className="h-24 rounded mb-2"
                  style={{
                    background: `hsl(${color.color1.h * 360}, ${color.color1.s * 100}%, ${color.color1.b * 100}%)`,
                  }}
                />
                <div className="text-sm font-semibold">{color.colorName}</div>
                <div className="text-xs text-gray-500">{color.make}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">📤 Share Your Scheme</h2>
          <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold">
              Upload Color Scheme
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
