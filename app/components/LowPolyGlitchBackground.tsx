'use client'
import React, { useEffect, useState, useCallback, useRef } from 'react'

interface JapanBackgroundProps {
  isDarkMode: boolean
}

interface BackgroundFile {
  src: string
  type: 'image' | 'video'
}

const SHUFFLE_INTERVAL = 30_000
const TRANSITION_DURATION = 1500

const FALLBACK_FILES: BackgroundFile[] = [
  { src: '/backgrounds/japan/tokyo-tower-night.jpg', type: 'image' },
  { src: '/backgrounds/japan/mt-fuji-lake.jpg', type: 'image' },
  { src: '/backgrounds/japan/tokyo-street-neon.jpg', type: 'image' },
  { src: '/backgrounds/japan/shibuya-crossing.jpg', type: 'image' },
  { src: '/backgrounds/japan/osaka-night.jpg', type: 'image' },
  { src: '/backgrounds/japan/kyoto-bamboo.jpg', type: 'image' },
  { src: '/backgrounds/japan/tokyo-skyline.jpg', type: 'image' },
  { src: '/backgrounds/japan/tokyo-rain-street.jpg', type: 'image' },
  { src: '/backgrounds/japan/fuji-cherry-blossom.jpg', type: 'image' },
  { src: '/backgrounds/japan/japan-temple-gate.jpg', type: 'image' },
  { src: '/backgrounds/japan/neon-shibuya-crossing-tokyo-japan-1140x760.jpg', type: 'image' },
  { src: '/backgrounds/japan/tokyo-panorama.jpg', type: 'image' },
  { src: '/backgrounds/japan/manuel-velasquez-ssfp9okORYs-unsplash-1200x801.jpg', type: 'image' },
  { src: '/backgrounds/japan/1-5.jpeg', type: 'image' },
]

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const JapanBackground: React.FC<JapanBackgroundProps> = ({ isDarkMode }) => {
  const [files, setFiles] = useState<BackgroundFile[]>(FALLBACK_FILES)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState(1)
  const [transitioning, setTransitioning] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch file list from API (auto-detects new additions)
  useEffect(() => {
    fetch('/api/backgrounds')
      .then(res => res.json())
      .then(data => {
        if (data.files && data.files.length > 0) {
          setFiles(shuffleArray(data.files))
        }
      })
      .catch(() => {
        setFiles(shuffleArray(FALLBACK_FILES))
      })
  }, [])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  const advanceSlide = useCallback(() => {
    if (files.length <= 1) return
    setTransitioning(true)
    setNextIndex(prev => (prev + 1) % files.length)

    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % files.length)
      setTransitioning(false)
    }, TRANSITION_DURATION)
  }, [files.length])

  useEffect(() => {
    intervalRef.current = setInterval(advanceSlide, SHUFFLE_INTERVAL)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [advanceSlide])

  const currentFile = files[currentIndex % files.length]
  const nextFile = files[nextIndex % files.length]
  if (!currentFile) return null

  const overlayStyle = isDarkMode
    ? 'bg-gradient-to-br from-slate-900/60 via-blue-900/30 to-black/70'
    : 'bg-gradient-to-br from-blue-100/40 via-purple-100/20 to-gray-200/50'

  const mediaFilter = isDarkMode
    ? 'brightness(0.6) contrast(1.2) saturate(1.1)'
    : 'brightness(1.1) contrast(1.05) saturate(0.95)'

  const renderMedia = (file: BackgroundFile, opacity: number, zIndex: number) => {
    if (file.type === 'video' && !isMobile) {
      return (
        <video
          key={file.src}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          style={{ opacity, filter: mediaFilter, zIndex, transition: `opacity ${TRANSITION_DURATION}ms ease-in-out` }}
        >
          <source src={file.src} type={file.src.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
        </video>
      )
    }
    return (
      <div
        key={file.src}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${file.src})`,
          opacity,
          filter: mediaFilter,
          zIndex,
          transition: `opacity ${TRANSITION_DURATION}ms ease-in-out`,
        }}
      />
    )
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Current background */}
      {renderMedia(currentFile, transitioning ? 0 : 1, 1)}

      {/* Next background (fades in during transition) */}
      {nextFile && renderMedia(nextFile, transitioning ? 1 : 0, 2)}

      {/* Color overlay */}
      <div className={`absolute inset-0 ${overlayStyle} transition-all duration-300`} style={{ zIndex: 3 }} />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 4,
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)',
        }}
      />
    </div>
  )
}

export default JapanBackground
