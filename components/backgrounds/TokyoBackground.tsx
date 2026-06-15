'use client'
import React, { useEffect, useState, useMemo } from 'react'

interface TokyoBackgroundProps {
  isDarkMode: boolean
  getSecureAssetUrl: (_url: string) => string
}

const TokyoBackground: React.FC<TokyoBackgroundProps> = ({ isDarkMode, getSecureAssetUrl }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageSrc, setImageSrc] = useState('')

  const selectedMedia = useMemo(() => {
    const mediaFiles = [
      'assets/images/backrounds/neon-shibuya-crossing-tokyo-japan-1140x760.jpg',
      'assets/images/backrounds/tokyo-panorama.jpg',
      'assets/images/backrounds/Gemini_Generated_Image_zatbflzatbflzatb.png',
      'assets/images/backrounds/Screenshot 2026-04-13 032903.png',
      'assets/images/backrounds/Screenshot 2026-04-13 032927.png',
      'assets/images/backrounds/v2-jbps6-5b1bc-1-1024x590.png',
    ]
    const thirtyMinuteSlots = Math.floor(Date.now() / (30 * 60 * 1000))
    return mediaFiles[thirtyMinuteSlots % mediaFiles.length]
  }, [])

  useEffect(() => {
    const src = getSecureAssetUrl(`/${selectedMedia}`)
    const img = new Image()
    img.onload = () => {
      setImageSrc(src)
      setImageLoaded(true)
    }
    img.onerror = () => {
      setImageError(true)
    }
    img.src = src
  }, [getSecureAssetUrl, selectedMedia])

  return (
    // fixed + inset-0: no contribution to document flow → zero CLS
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* Solid fallback — paints instantly, prevents CLS */}
      <div
        className="absolute inset-0"
        style={{ background: '#0a0e14' }}
      />

      {/* Background image fades in after load — no layout shift */}
      {imageLoaded && !imageError && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${imageSrc})`,
            opacity: isDarkMode ? 0.4 : 0.6,
            filter: isDarkMode
              ? 'brightness(0.8) contrast(1.3)'
              : 'brightness(1.2) contrast(1.1)',
            transition: 'opacity 0.5s ease',
          }}
        />
      )}

      {/* Atmosphere overlays */}
      {isDarkMode && (
        <>
          <div className="absolute inset-0 opacity-[0.12] animate-building-glow" />
          <div className="absolute inset-0 opacity-[0.08] animate-hologram-flicker" />
          <div className="absolute inset-y-0 left-0 right-0 overflow-hidden opacity-[0.10]">
            <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent animate-neon-scan" />
          </div>

          <div className="absolute inset-0 opacity-[0.10]">
            <div className="absolute top-[18%] left-[18%] w-2 h-2 bg-yellow-200/60 rounded-sm animate-window-twinkle" />
            <div className="absolute top-[22%] left-[26%] w-1.5 h-1.5 bg-blue-200/60 rounded-sm animate-window-flicker" />
            <div className="absolute top-[30%] left-[22%] w-2 h-1.5 bg-pink-200/60 rounded-sm animate-window-shimmer" />
            <div className="absolute top-[40%] left-[30%] w-1.5 h-2 bg-cyan-200/60 rounded-sm animate-window-pulse" />
            <div className="absolute top-[16%] right-[20%] w-2 h-2 bg-yellow-200/60 rounded-sm animate-window-flicker" style={{ animationDelay: '0.6s' }} />
            <div className="absolute top-[26%] right-[28%] w-1.5 h-1.5 bg-blue-200/60 rounded-sm animate-window-twinkle" style={{ animationDelay: '1.1s' }} />
            <div className="absolute top-[36%] right-[22%] w-2 h-1.5 bg-pink-200/60 rounded-sm animate-window-shimmer" style={{ animationDelay: '1.9s' }} />
            <div className="absolute top-[44%] right-[30%] w-1.5 h-2 bg-cyan-200/60 rounded-sm animate-window-pulse" style={{ animationDelay: '2.4s' }} />
          </div>

          <div className="absolute inset-0 opacity-[0.12]">
            <div className="absolute top-[12%] left-[8%] w-1 h-1 rounded-full bg-cyan-300 wind-particle animate-atmospheric-flow" />
            <div className="absolute top-[55%] left-[15%] w-1 h-1 rounded-full bg-fuchsia-300 wind-particle animate-atmospheric-flow" style={{ animationDelay: '1.7s' }} />
            <div className="absolute top-[78%] left-[5%] w-1 h-1 rounded-full bg-blue-300 wind-particle animate-atmospheric-flow" style={{ animationDelay: '3.1s' }} />
          </div>
        </>
      )}

      {/* Dark/light gradient overlay */}
      <div
        className={`absolute inset-0 transition-all duration-300 ${
          isDarkMode
            ? 'bg-gradient-to-br from-slate-900/70 via-blue-900/40 to-black/80'
            : 'bg-gradient-to-br from-blue-100/60 via-purple-100/30 to-gray-200/70'
        }`}
      />
    </div>
  )
}

export default TokyoBackground
