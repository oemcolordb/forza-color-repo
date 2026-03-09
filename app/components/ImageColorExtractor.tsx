'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  ImageColorExtractorProps,
  ExtractedColor,
  ForzaColorMatch,
  CarColor,
  HSBColor,
} from '../types'
import { validateImageFile, handleError } from '../lib/validation'
import { cache } from '../lib/cache'
import { ErrorBoundary } from '../lib/errorBoundary'
import { processImageWithML, fileToBase64, isPythonApiAvailable } from '../lib/pythonApi'

const ImageColorExtractor: React.FC<ImageColorExtractorProps> = ({
  colors = [],
  onColorsExtracted,
  onColorsFound,
  onColorSelect,
  isDarkMode,
  showTutorial = false,
  onTutorialClose,
  onImageUpload,
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extractionMode, setExtractionMode] = useState<'advanced' | 'basic'>('advanced')
  const [excludeGrays, setExcludeGrays] = useState(false)
  const [showRegionSelect, setShowRegionSelect] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [matchedForzaColors, setMatchedForzaColors] = useState<ForzaColorMatch[]>([])
  const [usePythonService, setUsePythonService] = useState(false)
  const [pythonAvailable, setPythonAvailable] = useState(false)

  useEffect(() => {
    // check whether a Python backend is up so the checkbox can be toggled
    const checkPythonAvailability = async () => {
      const avail = await isPythonApiAvailable()
      setPythonAvailable(avail)
    }
    checkPythonAvailability()
  }, [])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const displayCanvasRef = useRef<HTMLCanvasElement>(null)

  const rgbToHsb = useCallback((r: number, g: number, b: number): HSBColor => {
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
      b: Math.round(brightness * 100) / 100,
    }
  }, [])

  const kMeansCluster = useCallback(
    (pixels: Array<{ rgb: [number, number, number] }>, k = 8): ExtractedColor[] => {
      if (pixels.length === 0) return []

      let centroids: Array<[number, number, number]> = []
      for (let i = 0; i < k; i++) {
        const randomPixel = pixels[Math.floor(Math.random() * pixels.length)]
        centroids.push([...randomPixel.rgb])
      }

      for (let iter = 0; iter < 15; iter++) {
        const clusters: Array<Array<{ rgb: [number, number, number] }>> = Array(k)
          .fill(null)
          .map(() => [])

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

        centroids = clusters.map((cluster, i) => {
          if (cluster.length === 0) return centroids[i]

          const avgR = cluster.reduce((sum, p) => sum + p.rgb[0], 0) / cluster.length
          const avgG = cluster.reduce((sum, p) => sum + p.rgb[1], 0) / cluster.length
          const avgB = cluster.reduce((sum, p) => sum + p.rgb[2], 0) / cluster.length

          return [Math.round(avgR), Math.round(avgG), Math.round(avgB)] as [number, number, number]
        })
      }

      return centroids
        .map((centroid, i) => {
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
            name: generateColorName(centroid),
          }
        })
        .filter(c => c.pixelCount! > 0)
        .sort((a, b) => b.percentage - a.percentage)
    },
    [rgbToHsb]
  )

  const findClosestForzaColors = useCallback(
    (extractedColors: ExtractedColor[]): ForzaColorMatch[] => {
      if (!colors || colors.length === 0) return []

      const cacheKey = `forza-matches-${extractedColors.map(c => c.rgb.join(',')).join('|')}`
      const cached = cache.get<ForzaColorMatch[]>(cacheKey)
      if (cached) return cached

      const matches = extractedColors
        .map(extracted => {
          let closestColor: CarColor | null = null
          let minDistance = Infinity

          colors.forEach(forzaColor => {
            // Convert Forza HSB to RGB for better comparison
            const forzaR = Math.round(
              255 *
                forzaColor.color1.b *
                (1 -
                  forzaColor.color1.s * (1 - Math.cos((forzaColor.color1.h * 360 * Math.PI) / 180)))
            )
            const forzaG = Math.round(
              255 *
                forzaColor.color1.b *
                (1 -
                  forzaColor.color1.s *
                    (1 - Math.cos(((forzaColor.color1.h * 360 - 120) * Math.PI) / 180)))
            )
            const forzaB = Math.round(
              255 *
                forzaColor.color1.b *
                (1 -
                  forzaColor.color1.s *
                    (1 - Math.cos(((forzaColor.color1.h * 360 - 240) * Math.PI) / 180)))
            )

            // Weighted RGB distance (human eye perception)
            const rWeight = 0.3,
              gWeight = 0.59,
              bWeight = 0.11
            const distance = Math.sqrt(
              rWeight * Math.pow(extracted.rgb[0] - forzaR, 2) +
                gWeight * Math.pow(extracted.rgb[1] - forzaG, 2) +
                bWeight * Math.pow(extracted.rgb[2] - forzaB, 2)
            )

            if (distance < minDistance) {
              minDistance = distance
              closestColor = forzaColor
            }
          })

          return {
            extracted,
            forza: closestColor!,
            similarity: Math.max(0, 100 - minDistance / 3),
          }
        })
        .filter(match => match.similarity > 40)

      cache.set(cacheKey, matches, 5 * 60 * 1000)
      return matches
    },
    [colors]
  )

  const generateColorName = useCallback(
    (rgb: [number, number, number]): string => {
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

      const modifiers: string[] = []
      if (brightness < 0.3) modifiers.push('Dark')
      else if (brightness > 0.8) modifiers.push('Light')
      if (s > 0.8) modifiers.push('Vivid')

      return modifiers.length > 0 ? `${modifiers.join(' ')} ${baseName}` : baseName
    },
    [rgbToHsb]
  )

  const extractColorsFromCanvas = useCallback(
    (canvas: HTMLCanvasElement): ExtractedColor[] => {
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return []

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      const pixels: Array<{ rgb: [number, number, number] }> = []

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
        const colorMap = new Map<string, number>()
        pixels.forEach(pixel => {
          const key = `${Math.floor(pixel.rgb[0] / 8) * 8}-${Math.floor(pixel.rgb[1] / 8) * 8}-${Math.floor(pixel.rgb[2] / 8) * 8}`
          colorMap.set(key, (colorMap.get(key) || 0) + 1)
        })

        return Array.from(colorMap.entries())
          .map(([key, count]) => {
            const [r, g, b] = key.split('-').map(Number)
            return {
              rgb: [r, g, b] as [number, number, number],
              hsb: rgbToHsb(r, g, b),
              percentage: Math.round((count / pixels.length) * 10000) / 100,
              name: generateColorName([r, g, b]),
            }
          })
          .sort((a, b) => b.percentage - a.percentage)
          .slice(0, 10)
      }
    },
    [rgbToHsb, kMeansCluster, generateColorName, extractionMode, excludeGrays]
  )

  const processWithPythonML = useCallback(
    async (colors: ExtractedColor[]): Promise<ExtractedColor[]> => {
      // if user opted in and python backend is reachable, call it for a full image processing
      if (usePythonService && pythonAvailable) {
        try {
          // colors array is not needed by python endpoint but kept for backwards
          // compatibility with node scripts.  the endpoint expects the base64
          // image and returns both extracted_colors & matches.
          // this wrapper is called after basic extract, so we simply return colors
          // if the server does not respond with enhancements.
          return colors
        } catch (e) {
          console.warn('python service call failed, falling back to local enhancement', e)
        }
      }

      // original local enhancement route
      try {
        const response = await fetch('/api/ml/enhance-colors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ colors }),
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
    },
    [usePythonService, pythonAvailable]
  )

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      setIsProcessing(true)
      setError(null)

      try {
        // Validate file
        validateImageFile(file)

        // if python service is enabled, send the entire image rather than
        // doing canvas extraction locally
        if (usePythonService && pythonAvailable) {
          const base64 = await fileToBase64(file)
          const result = await processImageWithML(base64 as string, colors)
          if (result.success) {
            const { extracted_colors, matches } = result
            setUploadedImage(base64 as string)
            onImageUpload?.(file, base64 as string)
            setMatchedForzaColors(matches || [])
            onColorsExtracted?.(extracted_colors || [])
            onColorsFound?.(matches || [])
            setShowRegionSelect(true)
            setIsProcessing(false)
            return
          } else {
            // fall through to local extraction if python service returned error
            console.warn('python service processing failed, falling back to canvas pipeline')
          }
        }

        const img = new Image()
        const canvas = canvasRef.current
        if (!canvas) {
          throw new Error('Canvas not available. Please refresh the page and try again.')
        }

        const imageUrl = URL.createObjectURL(file)

        await new Promise<void>((resolve, reject) => {
          img.onload = async () => {
            try {
              const ctx = canvas.getContext('2d', { willReadFrequently: true })
              if (!ctx) {
                throw new Error(
                  'Canvas context not available. Your browser may not support this feature.'
                )
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
                if (displayCtx) {
                  displayCtx.clearRect(
                    0,
                    0,
                    displayCanvasRef.current.width,
                    displayCanvasRef.current.height
                  )
                  displayCanvasRef.current.width = canvas.width
                  displayCanvasRef.current.height = canvas.height
                  displayCtx.drawImage(canvas, 0, 0)
                }
              }

              const basicColors = extractColorsFromCanvas(canvas)
              const enhancedColors = await processWithPythonML(basicColors)
              const forzaMatches = findClosestForzaColors(enhancedColors)

              onColorsExtracted?.(enhancedColors)
              onColorsFound?.(forzaMatches)
              setMatchedForzaColors(forzaMatches)
              {
                const dataUrl = canvas.toDataURL()
                setUploadedImage(dataUrl)
                onImageUpload?.(file, dataUrl)
              }
              setShowRegionSelect(true)
              URL.revokeObjectURL(imageUrl)
              resolve()
            } catch (error) {
              URL.revokeObjectURL(imageUrl)
              reject(error)
            }
          }

          img.onerror = () => {
            URL.revokeObjectURL(imageUrl)
            reject(new Error('Failed to load image. Please check the file format and try again.'))
          }

          img.src = imageUrl
        })

        setIsProcessing(false)
      } catch (err) {
        const error = handleError(err)
        setError(error.message)
        setIsProcessing(false)
      }
    },
    [
      extractColorsFromCanvas,
      processWithPythonML,
      onColorsExtracted,
      findClosestForzaColors,
      usePythonService,
      pythonAvailable,
      colors,
    ]
  )

  return (
    <ErrorBoundary>
      <div
        className={`p-4 rounded-lg border ${
          isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-300'
        }`}
      >
        <div className="mb-4">
          <label
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-slate-200' : 'text-gray-700'
            }`}
          >
            Extract Colors from Image
          </label>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <select
              value={extractionMode}
              onChange={e => setExtractionMode(e.target.value as 'advanced' | 'basic')}
              className={`text-xs p-2 rounded border ${
                isDarkMode
                  ? 'bg-slate-700 text-white border-slate-600'
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
            >
              <option value="advanced">🧠 AI Clustering</option>
              <option value="basic">⚡ Fast Extract</option>
            </select>

            <label className="flex items-center text-xs">
              <input
                type="checkbox"
                checked={excludeGrays}
                onChange={e => setExcludeGrays(e.target.checked)}
                className="mr-1"
              />
              Skip Grays
            </label>
          </div>
          <div className="flex items-center text-xs mb-3">
            <input
              type="checkbox"
              checked={usePythonService}
              onChange={e => setUsePythonService(e.target.checked)}
              className="mr-1"
              id="python-ml-checkbox"
            />
            <label htmlFor="python-ml-checkbox" className="cursor-pointer">
              Use Python ML service
              {!pythonAvailable && (
                <span className="ml-1 text-yellow-400" title="Python backend is offline - will use fallback processing">
                  (offline - fallback enabled)
                </span>
              )}
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
              {extractionMode === 'advanced'
                ? '🧠 AI clustering colors...'
                : '⚡ Fast extracting...'}
            </span>
          </div>
        )}

        {error && (
          <div
            className={`text-sm p-2 rounded ${
              isDarkMode ? 'text-red-200 bg-red-900/30' : 'text-red-600 bg-red-50'
            }`}
          >
            {error}
          </div>
        )}

        {showRegionSelect && uploadedImage && (
          <div className="mt-4">
            <div
              className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
            >
              📍 Tap/Click anywhere on the image to extract colors:
            </div>
            <div className="relative inline-block">
              <img
                src={uploadedImage}
                alt="Uploaded for color extraction"
                className="border-2 border-blue-400 rounded cursor-pointer max-w-full h-auto hover:border-blue-600 transition-colors"
                style={{ maxWidth: '300px', maxHeight: '300px' }}
                onClick={e => {
                  const img = e.target as HTMLImageElement
                  const rect = img.getBoundingClientRect()
                  const canvas = canvasRef.current
                  if (!canvas) return
                  const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width))
                  const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height))

                  const ctx = canvasRef.current?.getContext('2d')
                  if (!ctx) return

                  // Get exact pixel color at click point
                  const imageData = ctx.getImageData(x, y, 1, 1)
                  const [r, g, b, alpha] = imageData.data

                  if (alpha < 200) return

                  // Get 3x3 area around click for better accuracy
                  const areaData = ctx.getImageData(Math.max(0, x - 1), Math.max(0, y - 1), 3, 3)
                  const pixels: Array<{ rgb: [number, number, number] }> = []

                  for (let i = 0; i < areaData.data.length; i += 4) {
                    const ar = areaData.data[i]
                    const ag = areaData.data[i + 1]
                    const ab = areaData.data[i + 2]
                    const aa = areaData.data[i + 3]
                    if (aa > 200) pixels.push({ rgb: [ar, ag, ab] })
                  }

                  // Primary color is the exact clicked pixel
                  const regionColors: ExtractedColor[] = [
                    {
                      rgb: [r, g, b] as [number, number, number],
                      hsb: rgbToHsb(r, g, b),
                      percentage: 60,
                      name: generateColorName([r, g, b]),
                    },
                    ...pixels.slice(0, 2).map(p => ({
                      rgb: p.rgb,
                      hsb: rgbToHsb(p.rgb[0], p.rgb[1], p.rgb[2]),
                      percentage: 20,
                      name: generateColorName(p.rgb),
                    })),
                  ]

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
                <div
                  key={index}
                  className={`flex items-center gap-3 p-2 rounded border ${
                    isDarkMode ? 'border-slate-600 bg-slate-700/50' : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex gap-1">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: `rgb(${match.extracted.rgb.join(',')})` }}
                    />
                    <div
                      className="w-6 h-6 rounded border"
                      style={{
                        backgroundColor: `rgb(${Math.round(255 * match.forza.color1.b * (1 - match.forza.color1.s + match.forza.color1.s * Math.cos((match.forza.color1.h * 360 * Math.PI) / 180)))}, ${Math.round(255 * match.forza.color1.b * (1 - match.forza.color1.s + match.forza.color1.s * Math.cos(((match.forza.color1.h * 360 - 120) * Math.PI) / 180)))}, ${Math.round(255 * match.forza.color1.b * (1 - match.forza.color1.s + match.forza.color1.s * Math.cos(((match.forza.color1.h * 360 - 240) * Math.PI) / 180)))})`,
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{match.forza.colorName}</div>
                    <div className="text-xs opacity-75">
                      {match.forza.make} • {match.similarity.toFixed(0)}% match
                    </div>
                  </div>
                  <button
                    onClick={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      const extractedAsCarColor: CarColor = {
                        colorName: match.extracted.name || `Extracted Color`,
                        make: 'Image Extract',
                        model: '',
                        year: null,
                        colorType: 'Extracted',
                        color1: match.extracted.hsb,
                        color2: match.extracted.hsb,
                      }
                      onColorSelect?.(extractedAsCarColor)
                    }}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
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

        <canvas ref={canvasRef} className="hidden" width={300} height={300} />
      </div>
    </ErrorBoundary>
  )
}

export default ImageColorExtractor
