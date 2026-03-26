'use client'

import React, { useState } from 'react'
import { CarColor } from '../types'
import '../nfs-theme.css'

interface NFSColorCardProps {
  color: CarColor
  onSelect?: (color: CarColor) => void
  onShowInfo?: (color: CarColor) => void
  isFavorite?: boolean
  onToggleFavorite?: (colorId: string) => void
  isDarkMode: boolean
}

export default function NFSColorCard({
  color,
  onSelect,
  onShowInfo,
  isFavorite = false,
  onToggleFavorite,
  isDarkMode,
}: NFSColorCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const colorId = `${color.make}-${color.colorName}-${color.year || 'unknown'}`
  
  // Convert HSB to RGB for display
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

  const rgb = hsbToRgb(color.color1.h, color.color1.s, color.color1.b)
  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`

  return (
    <div
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect?.(color)}
    >
      {/* Main Card */}
      <div
        className={`nfs-garage-card relative overflow-hidden transition-all duration-300 ${
          isHovered ? '-translate-y-0.5' : ''
        }`}
        style={{
          minHeight: '200px',
        }}
      >
        {/* Color Display with Underglow */}
        <div className="relative h-32 overflow-hidden">
          {/* Main Color */}
          <div
            className="absolute inset-0 transition-all duration-300"
            style={{
              background: rgbString,
            }}
          />
          
          {/* Subtle grunge reflection */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
            style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.2), rgba(0,0,0,0.28))' }}
          />
          
          {/* Underglow Effect */}
          <div
            className="absolute bottom-0 left-0 right-0 h-8 opacity-60 blur-md"
            style={{
              background: `linear-gradient(to top, ${rgbString}, transparent)`,
            }}
          />

          {/* Favorite Badge */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite?.(colorId)
            }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full nfs-garage-panel flex items-center justify-center hover:scale-105 transition-transform z-10"
          >
            {isFavorite ? (
              <span className="text-lg">⭐</span>
            ) : (
              <span className="text-lg opacity-50">☆</span>
            )}
          </button>

          {/* Color Type Badge */}
          <div className="absolute top-2 left-2 px-2 py-1 rounded nfs-garage-panel text-[10px] font-bold uppercase">
            <span className="nfs-era-label">{color.colorType || 'Standard'}</span>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-3 space-y-2">
          {/* Color Name */}
          <h3 className="nfs-era-heading font-bold text-sm truncate">
            {color.colorName}
          </h3>

          {/* Manufacturer */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded nfs-garage-panel flex items-center justify-center text-xs font-bold">
              {color.make.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-300 truncate">{color.make}</p>
              {color.model && (
                <p className="text-xs text-gray-500 truncate">{color.model}</p>
              )}
            </div>
          </div>

          {/* Year Badge */}
          {color.year && (
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded nfs-garage-panel text-xs">
              <span className="text-gray-400">📅</span>
              <span className="font-mono text-gray-300">{color.year}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onShowInfo?.(color)
              }}
              className="flex-1 px-3 py-1.5 rounded nfs-garage-audio-btn text-xs font-bold uppercase"
            >
              Details
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowDetails(!showDetails)
              }}
              className="px-3 py-1.5 rounded nfs-garage-audio-btn text-xs font-bold uppercase transition-all"
            >
              HSB
            </button>
          </div>

          {/* HSB Values (Expandable) */}
          {showDetails && (
            <div className="mt-2 p-2 rounded nfs-garage-panel space-y-1 animate-slide-up">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Hue:</span>
                <span className="font-mono nfs-era-label">
                  {(color.color1.h * 360).toFixed(0)}°
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Saturation:</span>
                <span className="font-mono nfs-era-label">
                  {(color.color1.s * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Brightness:</span>
                <span className="font-mono nfs-era-label">
                  {(color.color1.b * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t border-gray-700">
                <span className="text-gray-400">RGB:</span>
                <span className="font-mono text-gray-300">
                  {rgb.r}, {rgb.g}, {rgb.b}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}
      </div>

      {/* Bottom Underglow */}
      <div
        className={`absolute -bottom-2 left-1/4 right-1/4 h-4 blur-lg transition-opacity duration-300 ${
          isHovered ? 'opacity-60' : 'opacity-0'
        }`}
        style={{
          background: `linear-gradient(to right, transparent, ${rgbString}, transparent)`,
        }}
      />
    </div>
  )
}
