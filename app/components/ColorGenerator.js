'use client'

import React, { useState, useMemo, useCallback } from 'react'

const ColorGenerator = ({ colors, isDarkMode, onColorsGenerated, isMobile = false }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCount, setGeneratedCount] = useState(0)

  // Analyze gaps in the color database
  const colorAnalysis = useMemo(() => {
    const hueDistribution = new Array(36).fill(0) // 10° buckets
    const saturationLow = colors.filter(c => c.color1.s < 0.3).length
    const saturationMed = colors.filter(c => c.color1.s >= 0.3 && c.color1.s <= 0.7).length
    const saturationHigh = colors.filter(c => c.color1.s > 0.7).length
    const brightnessLow = colors.filter(c => c.color1.b < 0.3).length
    const brightnessMed = colors.filter(c => c.color1.b >= 0.3 && c.color1.b <= 0.7).length
    const brightnessHigh = colors.filter(c => c.color1.b > 0.7).length

    colors.forEach(color => {
      const hueBucket = Math.floor((color.color1.h * 360) / 10)
      hueDistribution[hueBucket]++
    })

    const minHue = Math.min(...hueDistribution)
    const gapHues = hueDistribution.map((count, index) => ({ hue: index * 10, count }))
      .filter(item => item.count <= minHue + 50)
      .map(item => item.hue)

    return {
      total: colors.length,
      saturationGaps: { low: saturationLow, med: saturationMed, high: saturationHigh },
      brightnessGaps: { low: brightnessLow, med: brightnessMed, high: brightnessHigh },
      hueGaps: gapHues,
      recommendations: []
    }
  }, [colors])

  // Generate new colors based on existing OEM colors
  const generateColors = useCallback(async () => {
    setIsGenerating(true)
    const newColors = []

    // Generate saturation variations
    const lowSatColors = colors.filter(c => c.color1.s > 0.5).slice(0, 100)
    lowSatColors.forEach((color, index) => {
      newColors.push({
        ...color,
        colorName: `Muted ${color.colorName}`,
        make: `${color.make} Generated`,
        color1: { ...color.color1, s: color.color1.s * 0.4 },
        color2: { ...color.color2, s: color.color2.s * 0.4 },
        colorType: 'Generated Muted',
        isGenerated: true
      })
    })

    // Generate brightness variations
    const darkColors = colors.filter(c => c.color1.b > 0.7).slice(0, 100)
    darkColors.forEach((color, index) => {
      newColors.push({
        ...color,
        colorName: `Deep ${color.colorName}`,
        make: `${color.make} Generated`,
        color1: { ...color.color1, b: color.color1.b * 0.5 },
        color2: { ...color.color2, b: color.color2.b * 0.5 },
        colorType: 'Generated Deep',
        isGenerated: true
      })
    })

    // Generate hue variations
    const baseColors = colors.slice(0, 150)
    baseColors.forEach((color, index) => {
      const hueShift = (index % 2 === 0) ? 0.05 : -0.05 // ±18°
      newColors.push({
        ...color,
        colorName: `${color.colorName} Variant`,
        make: `${color.make} Generated`,
        color1: { 
          ...color.color1, 
          h: (color.color1.h + hueShift + 1) % 1 
        },
        color2: { 
          ...color.color2, 
          h: (color.color2.h + hueShift + 1) % 1 
        },
        colorType: 'Generated Variant',
        isGenerated: true
      })
    })

    // Generate blended colors
    for (let i = 0; i < 100; i++) {
      const color1 = colors[Math.floor(Math.random() * colors.length)]
      const color2 = colors[Math.floor(Math.random() * colors.length)]
      
      if (color1.make === color2.make) {
        newColors.push({
          make: `${color1.make} Generated`,
          model: 'Blended',
          year: null,
          colorName: `${color1.colorName} × ${color2.colorName}`,
          colorType: 'Generated Blend',
          color1: {
            h: (color1.color1.h + color2.color1.h) / 2,
            s: (color1.color1.s + color2.color1.s) / 2,
            b: (color1.color1.b + color2.color1.b) / 2
          },
          color2: {
            h: (color1.color2.h + color2.color2.h) / 2,
            s: (color1.color2.s + color2.color2.s) / 2,
            b: (color1.color2.b + color2.color2.b) / 2
          },
          isGenerated: true
        })
      }
    }

    // Generate semigloss colors
    const semiglossBase = colors.filter(c => 
      c.colorType !== 'Matte' && 
      c.color1.s > 0.2 && 
      c.color1.b > 0.3
    ).slice(0, 200)
    
    semiglossBase.forEach(color => {
      newColors.push({
        ...color,
        colorName: `${color.colorName} Semigloss`,
        make: `${color.make} Generated`,
        color1: {
          ...color.color1,
          s: Math.min(1, color.color1.s * 0.85), // Slightly less saturated
          b: Math.min(1, color.color1.b * 1.05)  // Slightly brighter
        },
        color2: {
          ...color.color2,
          s: Math.min(1, color.color2.s * 0.85),
          b: Math.min(1, color.color2.b * 1.05)
        },
        colorType: 'Semigloss',
        isGenerated: true
      })
    })

    // Generate seasonal colors
    const seasonalBases = colors.slice(0, 50)
    seasonalBases.forEach(color => {
      // Spring version (lighter, more saturated)
      newColors.push({
        ...color,
        colorName: `Spring ${color.colorName}`,
        make: `${color.make} Generated`,
        color1: { 
          ...color.color1, 
          s: Math.min(1, color.color1.s * 1.2),
          b: Math.min(1, color.color1.b * 1.1)
        },
        color2: { 
          ...color.color2, 
          s: Math.min(1, color.color2.s * 1.2),
          b: Math.min(1, color.color2.b * 1.1)
        },
        colorType: 'Generated Spring',
        isGenerated: true
      })

      // Fall version (warmer, earthier)
      newColors.push({
        ...color,
        colorName: `Autumn ${color.colorName}`,
        make: `${color.make} Generated`,
        color1: { 
          h: color.color1.h < 0.17 ? color.color1.h + 0.05 : color.color1.h, // Shift toward orange
          s: color.color1.s * 0.8,
          b: color.color1.b * 0.9
        },
        color2: { 
          h: color.color2.h < 0.17 ? color.color2.h + 0.05 : color.color2.h,
          s: color.color2.s * 0.8,
          b: color.color2.b * 0.9
        },
        colorType: 'Generated Autumn',
        isGenerated: true
      })
    })

    setGeneratedCount(newColors.length)
    onColorsGenerated(newColors)
    setIsGenerating(false)
  }, [colors, onColorsGenerated])

  return (
    <div className={`${isMobile ? 'p-3' : 'p-4'} rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
      <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold ${isMobile ? 'mb-3' : 'mb-4'} ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        🧬 Color Generator
      </h3>

      {/* Database Analysis */}
      <div className={`${isMobile ? 'mb-3 p-2' : 'mb-4 p-3'} rounded ${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
        <h4 className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'} ${isMobile ? 'mb-1' : 'mb-2'} ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Database Analysis
        </h4>
        <div className={`grid grid-cols-2 ${isMobile ? 'gap-1' : 'gap-2'} ${isMobile ? 'text-2xs' : 'text-xs'}`}>
          <div>
            <span className={isDarkMode ? 'text-slate-300' : 'text-gray-600'}>Total Colors:</span>
            <span className={`ml-1 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {colorAnalysis.total.toLocaleString()}
            </span>
          </div>
          <div>
            <span className={isDarkMode ? 'text-slate-300' : 'text-gray-600'}>Generated:</span>
            <span className={`ml-1 font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              {generatedCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Generation Categories */}
      <div className={`${isMobile ? 'space-y-1 mb-3' : 'space-y-2 mb-4'}`}>
        <div className={`${isMobile ? 'text-2xs' : 'text-xs'} ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
          Will generate:
        </div>
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-1' : 'grid-cols-2 gap-1'} ${isMobile ? 'text-2xs' : 'text-xs'}`}>
          {isMobile ? (
            // Mobile: Simplified single column layout
            <>
              <div className={`${isMobile ? 'p-1.5' : 'p-2'} rounded ${isDarkMode ? 'bg-slate-700' : 'bg-blue-50'}`}>
                <div className={`font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>Color Variants</div>
                <div className={isDarkMode ? 'text-slate-400' : 'text-blue-600'}>~750 new colors</div>
              </div>
            </>
          ) : (
            // Desktop: Full grid layout
            <>
              <div className={`p-2 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-blue-50'}`}>
                <div className={`font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>Muted Variants</div>
                <div className={isDarkMode ? 'text-slate-400' : 'text-blue-600'}>~100 colors</div>
              </div>
              <div className={`p-2 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-purple-50'}`}>
                <div className={`font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>Deep Variants</div>
                <div className={isDarkMode ? 'text-slate-400' : 'text-purple-600'}>~100 colors</div>
              </div>
              <div className={`p-2 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-green-50'}`}>
                <div className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>Hue Variants</div>
                <div className={isDarkMode ? 'text-slate-400' : 'text-green-600'}>~150 colors</div>
              </div>
              <div className={`p-2 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-orange-50'}`}>
                <div className={`font-medium ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>Brand Blends</div>
                <div className={isDarkMode ? 'text-slate-400' : 'text-orange-600'}>~100 colors</div>
              </div>
              <div className={`p-2 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-pink-50'}`}>
                <div className={`font-medium ${isDarkMode ? 'text-pink-400' : 'text-pink-700'}`}>Semigloss</div>
                <div className={isDarkMode ? 'text-slate-400' : 'text-pink-600'}>~200 colors</div>
              </div>
              <div className={`p-2 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-yellow-50'}`}>
                <div className={`font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>Seasonal</div>
                <div className={isDarkMode ? 'text-slate-400' : 'text-yellow-600'}>~100 colors</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateColors}
        onTouchStart={() => {}} // Enable touch feedback
        disabled={isGenerating}
        className={`w-full ${isMobile ? 'py-3 px-3 text-sm' : 'py-3 px-4'} rounded font-medium transition-all touch-manipulation select-none ${
          isGenerating
            ? 'bg-gray-400 cursor-not-allowed animate-pulse'
            : `bg-gradient-to-r from-blue-600 to-purple-600 text-white ${
                isMobile 
                  ? 'active:from-blue-700 active:to-purple-700 active:scale-95' 
                  : 'hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
              }`
        }`}
        style={{
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation'
        }}
      >
        {isGenerating ? '🧬 Generating Colors...' : '🧬 Generate New Colors'}
      </button>

      {generatedCount > 0 && (
        <div className={`${isMobile ? 'mt-2 p-1.5' : 'mt-3 p-2'} rounded ${isMobile ? 'text-2xs' : 'text-xs'} text-center ${isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'}`}>
          ✅ Generated {generatedCount} new colors! {isMobile ? 'Scroll to see them.' : 'Check the harmony modes to see them.'}
        </div>
      )}
    </div>
  )
}

export default ColorGenerator