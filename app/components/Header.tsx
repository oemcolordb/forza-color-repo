'use client'

import React from 'react'
import { HeaderProps } from '../types'
import { ErrorBoundary } from '../lib/errorBoundary'

const THEME_ICONS: Record<string, string> = {
  light: '🌙',   // currently light → click goes to dark
  dark:  '🏁',   // currently dark  → click goes to nfs
  nfs:   '☀️',   // currently nfs   → click goes to light
}

const THEME_LABELS: Record<string, string> = {
  light: 'Switch to dark mode',
  dark:  'Switch to NFS mode',
  nfs:   'Switch to light mode',
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, theme, onToggleTheme }) => {
  const isNFS = theme === 'nfs'

  return (
    <ErrorBoundary>
      <header className="py-8 text-center bg-transparent relative">
        <button
          onClick={onToggleTheme}
          className="fixed z-50 p-3 rounded-full shadow-lg border-2 transition-all bamboo-button-ghost theme-toggle-btn"
          aria-label={THEME_LABELS[theme]}
          title={THEME_LABELS[theme]}
          style={{
            minHeight: '48px',
            minWidth: '48px',
            ...(isNFS ? {
              borderColor: 'var(--nfs-neon-blue)',
              boxShadow: '0 0 12px var(--nfs-neon-blue)',
            } : {}),
          }}
        >
          <span className="text-xl">{THEME_ICONS[theme]}</span>
        </button>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-fade-in-up bg-black/50 backdrop-blur-sm px-6 py-4 rounded-lg inline-block glass-effect">
          <span
            className="neon-text animate-color-shift text-purple-400"
            style={{
              textShadow:
                '0 0 10px #8b5cf6, 0 0 20px #8b5cf6, 0 0 30px #8b5cf6, 0 0 40px #8b5cf6, 0 0 50px #8b5cf6',
              animation: 'neon-glow 2s ease-in-out infinite alternate',
            }}
          >
            Forza-Color-Repo
          </span>
        </h1>

        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <a href="/vinyl-creator" className="inline-flex items-center gap-2 px-6 py-3 bamboo-button hover-lift bg-black/30 backdrop-blur-sm">
            🎨 Vinyl Creator
          </a>
          <a href="/tuneforge" className="inline-flex items-center gap-2 px-6 py-3 bamboo-button hover-lift bg-black/30 backdrop-blur-sm">
            🔧 TuneForge Lab
          </a>
          <a href="/location-finder" className="inline-flex items-center gap-2 px-6 py-3 bamboo-button hover-lift bg-black/30 backdrop-blur-sm">
            📍 Location Finder
          </a>
          <a href="/how-to-use" className="inline-flex items-center gap-2 px-6 py-3 bamboo-button hover-lift bg-black/30 backdrop-blur-sm">
            📖 How to Use
          </a>
          <a href="/blog" className="inline-flex items-center gap-2 px-6 py-3 bamboo-button hover-lift hover-rainbow bg-black/30 backdrop-blur-sm">
            📝 Color Blog
          </a>
          <a href="/tools" className="inline-flex items-center gap-2 px-6 py-3 bamboo-button hover-lift bg-black/30 backdrop-blur-sm">
            🛠️ Tools
          </a>
          <a
            href="/nfs-theme"
            className="inline-flex items-center gap-2 px-6 py-3 bamboo-button hover-lift"
            style={{ background: 'linear-gradient(135deg, #00d9ff4d, #b300ff4d)', border: '1px solid #00d9ff55' }}
          >
            🏁 NFS Theme
          </a>
        </div>

        {/* Mobile scroll indicator */}
        <div className="mt-8 md:hidden flex flex-col items-center animate-bounce">
          <div className="text-white/80 text-sm mb-2">Scroll down to explore colors</div>
          <div className="text-2xl">👇</div>
        </div>
      </header>
    </ErrorBoundary>
  )
}

export default Header
