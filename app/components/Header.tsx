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

const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  theme,
  onToggleTheme,
  colorCount = 0,
  manufacturerCount = 0,
  gameLabel = 'FH5 + FM',
}) => {
  const isNFS = theme === 'nfs'

  return (
    <ErrorBoundary>
      <header className="relative pb-8 md:pb-10">
        <div className="sticky top-0 z-40 border-b border-white/10 premium-glass-header">
          <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
            <a href="/" className="inline-flex items-center gap-2">
              <span className="text-xl">🏎️</span>
              <span className="premium-title text-base font-bold text-white sm:text-lg">TuneForge</span>
            </a>

            <a
              href="#color-search"
              className="hidden flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/65 backdrop-blur-sm md:block"
              aria-label="Jump to color search"
            >
              Search by color name, hex, or car...
            </a>

            <nav className="hidden items-center gap-2 text-xs text-white/75 md:flex">
              <a href="#color-gallery" className="rounded-lg px-3 py-2 transition hover:bg-white/10">Colors</a>
              <a href="/forza-color-sheet" className="rounded-lg px-3 py-2 transition hover:bg-white/10">Cars</a>
              <a href="/tools" className="rounded-lg px-3 py-2 transition hover:bg-white/10">Stats</a>
            </nav>

            <button
              onClick={onToggleTheme}
              className="tap-target rounded-full border border-white/20 bg-white/5 p-2.5 text-lg text-white transition hover:bg-white/10"
              aria-label={THEME_LABELS[theme]}
              title={THEME_LABELS[theme]}
              style={
                isNFS
                  ? {
                      borderColor: 'var(--nfs-neon-blue)',
                      boxShadow: '0 0 10px var(--nfs-neon-blue)',
                    }
                  : undefined
              }
            >
              {THEME_ICONS[theme]}
            </button>
          </div>
        </div>

        <div className="mx-auto mt-6 w-full max-w-7xl px-4 text-center md:mt-8 md:px-6">
          <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-black/25 px-5 py-8 backdrop-blur-sm md:px-8 md:py-10">
            <p className="premium-title text-xs uppercase tracking-[0.2em] text-white/65">Forza Color Database 2019-2024</p>
            <h1 className={`premium-title mt-3 text-3xl font-bold text-white md:text-5xl ${isNFS ? 'nfs-era-heading' : ''}`}>
              Professional Paint Reference Library
            </h1>
            <p className={`mx-auto mt-3 max-w-2xl text-sm text-white/70 md:text-base ${isNFS ? 'nfs-era-subheading' : ''}`}>
              A premium automotive color index for Forza Horizon and Motorsport players.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              <a href="#color-search" className="bamboo-button tap-target px-4 py-2 text-sm">Search Colors</a>
              <a href="#color-gallery" className="bamboo-button-ghost tap-target px-4 py-2 text-sm">Browse Gallery</a>
              <a href="/tuneforge" className="bamboo-button-ghost tap-target px-4 py-2 text-sm">Open TuneForge</a>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-2 text-sm text-white/75 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <span className="mono-value text-white">{colorCount.toLocaleString()}</span> Colors
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <span className="mono-value text-white">{manufacturerCount.toLocaleString()}</span> Manufacturers
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <span className="mono-value text-white">{gameLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {!isDarkMode && (
          <div className="mx-auto mt-3 text-center text-xs text-slate-500">Tip: toggle theme for dark or NFS viewing modes.</div>
        )}
      </header>
    </ErrorBoundary>
  )
}

export default Header
