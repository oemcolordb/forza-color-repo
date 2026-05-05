'use client'

import React, { useState, useEffect } from 'react'
import ImageColorExtractor from '../components/ImageColorExtractor'
import Breadcrumbs from '../components/Breadcrumbs'
import { getColorData } from '../../services/colorData'
import { ForzaColorMatch, CarColor, ExtractedColor } from '../types'
import { EnhancedAuthProvider, useAuth } from '../components/EnhancedAuthProvider'

// Safe JSON parsing helper
function safeJsonParse<T>(jsonString: string, defaultValue: T): T {
  try {
    return JSON.parse(jsonString) as T
  } catch {
    console.warn('Failed to parse JSON:', jsonString)
    return defaultValue
  }
}

interface SavedScan {
  id: string
  imageName: string
  extractedColors: ExtractedColor[]
  matches: ForzaColorMatch[]
  imageData: string
  createdAt: string
}

export default function ImageMatchPage() {
  return (
    <EnhancedAuthProvider>
      <ImageMatchPageInner />
    </EnhancedAuthProvider>
  )
}

function ImageMatchPageInner() {
  const [matches, setMatches] = useState<ForzaColorMatch[]>([])
  const [extracted, setExtracted] = useState<ExtractedColor[]>([])
  const [selected, setSelected] = useState<CarColor | null>(null)
  const [savedScans, setSavedScans] = useState<SavedScan[]>([])
  const [currentImageName, setCurrentImageName] = useState('')
  const [currentImageData, setCurrentImageData] = useState('')
  const [saving, setSaving] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [colorData, setColorData] = useState<CarColor[]>([])
  const [isLoadingColors, setIsLoadingColors] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    // Load color data asynchronously
    getColorData()
      .then((data: CarColor[]) => {
        setColorData(data)
      })
      .catch((error: unknown) => {
        console.warn('Failed to load color data:', error)
        setColorData([])
      })
      .finally(() => {
        setIsLoadingColors(false)
      })
  }, [])

  useEffect(() => {
    if (user) {
      loadSavedScans()
    }
  }, [user])

  const loadSavedScans = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/scans?userId=${user.id}`)
      const data = await response.json()
      setSavedScans(
        data.map((scan: Record<string, string>) => ({
          ...scan,
          extractedColors: safeJsonParse(scan.extractedColors, []),
          matches: safeJsonParse(scan.matches, []),
        }))
      )
    } catch (error) {
      console.error('Failed to load scans:', error)
    }
  }

  const saveScan = async () => {
    if (!user || !currentImageName || matches.length === 0) {
      alert('Please sign in and complete a scan first')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          imageName: currentImageName,
          extractedColors: extracted,
          matches,
          imageData: currentImageData,
        }),
      })

      const result = await response.json()
      if (result.success) {
        alert('Scan saved successfully!')
        loadSavedScans()
      }
    } catch (error) {
      console.error('Failed to save scan:', error)
      alert('Failed to save scan')
    } finally {
      setSaving(false)
    }
  }

  const loadScan = (scan: SavedScan) => {
    setExtracted(scan.extractedColors)
    setMatches(scan.matches)
    setCurrentImageName(scan.imageName)
    setCurrentImageData(scan.imageData)
    setShowHistory(false)
  }

  const deleteScan = async (scanId: string) => {
    if (!user || !confirm('Delete this scan?')) return

    try {
      await fetch(`/api/scans?scanId=${scanId}&userId=${user.id}`, {
        method: 'DELETE',
      })
      loadSavedScans()
    } catch (error) {
      console.error('Failed to delete scan:', error)
    }
  }

  const handleImageUpload = (file: File, dataUrl: string) => {
    setCurrentImageName(file.name)
    setCurrentImageData(dataUrl)
  }

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs isDarkMode={true} />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">🎨 Image-to-Paint Matcher</h1>
            <p className="text-gray-300">
              Upload a photo to extract colors and find matching Forza paints
            </p>
          </div>

          {user && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 bamboo-button rounded-lg font-semibold"
              >
                📚 History ({savedScans.length})
              </button>
              {matches.length > 0 && (
                <button
                  onClick={saveScan}
                  disabled={saving}
                  className="px-4 py-2 bamboo-button rounded-lg font-semibold disabled:opacity-50"
                >
                  {saving ? '💾 Saving...' : '💾 Save Scan'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Uploader */}
          <div className="lg:col-span-2">
            <div className="rounded-xl p-6 shadow-2xl bamboo-surface-dark">
              {isLoadingColors ? (
                <div className="flex items-center justify-center py-12 text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mr-3"></div>
                  Loading color database...
                </div>
              ) : (
                <ImageColorExtractor
                  colors={colorData}
                  onColorsExtracted={setExtracted}
                  onColorsFound={setMatches}
                  onColorSelect={setSelected}
                  isDarkMode={true}
                  showTutorial={false}
                  onImageUpload={handleImageUpload}
                />
              )}
            </div>

            {/* Matches */}
            {matches.length > 0 && (
              <div className="mt-6 rounded-xl p-6 shadow-2xl bamboo-surface-dark">
                <h2 className="text-2xl font-bold mb-4">🎯 Suggested Paints</h2>
                <div className="space-y-3">
                  {matches.slice(0, 10).map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-3 rounded-lg transition-colors cursor-pointer bamboo-surface-dark hover:opacity-95"
                      onClick={() => setSelected(m.forza)}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div
                        className="w-16 h-16 rounded border-2 border-gray-600"
                        style={{
                          background: `hsl(${m.forza.color1.h * 360}, ${m.forza.color1.s * 100}%, ${m.forza.color1.b * 100}%)`,
                        }}
                      />
                      <div className="flex-1">
                        <div className="font-semibold">{m.forza.colorName}</div>
                        <div className="text-sm text-gray-400">{m.forza.make}</div>
                        <div className="text-xs text-gray-500">{m.forza.colorType}</div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-2xl font-bold ${
                            m.similarity >= 90
                              ? 'text-green-400'
                              : m.similarity >= 80
                                ? 'text-blue-400'
                                : m.similarity >= 70
                                  ? 'text-yellow-400'
                                  : 'text-orange-400'
                          }`}
                        >
                          {m.similarity.toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500">Match</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Selected/History */}
          <div className="space-y-6">
            {/* Selected Color */}
            {selected && (
              <div className="rounded-xl p-6 shadow-2xl bamboo-surface-dark">
                <h3 className="text-xl font-bold mb-4">Selected Color</h3>
                <div
                  className="w-full h-32 rounded-lg mb-4"
                  style={{
                    background: `hsl(${selected.color1.h * 360}, ${selected.color1.s * 100}%, ${selected.color1.b * 100}%)`,
                  }}
                />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="font-semibold">{selected.colorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Make:</span>
                    <span>{selected.make}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span>{selected.colorType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">HSB:</span>
                    <span className="font-mono text-xs">
                      {Math.round(selected.color1.h * 360)}°{Math.round(selected.color1.s * 100)}%
                      {Math.round(selected.color1.b * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* History Panel */}
            {showHistory && user && (
              <div className="bg-slate-800 rounded-xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold mb-4">Scan History</h3>
                {savedScans.length === 0 ? (
                  <p className="text-gray-400 text-sm">No saved scans yet</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {savedScans.map(scan => (
                      <div
                        key={scan.id}
                        className="p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm truncate flex-1">
                            {scan.imageName}
                          </span>
                          <button
                            onClick={() => deleteScan(scan.id)}
                            className="text-red-400 hover:text-red-300 ml-2"
                          >
                            🗑️
                          </button>
                        </div>
                        <div className="flex gap-1 mb-2">
                          {scan.extractedColors.slice(0, 5).map((c: ExtractedColor, i: number) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded"
                              style={{ background: `rgb(${c.rgb[0]}, ${c.rgb[1]}, ${c.rgb[2]})` }}
                            />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => loadScan(scan)}
                            className="flex-1 px-3 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700"
                          >
                            Load
                          </button>
                          <span className="text-xs text-gray-400 self-center">
                            {new Date(scan.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Info Panel */}
            <div className="bg-slate-800 rounded-xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold mb-3">💡 Tips</h3>
              <ul className="text-sm space-y-2 text-gray-300">
                <li>• Upload clear, well-lit photos</li>
                <li>• System extracts dominant colors</li>
                <li>• Matches show similarity percentage</li>
                {user ? (
                  <li>• ✅ Signed in - scans auto-save</li>
                ) : (
                  <li>• 🔒 Sign in to save scans</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
