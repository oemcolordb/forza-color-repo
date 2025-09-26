'use client'

import { useState, useEffect } from 'react'
import type { CarColor } from './types/color'

export default function HomePage() {
  const [colors, setColors] = useState<CarColor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadColors = async () => {
      try {
        const { default: colorData } = await import('../services/colorData')
        setColors(colorData.slice(0, 20)) // Show first 20 colors
      } catch (error) {
        console.error('Failed to load colors:', error)
      } finally {
        setLoading(false)
      }
    }
    loadColors()
  }, [])

  const hsbToHsl = (h: number, s: number, b: number): [number, number, number] => {
    const l = b * (1 - s / 2)
    const newS = l === 0 || l === 1 ? 0 : (b - l) / Math.min(l, 1 - l)
    return [h * 360, newS * 100, l * 100]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500 mx-auto mb-4"></div>
          <p>Loading colors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto p-4">
        <header className="text-center py-8">
          <h1 className="text-4xl md:text-6xl font-bold">
            <span className="bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-transparent bg-clip-text">
              Forza Color Universe
            </span>
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            Explore automotive colors from Forza racing games
          </p>
        </header>

        <main>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {colors.map((color, index) => {
              const [h1, s1, l1] = hsbToHsl(color.color1.h, color.color1.s, color.color1.b)
              const [h2, s2, l2] = hsbToHsl(color.color2.h, color.color2.s, color.color2.b)
              const gradient = `linear-gradient(45deg, hsl(${h1}, ${s1}%, ${l1}%), hsl(${h2}, ${s2}%, ${l2}%))`
              
              return (
                <div key={index} className="bg-slate-800 rounded-lg overflow-hidden shadow-lg">
                  <div 
                    className="h-32 w-full"
                    style={{ background: gradient }}
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-slate-100 truncate">{color.colorName}</h3>
                    <p className="text-sm text-slate-400 truncate">
                      {color.make} {color.model} {color.year && `(${color.year})`}
                    </p>
                    {color.colorType && (
                      <span className="inline-block mt-2 text-xs bg-slate-700 text-cyan-400 px-2 py-1 rounded">
                        {color.colorType}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}