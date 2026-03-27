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
  searchQuery,
  onSearchChange,
  selectedMake,
  onMakeChange,
  selectedColorType,
  onColorTypeChange,
  selectedYear,
  onYearChange,
  years,
  sortBy,
  onSortChange,
  makes,
  colorTypes,
  favoritesCount = 0,
  showFavoritesOnly,
  onToggleShowFavoritesOnly,
  onClearFilters,
}) => {
  const isNFS = theme === 'nfs'
  const hasActiveFilters = Boolean(
    searchQuery || selectedMake || selectedColorType || selectedYear || showFavoritesOnly || sortBy !== 'newest'
  )

  return (
    <ErrorBoundary>
      <header className="relative pb-8 md:pb-10 modern-aurora">
        <div className="sticky top-0 z-40 border-b border-white/10 premium-glass-header">
          <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
            <a href="/" className="inline-flex items-center gap-2">
              <span className="text-xl">🏎️</span>
              <span className="premium-title text-base font-bold text-white sm:text-lg">TuneForge</span>
            </a>

            <div className="flex min-w-0 flex-1 items-center gap-2">
              <input
                id="global-color-search-input"
                type="text"
                value={searchQuery}
                onChange={event => onSearchChange(event.target.value)}
                placeholder="Search by color name, make, model, or #tag"
                aria-label="Search colors"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/45 backdrop-blur-sm transition focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/15"
              />
              <button
                type="button"
                onClick={onToggleShowFavoritesOnly}
                className={`relative rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  showFavoritesOnly
                    ? 'border-rose-300/40 bg-rose-500 text-white'
                    : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                }`}
                aria-label={showFavoritesOnly ? 'Show all colors' : 'Show favorites only'}
                title={showFavoritesOnly ? 'Show all colors' : 'Show favorites only'}
              >
                <span
                  style={{
                    display: 'inline-block',
                    transform: `scale(${Math.min(1 + favoritesCount * 0.02, 1.8)})`,
                    transition: 'transform 0.3s ease',
                  }}
                >
                  ❤️
                </span>
                {favoritesCount > 0 && (
                  <span className="ml-1 text-xs font-bold">{favoritesCount}</span>
                )}
              </button>
            </div>

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
          <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-black/25 px-5 py-8 backdrop-blur-sm md:px-8 md:py-10 glass-lift">
            <p className="section-kicker premium-title">Forza Color Database 2019-2024</p>
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

            <div id="color-search" className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4 text-left backdrop-blur-md md:p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="premium-title text-xs uppercase tracking-[0.18em] text-white/55">Search And Filter</p>
                  <p className="mt-1 text-sm text-white/70">
                    Refine the gallery from the top of the page without the extra filter block below.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClearFilters}
                  disabled={!hasActiveFilters}
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear Filters
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <select
                  value={selectedMake}
                  onChange={event => onMakeChange(event.target.value)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white backdrop-blur-sm focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/15"
                  aria-label="Filter by manufacturer"
                >
                  <option value="">All Makes</option>
                  {makes.map(make => (
                    <option key={make} value={make} className="text-gray-900">
                      {make}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedColorType}
                  onChange={event => onColorTypeChange(event.target.value)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white backdrop-blur-sm focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/15"
                  aria-label="Filter by color type"
                >
                  <option value="">All Types</option>
                  {colorTypes.map(type => (
                    <option key={type} value={type} className="text-gray-900">
                      {type}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={event => onYearChange(event.target.value)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white backdrop-blur-sm focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/15"
                  aria-label="Filter by year"
                >
                  <option value="">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year} className="text-gray-900">
                      {year}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={event => onSortChange(event.target.value as 'newest' | 'az' | 'random')}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white backdrop-blur-sm focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/15"
                  aria-label="Sort results"
                >
                  <option value="newest">Sort: Newest</option>
                  <option value="az">Sort: A-Z</option>
                  <option value="random">Sort: Random</option>
                </select>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-2 text-sm text-white/75 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 glass-lift">
                <span className="mono-value text-white">{colorCount.toLocaleString()}</span> Colors
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 glass-lift">
                <span className="mono-value text-white">{manufacturerCount.toLocaleString()}</span> Manufacturers
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 glass-lift">
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
