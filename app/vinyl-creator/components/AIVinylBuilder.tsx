'use client'

import React, { useState } from 'react'
import { VinylDesign } from '../types/vinyl'

interface AIVinylBuilderProps {
  onDesignGenerated: (_design: VinylDesign) => void
  isDarkMode?: boolean
}

export default function AIVinylBuilder({
  onDesignGenerated,
  isDarkMode = true,
}: AIVinylBuilderProps) {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerateDesign = async () => {
    if (!prompt.trim()) {
      setError('Please describe the vinyl design you want to create')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/vinyl-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate vinyl design')
      }

      const design = await response.json()
      onDesignGenerated(design)
      setPrompt('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate design')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`rounded-lg p-6 border ${isDarkMode ? 'bg-slate-800/60 border-purple-500/30' : 'bg-white border-purple-300'}`}>
      <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        ✨ AI Vinyl Generator
      </h3>

      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
            Describe your vinyl design
          </label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="e.g., 'A flaming phoenix with spread wings', 'Geometric tribal patterns', 'Retro wave sunset with palm trees'"
            className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              isDarkMode
                ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            rows={3}
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className={`p-3 rounded text-sm ${isDarkMode ? 'bg-red-900/30 text-red-300 border border-red-700' : 'bg-red-100 text-red-800 border border-red-300'}`}>
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleGenerateDesign}
            disabled={isLoading || !prompt.trim()}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              isLoading || !prompt.trim()
                ? isDarkMode
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isDarkMode
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⚙️</span>
                Generating...
              </>
            ) : (
              <>
                🎨 Generate Design
              </>
            )}
          </button>
        </div>

        <div className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-600'}`}>
          💡 Tip: Be specific! Examples: "flaming phoenix", "tribal dragon", "geometric mandala", "retro starfield"
        </div>
      </div>
    </div>
  )
}
