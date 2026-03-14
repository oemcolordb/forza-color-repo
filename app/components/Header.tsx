import React from 'react'
import { HeaderProps } from '../types'
import { ErrorBoundary } from '../lib/errorBoundary'
import PWAInstallButton from './PWAInstallButton'

const Header: React.FC<HeaderProps> = ({ isDarkMode, onToggleTheme, onShowAuth }) => {
  return (
    <ErrorBoundary>
      <header className="py-8 text-center bg-transparent relative">
        <button
          onClick={onToggleTheme}
          className="fixed top-4 left-4 z-50 p-3 rounded-full shadow-lg border-2 transition-all bamboo-button-ghost"
          aria-label="Toggle theme"
          style={{ minHeight: '48px', minWidth: '48px' }}
        >
          <span className="text-xl">{isDarkMode ? '☀️' : '🌙'}</span>
        </button>
        <div className="absolute top-4 right-4 flex items-center gap-3">
          <PWAInstallButton isDarkMode={isDarkMode} />
          {false ? (
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium ${
                  isDarkMode
                    ? 'text-white bg-slate-800/80 px-2 py-1 rounded'
                    : 'text-gray-900 bg-white/80 px-2 py-1 rounded'
                }`}
              >
                Guest
              </span>
              <button
                onClick={() => {}}
                className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  isDarkMode
                    ? 'bg-slate-800 text-white border-slate-600 hover:bg-slate-700'
                    : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={onShowAuth}
              className="px-4 py-2 text-sm bamboo-button hover-lift"
            >
              Sign In
            </button>
          )}
        </div>
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
          <a
            href="/tuneforge"
            className="inline-flex items-center gap-2 px-6 py-3 bamboo-button hover-lift"
          >
            🔧 TuneForge Lab
          </a>
          <a
            href="/location-finder"
            className="inline-flex items-center gap-2 px-6 py-3 bamboo-button hover-lift"
          >
            📍 Location Finder
          </a>
          <a
            href="/how-to-use"
            className="inline-flex items-center gap-2 px-6 py-3 bamboo-button hover-lift"
          >
            📖 How to Use
          </a>
          <a
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bamboo-button hover-lift hover-rainbow"
          >
            📝 Color Blog
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
