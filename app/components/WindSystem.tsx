import React, { useState, useEffect, useMemo } from 'react'

interface WindSystemProps {
  isDarkMode: boolean
  intensity?: number
}

interface WindParticle {
  id: number
  x: number
  y: number
  size: number
  rotation: number
  speed: number
  type: 'leaf' | 'petal' | 'dust' | 'sakura'
  color: string
  opacity: number
  rotationSpeed: number
  drift: number
}

interface WindState {
  direction: number // 0-360 degrees
  strength: number // 0-1
  gustiness: number // 0-1
}

const WindSystem: React.FC<WindSystemProps> = ({ isDarkMode, intensity = 0.7 }) => {
  const [wind, setWind] = useState<WindState>({
    direction: 45,
    strength: 0.3,
    gustiness: 0.2
  })

  const [particles, setParticles] = useState<WindParticle[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Dynamic wind direction based on background and time
  useEffect(() => {
    const updateWind = () => {
      const time = Date.now() / 1000
      const baseDirection = isDarkMode ? 135 : 45 // Different base directions for day/night
      const directionVariation = Math.sin(time * 0.1) * 30 + Math.cos(time * 0.07) * 15
      const strengthVariation = 0.3 + Math.sin(time * 0.15) * 0.4 + Math.cos(time * 0.12) * 0.2
      const gustVariation = 0.1 + Math.sin(time * 0.25) * 0.3

      setWind({
        direction: baseDirection + directionVariation,
        strength: Math.max(0.1, Math.min(1, strengthVariation * intensity)),
        gustiness: Math.max(0, Math.min(1, gustVariation))
      })
    }

    const interval = setInterval(updateWind, 100)
    return () => clearInterval(interval)
  }, [isDarkMode, intensity])

  // Generate wind particles (leaves, petals, dust, sakura)
  const generateParticles = useMemo(() => {
    const particleCount = isDarkMode ? 30 : 18
    const newParticles: WindParticle[] = []

    for (let i = 0; i < particleCount; i++) {
      const types = isDarkMode 
        ? ['leaf', 'petal', 'dust', 'sakura'] 
        : ['leaf', 'petal', 'dust']
      const type = types[Math.floor(Math.random() * types.length)] as 'leaf' | 'petal' | 'dust' | 'sakura'
      
      let colors: string[]
      if (type === 'leaf') {
        colors = isDarkMode 
          ? ['#22c55e', '#16a34a', '#15803d', '#fbbf24', '#f59e0b', '#dc2626', '#ea580c']
          : ['#65a30d', '#84cc16', '#eab308', '#f97316', '#dc2626', '#b45309']
      } else if (type === 'petal') {
        colors = isDarkMode
          ? ['#ec4899', '#f472b6', '#fbbf24', '#a855f7', '#8b5cf6', '#f97316']
          : ['#f472b6', '#ec4899', '#fbbf24', '#a855f7', '#f97316']
      } else if (type === 'sakura') {
        colors = ['#fecaca', '#fca5a5', '#f87171', '#ef4444', '#fbbf24']
      } else {
        colors = isDarkMode
          ? ['#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6']
          : ['#9ca3af', '#d1d5db', '#e5e7eb', '#f9fafb']
      }

      newParticles.push({
        id: i,
        x: Math.random() * (window.innerWidth || 1200),
        y: Math.random() * (window.innerHeight || 800),
        size: type === 'dust' ? 1 + Math.random() * 2 : 
              type === 'sakura' ? 4 + Math.random() * 6 :
              3 + Math.random() * 8,
        rotation: Math.random() * 360,
        speed: type === 'dust' ? 0.3 + Math.random() * 1 : 0.5 + Math.random() * 2,
        type,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: type === 'dust' ? 0.2 + Math.random() * 0.3 : 0.6 + Math.random() * 0.4,
        rotationSpeed: 0.5 + Math.random() * 2,
        drift: Math.random() * 0.5
      })
    }

    return newParticles
  }, [isDarkMode])

  useEffect(() => {
    setParticles(generateParticles)
  }, [generateParticles])

  // Animate particles based on wind
  useEffect(() => {
    const animateParticles = () => {
      setParticles(prev => prev.map(particle => {
        const windForceX = Math.cos((wind.direction * Math.PI) / 180) * wind.strength * particle.speed
        const windForceY = Math.sin((wind.direction * Math.PI) / 180) * wind.strength * particle.speed
        
        // Add gustiness and particle-specific drift
        const gustX = (Math.random() - 0.5) * wind.gustiness * 3
        const gustY = (Math.random() - 0.5) * wind.gustiness * 2
        const driftX = Math.sin(Date.now() * 0.001 + particle.id) * particle.drift
        const driftY = Math.cos(Date.now() * 0.0008 + particle.id) * particle.drift * 0.5

        // Gravity effect for different particle types
        const gravity = particle.type === 'dust' ? 0.1 : 
                       particle.type === 'sakura' ? 0.3 : 0.2

        let newX = particle.x + windForceX + gustX + driftX
        let newY = particle.y + windForceY + gustY + driftY + gravity

        // Wrap around screen with buffer
        const screenWidth = window.innerWidth || 1200
        const screenHeight = window.innerHeight || 800
        
        if (newX > screenWidth + 100) newX = -100
        if (newX < -100) newX = screenWidth + 100
        if (newY > screenHeight + 100) newY = -100
        if (newY < -100) newY = screenHeight + 100

        return {
          ...particle,
          x: newX,
          y: newY,
          rotation: particle.rotation + particle.rotationSpeed * (wind.strength + wind.gustiness)
        }
      }))
    }

    const interval = setInterval(animateParticles, 40)
    return () => clearInterval(interval)
  }, [wind])

  // Wind-affected rain
  const rainDrops = useMemo(() => {
    const rainCount = isDarkMode ? 40 : 20
    return Array.from({ length: rainCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 1 + Math.random() * 1.5,
      opacity: 0.3 + Math.random() * 0.4
    }))
  }, [isDarkMode])

  if (!mounted) {
    return null
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {/* Wind particles */}
      {particles.map(particle => {
        const getParticleShape = () => {
          switch (particle.type) {
            case 'leaf':
              return {
                borderRadius: '50% 0 50% 0',
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
              }
            case 'sakura':
              return {
                borderRadius: '50% 50% 50% 0',
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
              }
            case 'petal':
              return {
                borderRadius: '50% 50% 50% 0'
              }
            default:
              return {
                borderRadius: '50%'
              }
          }
        }

        return (
          <div
            key={particle.id}
            className={`absolute transition-all duration-100 ${
              particle.type === 'leaf' ? 'animate-leaf-float' :
              particle.type === 'petal' ? 'animate-petal-drift' :
              particle.type === 'sakura' ? 'animate-petal-drift' :
              'animate-dust-swirl'
            }`}
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              opacity: particle.opacity,
              transform: `rotate(${particle.rotation}deg)`,
              boxShadow: particle.type !== 'dust' ? 
                `0 0 ${particle.size * 0.8}px ${particle.color}60, 0 0 ${particle.size * 1.5}px ${particle.color}30` : 
                'none',
              filter: particle.type !== 'dust' ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' : 'none',
              animationDelay: `${particle.id * 0.1}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
              ...getParticleShape()
            }}
          />
        )
      })}

      {/* Wind-affected rain */}
      {rainDrops.map(drop => {
        const windSkew = wind.strength * Math.cos((wind.direction * Math.PI) / 180) * 15
        const windDrift = wind.strength * Math.sin((wind.direction * Math.PI) / 180) * 30
        
        return (
          <div
            key={`rain-${drop.id}`}
            className="absolute w-px bg-gradient-to-b from-transparent via-blue-200 to-transparent animate-wind-rain"
            style={{
              left: `${drop.x}%`,
              height: `${30 + Math.random() * 60}px`,
              top: '-10%',
              opacity: drop.opacity,
              animationDelay: `${drop.delay}s`,
              animationDuration: `${drop.duration}s`,
              transform: `skewX(${windSkew}deg)`,
              '--wind-skew': `${windSkew}deg`,
              '--wind-drift': `${windDrift}px`
            } as React.CSSProperties}
          />
        )
      })}

      {/* Wind direction indicator (subtle) */}
      <div 
        className={`absolute top-4 right-4 w-6 h-6 transition-all duration-500 ${
          isDarkMode ? 'text-cyan-400/60' : 'text-blue-600/40'
        }`}
        style={{
          transform: `rotate(${wind.direction}deg)`,
          opacity: 0.4
        }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L15 9H9L12 2ZM12 22L9 15H15L12 22Z" />
        </svg>
      </div>

      {/* Wind strength indicator */}
      <div className={`absolute top-4 right-12 w-1.5 h-12 rounded-full transition-all duration-300 ${
        isDarkMode ? 'bg-cyan-400/20' : 'bg-blue-600/20'
      }`}>
        <div 
          className={`w-full rounded-full transition-all duration-300 ${
            isDarkMode ? 'bg-cyan-400/80' : 'bg-blue-600/60'
          }`}
          style={{
            height: `${wind.strength * 100}%`,
            marginTop: `${(1 - wind.strength) * 100}%`
          }}
        />
      </div>
    </div>
  )
}

export default WindSystem