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
  const [extractionMode, setExtractionMode] = useState('advanced')
  const [excludeGrays, setExcludeGrays] = useState(false)
  const [showRegionSelect, setShowRegionSelect] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [matchedForzaColors, setMatchedForzaColors] = useState([])
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)
  const displayCanvasRef = useRef(null)

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

  const kMeansCluster = useCallback((pixels, k = 8) => {
    if (pixels.length === 0) return []
    
    let centroids = []
    for (let i = 0; i < k; i++) {
      const randomPixel = pixels[Math.floor(Math.random() * pixels.length)]
      centroids.push([...randomPixel.rgb])
    }
    
    for (let iter = 0; iter < 15; iter++) {
      const clusters = Array(k).fill().map(() => [])
      
      pixels.forEach(pixel => {
        let minDistance = Infinity
        let clusterIndex = 0
        
        centroids.forEach((centroid, i) => {
          const distance = Math.sqrt(
            Math.pow(pixel.rgb[0] - centroid[0], 2) +
            Math.pow(pixel.rgb[1] - centroid[1], 2) +
            Math.pow(pixel.rgb[2] - centroid[2], 2)
          )
          if (distance < minDistance) {
            minDistance = distance
            clusterIndex = i
          }
        })
        
        clusters[clusterIndex].push(pixel)
      })
      
      centroids = clusters.map(cluster => {
        if (cluster.length === 0) return centroids[0]
        
        const avgR = cluster.reduce((sum, p) => sum + p.rgb[0], 0) / cluster.length
        const avgG = cluster.reduce((sum, p) => sum + p.rgb[1], 0) / cluster.length
        const avgB = cluster.reduce((sum, p) => sum + p.rgb[2], 0) / cluster.length
        
        return [Math.round(avgR), Math.round(avgG), Math.round(avgB)]
      })
    }
    
    return centroids.map((centroid, i) => {
      const cluster = pixels.filter(pixel => {
        const distances = centroids.map(c => 
          Math.sqrt(
            Math.pow(pixel.rgb[0] - c[0], 2) +
            Math.pow(pixel.rgb[1] - c[1], 2) +
            Math.pow(pixel.rgb[2] - c[2], 2)
          )
        )
        return distances.indexOf(Math.min(...distances)) === i
      })
      
      return {
        rgb: centroid,
        hsb: rgbToHsb(centroid[0], centroid[1], centroid[2]),
        percentage: Math.round((cluster.length / pixels.length) * 10000) / 100,
        pixelCount: cluster.length,
        name: generateColorName(centroid)
      }
    }).filter(c => c.pixelCount > 0).sort((a, b) => b.percentage - a.percentage)
  }, [rgbToHsb])

  const findClosestForzaColors = useCallback((extractedColors) => {
    if (!colors || colors.length === 0) return []
    
    return extractedColors.map(extracted => {
      let closestColor = null
      let minDistance = Infinity
      
      colors.forEach(forzaColor => {
        const distance = Math.sqrt(
          Math.pow((extracted.hsb.h - forzaColor.color1.h) * 360, 2) +
          Math.pow((extracted.hsb.s - forzaColor.color1.s) * 100, 2) +
          Math.pow((extracted.hsb.b - forzaColor.color1.b) * 100, 2)
        )
        
        if (distance < minDistance) {
          minDistance = distance
          closestColor = forzaColor
        }
      })
      
      return {
        extracted,
        forza: closestColor,
        similarity: Math.max(0, 100 - (minDistance / 5))
      }
    }).filter(match => match.similarity > 30)
  }, [colors])

  const generateColorName = useCallback((rgb) => {
    const [r, g, b] = rgb
    const hsb = rgbToHsb(r, g, b)
    const h = hsb.h * 360
    const s = hsb.s
    const brightness = hsb.b
    
    let baseName = ''
    if (s < 0.1) {
      baseName = brightness > 0.8 ? 'White' : brightness > 0.5 ? 'Gray' : 'Black'
    } else if (h < 15 || h >= 345) baseName = 'Red'
    else if (h < 45) baseName = 'Orange'
    else if (h < 75) baseName = 'Yellow'
    else if (h < 135) baseName = 'Green'
    else if (h < 225) baseName = 'Blue'
    else if (h < 285) baseName = 'Purple'
    else baseName = 'Pink'
    
    const modifiers = []
    if (brightness < 0.3) modifiers.push('Dark')
    else if (brightness > 0.8) modifiers.push('Light')
    if (s > 0.8) modifiers.push('Vivid')
    
    return modifiers.length > 0 ? `${modifiers.join(' ')} ${baseName}` : baseName
  }, [rgbToHsb])

  const extractColorsFromCanvas = useCallback((canvas) => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return []

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const pixels = []
    
    for (let i = 0; i < data.length; i += 8) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const alpha = data[i + 3]

      if (alpha < 200) continue
      
      if (excludeGrays) {
        const grayness = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r)
        if (grayness < 30) continue
      }
      
      pixels.push({ rgb: [r, g, b] })
    }

    if (extractionMode === 'advanced') {
      return kMeansCluster(pixels, 10)
    } else {
      const colorMap = new Map()
      pixels.forEach(pixel => {
        const key = `${Math.floor(pixel.rgb[0]/8)*8}-${Math.floor(pixel.rgb[1]/8)*8}-${Math.floor(pixel.rgb[2]/8)*8}`
        colorMap.set(key, (colorMap.get(key) || 0) + 1)
      })
      
      return Array.from(colorMap.entries())
        .map(([key, count]) => {
          const [r, g, b] = key.split('-').map(Number)
          return {
            rgb: [r, g, b],
            hsb: rgbToHsb(r, g, b),
            percentage: Math.round((count / pixels.length) * 10000) / 100,
            name: generateColorName([r, g, b])
          }
        })
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 10)
    }
  }, [rgbToHsb, kMeansCluster, generateColorName, extractionMode, excludeGrays])

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
            
            // Also draw to display canvas for region selection
            if (displayCanvasRef.current) {
              const displayCtx = displayCanvasRef.current.getContext('2d')
              displayCanvasRef.current.width = canvas.width
              displayCanvasRef.current.height = canvas.height
              displayCtx.drawImage(img, 0, 0, canvas.width, canvas.height)
            }

            const basicColors = extractColorsFromCanvas(canvas)
            const enhancedColors = await processWithPythonML(basicColors)
            const forzaMatches = findClosestForzaColors(enhancedColors)
            
            onColorsExtracted?.(enhancedColors)
            setMatchedForzaColors(forzaMatches)
            setUploadedImage(imageUrl)
            setShowRegionSelect(true)
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
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          <select
            value={extractionMode}
            onChange={(e) => setExtractionMode(e.target.value)}
            className={`text-xs p-2 rounded border ${
              isDarkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-gray-900 border-gray-300'
            }`}
          >
            <option value="advanced">🧠 AI Clustering</option>
            <option value="basic">⚡ Fast Extract</option>
          </select>
          
          <label className="flex items-center text-xs">
            <input
              type="checkbox"
              checked={excludeGrays}
              onChange={(e) => setExcludeGrays(e.target.checked)}
              className="mr-1"
            />
            Skip Grays
          </label>
        </div>
        
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
          <span className="text-sm">
            {extractionMode === 'advanced' ? '🧠 AI clustering colors...' : '⚡ Fast extracting...'}
          </span>
        </div>
      )}

      {error && (
        <div className={`text-sm p-2 rounded ${
          isDarkMode ? 'text-red-200 bg-red-900/30' : 'text-red-600 bg-red-50'
        }`}>
          {error}
        </div>
      )}

      {showRegionSelect && uploadedImage && (
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Click on image to extract colors from that area:</div>
          <div className="relative inline-block">
            <canvas
              ref={displayCanvasRef}
              className="border rounded cursor-crosshair max-w-full h-auto"
              onClick={(e) => {
                const rect = e.target.getBoundingClientRect()
                const x = Math.floor((e.clientX - rect.left) * (e.target.width / rect.width))
                const y = Math.floor((e.clientY - rect.top) * (e.target.height / rect.height))
                
                const regionSize = 50
                const ctx = canvasRef.current.getContext('2d')
                const imageData = ctx.getImageData(
                  Math.max(0, x - regionSize/2),
                  Math.max(0, y - regionSize/2),
                  regionSize,
                  regionSize
                )
                
                const pixels = []
                for (let i = 0; i < imageData.data.length; i += 16) {
                  const r = imageData.data[i]
                  const g = imageData.data[i + 1]
                  const b = imageData.data[i + 2]
                  const alpha = imageData.data[i + 3]
                  if (alpha > 200) pixels.push({ rgb: [r, g, b] })
                }
                
                const regionColors = pixels.slice(0, 3).map(p => ({
                  rgb: p.rgb,
                  hsb: rgbToHsb(p.rgb[0], p.rgb[1], p.rgb[2]),
                  percentage: 33,
                  name: generateColorName(p.rgb)
                }))
                
                if (regionColors.length > 0) {
                  const regionMatches = findClosestForzaColors(regionColors)
                  onColorsExtracted?.(regionColors)
                  setMatchedForzaColors(regionMatches)
                }
              }}
            />
          </div>
        </div>
      )}
      
      {matchedForzaColors.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">🎯 Closest Forza Colors:</div>
          <div className="space-y-2">
            {matchedForzaColors.slice(0, 3).map((match, index) => (
              <div key={index} className={`flex items-center gap-3 p-2 rounded border ${
                isDarkMode ? 'border-slate-600 bg-slate-700/50' : 'border-gray-300 bg-gray-50'
              }`}>
                <div className="flex gap-1">
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: `rgb(${match.extracted.rgb.join(',')})` }}
                  />
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: `hsl(${match.forza.color1.h * 360}, ${match.forza.color1.s * 100}%, ${match.forza.color1.b * 100}%)` }}
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{match.forza.colorName}</div>
                  <div className="text-xs opacity-75">{match.forza.make} • {match.similarity.toFixed(0)}% match</div>
                </div>
                <button
                  onClick={() => onColorSelect?.(match.forza)}
                  className={`px-2 py-1 text-xs rounded ${
                    isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  Select
                </button>
              </div>
            ))}
          </div>
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