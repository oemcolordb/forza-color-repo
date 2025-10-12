import React from 'react'
import { HeaderProps } from '../types'
import { ErrorBoundary } from '../lib/errorBoundary'

const Header: React.FC<HeaderProps> = ({ isDarkMode, onToggleTheme, onShowAuth }) => {
  
  return (
    <ErrorBoundary>
      <header className="py-8 text-center bg-transparent relative">
        <button
          onClick={onToggleTheme}
          className={`fixed top-4 left-4 z-50 p-3 rounded-full shadow-lg border-2 transition-all ${
            isDarkMode 
              ? 'bg-yellow-400 border-yellow-300 text-yellow-900 hover:bg-yellow-300' 
              : 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700'
          }`}
          aria-label="Toggle theme"
          style={{ minHeight: '48px', minWidth: '48px' }}
        >
          <span className="text-xl">{isDarkMode ? '☀️' : '🌙'}</span>
        </button>
        <div className="absolute top-4 right-4 flex items-center gap-3">
          {false ? (
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-white bg-slate-800/80 px-2 py-1 rounded' : 'text-gray-900 bg-white/80 px-2 py-1 rounded'
              }`}>
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
              className={`px-4 py-2 text-sm font-medium rounded-lg border-2 transition-colors ${
                isDarkMode
                  ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700'
                  : 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700'
              }`}
            >
              Sign In
            </button>
          )}
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-fade-in-up bg-black/50 backdrop-blur-sm px-6 py-4 rounded-lg inline-block">
          <span className="neon-text animate-color-shift text-white" style={{
            textShadow: '0 0 10px #ff0080, 0 0 20px #00ff80, 0 0 30px #8000ff, 0 0 40px #ff8000, 0 0 50px currentColor',
            animation: 'neon-glow 2s ease-in-out infinite alternate'
          }}>
            🎨 OEMColorDB
          </span>
        </h1>
        <p className="mt-4 text-lg max-w-2xl mx-auto text-white font-semibold bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
          The ultimate color harmony engine for car lovers and Forza fans. 10,000+ real manufacturer colors. Curated by ResinRonin. Spin. Extract. Create.<br />
          <span className="block mt-2 text-base font-normal text-gray-200">
            <strong>Credits:</strong> To the GTPlanet community, with special thanks to Terronium-12 (original creator), Frizbe (revival), and ongoing contributors Mitcho2001, JaCor653, and MadaraxUchiha, whose dedication built and maintained the Forza Color Database Spreadsheet.
          </span>
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <a 
            href="/tuneforge"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            🔧 TuneForge Lab
          </a>
          <a 
            href="/how-to-use"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            📖 How to Use
          </a>
        </div>
      </header>
    </ErrorBoundary>
  )
}

export default Header