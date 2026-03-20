'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { NFSHeatLevel, NFSButton } from './NFSBackground'
import '../nfs-theme.css'

interface NFSHeaderProps {
  isDarkMode: boolean
  onToggleTheme: () => void
  showHeatLevel?: boolean
}

export default function NFSHeader({ 
  isDarkMode, 
  onToggleTheme,
  showHeatLevel = true 
}: NFSHeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [heatLevel, setHeatLevel] = useState(0)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Simulate heat level changes based on activity
    const heatInterval = setInterval(() => {
      setHeatLevel(prev => {
        const change = Math.random() > 0.5 ? 1 : -1
        return Math.max(0, Math.min(5, prev + change))
      })
    }, 5000)
    return () => clearInterval(heatInterval)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'nfs-card backdrop-blur-md shadow-2xl' 
          : 'bg-transparent'
      }`}
      style={{
        borderBottom: scrolled ? '1px solid rgba(0, 217, 255, 0.3)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              {/* Animated Logo */}
              <div className="w-12 h-12 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <linearGradient id="nfs-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--nfs-neon-blue)" />
                      <stop offset="50%" stopColor="var(--nfs-neon-purple)" />
                      <stop offset="100%" stopColor="var(--nfs-neon-pink)" />
                    </linearGradient>
                    <filter id="nfs-logo-glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Car silhouette */}
                  <path
                    d="M20 60 L30 50 L40 45 L60 45 L70 50 L80 60 L75 65 L70 65 L65 60 L35 60 L30 65 L25 65 Z"
                    fill="url(#nfs-logo-gradient)"
                    filter="url(#nfs-logo-glow)"
                    className="transition-all duration-300 group-hover:scale-110"
                  />
                  
                  {/* Wheels */}
                  <circle cx="35" cy="65" r="5" fill="var(--nfs-neon-orange)" filter="url(#nfs-logo-glow)" />
                  <circle cx="65" cy="65" r="5" fill="var(--nfs-neon-orange)" filter="url(#nfs-logo-glow)" />
                  
                  {/* Speed lines */}
                  <line x1="10" y1="55" x2="20" y2="55" stroke="var(--nfs-neon-blue)" strokeWidth="2" opacity="0.6" className="animate-pulse" />
                  <line x1="5" y1="60" x2="20" y2="60" stroke="var(--nfs-neon-blue)" strokeWidth="2" opacity="0.4" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <line x1="8" y1="65" x2="20" y2="65" stroke="var(--nfs-neon-blue)" strokeWidth="2" opacity="0.3" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
                </svg>
              </div>
              
              {/* Underglow effect */}
              <div className="absolute -bottom-1 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 blur-sm" />
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-xl font-bold nfs-text-neon-blue uppercase tracking-wider">
                Forza Colors
              </h1>
              <span className="text-xs text-gray-400 uppercase tracking-widest">Underground</span>
            </div>
          </Link>

          {/* Center Section - Time & Stats */}
          <div className="hidden md:flex items-center gap-6">
            {/* Digital Clock */}
            <div className="flex flex-col items-center">
              <div className="text-lg font-mono nfs-text-neon-blue">
                {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-xs text-gray-500 uppercase">Local Time</div>
            </div>

            {/* Heat Level */}
            {showHeatLevel && (
              <div className="flex flex-col items-center gap-1">
                <NFSHeatLevel level={heatLevel} maxLevel={5} />
                <div className="text-xs text-gray-500 uppercase">Wanted</div>
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="text-sm font-bold text-green-400">10K+</div>
                <div className="text-xs text-gray-500">Colors</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-sm font-bold text-purple-400">200+</div>
                <div className="text-xs text-gray-500">Brands</div>
              </div>
            </div>
          </div>

          {/* Right Section - Navigation */}
          <div className="flex items-center gap-3">
            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center gap-2">
              <Link 
                href="/garage" 
                className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-cyan-400 transition-colors uppercase tracking-wide"
              >
                🏁 Garage
              </Link>
              <Link 
                href="/tuneforge" 
                className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-purple-400 transition-colors uppercase tracking-wide"
              >
                🔧 Tune
              </Link>
              <Link 
                href="/vinyl-creator" 
                className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-pink-400 transition-colors uppercase tracking-wide"
              >
                🎨 Vinyl
              </Link>
            </nav>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="relative w-10 h-10 rounded-lg nfs-card flex items-center justify-center hover:scale-110 transition-transform"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 nfs-text-neon-orange" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 nfs-text-neon-blue" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden w-10 h-10 rounded-lg nfs-card flex flex-col items-center justify-center gap-1 hover:scale-110 transition-transform"
              aria-label="Menu"
            >
              <span className="w-5 h-0.5 bg-cyan-400 rounded" />
              <span className="w-5 h-0.5 bg-cyan-400 rounded" />
              <span className="w-5 h-0.5 bg-cyan-400 rounded" />
            </button>
          </div>
        </div>
      </div>

      {/* Underglow bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />
    </header>
  )
}
