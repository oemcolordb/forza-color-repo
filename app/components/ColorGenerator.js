'use client'

import React, { useState, useCallback } from 'react'

const ColorGenerator = ({ colors, isDarkMode, onColorsGenerated, isMobile = false }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCount, setGeneratedCount] = useState(0)



  // Generate systematic color variants using mathematical progression
  const generateSystematicVariants = useCallback((baseColors, type) => {
    const newColors = []
    
    // Limit to 2000 colors to prevent freezing
    const maxColors = 2000
    let colorCount = 0
    
    // Use limited colors, process in chunks to avoid memory issues
    const processInChunks = (colors, chunkSize = 500) => {
      for (let i = 0; i < colors.length && colorCount < maxColors; i += chunkSize) {
        const chunk = colors.slice(i, i + chunkSize)
        chunk.forEach((color, colorIndex) => {
          if (colorCount >= maxColors) return
      switch(type) {
          case 'hue':
            // Generate hue variants with limit
            for (let i = 1; i <= 24 && colorCount < maxColors; i++) {
              const hueShift = i / 24
              const newHsb = { ...color.color1, h: (color.color1.h + hueShift) % 1 }
              const uniqueId = `${colorIndex}_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
              
              newColors.push({
                ...color,
                colorName: `${color.colorName} H${i * 15}°`,
                make: `${color.make} Generated`,
                color1: newHsb,
                color2: { ...color.color2, h: (color.color2.h + hueShift) % 1 },
                colorType: 'Hue Variant',
                isGenerated: true,
                uniqueId
              })
              colorCount++
            }
            break
          break
          
          case 'brightness':
            // Generate brightness levels with limit
            for (let i = 1; i <= 20 && colorCount < maxColors; i++) {
              const brightnessMult = 0.1 + (i * 0.045) // 0.1 to 1.0
              const newHsb = { ...color.color1, b: Math.min(1, color.color1.b * brightnessMult) }
              const uniqueId = `${colorIndex}_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
              
              newColors.push({
                ...color,
                colorName: `${color.colorName} B${Math.round(brightnessMult * 100)}%`,
                make: `${color.make} Generated`,
                color1: newHsb,
                color2: { ...color.color2, b: Math.min(1, color.color2.b * brightnessMult) },
                colorType: 'Brightness Variant',
                isGenerated: true,
                uniqueId
              })
              colorCount++
            }
            break
          break
          
          case 'saturation':
            // Generate saturation levels with limit
            for (let i = 1; i <= 20 && colorCount < maxColors; i++) {
              const satMult = 0.05 + (i * 0.0475) // 0.05 to 1.0
              const newHsb = { ...color.color1, s: Math.min(1, color.color1.s * satMult) }
              const uniqueId = `${colorIndex}_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
              
              newColors.push({
                ...color,
                colorName: `${color.colorName} S${Math.round(satMult * 100)}%`,
                make: `${color.make} Generated`,
                color1: newHsb,
                color2: { ...color.color2, s: Math.min(1, color.color2.s * satMult) },
                colorType: 'Saturation Variant',
                isGenerated: true,
                uniqueId
              })
              colorCount++
            }
            break
          break
          
          case 'finishes':
            const finishes = [
              { name: 'Matte', s: 0.6, b: 0.8 },
              { name: 'Semigloss', s: 0.85, b: 1.05 },
              { name: 'Gloss', s: 1.1, b: 1.2 },
              { name: 'Metallic', s: 0.9, b: 1.15 },
              { name: 'Chrome', s: 0.3, b: 1.4 },
              { name: 'Pearlescent', s: 1.2, b: 1.1 }
            ]
            
            finishes.forEach((finish, finishIndex) => {
              // Generate intensity levels for each finish with limit
              for (let i = 1; i <= 10 && colorCount < maxColors; i++) {
                const intensity = 0.3 + (i * 0.07) // 0.3 to 1.0
                const newHsb = {
                  ...color.color1,
                  s: Math.min(1, color.color1.s * finish.s * intensity),
                  b: Math.min(1, color.color1.b * finish.b * intensity)
                }
                const uniqueId = `${colorIndex}_${finishIndex}_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                
                newColors.push({
                  ...color,
                  colorName: `${color.colorName} ${finish.name} ${Math.round(intensity * 100)}%`,
                  make: `${color.make} Generated`,
                  color1: newHsb,
                  color2: {
                    ...color.color2,
                    s: Math.min(1, color.color2.s * finish.s * intensity),
                    b: Math.min(1, color.color2.b * finish.b * intensity)
                  },
                  colorType: `${finish.name}`,
                  isGenerated: true,
                  uniqueId
                })
                colorCount++
              }
            })
            break
          break
        }
        })
      }
    }
    
    processInChunks(baseColors)
    return newColors
  }, [])

  // Generate specific type with batching
  const generateSpecificType = useCallback(async (type) => {
    setIsGenerating(true)
    
    try {
      const baseColors = colors // Use ALL colors as base
      const newColors = generateSystematicVariants(baseColors, type)
      
      setGeneratedCount(prev => prev + newColors.length)
      onColorsGenerated(newColors)
    } catch (error) {
      console.error('Generation error:', error)
    }
    
    setIsGenerating(false)
  }, [colors, generateSystematicVariants, onColorsGenerated])

  // Generate massive variant set
  const generateMassiveSet = useCallback(async () => {
    setIsGenerating(true)
    
    try {
      const baseColors = colors // Use ALL base colors
      const allVariants = []
      
      // Generate all types
      const types = ['hue', 'brightness', 'saturation', 'finishes']
      
      for (const type of types) {
        const variants = generateSystematicVariants(baseColors, type)
        allVariants.push(...variants)
        
        // Process in chunks to avoid memory issues
        if (allVariants.length > 10000) {
          setGeneratedCount(prev => prev + allVariants.length)
          onColorsGenerated([...allVariants])
          allVariants.length = 0 // Clear array
          await new Promise(resolve => setTimeout(resolve, 100)) // Brief pause
        }
      }
      
      // Process remaining
      if (allVariants.length > 0) {
        setGeneratedCount(prev => prev + allVariants.length)
        onColorsGenerated(allVariants)
      }
      
    } catch (error) {
      console.error('Massive generation error:', error)
    }
    
    setIsGenerating(false)
  }, [colors, generateSystematicVariants, onColorsGenerated])

  const getVariantCount = (type) => {
    // Limited to 2000 colors per generation
    return 2000
  }

  return (
    <div className={`${isMobile ? 'p-3' : 'p-4'} rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
      <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold ${isMobile ? 'mb-3' : 'mb-4'} ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        🧬 Systematic Color Generator
      </h3>

      <div className={`${isMobile ? 'mb-3 p-2' : 'mb-4 p-3'} rounded ${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
        <h4 className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'} ${isMobile ? 'mb-1' : 'mb-2'} ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Generation Stats
        </h4>
        <div className={`grid grid-cols-2 ${isMobile ? 'gap-1' : 'gap-2'} ${isMobile ? 'text-2xs' : 'text-xs'}`}>
          <div>
            <span className={isDarkMode ? 'text-slate-300' : 'text-gray-600'}>Base Colors:</span>
            <span className={`ml-1 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {colors.length.toLocaleString()}
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

      <div className={`${isMobile ? 'space-y-1 mb-3' : 'space-y-2 mb-4'}`}>
        <div className={`${isMobile ? 'text-2xs' : 'text-xs'} ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
          Systematic Generation:
        </div>
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-1' : 'grid-cols-2 gap-1'} ${isMobile ? 'text-2xs' : 'text-xs'}`}>
          <button
            onClick={() => generateSpecificType('hue')}
            disabled={isGenerating}
            className={`p-2 rounded transition-all ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-50 hover:bg-red-100'} ${isGenerating ? 'opacity-50' : ''}`}
          >
            <div className={`font-medium ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>🎨 Hue Variants</div>
            <div className={isDarkMode ? 'text-slate-400' : 'text-red-600'}>{getVariantCount('hue').toLocaleString()} colors</div>
          </button>
          
          <button
            onClick={() => generateSpecificType('brightness')}
            disabled={isGenerating}
            className={`p-2 rounded transition-all ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-yellow-50 hover:bg-yellow-100'} ${isGenerating ? 'opacity-50' : ''}`}
          >
            <div className={`font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>⚪ Brightness</div>
            <div className={isDarkMode ? 'text-slate-400' : 'text-yellow-600'}>{getVariantCount('brightness').toLocaleString()} colors</div>
          </button>
          
          <button
            onClick={() => generateSpecificType('saturation')}
            disabled={isGenerating}
            className={`p-2 rounded transition-all ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-purple-50 hover:bg-purple-100'} ${isGenerating ? 'opacity-50' : ''}`}
          >
            <div className={`font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>🌈 Saturation</div>
            <div className={isDarkMode ? 'text-slate-400' : 'text-purple-600'}>{getVariantCount('saturation').toLocaleString()} colors</div>
          </button>
          
          <button
            onClick={() => generateSpecificType('finishes')}
            disabled={isGenerating}
            className={`p-2 rounded transition-all ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-blue-50 hover:bg-blue-100'} ${isGenerating ? 'opacity-50' : ''}`}
          >
            <div className={`font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>✨ Finishes</div>
            <div className={isDarkMode ? 'text-slate-400' : 'text-blue-600'}>{getVariantCount('finishes').toLocaleString()} colors</div>
          </button>
        </div>
      </div>

      <button
        onClick={generateMassiveSet}
        disabled={isGenerating}
        className={`w-full ${isMobile ? 'py-3 px-3 text-sm' : 'py-3 px-4'} rounded font-medium transition-all ${
          isGenerating
            ? 'bg-gray-400 cursor-not-allowed animate-pulse'
            : `bg-gradient-to-r from-purple-600 to-pink-600 text-white ${
                isMobile 
                  ? 'active:from-purple-700 active:to-pink-700 active:scale-95' 
                  : 'hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'
              }`
        }`}
      >
        {isGenerating ? '🧬 Generating Variants...' : '🚀 Generate All Variants (2K per type)'}
      </button>

      {generatedCount > 0 && (
        <div className={`${isMobile ? 'mt-2 p-1.5' : 'mt-3 p-2'} rounded ${isMobile ? 'text-2xs' : 'text-xs'} text-center ${isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'}`}>
          ✅ Generated {generatedCount.toLocaleString()} colors! Systematic color space exploration complete.
        </div>
      )}
    </div>
  )
}

export default ColorGenerator