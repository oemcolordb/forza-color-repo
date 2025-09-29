'use client'

import React, { useState, useCallback, useRef } from 'react'

const ImageColorExtractor = ({
  colors = [],
  onColorsExtracted,
  onColorsFound,
  onColorSelect,
  isDarkMode,
  showTutorial = false,
  onTutorialClose
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)

  const rgbToHsb = useCallback((r, g, b) => {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const diff = max - min

    let h = 0
    if (diff !== 0) {
      if (max === r) h = ((g - b) / diff) % 6
      else if (max === g) h = (b - r) / diff + 2
      else h = (r - g) / diff + 4
    }
    h = Math.round(h * 60)
    if (h < 0) h += 360

    const s = max === 0 ? 0 : diff / max
    const brightness = max

    return {
      h: h / 360,
      s: Math.round(s * 100) / 100,
      b: Math.round(brightness * 100) / 100
    }
  }, [])

  const extractColorsFromCanvas = useCallback((canvas) => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return []

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const colorMap = new Map()
    const totalPixels = data.length / 4

    // Sample every 4th pixel for performance
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const alpha = data[i + 3]

      if (alpha < 200) continue

      // Group similar colors (reduce precision)
      const key = `${Math.floor(r/8)*8}-${Math.floor(g/8)*8}-${Math.floor(b/8)*8}`
      colorMap.set(key, (colorMap.get(key) || 0) + 1)
    }

    // Convert to array and sort by frequency
    const colors = Array.from(colorMap.entries())
      .map(([key, count]) => {
        const [r, g, b] = key.split('-').map(Number)
        return {
          rgb: [r, g, b],
          hsb: rgbToHsb(r, g, b),
          percentage: Math.round((count / (totalPixels / 4)) * 10000) / 100
        }
      })
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 10)

    return colors
  }, [rgbToHsb])

  const processWithPythonML = useCallback(async (colors) => {
    try {
      const response = await fetch('/api/ml/enhance-colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colors })
      })

      if (!response.ok) {
        console.warn('ML service unavailable, using basic extraction')
        return colors
      }

      const enhanced = await response.json()
      return enhanced.colors || colors
    } catch (error) {
      console.warn('ML enhancement failed:', error)
      return colors
    }
  }, [])

  const handleImageUpload = useCallback(async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Image file is too large. Please select a file under 10MB.')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const img = new Image()
      const canvas = canvasRef.current
      if (!canvas) {
        setError('Canvas not available. Please refresh the page and try again.')
        setIsProcessing(false)
        return
      }

      const imageUrl = URL.createObjectURL(file)

      await new Promise((resolve, reject) => {
        img.onload = async () => {
          try {
            const ctx = canvas.getContext('2d', { willReadFrequently: true })
            if (!ctx) {
              throw new Error('Canvas context not available. Your browser may not support this feature.')
            }

            // Resize for performance
            const maxSize = 300
            const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
            canvas.width = img.width * scale
            canvas.height = img.height * scale

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

            const basicColors = extractColorsFromCanvas(canvas)
            const enhancedColors = await processWithPythonML(basicColors)
            
            onColorsExtracted?.(enhancedColors)
            onColorsFound?.([])
            URL.revokeObjectURL(imageUrl)
            resolve()
          } catch (error) {
            URL.revokeObjectURL(imageUrl)
            reject(error)
          }
        }

        img.onerror = (error) => {
          URL.revokeObjectURL(imageUrl)
          console.error('Image load error:', error)
          reject(new Error('Failed to load image. Please check the file format and try again.'))
        }

        img.src = imageUrl
      })

      setIsProcessing(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Processing failed')
      setIsProcessing(false)
    }
  }, [extractColorsFromCanvas, processWithPythonML, onColorsExtracted])

  return (
    <div className={`p-4 rounded-lg border ${
      isDarkMode 
        ? 'bg-slate-800 border-slate-600' 
        : 'bg-white border-gray-300'
    }`}>
      <div className="mb-4">
        <label className={`block text-sm font-medium mb-2 ${
          isDarkMode ? 'text-slate-200' : 'text-gray-700'
        }`}>
          Extract Colors from Image
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={isProcessing}
          aria-label="Upload image to extract colors"
          className={`block w-full text-sm ${
            isDarkMode 
              ? 'text-slate-300 file:bg-slate-700 file:text-slate-200' 
              : 'text-gray-900 file:bg-gray-50 file:text-gray-700'
          } file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold hover:file:bg-opacity-80`}
        />
      </div>

      {isProcessing && (
        <div className="flex items-center space-x-2 text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm">Processing with ML enhancement...</span>
        </div>
      )}

      {error && (
        <div className={`text-sm p-2 rounded ${
          isDarkMode ? 'text-red-200 bg-red-900/30' : 'text-red-600 bg-red-50'
        }`}>
          {error}
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="hidden"
        width={300}
        height={300}
      />
    </div>
  )
}

export default ImageColorExtractor