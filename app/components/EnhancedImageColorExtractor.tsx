import React, { useState, useCallback } from 'react'
import type { CarColor } from '../types/color'
import { processImageWithML, fileToBase64, isPythonApiAvailable } from '../lib/pythonApi'

interface EnhancedImageColorExtractorProps {
  colors: CarColor[]
  onColorsFound: (matchedColors: CarColor[]) => void
  onColorSelect?: (color: CarColor) => void
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
  v: number
  percentage: number
  count: number
  method: string
  automotive_score?: number
}

interface ColorMatch extends CarColor {
  similarity_score: number
  distance: number
  match_type: string
}

const EnhancedImageColorExtractor: React.FC<EnhancedImageColorExtractorProps> = ({
  colors,
  onColorsFound,
  onColorSelect,
  isDarkMode,
  showTutorial = false,
  onTutorialClose
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([])
  const [matches, setMatches] = useState<ColorMatch[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pythonApiAvailable, setPythonApiAvailable] = useState(false)
  const [processingStats, setProcessingStats] = useState<any>(null)

  // Check Python API availability on mount
  React.useEffect(() => {
    isPythonApiAvailable().then(setPythonApiAvailable)
  }, [])

  const processImage = useCallback(async (file: File) => {
    if (!pythonApiAvailable) {
      setError('Python ML services not available. Using basic extraction.')
      return
    }

    setIsProcessing(true)
    setError(null)
    
    try {
      // Convert file to base64
      const base64Data = await fileToBase64(file)
      
      // Process with Python ML service
      const result = await processImageWithML(base64Data, colors)
      
      if (result.success && result.data) {
        const { extracted_colors, matches: colorMatches, extraction_stats } = result.data
        
        setExtractedColors(extracted_colors)
        setMatches(colorMatches)
        setProcessingStats(extraction_stats)
        
        // Convert matches to CarColor format for parent component
        const carColorMatches = colorMatches.map((match: ColorMatch) => ({
          make: match.make,
          model: match.model,
          year: match.year,
          colorName: match.colorName,
          colorType: match.colorType,
          color1: match.color1,
          color2: match.color2
        }))
        
        onColorsFound(carColorMatches)
        
      } else {
        setError(result.error || 'Failed to process image')
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Image processing failed')
    } finally {
      setIsProcessing(false)
    }
  }, [colors, onColorsFound, pythonApiAvailable])

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
      {/* Enhanced Tutorial */}
      {showTutorial && (
        <div className={`mb-4 p-4 rounded-lg border-l-4 ${
          isDarkMode 
            ? 'bg-blue-900/30 border-blue-400 text-blue-100' 
            : 'bg-blue-50 border-blue-400 text-blue-800'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold mb-2">🧠 Enhanced ML Color Matching:</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Upload any image (car photos work best)</li>
                <li>Advanced ML algorithms extract automotive-relevant colors</li>
                <li>Perceptual color matching finds the closest automotive paints</li>
                <li>Get similarity scores and match quality ratings</li>
                <li>View extraction statistics and processing methods</li>
              </ol>
              {!pythonApiAvailable && (
                <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-xs">
                  ⚠️ Python ML services not available. Using basic extraction.
                </div>
              )}
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
            {pythonApiAvailable ? '🧠' : '🎨'}
          </div>
          
          <h3 className={`text-lg font-semibold mb-2 ${
            isDarkMode ? 'text-slate-200' : 'text-gray-800'
          }`}>
            {pythonApiAvailable ? 'ML-Powered Color Matching' : 'Basic Color Matching'}
          </h3>
          
          <p className={`text-sm mb-4 ${
            isDarkMode ? 'text-slate-400' : 'text-gray-600'
          }`}>
            {pythonApiAvailable 
              ? 'Advanced ML algorithms extract and match automotive colors'
              : 'Upload an image to extract colors and find matching automotive paints'
            }
          </p>

          <input
            type="file"
            accept="image/*,.heic,.avif"
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
              {isProcessing ? 'Processing with ML...' : 'Choose Image'}
            </label>
          ) : (
            <div className="w-full text-left">
              {/* Processing Stats */}
              {processingStats && (
                <div className={`mb-4 p-3 rounded-lg ${
                  isDarkMode ? 'bg-slate-700' : 'bg-gray-100'
                }`}>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Extracted Colors:</span>
                      <span className="font-medium">{processingStats.total_extracted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Automotive Matches:</span>
                      <span className="font-medium">{processingStats.total_matches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing Method:</span>
                      <span className="font-medium">{processingStats.processing_method}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Extracted Colors */}
              <h4 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-slate-200' : 'text-gray-800'
              }`}>
                🎨 Extracted Colors {pythonApiAvailable && '(ML Enhanced)'}
              </h4>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-4">
                {extractedColors.map((color, index) => {
                  const hexCode = `#${color.r.toString(16).padStart(2,'0')}${color.g.toString(16).padStart(2,'0')}${color.b.toString(16).padStart(2,'0')}`
                  
                  // Create CarColor object for selection
                  const carColor: CarColor = {
                    make: 'Extracted',
                    model: 'Image Color',
                    year: null,
                    colorName: `${color.method} Color ${index + 1}`,
                    colorType: 'Extracted',
                    color1: { h: color.h, s: color.s, b: color.v },
                    color2: { h: color.h, s: color.s, b: color.v }
                  }
                  
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <button
                        className="w-12 h-12 rounded-lg border-2 border-white shadow-lg transition-all hover:scale-110 hover:shadow-xl cursor-pointer relative"
                        style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }}
                        onClick={() => onColorSelect?.(carColor)}
                        title={`${color.method} extraction - ${color.percentage.toFixed(1)}% of image`}
                      >
                        {pythonApiAvailable && color.automotive_score && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full text-xs flex items-center justify-center text-white">
                            ✓
                          </div>
                        )}
                      </button>
                      <span className={`text-xs mt-1 ${
                        isDarkMode ? 'text-slate-400' : 'text-gray-600'
                      }`}>
                        {hexCode}
                      </span>
                      {pythonApiAvailable && (
                        <span className={`text-xs ${
                          isDarkMode ? 'text-slate-500' : 'text-gray-500'
                        }`}>
                          {color.percentage.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* ML Matches */}
              {pythonApiAvailable && matches.length > 0 && (
                <div className="mb-4">
                  <h4 className={`text-lg font-semibold mb-3 ${
                    isDarkMode ? 'text-slate-200' : 'text-gray-800'
                  }`}>
                    🎯 Best Automotive Matches
                  </h4>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {matches.slice(0, 10).map((match, index) => (
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
                                {match.colorType} • {match.match_type}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${
                              getMatchScoreColor(match.similarity_score)
                            }`}>
                              {(match.similarity_score * 100).toFixed(0)}%
                            </div>
                            <div className={`text-xs ${
                              isDarkMode ? 'text-slate-500' : 'text-gray-500'
                            }`}>
                              similarity
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

      {/* API Status Indicator */}
      <div className={`mt-2 text-xs flex items-center justify-center space-x-2 ${
        isDarkMode ? 'text-slate-500' : 'text-gray-500'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          pythonApiAvailable ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span>
          {pythonApiAvailable ? 'ML Services Active' : 'ML Services Offline'}
        </span>
      </div>
    </>
  )
}

// Helper function for match score color coding
function getMatchScoreColor(score: number): string {
  if (score >= 0.9) return 'text-green-500'
  if (score >= 0.7) return 'text-yellow-500'
  if (score >= 0.5) return 'text-orange-500'
  return 'text-red-500'
}

export default EnhancedImageColorExtractor