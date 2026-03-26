'use client'

import React, { ReactNode, useEffect } from 'react'
import '../nfs-theme.css'
import NFSGarageAudio from './NFSGarageAudio'

interface NFSThemeWrapperProps {
  children: ReactNode
  enabled?: boolean
}

const NFSThemeWrapper: React.FC<NFSThemeWrapperProps> = ({ children, enabled = false }) => {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const onScroll = () => {
      const y = window.scrollY || 0
      const xOffset = Math.sin(y / 300) * 2.2
      const yOffset = Math.min(10, y * 0.012)
      document.documentElement.style.setProperty('--nfs-parallax-x', `${xOffset.toFixed(2)}px`)
      document.documentElement.style.setProperty('--nfs-parallax-y', `${yOffset.toFixed(2)}px`)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.documentElement.style.setProperty('--nfs-parallax-x', '0px')
      document.documentElement.style.setProperty('--nfs-parallax-y', '0px')
    }
  }, [enabled])

  if (!enabled) return <>{children}</>

  return (
    <div className="relative min-h-screen nfs-garage-shell">
      <div className="fixed inset-0 pointer-events-none z-0 nfs-garage-grid nfs-parallax-layer opacity-55" />
      <div className="fixed inset-x-0 bottom-0 h-[32vh] pointer-events-none z-0 nfs-garage-floor-lines nfs-parallax-layer opacity-50" />
      <div className="fixed inset-x-[8%] top-0 h-2 pointer-events-none z-0 nfs-garage-light-bar" />
      <div className="fixed inset-x-[18%] top-2 h-1 pointer-events-none z-0 nfs-garage-buzzpulse" />
      <div className="fixed inset-0 pointer-events-none z-0 nfs-garage-haze nfs-parallax-layer" />
      <div className="fixed inset-0 pointer-events-none z-0 nfs-garage-vignette" />

      <div className="fixed left-6 bottom-20 h-44 w-12 rounded-sm pointer-events-none z-0 nfs-prop-lift nfs-parallax-layer" />
      <div className="fixed right-8 bottom-24 h-40 w-28 rounded-sm pointer-events-none z-0 nfs-prop-rack nfs-parallax-layer" />
      <div className="fixed right-20 top-24 h-14 w-14 rounded-full pointer-events-none z-0 nfs-prop-fan nfs-parallax-layer" />

      <div className="fixed right-4 top-4 z-40">
        <NFSGarageAudio />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  )
}

export default NFSThemeWrapper
