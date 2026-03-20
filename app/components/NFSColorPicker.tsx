'use client'

import React, { useState, useEffect } from 'react'
import { CarColor } from '../types'
import '../nfs-theme.css'

interface NFSColorPickerProps {
  colors: CarColor[]
  onColorSelect: (color: CarColor) => void
  isDarkMode: boolean
}

export default function NFSColorPicker({ colors, onColorSelect, isDarkMode }: NFSColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState<CarColor | null>(null)
  const [paintFinish, setPaintFinish] = useState<'matte' | 'metallic' | 'pearl' | 'chrome'>('metallic')
  const [underglowColor, setUnderglowColor] = useState('#00d9ff')
  const [underglowIntensity, setUnderglowIntensity] = useState(50)
  const [shineIntensity, setShineIntensity] = useState(70)
  const [isTwoTone, setIsTwoTone] = useState(false)
  const [secondaryColor, setSecondaryColor] = useState<CarColor | null>(null)
  const [twoToneSplit, setTwoToneSplit] = useState<'horizontal' | 'vertical' | 'diagonal'>('horizontal')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMake, setFilterMake] = useState('')
  const [filterType, setFilterType] = useState('')

  // Convert HSB to RGB
  const hsbToRgb = (h: number, s: number, b: number) => {
    const i = Math.floor(h * 6)
    const f = h * 6 - i
    const p = b * (1 - s)
    const q = b * (1 - f * s)
    const t = b * (1 - (1 - f) * s)
    
    let r = 0, g = 0, bl = 0
    switch (i % 6) {
      case 0: r = b; g = t; bl = p; break
      case 1: r = q; g = b; bl = p; break
      case 2: r = p; g = b; bl = t; break
      case 3: r = p; g = q; bl = b; break
      case 4: r = t; g = p; bl = b; break
      case 5: r = b; g = p; bl = q; break
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(bl * 255),
    }
  }

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
  }

  // Get filtered colors
  const filteredColors = colors.filter(color => {
    const matchesSearch = !searchQuery || 
      color.colorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      color.make.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesMake = !filterMake || color.make === filterMake
    const matchesType = !filterType || color.colorType === filterType
    return matchesSearch && matchesMake && matchesType
  })

  const makes = Array.from(new Set(colors.map(c => c.make))).sort()
  const colorTypes = Array.from(new Set(colors.map(c => c.colorType).filter(Boolean))).sort()

  const handleColorClick = (color: CarColor) => {
    if (isTwoTone && selectedColor && !secondaryColor) {
      setSecondaryColor(color)
    } else {
      setSelectedColor(color)
      setSecondaryColor(null)
      onColorSelect(color)
    }
  }

  const getPaintStyle = (color: CarColor) => {
    const rgb = hsbToRgb(color.color1.h, color.color1.s, color.color1.b)
    const baseColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    
    switch (paintFinish) {
      case 'matte':
        return {
          background: baseColor,
          filter: 'brightness(0.9) saturate(0.8)',
        }
      case 'metallic':
        return {
          background: `linear-gradient(135deg, 
            ${baseColor} 0%, 
            rgba(255,255,255,${shineIntensity / 200}) 50%, 
            ${baseColor} 100%)`,
          boxShadow: `inset 0 0 30px rgba(255,255,255,${shineIntensity / 300})`,
        }
      case 'pearl':
        return {
          background: `linear-gradient(135deg, 
            ${baseColor} 0%, 
            rgba(255,255,255,${shineIntensity / 150}) 30%,
            rgba(200,150,255,${shineIntensity / 200}) 50%,
            ${baseColor} 100%)`,
          boxShadow: `inset 0 0 40px rgba(255,255,255,${shineIntensity / 250})`,
        }
      case 'chrome':
        return {
          background: `linear-gradient(135deg, 
            rgba(255,255,255,0.9) 0%, 
            ${baseColor} 25%,
            rgba(255,255,255,0.9) 50%,
            ${baseColor} 75%,
            rgba(255,255,255,0.9) 100%)`,
          backgroundSize: '200% 200%',
          animation: 'nfs-chrome-shine 3s linear infinite',
        }
      default:
        return { background: baseColor }
    }
  }

  const getTwoToneStyle = () => {
    if (!selectedColor || !secondaryColor) return {}
    
    const rgb1 = hsbToRgb(selectedColor.color1.h, selectedColor.color1.s, selectedColor.color1.b)
    const rgb2 = hsbToRgb(secondaryColor.color1.h, secondaryColor.color1.s, secondaryColor.color1.b)
    const color1 = `rgb(${rgb1.r}, ${rgb1.g}, ${rgb1.b})`
    const color2 = `rgb(${rgb2.r}, ${rgb2.g}, ${rgb2.b})`
    
    switch (twoToneSplit) {
      case 'horizontal':
        return { background: `linear-gradient(180deg, ${color1} 50%, ${color2} 50%)` }
      case 'vertical':
        return { background: `linear-gradient(90deg, ${color1} 50%, ${color2} 50%)` }
      case 'diagonal':
        return { background: `linear-gradient(135deg, ${color1} 50%, ${color2} 50%)` }
    }
  }

  return (
    <div className="space-y-6">
      {/* Preview Section */}
      <div className="nfs-card p-6">
        <h2 className="text-xl font-bold nfs-text-neon-blue mb-4 uppercase">
          🎨 Paint Preview
        </h2>
        
        {/* Car Preview */}
        <div className="relative mb-6">
          <div 
            className="w-full h-64 rounded-lg relative overflow-hidden"
            style={{
              background: '#0a0a0a',
            }}
          >
            {/* Car Body */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 400 200" className="w-full h-full">
                <defs>
                  <filter id="car-shadow">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                    <feOffset dx="0" dy="5" result="offsetblur"/>
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.5"/>
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Car silhouette */}
                <g filter="url(#car-shadow)">
                  {/* Body */}
                  <path
                    d="M 80 120 L 100 100 L 140 90 L 260 90 L 300 100 L 320 120 L 310 140 L 90 140 Z"
                    fill={selectedColor ? rgbToHex(
                      hsbToRgb(selectedColor.color1.h, selectedColor.color1.s, selectedColor.color1.b).r,
                      hsbToRgb(selectedColor.color1.h, selectedColor.color1.s, selectedColor.color1.b).g,
                      hsbToRgb(selectedColor.color1.h, selectedColor.color1.s, selectedColor.color1.b).b
                    ) : '#666'}
                    style={selectedColor ? (isTwoTone && secondaryColor ? getTwoToneStyle() : getPaintStyle(selectedColor)) : {}}
                  />
                  
                  {/* Windows */}
                  <path
                    d="M 110 100 L 130 95 L 170 95 L 180 100 Z"
                    fill="rgba(100,150,200,0.3)"
                  />
                  <path
                    d="M 220 100 L 230 95 L 270 95 L 280 100 Z"
                    fill="rgba(100,150,200,0.3)"
                  />
                  
                  {/* Wheels */}
                  <circle cx="120" cy="140" r="20" fill="#1a1a1a" stroke="#333" strokeWidth="2"/>
                  <circle cx="120" cy="140" r="12" fill="#444"/>
                  <circle cx="280" cy="140" r="20" fill="#1a1a1a" stroke="#333" strokeWidth="2"/>
                  <circle cx="280" cy="140" r="12" fill="#444"/>
                  
                  {/* Headlights */}
                  <ellipse cx="315" cy="115" rx="8" ry="5" fill="#ffeb3b" opacity="0.8"/>
                  <ellipse cx="315" cy="125" rx="8" ry="5" fill="#ffeb3b" opacity="0.8"/>
                </g>
              </svg>
            </div>
            
            {/* Underglow Effect */}
            {selectedColor && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-20 blur-xl"
                style={{
                  background: `radial-gradient(ellipse at center, ${underglowColor} 0%, transparent 70%)`,
                  opacity: underglowIntensity / 100,
                }}
              />
            )}
          </div>
          
          {/* Color Info */}
          {selectedColor && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="nfs-card p-3">
                <div className="text-xs text-gray-400 mb-1">Primary Color</div>
                <div className="font-bold nfs-text-neon-blue">{selectedColor.colorName}</div>
                <div className="text-xs text-gray-400">{selectedColor.make}</div>
              </div>
              {isTwoTone && secondaryColor && (
                <div className="nfs-card p-3">
                  <div className="text-xs text-gray-400 mb-1">Secondary Color</div>
                  <div className="font-bold nfs-text-neon-pink">{secondaryColor.colorName}</div>
                  <div className="text-xs text-gray-400">{secondaryColor.make}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Paint Finish Controls */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold nfs-text-neon-blue mb-2 block">
              Paint Finish
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['matte', 'metallic', 'pearl', 'chrome'] as const).map(finish => (
                <button
                  key={finish}
                  onClick={() => setPaintFinish(finish)}
                  className={`px-4 py-2 rounded text-sm font-bold uppercase transition-all ${
                    paintFinish === finish
                      ? 'nfs-button'
                      : 'nfs-card hover:nfs-neon-glow-blue'
                  }`}
                >
                  {finish}
                </button>
              ))}
            </div>
          </div>

          {/* Shine Intensity */}
          {paintFinish !== 'matte' && (
            <div>
              <label className="text-sm font-semibold nfs-text-neon-blue mb-2 block">
                Shine Intensity: {shineIntensity}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={shineIntensity}
                onChange={(e) => setShineIntensity(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {/* Two-Tone Toggle */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isTwoTone}
                onChange={(e) => {
                  setIsTwoTone(e.target.checked)
                  if (!e.target.checked) setSecondaryColor(null)
                }}
                className="w-5 h-5"
              />
              <span className="text-sm font-semibold nfs-text-neon-pink">
                Two-Tone Paint
              </span>
            </label>
          </div>

          {/* Two-Tone Split */}
          {isTwoTone && (
            <div>
              <label className="text-sm font-semibold nfs-text-neon-pink mb-2 block">
                Split Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['horizontal', 'vertical', 'diagonal'] as const).map(split => (
                  <button
                    key={split}
                    onClick={() => setTwoToneSplit(split)}
                    className={`px-4 py-2 rounded text-sm font-bold uppercase transition-all ${
                      twoToneSplit === split
                        ? 'bg-pink-600 text-white'
                        : 'nfs-card hover:bg-pink-600/30'
                    }`}
                  >
                    {split}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Underglow Controls */}
          <div>
            <label className="text-sm font-semibold nfs-text-neon-green mb-2 block">
              Underglow Color
            </label>
            <div className="flex gap-2">
              {['#00d9ff', '#ff006e', '#00ff88', '#ff6b00', '#b300ff'].map(color => (
                <button
                  key={color}
                  onClick={() => setUnderglowColor(color)}
                  className={`w-10 h-10 rounded border-2 transition-all ${
                    underglowColor === color ? 'border-white scale-110' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold nfs-text-neon-green mb-2 block">
              Underglow Intensity: {underglowIntensity}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={underglowIntensity}
              onChange={(e) => setUnderglowIntensity(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* NFS-Styled Search Filters */}
      <div className="nfs-card p-6">
        <h2 className="text-xl font-bold nfs-text-neon-orange mb-4 uppercase">
          🔍 Color Search
        </h2>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div>
            <input
              type="text"
              placeholder="Search colors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded nfs-card text-white placeholder-gray-500 focus:nfs-neon-glow-blue transition-all"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-400 mb-2 block">
                Manufacturer
              </label>
              <select
                value={filterMake}
                onChange={(e) => setFilterMake(e.target.value)}
                className="w-full px-4 py-3 rounded nfs-card text-white focus:nfs-neon-glow-blue transition-all"
              >
                <option value="">All Manufacturers</option>
                {makes.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-400 mb-2 block">
                Paint Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 rounded nfs-card text-white focus:nfs-neon-glow-blue transition-all"
              >
                <option value="">All Types</option>
                {colorTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-400 text-center">
            {filteredColors.length} colors found
          </div>
        </div>
      </div>

      {/* Color Grid */}
      <div className="nfs-card p-6">
        <h2 className="text-xl font-bold nfs-text-neon-pink mb-4 uppercase">
          {isTwoTone && selectedColor && !secondaryColor 
            ? '🎨 Select Secondary Color' 
            : '🎨 Select Color'}
        </h2>
        
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-96 overflow-y-auto">
          {filteredColors.map((color, index) => {
            const rgb = hsbToRgb(color.color1.h, color.color1.s, color.color1.b)
            const isSelected = selectedColor?.colorName === color.colorName && selectedColor?.make === color.make
            const isSecondary = secondaryColor?.colorName === color.colorName && secondaryColor?.make === color.make
            
            return (
              <button
                key={index}
                onClick={() => handleColorClick(color)}
                className={`aspect-square rounded border-2 transition-all hover:scale-110 ${
                  isSelected ? 'border-cyan-400 nfs-neon-glow-blue' :
                  isSecondary ? 'border-pink-400 nfs-neon-glow-pink' :
                  'border-gray-700 hover:border-white'
                }`}
                style={{ backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` }}
                title={`${color.colorName} - ${color.make}`}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
