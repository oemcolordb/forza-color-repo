'use client'

import React, { useState, useEffect } from 'react'
import '../nfs-theme.css'

interface NFSBackgroundProps {
  isDarkMode: boolean
  showPoliceScanner?: boolean
  showNitrous?: boolean
}

export default function NFSBackground({ 
  isDarkMode, 
  showPoliceScanner = false,
  showNitrous = false 
}: NFSBackgroundProps) {
  const [speed, setSpeed] = useState(0)
  const [heatLevel, setHeatLevel] = useState(0)

  useEffect(() => {
    // Simulate speed changes
    const speedInterval = setInterval(() => {
      setSpeed(prev => {
        const newSpeed = prev + (Math.random() * 20 - 10)
        return Math.max(0, Math.min(200, newSpeed))
      })
    }, 1000)

    return () => clearInterval(speedInterval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Carbon Fiber Base */}
      <div className="absolute inset-0 nfs-carbon-bg opacity-30" />
      
      {/* Asphalt Texture Overlay */}
      <div className="absolute inset-0 nfs-asphalt-bg opacity-50" />

      {/* Street Lights */}
      <div className="absolute top-0 left-0 w-full h-full">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="nfs-street-light absolute"
            style={{
              top: `${i * 20}%`,
              left: i % 2 === 0 ? '5%' : '95%',
              width: '100px',
              height: '100px',
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Neon Grid Lines */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="nfs-grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="rgba(0, 217, 255, 0.3)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#nfs-grid)" />
        </svg>
      </div>

      {/* Police Scanner Effect */}
      {showPoliceScanner && (
        <div className="nfs-police-scanner absolute inset-0 opacity-30" />
      )}

      {/* Nitrous Boost Effect */}
      {showNitrous && (
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-20 bg-gradient-to-b from-cyan-400 to-transparent opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animation: `nfs-nitrous-stream ${0.5 + Math.random() * 0.5}s linear infinite`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Underglow Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-40 nfs-underglow opacity-40" />

      {/* Tire Smoke */}
      <div className="absolute bottom-0 left-1/4 w-1/2 h-32 nfs-tire-smoke opacity-30" />
    </div>
  )
}

// NFS Speedometer Component
export function NFSSpeedometer({ speed = 0, maxSpeed = 200 }: { speed?: number; maxSpeed?: number }) {
  const rotation = (speed / maxSpeed) * 270 - 135

  return (
    <div className="nfs-speedometer relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold nfs-text-neon-blue">{Math.round(speed)}</div>
          <div className="text-xs text-gray-400">MPH</div>
        </div>
      </div>
      <div
        className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-orange-500 origin-left"
        style={{
          transform: `translate(-100%, -50%) rotate(${rotation}deg)`,
          boxShadow: '0 0 10px var(--nfs-neon-orange)',
          transition: 'transform 0.3s ease-out',
        }}
      />
      {/* Speed markers */}
      {[...Array(9)].map((_, i) => {
        const angle = -135 + i * 33.75
        return (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-1 h-2 bg-cyan-400"
            style={{
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-50px)`,
              transformOrigin: 'center',
            }}
          />
        )
      })}
    </div>
  )
}

// NFS Heat Level Component
export function NFSHeatLevel({ level = 0, maxLevel = 5 }: { level?: number; maxLevel?: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-red-500 uppercase">Heat</span>
      <div className="nfs-heat-level">
        {[...Array(maxLevel)].map((_, i) => (
          <div
            key={i}
            className={`nfs-heat-pip ${i < level ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}

// NFS Gauge Cluster Component
export function NFSGaugeCluster({ 
  speed = 0, 
  rpm = 0, 
  heatLevel = 0,
  nitrous = 100 
}: { 
  speed?: number
  rpm?: number
  heatLevel?: number
  nitrous?: number
}) {
  return (
    <div className="nfs-gauge-cluster">
      <div className="flex flex-col items-center gap-2">
        <NFSSpeedometer speed={speed} />
        <span className="text-xs text-gray-400 uppercase">Speed</span>
      </div>
      
      <div className="flex flex-col gap-3 justify-center">
        <NFSHeatLevel level={heatLevel} maxLevel={5} />
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold nfs-text-neon-blue uppercase">NOS</span>
          <div className="nfs-progress-bar w-32 h-3">
            <div 
              className="nfs-progress-fill" 
              style={{ width: `${nitrous}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-green-400 uppercase">RPM</span>
          <div className="nfs-progress-bar w-32 h-3">
            <div 
              className="nfs-progress-fill" 
              style={{ 
                width: `${(rpm / 8000) * 100}%`,
                background: rpm > 6000 
                  ? 'linear-gradient(90deg, var(--nfs-neon-orange) 0%, var(--nfs-neon-pink) 100%)'
                  : 'linear-gradient(90deg, var(--nfs-neon-green) 0%, var(--nfs-neon-blue) 100%)'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// NFS Card Component
export function NFSCard({ 
  children, 
  className = '',
  glowColor = 'blue' 
}: { 
  children: React.ReactNode
  className?: string
  glowColor?: 'blue' | 'pink' | 'green' | 'orange'
}) {
  const glowClass = `nfs-neon-glow-${glowColor}`
  
  return (
    <div className={`nfs-card ${glowClass} rounded-lg p-4 ${className}`}>
      {children}
    </div>
  )
}

// NFS Button Component
export function NFSButton({ 
  children, 
  onClick,
  className = '',
  disabled = false 
}: { 
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`nfs-button px-6 py-3 rounded-lg ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {children}
    </button>
  )
}

// NFS Drift Indicator
export function NFSDriftIndicator({ isDrifting = false }: { isDrifting?: boolean }) {
  return (
    <div className={`nfs-drift-indicator ${isDrifting ? 'opacity-100' : 'opacity-30'}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold nfs-text-neon-orange">DRIFT</span>
      </div>
    </div>
  )
}
