'use client'
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { logger } from '../lib/logger'

interface TokyoBackgroundProps {
  isDarkMode: boolean
  getSecureAssetUrl: (_url: string) => string
  backgroundIndex?: number
  onRotate?: () => void
}

const TokyoBackground: React.FC<TokyoBackgroundProps> = ({ isDarkMode, getSecureAssetUrl, backgroundIndex: externalIndex, onRotate }) => {
  const [isMobile, setIsMobile] = useState(false)
  const [backgroundMedia, setBackgroundMedia] = useState('')
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')
  const [mediaLoaded, setMediaLoaded] = useState(false)
  const [mediaError, setMediaError] = useState(false)
  const [manualIndex, setManualIndex] = useState<number | null>(null)

  const checkMobile = useCallback(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768)
    }
  }, [])

  useEffect(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile, { passive: true })
    return () => window.removeEventListener('resize', checkMobile)
  }, [checkMobile])

  const mediaFiles = useMemo(() => [
      // Images (Videos removed due to missing assets)
      { file: 'assets/images/manuel-velasquez-ssfp9okORYs-unsplash-1200x801.jpg', type: 'image' as const },
      { file: 'assets/images/neon-shibuya-crossing-tokyo-japan-1140x760.jpg', type: 'image' as const },
      { file: 'assets/images/tokyo-panorama.jpg', type: 'image' as const },
      { file: 'forza-color-sheet-preview.jpg', type: 'image' as const },
    ], [])

  const selectedMedia = useMemo(() => {
    const effectiveIndex = externalIndex ?? manualIndex ?? Math.floor(Date.now() / (30 * 60 * 1000)) % mediaFiles.length
    const chosen = mediaFiles[effectiveIndex % mediaFiles.length]

    if (isMobile && chosen.type === 'video') {
      const imageFiles = mediaFiles.filter(m => m.type === 'image')
      return imageFiles[effectiveIndex % imageFiles.length]
    }

    return chosen
  }, [isMobile, mediaFiles, externalIndex, manualIndex])

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
        logger.warn('Background image failed to load:', mediaSrc)
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

  }, [getSecureAssetUrl, selectedMedia])

  // Handle manual rotation
  useEffect(() => {
    if (externalIndex !== undefined) {
      setMediaLoaded(false)
      setMediaError(false)
    }
  }, [externalIndex])

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
              logger.warn('Background video failed to load:', backgroundMedia)
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
