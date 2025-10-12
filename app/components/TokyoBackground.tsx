'use client'
import React, { useEffect, useState, useCallback, useMemo } from 'react'

interface TokyoBackgroundProps {
  isDarkMode: boolean
  getSecureAssetUrl: (url: string) => string
}

const TokyoBackground: React.FC<TokyoBackgroundProps> = ({ isDarkMode, getSecureAssetUrl }) => {
  const [isMobile, setIsMobile] = useState(false)
  const [backgroundMedia, setBackgroundMedia] = useState('')
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')
  const [mediaLoaded, setMediaLoaded] = useState(false)
  const [mediaError, setMediaError] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  
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
  
  const selectedMedia = useMemo(() => {
    const mediaFiles = [
      { file: 'manuel-velasquez-ssfp9okorys-unsplash-1200x801.jpg', type: 'image' as const }
    ]
    return mediaFiles[0]
  }, [])
  
  useEffect(() => {
    if (isInitialized || isMobile) return
    
    const mediaSrc = `/${selectedMedia.file}`    
    if (selectedMedia.type === 'image') {
      const img = new Image()
      img.onload = () => {
        setBackgroundMedia(mediaSrc)
        setMediaType('image')
        setMediaLoaded(true)
        setMediaError(false)
        setIsInitialized(true)
      }
      img.onerror = () => {
        setMediaError(true)
        setMediaLoaded(true)
        setIsInitialized(true)
      }
      img.src = mediaSrc
    }
  }, [selectedMedia, isInitialized, isMobile])
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {!isMobile && mediaLoaded && backgroundMedia && !mediaError && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-300"
          style={{ 
            backgroundImage: `url(${backgroundMedia})`,
            opacity: isDarkMode ? 0.4 : 0.6,
            filter: isDarkMode ? 'brightness(0.8) contrast(1.3)' : 'brightness(1.2) contrast(1.1)'
          }}
        />
      )}
      <div className={`absolute inset-0 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900/70 via-blue-900/40 to-black/80' 
          : 'bg-gradient-to-br from-blue-100/60 via-purple-100/30 to-gray-200/70'
      }`} />
    </div>
  )
}

export default TokyoBackground