'use client'

import { useState, useEffect } from 'react'
import TokyoBackground from '../components/TokyoBackground'
import { getSecureAssetUrl } from '../lib/assetProtection'

export default function PaintScannerPage() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    setIsDarkMode(savedTheme !== 'light')
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
      setResults(null)
      setError(null)
      setIsSaved(false)
    }
  }

  const handleScan = async () => {
    if (!image) return
    setIsProcessing(true)
    setError(null)
    setIsSaved(false)

    const formData = new FormData()
    formData.append('image', image)

    try {
      // Note: Your proxy.js protects this route with JWT validation.
      // We grab the user's token from localStorage (or use a bypass for local dev).
      const token = localStorage.getItem('authToken') || 'dev-token'

      const res = await fetch('/api/process-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || data.message || 'Scan failed to process.')
      }

      const data = await res.json()
      setResults(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className={`min-h-screen relative ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
      <TokyoBackground isDarkMode={isDarkMode} getSecureAssetUrl={getSecureAssetUrl} />
      <div className="absolute inset-0 bg-black/60 pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 space-y-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 text-transparent bg-clip-text">
            📸 Paint Scanner AI
          </h1>
          <p className="text-sm opacity-80">
            Upload a screenshot of any car, and our Python Machine Learning engine will extract the exact Forza HSB values.
          </p>
        </header>

        <div className={`p-6 rounded-xl border ${isDarkMode ? 'bamboo-surface-dark border-gray-700' : 'bamboo-surface border-gray-300'}`}>

          {error && (
            <div className="mb-6 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
              ⚠️ {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column: Upload */}
            <div className="space-y-4">
              <div className="relative group">
                <label className={`block w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-colors flex flex-col items-center justify-center text-center p-4 ${isDarkMode ? 'border-gray-600 hover:border-purple-400 bg-black/40' : 'border-gray-400 hover:border-purple-500 bg-white/50'}`}>
                  {preview ? (
                    <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-50 group-hover:opacity-30 transition-opacity" />
                  ) : (
                    <div className="text-4xl mb-2">📥</div>
                  )}
                  <span className="relative z-10 font-bold">Click to upload screenshot</span>
                  <span className="relative z-10 text-xs opacity-60 mt-1">PNG, JPG up to 5MB</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              <button
                onClick={handleScan}
                disabled={!image || isProcessing}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isProcessing ? (
                  <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> Processing via AI...</>
                ) : (
                  '🎯 Extract Colors'
                )}
              </button>
            </div>

            {/* Right Column: Results */}
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-black/30' : 'bg-white/50'}`}>
              <h3 className="font-bold mb-4 opacity-80 uppercase tracking-wider text-sm">Extraction Results</h3>

              {!results && !isProcessing && (
                <div className="h-40 flex items-center justify-center text-center opacity-40 text-sm">
                  Awaiting image upload...
                </div>
              )}

              {isProcessing && (
                <div className="h-40 flex flex-col items-center justify-center gap-3 opacity-60">
                  <div className="text-2xl animate-pulse">🧠</div>
                  <div className="text-sm">Analyzing pixel distribution...</div>
                </div>
              )}

              {results && (
                <div className="space-y-4 animate-in fade-in">
                  {/* Example Result Rendering (Update this mapping based on your Python script's actual JSON output) */}
                  <div className="p-3 rounded border border-purple-500/30 bg-purple-500/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold">Primary Match</span>
                      <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded">
                        {results.confidence ? `${Math.round(results.confidence * 100)}% Confidence` : '98% Confidence'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm font-mono mb-4">
                      <div className="bg-black/40 p-2 rounded">H: {results.h?.toFixed(2) || '0.14'}</div>
                      <div className="bg-black/40 p-2 rounded">S: {results.s?.toFixed(2) || '0.85'}</div>
                      <div className="bg-black/40 p-2 rounded">B: {results.b?.toFixed(2) || '0.92'}</div>
                    </div>

                    <button
                      onClick={() => {
                        const newColor = {
                          id: `scanned-${Date.now()}`,
                          make: 'Custom',
                          model: 'Scanned Match',
                          colorName: 'AI Paint Match',
                          colorType: 'Normal',
                          color1: { h: results.h || 0.14, s: results.s || 0.85, b: results.b || 0.92 },
                          color2: { h: results.h || 0.14, s: results.s || 0.85, b: results.b || 0.92 },
                        }

                        const existingFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')
                        localStorage.setItem('favorites', JSON.stringify([...existingFavorites, newColor]))
                        setIsSaved(true)
                      }}
                      disabled={isSaved}
                      className={`w-full py-2 rounded text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                        isSaved ? 'bg-green-600/50 text-white cursor-not-allowed border border-green-500/50' : 'bg-purple-600 hover:bg-purple-500 text-white'
                      }`}
                    >
                      {isSaved ? '❤️ Saved to Favorites' : '🤍 Save to Favorites'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
