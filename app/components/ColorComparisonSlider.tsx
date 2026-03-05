'use client'

import React, { useState } from 'react'
import { CarColor } from '../types'

interface ColorComparisonSliderProps {
  original: { h: number; s: number; b: number }
  matched: CarColor
  isDarkMode: boolean
}

export default function ColorComparisonSlider({ original, matched, isDarkMode }: ColorComparisonSliderProps) {
  const [sliderValue, setSliderValue] = useState(50)

  const originalCSS = `hsl(${original.h * 360}, ${original.s * 100}%, ${original.b * 100}%)`
  const matchedCSS = `hsl(${matched.color1.h * 360}, ${matched.color1.s * 100}%, ${matched.color1.b * 100}%)`

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <div className="relative h-32 rounded-lg overflow-hidden mb-4">
        <div
          className="absolute inset-0"
          style={{ background: originalCSS }}
        />
        <div
          className="absolute inset-0 transition-all"
          style={{
            background: matchedCSS,
            clipPath: `inset(0 ${100 - sliderValue}% 0 0)`
          }}
        />
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
          style={{ left: `${sliderValue}%` }}
        />
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={sliderValue}
        onChange={e => setSliderValue(Number(e.target.value))}
        className="w-full"
      />

      <div className="flex justify-between mt-2 text-sm">
        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Original</span>
        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Matched: {matched.colorName}</span>
      </div>
    </div>
  )
}
