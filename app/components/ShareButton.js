import React from 'react'

const ShareButton = ({ color, isDarkMode }) => {
  const shareColor = async () => {
    const url = `${window.location.origin}?color=${encodeURIComponent(color.colorName)}&make=${encodeURIComponent(color.make)}`
    const text = `Check out this ${color.colorName} color from ${color.make}!`

    if (navigator.share) {
      try {
        await navigator.share({ title: text, url })
      } catch {
        copyToClipboard(url)
      }
    } else {
      copyToClipboard(url)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    })
  }

  return (
    <button
      onClick={shareColor}
      className={`px-3 py-1 rounded text-sm transition-colors ${
        isDarkMode 
          ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
      }`}
    >
      🔗 Share
    </button>
  )
}

export default ShareButton