'use client'

import React, { ReactNode } from 'react'
import '../nfs-theme.css'

interface NFSThemeWrapperProps {
  children: ReactNode
  enabled?: boolean
}

const NFSThemeWrapper: React.FC<NFSThemeWrapperProps> = ({ children, enabled = false }) => {
  if (!enabled) return <>{children}</>

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
      {/* Carbon fiber base */}
      <div className="fixed inset-0 nfs-carbon-bg opacity-30 pointer-events-none z-0" />

      {/* Underglow */}
      <div className="fixed bottom-0 left-0 right-0 h-32 nfs-underglow opacity-20 pointer-events-none z-0" />

      {/* Street lights */}
      <div className="fixed top-0 left-1/4 w-32 h-32 nfs-street-light opacity-10 pointer-events-none z-0" />
      <div className="fixed top-0 right-1/4 w-32 h-32 nfs-street-light opacity-10 pointer-events-none z-0" />

      {/* Speed lines */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px opacity-30"
            style={{
              top: `${20 + i * 15}%`,
              width: '200%',
              background: 'linear-gradient(to right, transparent, var(--nfs-neon-blue), transparent)',
              animation: `nfs-speed-line ${2 + i * 0.5}s linear infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export default NFSThemeWrapper
