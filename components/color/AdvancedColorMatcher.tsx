'use client'

import React, { useState, useMemo } from 'react'
import { CarColor } from '@/types'

// Vibe mapping heuristic logic
const VIBES = {
  'Aggressive / Track': { minS: 0.7, maxS: 1.0, minB: 0.4, maxB: 1.0, allowedHues: [[0, 30], [330, 360], [200, 240]] }, // Reds, Oranges, Blues
  'Vintage Luxury': { minS: 0.2, maxS: 0.6, minB: 0.2, maxB: 0.5, allowedHues: [[20, 60], [120, 180]] }, // Earth tones, British Racing Green
  'Cyberpunk Neon': { minS: 0.8, maxS: 1.0, minB: 0.8, maxB: 1.0, allowedHues: [[280, 320], [160, 200]] }, // Purples, Cyan
  'Sleek Stealth': { minS: 0.0, maxS: 0.2, minB: 0.0, maxB: 0.3, allowedHues: [[0, 360]] }, // Blacks, Dark Grays
  'Clean & Pure': { minS: 0.0, maxS: 0.1, minB: 0.9, maxB: 1.0, allowedHues: [[0, 360]] }, // Whites
}

const DECADES = [
  { label: '1960s', desc: 'Pastels & Surf Colors', minS: 0.3, maxS: 0.6, minB: 0.7, maxB: 0.9, hues: [[180, 240], [30, 60]] },
  { label: '1970s', desc: 'Earth Tones', minS: 0.4, maxS: 0.8, minB: 0.3, maxB: 0.6, hues: [[20, 50], [100, 140]] },
  { label: '1980s', desc: 'Bold & Bright', minS: 0.8, maxS: 1.0, minB: 0.6, maxB: 0.9, hues: [[0, 30], [300, 340]] },
  { label: '1990s', desc: 'Teals & Deep Purples', minS: 0.5, maxS: 0.8, minB: 0.3, maxB: 0.6, hues: [[160, 200], [260, 290]] },
  { label: '2000s', desc: 'Silvers & Metallics', minS: 0.0, maxS: 0.2, minB: 0.5, maxB: 0.8, hues: [[0, 360]] },
  { label: '2010s', desc: 'Whites & Flat Grays', minS: 0.0, maxS: 0.1, minB: 0.2, maxB: 1.0, hues: [[0, 360]] },
  { label: '2020s', desc: 'Saturated Pearls', minS: 0.6, maxS: 0.9, minB: 0.4, maxB: 0.8, hues: [[200, 260], [0, 40]] },
]

const SEASONS = {
  'Spring': { icon: '🌸', desc: 'Fresh, vibrant greens and pinks', fn: (h: number, s: number, b: number) => b > 0.6 && s > 0.3 && ((h >= 60 && h <= 150) || (h >= 300 && h <= 340)) },
  'Summer': { icon: '🌞', desc: 'Bright, warm yellows and blues', fn: (h: number, s: number, b: number) => b > 0.5 && s > 0.5 && ((h >= 30 && h <= 70) || (h >= 190 && h <= 240)) },
  'Fall': { icon: '🍂', desc: 'Warm, earthy oranges and browns', fn: (h: number, s: number, b: number) => b < 0.7 && s > 0.4 && ((h >= 15 && h <= 45) || (h >= 300 && h <= 360)) },
  'Winter': { icon: '❄️', desc: 'Cool, crisp, high contrast colors', fn: (h: number, s: number, b: number) => (b > 0.8 || b < 0.2) && s < 0.4 && ((h >= 180 && h <= 280) || (h >= 0 && h <= 360)) },
}

interface AdvancedColorMatcherProps {
  colors: CarColor[]
  isDarkMode: boolean
  onColorSelect: (color: CarColor) => void
}

export default function AdvancedColorMatcher({ colors, isDarkMode, onColorSelect }: AdvancedColorMatcherProps) {
  const [activeTab, setActiveTab] = useState<'vibe' | 'history' | 'season'>('vibe')
  const [selectedVibe, setSelectedVibe] = useState<string>('Aggressive / Track')
  const [selectedDecade, setSelectedDecade] = useState<number>(0) // index
  const [selectedSeason, setSelectedSeason] = useState<string>('Spring')

  const isHueInRange = (hue: number, ranges: number[][]) => {
    return ranges.some(([min, max]) => hue >= min && hue <= max)
  }

  const matches = useMemo(() => {
    if (!colors || colors.length === 0) return []
    let filtered: CarColor[] = []

    if (activeTab === 'vibe') {
      const vibe = VIBES[selectedVibe as keyof typeof VIBES]
      filtered = colors.filter(c => {
        if (!c.color1) return false
        const { h, s, b } = c.color1
        const hue = h * 360
        return s >= vibe.minS && s <= vibe.maxS && b >= vibe.minB && b <= vibe.maxB && isHueInRange(hue, vibe.allowedHues)
      })
    } else if (activeTab === 'history') {
      const decade = DECADES[selectedDecade]
      filtered = colors.filter(c => {
        if (!c.color1) return false
        const { h, s, b } = c.color1
        const hue = h * 360
        return s >= decade.minS && s <= decade.maxS && b >= decade.minB && b <= decade.maxB && isHueInRange(hue, decade.hues)
      })
    } else if (activeTab === 'season') {
      const seasonFn = SEASONS[selectedSeason as keyof typeof SEASONS].fn
      filtered = colors.filter(c => {
        if (!c.color1) return false
        const { h, s, b } = c.color1
        return seasonFn(h * 360, s, b)
      })
    }

    // Sort by name and take top 24
    return filtered.sort((a, b) => a.colorName.localeCompare(b.colorName)).slice(0, 24)
  }, [colors, activeTab, selectedVibe, selectedDecade, selectedSeason])

  return (
    <div className={`p-6 rounded-2xl shadow-xl border ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/90 border-gray-200'} backdrop-blur-xl`}>
      <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <span className="text-3xl">✨</span> Advanced Color Matcher
      </h2>

      <div className="flex bg-black/10 rounded-lg p-1 mb-6">
        <button 
          onClick={() => setActiveTab('vibe')} 
          className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'vibe' ? 'bg-indigo-500 text-white shadow' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
        >
          AI Vibe Match
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'history' ? 'bg-rose-500 text-white shadow' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
        >
          Historical Trends
        </button>
        <button 
          onClick={() => setActiveTab('season')} 
          className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'season' ? 'bg-emerald-500 text-white shadow' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
        >
          Seasonal Palettes
        </button>
      </div>

      <div className="mb-8 min-h-[80px]">
        {activeTab === 'vibe' && (
          <div className="animate-fade-in">
            <p className="text-sm text-gray-500 mb-3">Select an aesthetic vibe, and our matching algorithm will find the perfect OEM colors.</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(VIBES).map(vibe => (
                <button
                  key={vibe}
                  onClick={() => setSelectedVibe(vibe)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                    selectedVibe === vibe 
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/30 scale-105' 
                      : 'bg-transparent border-gray-400 text-gray-500 hover:border-indigo-500 hover:text-indigo-500'
                  }`}
                >
                  {vibe}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-fade-in w-full px-4">
            <div className="flex justify-between mb-2">
              <span className={`font-bold ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>{DECADES[selectedDecade].label}</span>
              <span className="text-sm text-gray-500">{DECADES[selectedDecade].desc}</span>
            </div>
            <input 
              type="range" min="0" max={DECADES.length - 1} step="1"
              value={selectedDecade}
              onChange={(e) => setSelectedDecade(parseInt(e.target.value))}
              className="w-full accent-rose-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2 font-mono">
              <span>{DECADES[0].label}</span>
              <span>{DECADES[DECADES.length - 1].label}</span>
            </div>
          </div>
        )}

        {activeTab === 'season' && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(SEASONS).map(([season, data]) => (
                <button
                  key={season}
                  onClick={() => setSelectedSeason(season)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                    selectedSeason === season
                      ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/50 scale-105'
                      : 'bg-black/5 border-transparent hover:bg-black/10'
                  }`}
                >
                  <span className="text-3xl mb-2">{data.icon}</span>
                  <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{season}</span>
                  <span className="text-[10px] text-gray-500 text-center mt-1 hidden sm:block">{data.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-black/5 rounded-xl p-4 min-h-[300px]">
        <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Matches Found ({matches.length})
        </h3>
        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 opacity-50">
            <span className="text-4xl mb-2">🤷‍♂️</span>
            <p>No perfect matches found for these criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {matches.map((color, i) => {
              // Convert HSB to HSL for standard CSS background
              const l = color.color1.b * (1 - color.color1.s / 2);
              const s = l === 0 || l === 1 ? 0 : (color.color1.b - l) / Math.min(l, 1 - l);
              const hex = `hsl(${color.color1.h * 360}, ${s * 100}%, ${l * 100}%)`;
              
              return (
                <button
                  key={`${color.make}-${color.colorName}-${i}`}
                  onClick={() => onColorSelect(color)}
                  className="group relative aspect-square rounded-lg shadow-sm border border-black/10 overflow-hidden hover:scale-110 hover:shadow-xl transition-all hover:z-10"
                  title={`${color.colorName} - ${color.make}`}
                >
                  <div className="absolute inset-0" style={{ background: hex }}></div>
                  {color.colorType && color.colorType.toLowerCase().includes('metal') && (
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                    <span className="text-white text-[10px] font-bold leading-tight truncate">{color.colorName}</span>
                    <span className="text-gray-300 text-[9px] uppercase tracking-wider truncate">{color.make}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
