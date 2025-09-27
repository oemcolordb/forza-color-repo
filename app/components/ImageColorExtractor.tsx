import React, { useState, useCallback } from 'react'
import type { CarColor } from '../types/color'

interface ImageColorExtractorProps {
  colors: CarColor[]
  onColorsFound: (matchedColors: CarColor[]) => void
  isDarkMode: boolean
  showTutorial?: boolean
  onTutorialClose?: () => void
}

interface ExtractedColor {
  r: number
  g: number
  b: number
  h: number
  s: number
  l: number
  count: number
}

const ImageColorExtractor: React.FC<ImageColorExtractorProps> = ({
  colors,
  onColorsFound,
  isDarkMode,
  showTutorial = false,
  onTutorialClose
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }
    return [h, s, l]
  }

  const extractColorsFromImage = useCallback((imageData: ImageData): ExtractedColor[] => {
    const colorMap = new Map<string, number>()
    const data = imageData.data

    // Sample every 4th pixel for performance
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const alpha = data[i + 3]

      if (alpha < 128) continue // Skip transparent pixels

      const key = `${Math.floor(r/10)*10}-${Math.floor(g/10)*10}-${Math.floor(b/10)*10}`
      colorMap.set(key, (colorMap.get(key) || 0) + 1)
    }

    return Array.from(colorMap.entries())
      .map(([key, count]) => {
        const [r, g, b] = key.split('-').map(Number)
        const [h, s, l] = rgbToHsl(r, g, b)
        return { r, g, b, h, s, l, count }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [])

  const findMatchingColors = useCallback((extractedColors: ExtractedColor[]): CarColor[] => {
    const matches: Array<{ color: CarColor; score: number }> = []

    extractedColors.forEach(extracted => {
      colors.forEach(carColor => {
        // Convert HSB to HSL for comparison
        const carH = carColor.color1.h
        const carS = carColor.color1.s
        const carB = carColor.color1.b
        const carL = carB * (1 - carS / 2)
        const carSHsl = carL === 0 || carL === 1 ? 0 : (carB - carL) / Math.min(carL, 1 - carL)

        // Calculate color distance
        const hDiff = Math.min(Math.abs(extracted.h - carH), 1 - Math.abs(extracted.h - carH))
        const sDiff = Math.abs(extracted.s - carSHsl)
        const lDiff = Math.abs(extracted.l - carL)

        const distance = Math.sqrt(hDiff * hDiff + sDiff * sDiff + lDiff * lDiff)
        const score = (1 - distance) * extracted.count

        if (distance < 0.3) { // Threshold for similarity
          matches.push({ color: carColor, score })
        }
      })
    })

    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map(match => match.color)
  }, [colors])

  const validateFile = useCallback((file: File): string | null => {
    // Check file type - support all common image formats
    const validTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 
      'image/bmp', 'image/tiff', 'image/svg+xml', 'image/avif', 'image/heic'
    ]
    
    if (!validTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, GIF, WebP, BMP, TIFF, SVG, AVIF, HEIC)'
    }
    
    // Check file size - allow up to 50MB for large images
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return 'File size too large. Please upload an image smaller than 50MB.'
    }
    
    return null
  }, [])

  const processImage = useCallback(async (file: File) => {
    setIsProcessing(true)
    setError(null)
    
    // Validate file first
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setIsProcessing(false)
      return
    }
    
    try {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = URL.createObjectURL(file)
      })

      // Resize for performance
      const maxSize = 200
      const scale = Math.min(maxSize / img.width, maxSize / img.height)
      canvas.width = img.width * scale
      canvas.height = img.height * scale

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      const extracted = extractColorsFromImage(imageData)
      setExtractedColors(extracted)

      const matchedColors = findMatchingColors(extracted)
      onColorsFound(matchedColors)

      URL.revokeObjectURL(img.src)
    } catch (error) {
      console.error('Error processing image:', error)
      setError('Failed to process image. Please try a different image.')
    } finally {
      setIsProcessing(false)
    }
  }, [onColorsFound, extractColorsFromImage, findMatchingColors, validateFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      processImage(imageFile)
    }
  }, [processImage])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processImage(file)
    }
  }, [processImage])

  return (
    <>
      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className={`mb-4 p-4 rounded-lg border-l-4 ${
          isDarkMode 
            ? 'bg-blue-900/30 border-blue-400 text-blue-100' 
            : 'bg-blue-50 border-blue-400 text-blue-800'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold mb-2">How to use Image Color Matching:</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Upload a photo (car, color swatch, or any image)</li>
                <li>We'll extract the dominant colors automatically</li>
                <li>See matching automotive paint colors from 10,000+ options</li>
                <li>Click any result to view detailed color information</li>
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
          ? 'border-slate-600 bg-slate-800/50' 
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
          Find Matching Car Colors
        </h3>
        
        <p className={`text-sm mb-4 ${
          isDarkMode ? 'text-slate-400' : 'text-gray-600'
        }`}>
          Upload an image to extract colors and find matching automotive paints
        </p>

        <input
          type="file"
          accept="image/*,.heic,.avif"
          onChange={handleFileInput}
          className="hidden"
          id="image-upload"
          disabled={isProcessing}
        />
        
        {error && (
          <div className={`mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-50 text-red-800'}`}>
            {error}
          </div>
        )}
        
        <label
          htmlFor="image-upload"
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

        {extractedColors.length > 0 && (
          <div className="mt-4">
            <p className={`text-sm mb-2 ${
              isDarkMode ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Extracted Colors:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {extractedColors.slice(0, 6).map((color, index) => (
                <div
                  key={index}
                  className="w-8 h-8 rounded border-2 border-white shadow-sm"
                  style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }}
                  title={`RGB(${color.r}, ${color.g}, ${color.b})`}
                />
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  )
}

export default ImageColorExtractor