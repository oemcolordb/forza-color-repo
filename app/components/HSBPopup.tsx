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
  if (!isOpen || !color) return null

  const formatHSB = (hsb: { h: number; s: number; b: number }) => ({
    h: Math.round(hsb.h * 360),
    s: Math.round(hsb.s * 100),
    b: Math.round(hsb.b * 100)
  })

  const hsb1 = formatHSB(color.color1)
  const hsb2 = formatHSB(color.color2)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className={`p-4 rounded-lg max-w-sm w-full mx-4 ${
          isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">HSB Color Data</h3>
          <button 
            onClick={onClose}
            className={`text-xl ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}
          >
            ×
          </button>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="font-medium text-sm">{color.colorName}</div>
            <div className="text-xs opacity-75">{color.make}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-medium mb-1">Primary Color</div>
              <div 
                className="w-full h-8 rounded border"
                style={{ backgroundColor: `hsl(${hsb1.h}, ${hsb1.s}%, ${hsb1.b}%)` }}
              />
              <div className="text-xs mt-1 space-y-0.5">
                <div>H: {hsb1.h}°</div>
                <div>S: {hsb1.s}%</div>
                <div>B: {hsb1.b}%</div>
              </div>
            </div>
            
            <div>
              <div className="text-xs font-medium mb-1">Secondary Color</div>
              <div 
                className="w-full h-8 rounded border"
                style={{ backgroundColor: `hsl(${hsb2.h}, ${hsb2.s}%, ${hsb2.b}%)` }}
              />
              <div className="text-xs mt-1 space-y-0.5">
                <div>H: {hsb2.h}°</div>
                <div>S: {hsb2.s}%</div>
                <div>B: {hsb2.b}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HSBPopup