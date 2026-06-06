'use client'
import React, { useEffect, useState, useMemo } from 'react'

interface TokyoBackgroundProps {
  isDarkMode: boolean
  getSecureAssetUrl: (_url: string) => string
}

const TokyoBackground: React.FC<TokyoBackgroundProps> = ({ isDarkMode, getSecureAssetUrl }) => {
  const [backgroundMedia, setBackgroundMedia] = useState('')
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')
  const [mediaLoaded, setMediaLoaded] = useState(false)
  const [mediaError, setMediaError] = useState(false)

  const selectedMedia = useMemo(() => {
    const mediaFiles = [
      // Images (all exist in public/assets/images/backrounds/)
      { file: 'assets/images/backrounds/neon-shibuya-crossing-tokyo-japan-1140x760.jpg', type: 'image' as const },
      { file: 'assets/images/backrounds/tokyo-panorama.jpg', type: 'image' as const },
      { file: 'assets/images/backrounds/Gemini_Generated_Image_zatbflzatbflzatb.png', type: 'image' as const },
      { file: 'assets/images/backrounds/Screenshot 2026-04-13 032903.png', type: 'image' as const },
      { file: 'assets/images/backrounds/Screenshot 2026-04-13 032927.png', type: 'image' as const },
      { file: 'assets/images/backrounds/v2-jbps6-5b1bc-1-1024x590.png', type: 'image' as const },
    ]

    const now = new Date()
    const thirtyMinuteSlots = Math.floor(now.getTime() / (30 * 60 * 1000))
    const mediaIndex = thirtyMinuteSlots % mediaFiles.length
    const chosen = mediaFiles[mediaIndex]

    return chosen
  }, [])

  useEffect(() => {
    const mediaSrc = getSecureAssetUrl(`/${selectedMedia.file}`)

    if (selectedMedia.type === 'image') {
      const img = new Image()
      img.onload = () => {
        setBackgroundMedia(mediaSrc)
        setMediaType('image')
        setMediaLoaded(true)
        setMediaError(false)
      }
      img.onerror = () => {
        console.warn('Background image failed to load:', mediaSrc)
        setMediaError(true)
        setMediaLoaded(true)
      }
      img.src = mediaSrc
    } else {
      // For videos, just set the source without preloading
      setBackgroundMedia(mediaSrc)
      setMediaType('video')
      setMediaLoaded(true)
      setMediaError(false)
    }

    // Set up 30-minute rotation timer
    const checkRotation = () => {
      const now = new Date()
      const thirtyMinuteSlots = Math.floor(now.getTime() / (30 * 60 * 1000))
      const nextSlot = (thirtyMinuteSlots + 1) * 30 * 60 * 1000
      const timeUntilNext = nextSlot - now.getTime()

      setTimeout(() => {
        window.location.reload()
      }, timeUntilNext)
    }

    checkRotation()
  }, [getSecureAssetUrl, selectedMedia])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {mediaLoaded &&
        backgroundMedia &&
        !mediaError &&
        (mediaType === 'image' ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-300"
            style={{
              backgroundImage: `url(${backgroundMedia})`,
              opacity: isDarkMode ? 0.4 : 0.6,
              filter: isDarkMode
                ? 'brightness(0.8) contrast(1.3)'
                : 'brightness(1.2) contrast(1.1)',
            }}
          />
        ) : (
          <video
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            autoPlay
            muted
            loop
            playsInline
            onError={() => {
              console.warn('Background video failed to load:', backgroundMedia)
              setMediaError(true)
            }}
            style={{
              opacity: isDarkMode ? 0.4 : 0.6,
              filter: isDarkMode
                ? 'brightness(0.8) contrast(1.3)'
                : 'brightness(1.2) contrast(1.1)',
            }}
          >
            <source src={backgroundMedia} type="video/mp4" />
          </video>
        ))}

      <div className="absolute inset-0 opacity-[0.18] animate-city-pulse" />

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
