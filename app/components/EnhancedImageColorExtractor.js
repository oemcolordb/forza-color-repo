import React, { useState, useCallback } from 'react'

const EnhancedImageColorExtractor = ({
  colors,
  onColorsFound,
  onColorSelect,
  isDarkMode,
  showTutorial = false,
  onTutorialClose
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedColors, setExtractedColors] = useState([])
  const [matches, setMatches] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState(null)

  const processImage = useCallback(async (file) => {
    setIsProcessing(true)
    setError(null)
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      setIsProcessing(false)
      return
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file is too large. Please select a file under 10MB.')
      setIsProcessing(false)
      return
    }
    
    try {
      // Basic color extraction using canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        try {
          // Validate image dimensions
          if (img.width === 0 || img.height === 0) {
            throw new Error('Invalid image dimensions')
          }
          
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        const colorMap = {}
        
        // Sample pixels and group similar colors
        for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const alpha = data[i + 3]
          
          if (alpha < 200) continue // Skip transparent pixels
          
          // Group colors by reducing precision
          const key = `${Math.floor(r/10)*10}-${Math.floor(g/10)*10}-${Math.floor(b/10)*10}`
          colorMap[key] = (colorMap[key] || 0) + 1
        }
        
        // Get top colors
        const sortedColors = Object.entries(colorMap)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 8)
          .map(([key, count]) => {
            const [r, g, b] = key.split('-').map(Number)
            return {
              r, g, b,
              h: rgbToHsb(r, g, b).h,
              s: rgbToHsb(r, g, b).s,
              v: rgbToHsb(r, g, b).b,
              percentage: (count / (data.length / 4)) * 100,
              count,
              method: 'Canvas'
            }
          })
        
          setExtractedColors(sortedColors)
          
          // Find matching colors
          const colorMatches = findMatchingColors(sortedColors, colors)
          setMatches(colorMatches)
          onColorsFound(colorMatches)
        } catch (error) {
          console.error('Image processing error:', error)
          setError('Failed to process image: ' + error.message)
        }
      }
      
      img.onerror = (error) => {
        console.error('Image load error:', error)
        setError('Failed to load image. Please check the file format and try again.')
      }
      
      const imageUrl = URL.createObjectURL(file)
      img.src = imageUrl
      
      // Cleanup after processing
      img.onload = (originalOnLoad => function(...args) {
        const result = originalOnLoad.apply(this, args)
        URL.revokeObjectURL(imageUrl)
        return result
      })(img.onload)
      
      img.onerror = (originalOnError => function(...args) {
        URL.revokeObjectURL(imageUrl)
        const result = originalOnError.apply(this, args)
        return result
      })(img.onerror)
      
    } catch (error) {
      console.error('Image processing error:', error)
      setError('Failed to process image: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }, [colors, onColorsFound])

  const rgbToHsb = (r, g, b) => {
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
    
    return { h: h / 360, s, b: brightness }
  }

  const findMatchingColors = (extractedColors, allColors) => {
    const matches = []
    
    extractedColors.forEach(extracted => {
      const bestMatch = allColors.reduce((best, color) => {
        const distance = Math.sqrt(
          Math.pow(extracted.h - color.color1.h, 2) +
          Math.pow(extracted.s - color.color1.s, 2) +
          Math.pow(extracted.v - color.color1.b, 2)
        )
        
        if (!best || distance < best.distance) {
          return { ...color, distance, similarity_score: 1 - distance }
        }
        return best
      }, null)
      
      if (bestMatch && bestMatch.distance < 0.3) {
        matches.push(bestMatch)
      }
    })
    
    return matches.slice(0, 10)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      processImage(imageFile)
    }
  }, [processImage])

  const handleFileInput = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) {
      processImage(file)
    }
  }, [processImage])

  return (
    <>
      {showTutorial && (
        <div className={`mb-4 p-4 rounded-lg border-l-4 ${
          isDarkMode 
            ? 'bg-blue-900/30 border-blue-400 text-blue-100' 
            : 'bg-blue-50 border-blue-400 text-blue-800'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold mb-2">🎨 Color Matching:</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Upload any image (car photos work best)</li>
                <li>Extract dominant colors from the image</li>
                <li>Find closest matching automotive paint colors</li>
                <li>Click colors to explore them</li>
              </ol>
            </div>
            {onTutorialClose && (
              <button
                onClick={onTutorialClose}
                className={`ml-4 text-sm px-2 py-1 rounded ${
                  isDarkMode 
                    ? 'text-blue-300 hover:bg-blue-800' 
                    : 'text-blue-600 hover:bg-blue-100'
                } transition-colors`}
              >
                Got it
              </button>
            )}
          </div>
        </div>
      )}
      
      <div className={`p-6 rounded-lg border-2 border-dashed transition-colors ${
        dragActive 
          ? 'border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20' 
          : isDarkMode 
            ? 'border-slate-600 bg-slate-800' 
            : 'border-gray-300 bg-gray-50'
      }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
      >
        <div className="text-center">
          <div className={`mx-auto w-12 h-12 mb-4 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
          }`}>
            🎨
          </div>
          
          <h3 className={`text-lg font-semibold mb-2 ${
            isDarkMode ? 'text-slate-200' : 'text-gray-800'
          }`}>
            Color Matching
          </h3>
          
          <p className={`text-sm mb-4 ${
            isDarkMode ? 'text-slate-400' : 'text-gray-600'
          }`}>
            Upload an image to extract colors and find matching automotive paints
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            id="enhanced-image-upload"
            disabled={isProcessing}
          />
          
          {error && (
            <div className={`mb-4 p-3 rounded-lg ${
              isDarkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-50 text-red-800'
            }`}>
              {error}
            </div>
          )}
          
          {extractedColors.length === 0 ? (
            <label
              htmlFor="enhanced-image-upload"
              className={`inline-block px-4 py-2 rounded-md cursor-pointer transition-colors ${
                isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isDarkMode
                    ? 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white'
                    : 'bg-fuchsia-500 hover:bg-fuchsia-600 text-white'
              }`}
            >
              {isProcessing ? 'Processing...' : 'Choose Image'}
            </label>
          ) : (
            <div className="w-full text-left">
              <h4 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-slate-200' : 'text-gray-800'
              }`}>
                🎨 Extracted Colors
              </h4>
              
              <div className="grid grid-cols-4 gap-3 mb-4">
                {extractedColors.map((color, index) => {
                  const hexCode = `#${color.r.toString(16).padStart(2,'0')}${color.g.toString(16).padStart(2,'0')}${color.b.toString(16).padStart(2,'0')}`
                  
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="w-12 h-12 rounded-lg border-2 border-white shadow-lg"
                        style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }}
                        title={`${color.percentage.toFixed(1)}% of image`}
                      />
                      <span className={`text-xs mt-1 ${
                        isDarkMode ? 'text-slate-400' : 'text-gray-600'
                      }`}>
                        {hexCode}
                      </span>
                    </div>
                  )
                })}
              </div>

              {matches.length > 0 && (
                <div className="mb-4">
                  <h4 className={`text-lg font-semibold mb-3 ${
                    isDarkMode ? 'text-slate-200' : 'text-gray-800'
                  }`}>
                    🎯 Matching Colors
                  </h4>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {matches.map((match, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          isDarkMode 
                            ? 'bg-slate-700 hover:bg-slate-600' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        onClick={() => onColorSelect?.(match)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-8 h-8 rounded border-2 border-white shadow"
                              style={{ 
                                backgroundColor: `hsl(${match.color1.h * 360}, ${match.color1.s * 100}%, ${match.color1.b * 50}%)` 
                              }}
                            />
                            <div>
                              <div className={`font-medium ${
                                isDarkMode ? 'text-slate-200' : 'text-gray-800'
                              }`}>
                                {match.make} {match.colorName}
                              </div>
                              <div className={`text-xs ${
                                isDarkMode ? 'text-slate-400' : 'text-gray-600'
                              }`}>
                                {match.colorType}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <label
                htmlFor="enhanced-image-upload"
                className={`inline-block px-3 py-1 text-sm rounded-md cursor-pointer transition-colors ${
                  isDarkMode
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Try Different Image
              </label>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default EnhancedImageColorExtractor