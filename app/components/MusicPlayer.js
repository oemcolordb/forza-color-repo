'use client'

import React, { useState } from 'react'

const MusicPlayer = ({ isDarkMode }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [videoId, setVideoId] = useState('')
  const [showPlayer, setShowPlayer] = useState(false)

  const extractVideoId = url => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : ''
  }

  const handleSubmit = e => {
    e.preventDefault()
    const id = extractVideoId(youtubeUrl)
    if (id) {
      setVideoId(id)
      setShowPlayer(true)
    }
  }

  const closePlayer = () => {
    setShowPlayer(false)
    setVideoId('')
    setYoutubeUrl('')
  }

  return (
    <div className={`fixed bottom-4 right-4 z-40 ${showPlayer ? 'w-80' : 'w-64'}`}>
      {!showPlayer ? (
        <div
          className={`p-4 rounded-lg shadow-lg border ${
            isDarkMode
              ? 'bg-slate-800/90 border-slate-700 backdrop-blur-sm'
              : 'bg-white/90 border-gray-200 backdrop-blur-sm'
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            <div
              className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-gray-900'}`}
            >
              🎵 Add YouTube Music
            </div>
            <input
              type="text"
              placeholder="Paste YouTube URL..."
              value={youtubeUrl}
              onChange={e => setYoutubeUrl(e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded border ${
                isDarkMode
                  ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-fuchsia-500`}
            />
            <button
              type="submit"
              disabled={!youtubeUrl.trim()}
              className={`w-full py-2 px-4 text-sm rounded transition-colors ${
                isDarkMode
                  ? 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white disabled:bg-slate-600'
                  : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400'
              } disabled:cursor-not-allowed`}
            >
              Load Video
            </button>
            <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              ⚠️ User responsibility for content
            </div>
          </form>
        </div>
      ) : (
        <div
          className={`p-3 rounded-lg shadow-lg border ${
            isDarkMode
              ? 'bg-slate-800/90 border-slate-700 backdrop-blur-sm'
              : 'bg-white/90 border-gray-200 backdrop-blur-sm'
          }`}
        >
          <div className="flex justify-between items-center mb-3">
            <div
              className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-gray-900'}`}
            >
              🎵 YouTube Player
            </div>
            <button
              onClick={closePlayer}
              className={`text-sm ${
                isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ✕
            </button>
          </div>
          <iframe
            width="304"
            height="171"
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded"
          />
        </div>
      )}
    </div>
  )
}

export default MusicPlayer
