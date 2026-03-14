'use client'

import React, { useState, useRef } from 'react'
import { Location } from './types'

interface MapCalibratorProps {
  locations: Location[]
  onCalibrationComplete: (_transform: CoordinateTransform) => void
  onClose: () => void
}

export interface CoordinateTransform {
  offsetX: number
  offsetY: number
  scaleX: number
  scaleY: number
}

interface DetectedPin {
  x: number
  y: number
  color: string
  confidence: number
}

const MapCalibrator: React.FC<MapCalibratorProps> = ({
  locations,
  onCalibrationComplete,
  onClose,
}) => {
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [detectedPins, setDetectedPins] = useState<DetectedPin[]>([])
  const [transform, setTransform] = useState<CoordinateTransform>({
    offsetX: 0,
    offsetY: 0,
    scaleX: 1,
    scaleY: 1,
  })
  const [matchedPairs, setMatchedPairs] = useState<number>(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = e => {
      setReferenceImage(e.target?.result as string)
      setDetectedPins([])
      setMatchedPairs(0)
    }
    reader.readAsDataURL(file)
  }

  const analyzeImage = async () => {
    if (!referenceImage || !canvasRef.current || !imageRef.current) return

    setAnalyzing(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = imageRef.current
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    ctx.drawImage(img, 0, 0)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const detected = detectPins(imageData, canvas.width, canvas.height)
    
    setDetectedPins(detected)

    // Auto-calculate transformation if we have enough pins
    if (detected.length >= 3) {
      const calculatedTransform = calculateTransform(detected, locations)
      setTransform(calculatedTransform)
      
      // Count how many locations match detected pins
      const matches = countMatches(detected, locations, calculatedTransform)
      setMatchedPairs(matches)
    }

    setAnalyzing(false)
  }

  const detectPins = (imageData: ImageData, width: number, height: number): DetectedPin[] => {
    const pins: DetectedPin[] = []
    const data = imageData.data
    const threshold = 150 // Brightness threshold for pin detection
    const minClusterSize = 5 // Minimum pixels to consider a pin
    const visited = new Set<number>()

    // Scan for bright colored pixels (pins are usually bright markers)
    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const idx = (y * width + x) * 4
        const r = data[idx]
        const g = data[idx + 1]
        const b = data[idx + 2]
        
        // Check if pixel is bright and colorful (likely a pin)
        const brightness = (r + g + b) / 3
        const saturation = Math.max(r, g, b) - Math.min(r, g, b)
        
        if (brightness > threshold && saturation > 50 && !visited.has(idx)) {
          // Found a potential pin, do flood fill to get cluster
          const cluster = floodFill(data, width, height, x, y, visited)
          
          if (cluster.length >= minClusterSize) {
            // Calculate center of cluster
            const centerX = cluster.reduce((sum, p) => sum + p.x, 0) / cluster.length
            const centerY = cluster.reduce((sum, p) => sum + p.y, 0) / cluster.length
            
            // Get dominant color
            const avgR = cluster.reduce((sum, p) => sum + p.r, 0) / cluster.length
            const avgG = cluster.reduce((sum, p) => sum + p.g, 0) / cluster.length
            const avgB = cluster.reduce((sum, p) => sum + p.b, 0) / cluster.length
            
            pins.push({
              x: (centerX / width) * 100,
              y: (centerY / height) * 100,
              color: `rgb(${Math.round(avgR)}, ${Math.round(avgG)}, ${Math.round(avgB)})`,
              confidence: Math.min(cluster.length / 20, 1),
            })
          }
        }
      }
    }

    return pins
  }

  const floodFill = (
    data: Uint8ClampedArray,
    width: number,
    height: number,
    startX: number,
    startY: number,
    visited: Set<number>
  ): Array<{ x: number; y: number; r: number; g: number; b: number }> => {
    const cluster: Array<{ x: number; y: number; r: number; g: number; b: number }> = []
    const queue: Array<{ x: number; y: number }> = [{ x: startX, y: startY }]
    const startIdx = (startY * width + startX) * 4
    const targetR = data[startIdx]
    const targetG = data[startIdx + 1]
    const targetB = data[startIdx + 2]
    const colorTolerance = 40

    while (queue.length > 0 && cluster.length < 100) {
      const { x, y } = queue.shift()!
      const idx = (y * width + x) * 4

      if (visited.has(idx)) continue
      if (x < 0 || x >= width || y < 0 || y >= height) continue

      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]

      // Check if color is similar
      if (
        Math.abs(r - targetR) <= colorTolerance &&
        Math.abs(g - targetG) <= colorTolerance &&
        Math.abs(b - targetB) <= colorTolerance
      ) {
        visited.add(idx)
        cluster.push({ x, y, r, g, b })

        // Add neighbors
        queue.push({ x: x + 1, y })
        queue.push({ x: x - 1, y })
        queue.push({ x, y: y + 1 })
        queue.push({ x, y: y - 1 })
      }
    }

    return cluster
  }

  const calculateTransform = (
    detected: DetectedPin[],
    locations: Location[]
  ): CoordinateTransform => {
    // Use least squares to find best fit transformation
    // We'll match detected pins to expected locations
    
    if (detected.length < 3) {
      return { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 }
    }

    // Find closest matches between detected pins and expected locations
    const pairs: Array<{ detected: DetectedPin; expected: Location }> = []
    
    for (const pin of detected) {
      let closestLocation: Location | null = null
      let minDistance = Infinity

      for (const loc of locations) {
        const dx = pin.x - loc.coordinates.x
        const dy = pin.y - loc.coordinates.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < minDistance) {
          minDistance = distance
          closestLocation = loc
        }
      }

      if (closestLocation && minDistance < 30) {
        pairs.push({ detected: pin, expected: closestLocation })
      }
    }

    if (pairs.length < 3) {
      return { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 }
    }

    // Calculate average offset and scale
    let sumOffsetX = 0
    let sumOffsetY = 0

    for (const pair of pairs) {
      sumOffsetX += pair.detected.x - pair.expected.coordinates.x
      sumOffsetY += pair.detected.y - pair.expected.coordinates.y
    }

    const offsetX = sumOffsetX / pairs.length
    const offsetY = sumOffsetY / pairs.length

    // Calculate scale based on spread of points
    const detectedSpreadX = Math.max(...pairs.map(p => p.detected.x)) - Math.min(...pairs.map(p => p.detected.x))
    const expectedSpreadX = Math.max(...pairs.map(p => p.expected.coordinates.x)) - Math.min(...pairs.map(p => p.expected.coordinates.x))
    const detectedSpreadY = Math.max(...pairs.map(p => p.detected.y)) - Math.min(...pairs.map(p => p.detected.y))
    const expectedSpreadY = Math.max(...pairs.map(p => p.expected.coordinates.y)) - Math.min(...pairs.map(p => p.expected.coordinates.y))

    const scaleX = expectedSpreadX > 0 ? detectedSpreadX / expectedSpreadX : 1
    const scaleY = expectedSpreadY > 0 ? detectedSpreadY / expectedSpreadY : 1

    return {
      offsetX: -offsetX,
      offsetY: -offsetY,
      scaleX: scaleX || 1,
      scaleY: scaleY || 1,
    }
  }

  const countMatches = (
    detected: DetectedPin[],
    locations: Location[],
    transform: CoordinateTransform
  ): number => {
    let matches = 0
    const matchThreshold = 5 // 5% tolerance

    for (const loc of locations) {
      const transformedX = (loc.coordinates.x + transform.offsetX) * transform.scaleX
      const transformedY = (loc.coordinates.y + transform.offsetY) * transform.scaleY

      for (const pin of detected) {
        const dx = Math.abs(pin.x - transformedX)
        const dy = Math.abs(pin.y - transformedY)

        if (dx < matchThreshold && dy < matchThreshold) {
          matches++
          break
        }
      }
    }

    return matches
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">🎯 Smart Map Calibration</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
              <h3 className="font-bold text-blue-300 mb-2">📋 How it works:</h3>
              <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                <li>Upload a reference map image that has location pins already marked on it</li>
                <li>The system will automatically detect the pin positions</li>
                <li>It will calculate the coordinate transformation needed to align your data</li>
                <li>Review the results and apply the calibration</li>
              </ol>
            </div>

            {/* Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload Reference Map (with pins marked)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
            </div>

            {/* Preview and Analysis */}
            {referenceImage && (
              <div className="space-y-4">
                <div className="relative bg-gray-800 rounded-lg p-4">
                  <img
                    ref={imageRef}
                    src={referenceImage}
                    alt="Reference map"
                    className="w-full h-auto rounded"
                    onLoad={() => {
                      // Auto-analyze when image loads
                      setTimeout(analyzeImage, 100)
                    }}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {detectedPins.length > 0 && (
                    <div className="absolute inset-0 pointer-events-none">
                      {detectedPins.map((pin, idx) => (
                        <div
                          key={idx}
                          className="absolute w-3 h-3 rounded-full border-2 border-white shadow-lg"
                          style={{
                            left: `${pin.x}%`,
                            top: `${pin.y}%`,
                            backgroundColor: pin.color,
                            opacity: pin.confidence,
                            transform: 'translate(-50%, -50%)',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={analyzeImage}
                  disabled={analyzing}
                  className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                >
                  {analyzing ? '🔍 Analyzing...' : '🔍 Re-analyze Image'}
                </button>

                {/* Results */}
                {detectedPins.length > 0 && (
                  <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                    <h3 className="font-bold text-white">📊 Analysis Results</h3>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Pins Detected</div>
                        <div className="text-xl font-bold text-green-400">{detectedPins.length}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Matched Locations</div>
                        <div className="text-xl font-bold text-blue-400">
                          {matchedPairs} / {locations.length}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-900 rounded p-3 space-y-2">
                      <div className="text-xs font-mono text-gray-400">Calculated Transform:</div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>Offset X: <span className="text-blue-400">{transform.offsetX.toFixed(2)}%</span></div>
                        <div>Offset Y: <span className="text-blue-400">{transform.offsetY.toFixed(2)}%</span></div>
                        <div>Scale X: <span className="text-green-400">{transform.scaleX.toFixed(3)}</span></div>
                        <div>Scale Y: <span className="text-green-400">{transform.scaleY.toFixed(3)}</span></div>
                      </div>
                    </div>

                    {matchedPairs >= 3 && (
                      <button
                        onClick={() => onCalibrationComplete(transform)}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                      >
                        ✅ Apply Calibration ({matchedPairs} matches)
                      </button>
                    )}

                    {matchedPairs < 3 && (
                      <div className="bg-yellow-900/30 border border-yellow-700/50 rounded p-3 text-sm text-yellow-300">
                        ⚠️ Not enough matches found. Try a different reference image with clearer pin markers.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapCalibrator
