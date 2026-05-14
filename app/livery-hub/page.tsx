'use client'

import React, { useState, useEffect, useRef } from 'react'
import TokyoBackground from '../components/TokyoBackground'
import { getSecureAssetUrl } from '../lib/assetProtection'
import Breadcrumbs from '../components/Breadcrumbs'
import { CarColor } from '../types'

interface Shape {
  type: number
  data: number[]
  color: number[]
  score: number
}

interface LiveryData {
  shapes: Shape[]
}

export default function LiveryHubPage() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [liveryData, setLiveryData] = useState<LiveryData | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        setLiveryData(data)
        setCurrentStep(data.shapes.length)
      } catch (err) {
        alert('Invalid JSON file format.')
      } finally {
        setIsLoading(false)
      }
    }
    reader.readAsText(file)
  }

  useEffect(() => {
    if (!liveryData || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Find canvas bounds from the first shape (usually the background)
    const bgShape = liveryData.shapes[0]
    const [,, width, height] = bgShape.data
    canvas.width = width
    canvas.height = height

    ctx.clearRect(0, 0, width, height)

    liveryData.shapes.slice(0, currentStep).forEach((shape) => {
      const [r, g, b, a] = shape.color
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`

      if (shape.type === 1) { // Rectangle
        const [x, y, w, h] = shape.data
        ctx.fillRect(x, y, w, h)
      } else if (shape.type === 16) { // Rotated Ellipse
        const [x, y, rx, ry, angle] = shape.data
        ctx.beginPath()
        ctx.ellipse(x, y, rx, ry, (angle * Math.PI) / 180, 0, 2 * Math.PI)
        ctx.fill()
      }
      // Add more types as discovered
    })
  }, [liveryData, currentStep])

  const rgbToHsb = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const d = max - min
    let h = 0
    const s = max === 0 ? 0 : d / max
    const v = max

    if (max !== min) {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }
    return { h: h.toFixed(2), s: s.toFixed(2), b: v.toFixed(2) }
  }

  return (
    <div className={`min-h-screen relative ${isDarkMode ? 'text-white' : 'text-black'}`}>
      <TokyoBackground isDarkMode={isDarkMode} getSecureAssetUrl={getSecureAssetUrl} />
      <div className="absolute inset-0 bg-black/60 pointer-events-none z-0"></div>

      <header className={`relative z-10 p-4 backdrop-blur-sm border-b ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold">🎨 Livery Replication Hub</h1>
            <p className="text-xs opacity-75">Visual Guides for In-Game Painting</p>
          </div>
          <a href="/" className="px-4 py-2 bamboo-button rounded text-center text-sm">
            ← Back
          </a>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto p-4">
        <Breadcrumbs isDarkMode={isDarkMode} />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Selector and Controls */}
          <div className="lg:col-span-1 space-y-4">
            <section className={`p-4 rounded-xl border-2 border-dashed ${isDarkMode ? 'bamboo-surface-dark border-gray-700' : 'bamboo-surface border-gray-300'} hover:border-blue-500 transition-colors`}>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <span>📤</span> Upload Template
              </h3>
              <p className="text-[10px] opacity-75 mb-3">
                Upload a .json template file to get Forza painting instructions.
              </p>
              <input 
                type="file" 
                accept=".json" 
                onChange={handleFileUpload}
                className="block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
              />
            </section>

            <section className={`p-4 rounded-xl ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <span>⚙️</span> Step Control
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs opacity-75 mb-2 block">
                    Current Shape: {currentStep} / {liveryData?.shapes.length || 0}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={liveryData?.shapes.length || 0}
                    value={currentStep}
                    onChange={(e) => setCurrentStep(parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => setCurrentStep(Math.min(liveryData?.shapes.length || 0, currentStep + 1))}
                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>

            {liveryData && liveryData.shapes[currentStep - 1] && (
              <section className={`p-4 rounded-xl border-2 border-blue-500/50 ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
                <h3 className="font-bold mb-3 text-blue-400 flex items-center gap-2">
                  <span>🎮</span> Forza In-Game Settings
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-black/20 p-2 rounded">
                      <div className="text-[10px] opacity-60 uppercase">X Position</div>
                      <div className="text-sm font-mono">{liveryData.shapes[currentStep - 1].data[0]}</div>
                    </div>
                    <div className="bg-black/20 p-2 rounded">
                      <div className="text-[10px] opacity-60 uppercase">Y Position</div>
                      <div className="text-sm font-mono">{liveryData.shapes[currentStep - 1].data[1]}</div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-600/20 p-3 rounded border border-blue-500/30">
                    <div className="text-xs font-bold mb-2 text-blue-300">FINE-TUNE COLOR (HSB)</div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-black/40 p-1 rounded">
                        <div className="text-[9px]">H</div>
                        <div className="text-sm font-bold text-white">
                          {rgbToHsb(liveryData.shapes[currentStep - 1].color[0], liveryData.shapes[currentStep - 1].color[1], liveryData.shapes[currentStep - 1].color[2]).h}
                        </div>
                      </div>
                      <div className="bg-black/40 p-1 rounded">
                        <div className="text-[9px]">S</div>
                        <div className="text-sm font-bold text-white">
                          {rgbToHsb(liveryData.shapes[currentStep - 1].color[0], liveryData.shapes[currentStep - 1].color[1], liveryData.shapes[currentStep - 1].color[2]).s}
                        </div>
                      </div>
                      <div className="bg-black/40 p-1 rounded">
                        <div className="text-[9px]">B</div>
                        <div className="text-sm font-bold text-white">
                          {rgbToHsb(liveryData.shapes[currentStep - 1].color[0], liveryData.shapes[currentStep - 1].color[1], liveryData.shapes[currentStep - 1].color[2]).b}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Canvas Visualization */}
          <div className="lg:col-span-2">
            <div className={`p-4 rounded-xl h-full flex flex-col ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  <span>🖼️</span> Livery Preview
                </h3>
                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-blue-400">
                    <div className="animate-spin h-3 w-3 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                    Loading Vector Data...
                  </div>
                )}
              </div>
              
              <div className="flex-1 bg-black/40 rounded-lg overflow-hidden flex items-center justify-center p-4 border border-white/5">
                <canvas 
                  ref={canvasRef} 
                  className="max-w-full max-h-full object-contain shadow-2xl"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>

              <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/20 text-xs text-blue-300">
                <strong>Tip:</strong> Use the Step Control to see exactly where each shape is placed. Match the HSB values in Forza's "Fine-Tune" menu to replicate this image as a livery.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
