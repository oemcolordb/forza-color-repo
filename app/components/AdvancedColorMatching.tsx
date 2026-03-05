'use client'

import React, { useState, useMemo } from 'react'
import { CarColor } from '../types'
import { findClosestColors, generateColorDiff } from '../lib/colorMatching'
import ColorComparisonSlider from './ColorComparisonSlider'

interface AdvancedColorMatchingProps {
  targetColor: { h: number; s: number; b: number }
  colors: CarColor[]
  isDarkMode: boolean
  onColorSelect: (color: CarColor) => void
}

export default function AdvancedColorMatching({
  targetColor,
  colors,
  isDarkMode,
  onColorSelect
}: AdvancedColorMatchingProps) {
  const [selectedMatch, setSelectedMatch] = useState<CarColor | null>(null)
  const [showComparison, setShowComparison] = useState(false)

  const matches = useMemo(() => {
    return findClosestColors(targetColor, colors, 10)
  }, [targetColor, colors])

  const exactMatch = matches[0]?.distance < 0.01

  return (
    <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          🎯 Color Matching Results
        </h3>
        {exactMatch && (
          <span className="px-3 py-1 bg-green-500 text-white text-sm rounded-full">
            ✓ Exact Match
          </span>
        )}
      </div>

      {/* Target Color Display */}
      <div className="mb-6">
        <div className="text-sm font-semibold mb-2">Your Color:</div>
        <div className="flex items-center gap-4">
          <div
            className="w-20 h-20 rounded-lg border-2 border-gray-300"
            style={{
              background: `hsl(${targetColor.h * 360}, ${targetColor.s * 100}%, ${targetColor.b * 100}%)`
            }}
          />
          <div className="text-sm">
            <div>H: {Math.round(targetColor.h * 360)}°</div>
            <div>S: {Math.round(targetColor.s * 100)}%</div>
            <div>B: {Math.round(targetColor.b * 100)}%</div>
          </div>
        </div>
      </div>

      {/* Closest Matches */}
      <div className="mb-4">
        <div className="text-sm font-semibold mb-3">
          {exactMatch ? 'Perfect Match Found!' : 'Closest Available Paints:'}
        </div>
        <div className="space-y-3">
          {matches.map(({ color, distance, similarity }, index) => {
            const diff = generateColorDiff(targetColor, color.color1)
            
            return (
              <div
                key={`${color.make}-${color.colorName}-${index}`}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedMatch === color
                    ? 'border-blue-500'
                    : isDarkMode
                    ? 'border-slate-700 hover:border-slate-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  setSelectedMatch(color)
                  setShowComparison(true)
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0
                      ? 'bg-yellow-500 text-white'
                      : index === 1
                      ? 'bg-gray-400 text-white'
                      : index === 2
                      ? 'bg-orange-600 text-white'
                      : isDarkMode
                      ? 'bg-slate-700 text-gray-300'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Color Preview */}
                  <div
                    className="w-16 h-16 rounded-lg border-2 border-gray-300"
                    style={{
                      background: `hsl(${color.color1.h * 360}, ${color.color1.s * 100}%, ${color.color1.b * 100}%)`
                    }}
                  />

                  {/* Color Info */}
                  <div className="flex-1">
                    <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {color.colorName}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {color.make} {color.model && `• ${color.model}`}
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded ${
                        isDarkMode ? 'bg-slate-700' : 'bg-gray-100'
                      }`}>
                        {color.colorType}
                      </span>
                    </div>
                  </div>

                  {/* Match Quality */}
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      similarity >= 95
                        ? 'text-green-500'
                        : similarity >= 85
                        ? 'text-blue-500'
                        : similarity >= 75
                        ? 'text-yellow-500'
                        : 'text-orange-500'
                    }`}>
                      {similarity}%
                    </div>
                    <div className="text-xs text-gray-500">Match</div>
                    
                    {/* Difference Indicators */}
                    <div className="mt-2 space-y-1">
                      {diff.hDiff > 10 && (
                        <div className="text-xs text-red-500">ΔH: {Math.round(diff.hDiff)}°</div>
                      )}
                      {diff.sDiff > 10 && (
                        <div className="text-xs text-orange-500">ΔS: {Math.round(diff.sDiff)}%</div>
                      )}
                      {diff.bDiff > 10 && (
                        <div className="text-xs text-yellow-500">ΔB: {Math.round(diff.bDiff)}%</div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onColorSelect(color)
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedMatch(color)
                        setShowComparison(true)
                      }}
                      className={`px-3 py-1 text-sm rounded ${
                        isDarkMode
                          ? 'bg-slate-700 text-white hover:bg-slate-600'
                          : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                      }`}
                    >
                      Compare
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Comparison Slider */}
      {showComparison && selectedMatch && (
        <div className="mt-6 p-4 rounded-lg border-2 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Color Comparison
            </h4>
            <button
              onClick={() => setShowComparison(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <ColorComparisonSlider
            original={targetColor}
            matched={selectedMatch}
            isDarkMode={isDarkMode}
          />
        </div>
      )}

      {/* Tips */}
      <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
        <div className="text-sm">
          <div className="font-semibold mb-1">💡 Tips:</div>
          <ul className="text-xs space-y-1 text-gray-500">
            <li>• Click any match to compare side-by-side</li>
            <li>• Matches above 90% are nearly identical</li>
            <li>• ΔH/ΔS/ΔB show hue/saturation/brightness differences</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
