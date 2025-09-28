'use client'

import React, { useState, useMemo } from 'react'
import { CarColor } from '../types/color'

interface PaletteGeneratorProps {
  colors: CarColor[]
  isDarkMode: boolean
  onPaletteGenerated: (palette: CarColor[]) => void
}

const PALETTE_CATEGORIES = {
  'Ferrari Reds': { makes: ['Ferrari'], colorNames: ['rosso', 'red', 'rouge'], icon: '🏎️' },
  'Racing Blues': { makes: ['BMW', 'Ford', 'Subaru'], colorNames: ['blue', 'bleu', 'blu'], icon: '🏁' },
  'Luxury Blacks': { makes: ['Mercedes-Benz', 'Audi', 'BMW'], colorNames: ['black', 'noir', 'nero'], icon: '💎' },
  'Supercar Yellows': { makes: ['Lamborghini', 'Ferrari', 'Porsche'], colorNames: ['yellow', 'giallo', 'gelb'], icon: '⚡' },
  'JDM Classics': { makes: ['Honda', 'Toyota', 'Nissan', 'Mazda'], colorNames: ['white', 'silver', 'black'], icon: '🗾' },
  'German Engineering': { makes: ['BMW', 'Mercedes-Benz', 'Audi', 'Porsche'], colorNames: [], icon: '🔧' },
  'British Racing': { makes: ['McLaren', 'Aston Martin', 'Jaguar'], colorNames: ['green', 'racing'], icon: '🇬🇧' },
  'American Muscle': { makes: ['Ford', 'Chevrolet', 'Dodge'], colorNames: ['red', 'blue', 'orange'], icon: '🦅' },
  'Exotic Supercars': { makes: ['Bugatti', 'Koenigsegg', 'Pagani'], colorNames: [], icon: '🚀' },
  'Rally Legends': { makes: ['Subaru', 'Mitsubishi', 'Lancia'], colorNames: ['rally', 'wrc'], icon: '🏔️' }
}

const PaletteGenerator: React.FC<PaletteGeneratorProps> = ({
  colors,
  isDarkMode,
  onPaletteGenerated
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [paletteSize, setPaletteSize] = useState(6)

  const generatePalette = (category: string) => {
    const config = PALETTE_CATEGORIES[category as keyof typeof PALETTE_CATEGORIES]
    if (!config) return []

    let filteredColors = colors.filter(color => {
      const makeMatch = config.makes.length === 0 || config.makes.includes(color.make)
      const nameMatch = config.colorNames.length === 0 || 
        config.colorNames.some(name => 
          color.colorName.toLowerCase().includes(name.toLowerCase())
        )
      return makeMatch && (config.colorNames.length === 0 || nameMatch)
    })

    // Shuffle and take requested amount
    const shuffled = filteredColors.sort(() => Math.random() - 0.5)
    return shuffled.slice(0, paletteSize)
  }

  const handleGenerate = () => {
    if (!selectedCategory) return
    const palette = generatePalette(selectedCategory)
    setLastGenerated(palette)
    onPaletteGenerated(palette)
  }

  const [generationMode, setGenerationMode] = useState<'random' | 'balanced' | 'trending'>('random')
  const [lastGenerated, setLastGenerated] = useState<CarColor[]>([])

  const hsbToHex = (h: number, s: number, b: number) => {
    const c = b * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = b - c
    let r = 0, g = 0, bl = 0

    if (h >= 0 && h < 60) { r = c; g = x; bl = 0 }
    else if (h >= 60 && h < 120) { r = x; g = c; bl = 0 }
    else if (h >= 120 && h < 180) { r = 0; g = c; bl = x }
    else if (h >= 180 && h < 240) { r = 0; g = x; bl = c }
    else if (h >= 240 && h < 300) { r = x; g = 0; bl = c }
    else if (h >= 300 && h < 360) { r = c; g = 0; bl = x }

    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    bl = Math.round((bl + m) * 255)

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`
  }

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        🎨 Palette Generator
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`w-full p-2 rounded border ${
              isDarkMode 
                ? 'bg-slate-700 border-slate-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">Select a category...</option>
            {Object.entries(PALETTE_CATEGORIES).map(([category, config]) => (
              <option key={category} value={category}>{config.icon} {category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Generation Mode
          </label>
          <select
            value={generationMode}
            onChange={(e) => setGenerationMode(e.target.value as any)}
            className={`w-full p-2 rounded border ${
              isDarkMode 
                ? 'bg-slate-700 border-slate-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="random">🎲 Random</option>
            <option value="balanced">⚖️ Balanced Spectrum</option>
            <option value="trending">📈 Trending</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Palette Size: {paletteSize}
          </label>
          <input
            type="range"
            min="3"
            max="12"
            value={paletteSize}
            onChange={(e) => setPaletteSize(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            disabled={!selectedCategory}
            className={`flex-1 py-2 px-4 rounded font-medium transition-colors ${
              selectedCategory
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            🎨 Generate
          </button>
          {lastGenerated.length > 0 && (
            <button
              onClick={() => onPaletteGenerated(lastGenerated)}
              className={`px-3 py-2 rounded font-medium transition-colors ${
                isDarkMode
                  ? 'bg-slate-600 hover:bg-slate-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              title="Show last palette"
            >
              🔄
            </button>
          )}
        </div>

        {lastGenerated.length > 0 && (
          <div className="mt-4">
            <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Preview ({lastGenerated.length} colors)
            </h4>
            <div className="flex gap-1 overflow-x-auto">
              {lastGenerated.map((color, index) => (
                <div
                  key={index}
                  className="w-8 h-8 rounded border flex-shrink-0"
                  style={{
                    background: `hsl(${color.color1.h * 360}, ${color.color1.s * 100}%, ${color.color1.b * 50}%)`
                  }}
                  title={`${color.colorName} - ${color.make}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaletteGenerator