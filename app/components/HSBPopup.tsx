'use client'

import React from 'react'
import { CarColor } from '../types'

interface HSBPopupProps {
  color: CarColor | null
  isOpen: boolean
  onClose: () => void
  isDarkMode: boolean
}

const HSBPopup: React.FC<HSBPopupProps> = ({ color, isOpen, onClose, isDarkMode }) => {
  console.log('HSBPopup render - isOpen:', isOpen, 'color:', color?.colorName)
  if (!isOpen || !color) return null

  const formatHSB = (hsb: { h: number; s: number; b: number }) => ({
    h: hsb.h.toFixed(2),
    s: hsb.s.toFixed(2),
    b: hsb.b.toFixed(2)
  })

  const hsb1 = formatHSB(color.color1)
  const hsb2 = formatHSB(color.color2)

  return (
    <div 
      className="fixed bg-black bg-opacity-50 flex justify-center items-center" 
      onClick={onClose}
      style={{ 
        touchAction: 'none',
        zIndex: 999999,
        top: '0px',
        left: '0px',
        width: '100vw',
        height: '100vh'
      }}
    >
      <div 
        className={`p-4 rounded-lg max-w-sm w-full mx-4 shadow-2xl border-2 ${
          isDarkMode ? 'bg-slate-800 text-white border-white' : 'bg-white text-gray-900 border-black'
        }`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        style={{ zIndex: 1000000 }}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">HSB Color Data</h3>
          <button 
            onClick={onClose}
            onTouchStart={(e) => { e.stopPropagation(); onClose(); }}
            className={`text-xl min-w-[44px] min-h-[44px] flex items-center justify-center ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}
            style={{ touchAction: 'manipulation' }}
          >
            ×
          </button>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="font-medium text-sm">{color.colorName}</div>
            <div className="text-xs opacity-75">{color.make}</div>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium mb-2">Color 1</div>
              <div 
                className="w-full h-8 rounded border mb-2"
                style={{ backgroundColor: `rgb(${Math.round(255 * color.color1.b * (1 - color.color1.s + color.color1.s * Math.cos((color.color1.h * 360) * Math.PI / 180)))}, ${Math.round(255 * color.color1.b * (1 - color.color1.s + color.color1.s * Math.cos((color.color1.h * 360 - 120) * Math.PI / 180)))}, ${Math.round(255 * color.color1.b * (1 - color.color1.s + color.color1.s * Math.cos((color.color1.h * 360 - 240) * Math.PI / 180)))})` }}
              />
              <div className="text-sm font-mono">
                {hsb1.h} {hsb1.s} {hsb1.b}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium mb-2">Color 2</div>
              <div 
                className="w-full h-8 rounded border mb-2"
                style={{ backgroundColor: `rgb(${Math.round(255 * color.color2.b * (1 - color.color2.s + color.color2.s * Math.cos((color.color2.h * 360) * Math.PI / 180)))}, ${Math.round(255 * color.color2.b * (1 - color.color2.s + color.color2.s * Math.cos((color.color2.h * 360 - 120) * Math.PI / 180)))}, ${Math.round(255 * color.color2.b * (1 - color.color2.s + color.color2.s * Math.cos((color.color2.h * 360 - 240) * Math.PI / 180)))})` }}
              />
              <div className="text-sm font-mono">
                {hsb2.h} {hsb2.s} {hsb2.b}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HSBPopup