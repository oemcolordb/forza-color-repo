'use client'

import React, { useState, useEffect, useRef } from 'react'
import { HeaderProps } from '@/types'
import { ErrorBoundary } from '@/lib/utils/errorBoundary'
import Button from '@/components/ui/Button'
import PWAInstallButton from '@/components/system/PWAInstallButton'

const Header: React.FC<HeaderProps> = ({ isDarkMode, onToggleTheme }) => {
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  // Close "More" menu when clicking outside
  useEffect(() => {
    if (!moreOpen) return
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [moreOpen])

  return (
    <ErrorBoundary>
      <header className="py-6 text-center bg-transparent relative z-10">
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
          <span className="text-[color:var(--bamboo-stalk)] neon-text">Forza-Color-Repo</span>
        </h1>
        <p className="mt-2 text-sm font-medium text-[#00ff00] drop-shadow-md">
          Made with love by ResiRonin with credits to the legends at GTPLANET
        </p>

        {/* Primary nav — always visible */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button as="a" href="/tuneforge" variant="primary" size="lg" className="hover-lift">
            🔧 TuneForge Lab
          </Button>
          <Button as="a" href="/garage" variant="primary" size="lg" className="hover-lift">
            🏎️ Car Database
          </Button>
          <Button as="a" href="https://mapgenie.io/" target="_blank" rel="noopener noreferrer" variant="primary" size="lg" className="hover-lift">
            📍 Location Finder
          </Button>
          <Button as="a" href="/community" variant="primary" size="lg" className="hover-lift">
            🤝 Community
          </Button>
          <Button
            as="a"
            href="/how-to-use"
            variant="primary"
            size="lg"
            className="hover-lift hidden sm:inline-flex"
          >
            📖 How to Use
          </Button>
          <Button
            as="a"
            href="/blog"
            variant="primary"
            size="lg"
            className="hover-lift hidden sm:inline-flex"
          >
            📝 Color Blog
          </Button>

          {/* More dropdown with click-outside-to-close */}
          <PWAInstallButton isDarkMode={isDarkMode} />
          <div ref={moreRef} className="relative">
            <button
              onClick={() => setMoreOpen(prev => !prev)}
              aria-expanded={moreOpen}
              aria-haspopup="true"
              className="inline-flex items-center gap-1 px-5 py-3 bamboo-button rounded-lg font-medium"
            >
              More{' '}
              <span className={`transition-transform duration-150 ${moreOpen ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </button>

            {moreOpen && (
              <div
                className={`absolute right-0 mt-1 z-50 min-w-[190px] rounded-xl shadow-2xl border py-2 flex flex-col ${
                  isDarkMode
                    ? 'bamboo-surface-dark border-gray-700'
                    : 'bamboo-surface border-gray-200'
                }`}
                role="menu"
              >
                <a
                  onClick={() => setMoreOpen(false)}
                  href="/about"
                  role="menuitem"
                  className="px-4 py-2 hover:bg-white/10 transition-colors text-sm text-left"
                >
                  ℹ️ About
                </a>
                <a
                  onClick={() => setMoreOpen(false)}
                  href="/help"
                  role="menuitem"
                  className="px-4 py-2 hover:bg-white/10 transition-colors text-sm text-left"
                >
                  ❓ Help
                </a>
                <a
                  onClick={() => setMoreOpen(false)}
                  href="/contact"
                  role="menuitem"
                  className="px-4 py-2 hover:bg-white/10 transition-colors text-sm text-left"
                >
                  ✉️ Contact
                </a>
                <a
                  onClick={() => setMoreOpen(false)}
                  href="/privacy"
                  role="menuitem"
                  className="px-4 py-2 hover:bg-white/10 transition-colors text-sm text-left"
                >
                  🔒 Privacy
                </a>
                <a
                  onClick={() => setMoreOpen(false)}
                  href="/terms"
                  role="menuitem"
                  className="px-4 py-2 hover:bg-white/10 transition-colors text-sm text-left"
                >
                  📜 Terms
                </a>
                <hr className={`my-1 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                <a
                  onClick={() => setMoreOpen(false)}
                  href="/image-match"
                  role="menuitem"
                  className="px-4 py-2 hover:bg-white/10 transition-colors text-sm text-left"
                >
                  🖼️ Image Match
                </a>
                <a
                  onClick={() => setMoreOpen(false)}
                  href="/how-to-use"
                  role="menuitem"
                  className="px-4 py-2 hover:bg-white/10 transition-colors text-sm text-left sm:hidden"
                >
                  📖 How to Use
                </a>
                <a
                  onClick={() => setMoreOpen(false)}
                  href="/blog"
                  role="menuitem"
                  className="px-4 py-2 hover:bg-white/10 transition-colors text-sm text-left sm:hidden"
                >
                  📝 Color Blog
                </a>
              </div>
            )}
          </div>
        </div>
      </header>
    </ErrorBoundary>
  )
}

export default Header
