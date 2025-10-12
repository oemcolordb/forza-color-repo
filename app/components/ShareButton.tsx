'use client'

import React, { useState } from 'react'
import { CarColor } from '../types'

interface ShareButtonProps {
  color: CarColor
  isDarkMode: boolean
}

const ShareButton: React.FC<ShareButtonProps> = ({ color, isDarkMode }) => {
  const [showOptions, setShowOptions] = useState(false)

  const shareText = `Check out this ${color.colorName} from ${color.make}! 🎨 #ForzaColors #${color.make.replace(/\s+/g, '')}`
  const shareUrl = `${window.location.origin}/?color=${encodeURIComponent(color.colorName)}&make=${encodeURIComponent(color.make)}`

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=550,height=420')
  }

  const shareToInstagram = () => {
    // Instagram doesn't support direct sharing, so copy to clipboard
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
    alert('Link copied! Paste it in your Instagram story or post.')
  }

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    alert('Link copied to clipboard!')
  }

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${color.colorName} - ${color.make}`,
          text: shareText,
          url: shareUrl
        })
      } catch (err) {
        copyLink()
      }
    } else {
      copyLink()
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className={`p-2 rounded-full transition-colors ${
          isDarkMode ? 'text-slate-300 hover:text-blue-400 hover:bg-slate-700' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
        }`}
        aria-label="Share color"
      >
        📤
      </button>
      
      {showOptions && (
        <div className={`absolute bottom-full right-0 mb-2 p-2 rounded-lg shadow-lg border z-50 ${
          isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col gap-1 min-w-[120px]">
            <button
              onClick={shareToTwitter}
              className={`px-3 py-2 text-sm rounded transition-colors text-left ${
                isDarkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              🐦 Twitter
            </button>
            <button
              onClick={shareToInstagram}
              className={`px-3 py-2 text-sm rounded transition-colors text-left ${
                isDarkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              📷 Instagram
            </button>
            <button
              onClick={nativeShare}
              className={`px-3 py-2 text-sm rounded transition-colors text-left ${
                isDarkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              📱 Share
            </button>
            <button
              onClick={copyLink}
              className={`px-3 py-2 text-sm rounded transition-colors text-left ${
                isDarkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              📋 Copy Link
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShareButton