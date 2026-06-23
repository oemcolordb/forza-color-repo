'use client'
import React, { useEffect, useState, useMemo, useRef } from 'react'

interface TokyoBackgroundProps {
  isDarkMode: boolean
  getSecureAssetUrl: (_url: string) => string
}

const TokyoBackground: React.FC<TokyoBackgroundProps> = ({ isDarkMode, getSecureAssetUrl }) => {
  const [mediaLoaded, setMediaLoaded] = useState(false)
  const [mediaError, setMediaError] = useState(false)
  const [mediaSrc, setMediaSrc] = useState('')
  const [isVideo, setIsVideo] = useState(false)

  const [selectedMedia, setSelectedMedia] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const mediaFiles = [
      'assets/videos/tokyo_aerial_looped.mp4',
      'assets/videos/tokyo_movie.mp4',
      'assets/images/backgrounds/cyberpunk_jdm_highway_1781544037954.png',
      'assets/images/backgrounds/cyberpunk_jdm_garage_1781544024595.png',
      'assets/images/backgrounds/cyberpunk_jdm_street_1781544010932.png',
      'assets/images/backgrounds/jdm_tokyo_street_1781543894124.png',
      'assets/images/backgrounds/jdm_mountain_drift_1781543906338.png',
      'assets/images/backgrounds/jdm_cyberpunk_meet_1781543919984.png',
      'assets/images/backgrounds/tokyo_akihabara_neon_1781543827018.png',
      'assets/images/backgrounds/tokyo_neon_street_1781543800162.png',
      'assets/images/backgrounds/tokyo_sunset_skyline_1781543814077.png',
      'assets/images/backgrounds/neon-shibuya-crossing-tokyo-japan-1140x760.jpg',
      'assets/images/backgrounds/tokyo-panorama.jpg',
    ]

    const updateBackground = () => {
      const fifteenMinuteSlots = Math.floor(Date.now() / (15 * 60 * 1000))
      setSelectedMedia(mediaFiles[fifteenMinuteSlots % mediaFiles.length])
    }

    // Set initial background
    updateBackground()

    // Check every minute if the 15-minute slot has changed
    const intervalId = setInterval(updateBackground, 60000)

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (!selectedMedia) return

    const src = getSecureAssetUrl(`/${selectedMedia}`)
    setMediaLoaded(false)
    setMediaError(false)
    setMediaSrc(src)

    if (selectedMedia.endsWith('.mp4') || selectedMedia.endsWith('.webm')) {
      setIsVideo(true)
      // For videos, we rely on the onLoadedData event on the video element itself
    } else {
      setIsVideo(false)
      const img = new Image()
      img.onload = () => {
        setMediaLoaded(true)
      }
      img.onerror = () => {
        setMediaError(true)
      }
      img.src = src
    }
  }, [getSecureAssetUrl, selectedMedia])

  return (
    // fixed + inset-0: no contribution to document flow → zero CLS
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* Solid fallback — paints instantly, prevents CLS */}
      <div
        className="absolute inset-0"
        style={{ background: '#0a0e14' }}
      />

      {/* Background media fades in after load — no layout shift */}
      {!mediaError && isVideo && mediaSrc && (
        <video
          ref={videoRef}
          src={mediaSrc}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setMediaLoaded(true)}
          onError={() => setMediaError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${mediaLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{
            opacity: mediaLoaded ? (isDarkMode ? 0.4 : 0.6) : 0,
            filter: isDarkMode
              ? 'brightness(0.8) contrast(1.3)'
              : 'brightness(1.2) contrast(1.1)',
          }}
        />
      )}

      {mediaLoaded && !mediaError && !isVideo && mediaSrc && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${mediaSrc}')`,
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

