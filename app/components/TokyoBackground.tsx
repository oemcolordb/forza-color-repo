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
      { file: 'manuel-velasquez-ssfp9okorys-unsplash-1200x801.jpg', type: 'image' as const },
      { file: '3060_04.jpg', type: 'image' as const },
      { file: '3060_06.jpg', type: 'image' as const },
      { file: 'Mp 4 H 280 3 Q Nlf 3 J O Aem 8 Kv Cu Uuya AN Cr O Du C Qs 63 S Vq Z Rad 6 O 11 BZ.mp4', type: 'video' as const },
      { file: 'Mp 4 H 280 C Baj X 2 Z 9 R 9 E Fr 1 Gh W Ai RTFM 6 Xbt BSZ 76 N 6 Ywb BAE Dic 4 R.mp4', type: 'video' as const },
      { file: 'Mp 4 H 280 J 9 IY 9 U GBZ Mp Lle M Zd 6 S Zybj Yh 3 F 6 G VI 46 Cr Uf 0 PN 3 Dq TU.mp4', type: 'video' as const },
      { file: 'Mp 4 H 280 Yq 68 Y FSH 7 L G 3 Xq O 4 Vv IA 6 F Ud IEJIB 01 Qeq N 1 T Sur DR 5 T I.mp4', type: 'video' as const }
    ]
    
    const now = new Date()
    const thirtyMinuteSlots = Math.floor(now.getTime() / (30 * 60 * 1000))
    const mediaIndex = thirtyMinuteSlots % mediaFiles.length
    return mediaFiles[mediaIndex]
  }, [])
  
  useEffect(() => {
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
    } else {
      setBackgroundMedia(mediaSrc)
      setMediaType('video')
      setMediaLoaded(true)
      setMediaError(false)
      setIsInitialized(true)
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
  }, [selectedMedia])
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {mediaLoaded && backgroundMedia && !mediaError && (
        mediaType === 'image' ? (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-300"
            style={{ 
              backgroundImage: `url(${backgroundMedia})`,
              opacity: isDarkMode ? 0.4 : 0.6,
              filter: isDarkMode ? 'brightness(0.8) contrast(1.3)' : 'brightness(1.2) contrast(1.1)'
            }}
          />
        ) : (
          <video
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            autoPlay
            muted
            loop
            playsInline
            style={{
              opacity: isDarkMode ? 0.4 : 0.6,
              filter: isDarkMode ? 'brightness(0.8) contrast(1.3)' : 'brightness(1.2) contrast(1.1)'
            }}
          >
            <source src={backgroundMedia} type="video/mp4" />
          </video>
        )
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