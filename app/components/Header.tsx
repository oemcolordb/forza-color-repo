import React from 'react'
import { HeaderProps } from '../types'
import { ErrorBoundary } from '../lib/errorBoundary'
import Button from './ui/Button'

const Header: React.FC<HeaderProps> = ({ isDarkMode, onToggleTheme }) => {
  return (
    <ErrorBoundary>
      <header className="py-8 text-center bg-transparent relative">
        <Button
          onClick={onToggleTheme}
          variant="ghost"
          size="md"
          className="fixed top-4 left-4 z-50 rounded-full shadow-lg border-2"
          aria-label="Toggle theme"
          style={{ minHeight: '48px', minWidth: '48px' }}
        >
          <span className="text-xl">{isDarkMode ? '☀️' : '🌙'}</span>
        </Button>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-fade-in-up px-6 py-4 rounded-lg inline-block bamboo-surface-dark">
          <span className="text-[color:var(--bamboo-stalk)] neon-text">
            Forza-Color-Repo
          </span>
        </h1>

        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Button as="a" href="/tuneforge" variant="primary" size="lg" className="hover-lift">
            🔧 TuneForge Lab
          </Button>
          <Button as="a" href="/location-finder" variant="primary" size="lg" className="hover-lift">
            📍 Location Finder
          </Button>
          <Button
            as="a"
            href="/how-to-use"
            variant="primary"
            size="lg"
            className="hidden hover-lift sm:inline-flex"
          >
            📖 How to Use
          </Button>
          <Button as="a" href="/blog" variant="primary" size="lg" className="hidden hover-lift sm:inline-flex">
            📝 Color Blog
          </Button>
          <details className="sm:hidden">
            <summary className="list-none cursor-pointer inline-flex items-center gap-2 px-6 py-3 bamboo-button">
              More Tools
            </summary>
            <div className="mt-2 flex flex-col gap-2">
              <a href="/how-to-use" className="inline-flex items-center justify-center gap-2 px-4 py-2 bamboo-button-ghost">
                📖 How to Use
              </a>
              <a href="/blog" className="inline-flex items-center justify-center gap-2 px-4 py-2 bamboo-button-ghost">
                📝 Color Blog
              </a>
            </div>
          </details>
        </div>

        {/* Mobile scroll indicator */}
        <div className="mt-8 md:hidden flex flex-col items-center animate-bounce">
          <div className="text-[color:var(--bamboo-paper)] text-sm mb-2">Scroll down to explore colors</div>
          <div className="text-2xl">👇</div>
        </div>
      </header>
    </ErrorBoundary>
  )
}

export default Header
