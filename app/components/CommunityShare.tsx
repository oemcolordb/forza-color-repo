'use client'

import React, { useState, useEffect } from 'react'
import { CarColor } from '../types'
import { useAuth } from './EnhancedAuthProvider'

interface ColorScheme {
  id: string
  name: string
  description: string
  colors: CarColor[]
  author: {
    id: string
    username: string
    avatar?: string
  }
  rating: number
  ratingCount: number
  downloads: number
  createdAt: string
  tags: string[]
}

interface CommunityShareProps {
  isDarkMode: boolean
}

export default function CommunityShare({ isDarkMode }: CommunityShareProps) {
  const [schemes, setSchemes] = useState<ColorScheme[]>([])
  const [mySchemes, setMySchemes] = useState<ColorScheme[]>([])
  const [filter, setFilter] = useState<'trending' | 'recent' | 'top'>('trending')
  const [searchQuery, setSearchQuery] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    loadSchemes()
    if (user) loadMySchemes()
  }, [filter, user])

  const loadSchemes = async () => {
    try {
      const response = await fetch(`/api/schemes?filter=${filter}&search=${searchQuery}`)
      const data = await response.json()
      setSchemes(data)
    } catch (error) {
      console.error('Failed to load schemes:', error)
    }
  }

  const loadMySchemes = async () => {
    if (!user) return
    try {
      const response = await fetch(`/api/schemes/user/${user.id}`)
      const data = await response.json()
      setMySchemes(data)
    } catch (error) {
      console.error('Failed to load my schemes:', error)
    }
  }

  const rateScheme = async (schemeId: string, rating: number) => {
    if (!user) {
      alert('Please sign in to rate schemes')
      return
    }

    try {
      await fetch(`/api/schemes/${schemeId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, rating })
      })
      loadSchemes()
    } catch (error) {
      console.error('Failed to rate scheme:', error)
    }
  }

  const importScheme = async (scheme: ColorScheme) => {
    try {
      // Save to local favorites
      const favorites = JSON.parse(localStorage.getItem('forza-favorites') || '[]')
      scheme.colors.forEach(color => {
        const colorId = `${color.make}-${color.colorName}-${color.year || 'unknown'}`
        if (!favorites.includes(colorId)) {
          favorites.push(colorId)
        }
      })
      localStorage.setItem('forza-favorites', JSON.stringify(favorites))

      // Track download
      await fetch(`/api/schemes/${scheme.id}/download`, { method: 'POST' })
      
      alert(`Imported "${scheme.name}" to your favorites!`)
      loadSchemes()
    } catch (error) {
      console.error('Failed to import scheme:', error)
    }
  }

  const exportScheme = (colors: CarColor[]) => {
    const data = JSON.stringify(colors, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'color-scheme.json'
    a.click()
  }

  return (
    <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          🌟 Community Color Schemes
        </h2>
        {user && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-semibold"
          >
            📤 Share Scheme
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex gap-2">
          {(['trending', 'recent', 'top'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-semibold ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : isDarkMode
                  ? 'bg-slate-700 text-gray-300'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {f === 'trending' ? '🔥 Trending' : f === 'recent' ? '🆕 Recent' : '⭐ Top Rated'}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search schemes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadSchemes()}
          className={`flex-1 px-4 py-2 rounded-lg border ${
            isDarkMode
              ? 'bg-slate-700 border-slate-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>

      {/* My Schemes */}
      {user && mySchemes.length > 0 && (
        <div className="mb-8">
          <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            My Published Schemes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mySchemes.map((scheme) => (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
                isDarkMode={isDarkMode}
                onRate={rateScheme}
                onImport={importScheme}
                onExport={exportScheme}
                isOwner={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Community Schemes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schemes.map((scheme) => (
          <SchemeCard
            key={scheme.id}
            scheme={scheme}
            isDarkMode={isDarkMode}
            onRate={rateScheme}
            onImport={importScheme}
            onExport={exportScheme}
            isOwner={user?.id === scheme.author.id}
          />
        ))}
      </div>

      {schemes.length === 0 && (
        <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          No schemes found. Be the first to share!
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadSchemeModal
          isDarkMode={isDarkMode}
          onClose={() => setShowUploadModal(false)}
          onUpload={loadSchemes}
        />
      )}
    </div>
  )
}

function SchemeCard({
  scheme,
  isDarkMode,
  onRate,
  onImport,
  onExport,
  isOwner
}: {
  scheme: ColorScheme
  isDarkMode: boolean
  onRate: (id: string, rating: number) => void
  onImport: (scheme: ColorScheme) => void
  onExport: (colors: CarColor[]) => void
  isOwner: boolean
}) {
  const [showRating, setShowRating] = useState(false)

  return (
    <div className={`p-6 rounded-xl border-2 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
      {/* Author */}
      <div className="flex items-center gap-2 mb-3">
        {scheme.author.avatar ? (
          <img src={scheme.author.avatar} alt="" className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
        )}
        <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {scheme.author.username}
        </span>
        {isOwner && (
          <span className="ml-auto text-xs px-2 py-1 bg-blue-600 text-white rounded">You</span>
        )}
      </div>

      {/* Name & Description */}
      <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {scheme.name}
      </h3>
      <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {scheme.description}
      </p>

      {/* Color Preview */}
      <div className="flex gap-2 mb-4">
        {scheme.colors.slice(0, 5).map((color, i) => (
          <div
            key={i}
            className="flex-1 h-16 rounded"
            style={{
              background: `hsl(${color.color1.h * 360}, ${color.color1.s * 100}%, ${color.color1.b * 100}%)`
            }}
          />
        ))}
        {scheme.colors.length > 5 && (
          <div className={`flex-1 h-16 rounded flex items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}>
            <span className="text-sm font-semibold">+{scheme.colors.length - 5}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {scheme.tags.map((tag) => (
          <span
            key={tag}
            className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-slate-800 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1">
          <span>⭐</span>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
            {scheme.rating.toFixed(1)} ({scheme.ratingCount})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span>📥</span>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
            {scheme.downloads}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onImport(scheme)}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          Import
        </button>
        <button
          onClick={() => setShowRating(!showRating)}
          className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-gray-200 text-gray-900'}`}
        >
          ⭐
        </button>
        <button
          onClick={() => onExport(scheme.colors)}
          className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-gray-200 text-gray-900'}`}
        >
          📤
        </button>
      </div>

      {/* Rating Selector */}
      {showRating && (
        <div className="mt-3 flex gap-2 justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => {
                onRate(scheme.id, star)
                setShowRating(false)
              }}
              className="text-2xl hover:scale-110 transition-transform"
            >
              {star <= Math.round(scheme.rating) ? '⭐' : '☆'}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function UploadSchemeModal({
  isDarkMode,
  onClose,
  onUpload
}: {
  isDarkMode: boolean
  onClose: () => void
  onUpload: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [selectedColors, setSelectedColors] = useState<CarColor[]>([])
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await fetch('/api/schemes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          colors: selectedColors,
          tags: tags.split(',').map(t => t.trim()),
          authorId: user?.id
        })
      })

      onUpload()
      onClose()
    } catch (error) {
      console.error('Failed to upload scheme:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-2xl rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Share Color Scheme
            </h3>
            <button onClick={onClose} className="text-gray-500 text-2xl">×</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Scheme Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
              }`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
              }`}
              rows={3}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="racing, drift, custom"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Publish
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
