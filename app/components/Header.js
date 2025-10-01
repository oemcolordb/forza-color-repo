import React from 'react'
import { useAuth } from './AuthProvider'

const Header = ({ isDarkMode, onToggleTheme, onShowAuth }) => {
  const { user, logout } = useAuth()
  
  return (
    <header className="py-8 text-center bg-transparent relative">
      <div className="absolute top-4 right-4 flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
              {user.name}
            </span>
            <button
              onClick={logout}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                isDarkMode
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={onShowAuth}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              isDarkMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Sign In
          </button>
        )}
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-lg border-2 ${
            isDarkMode 
              ? 'bg-yellow-500 border-yellow-400 text-yellow-900' 
              : 'bg-blue-900 border-blue-800 text-blue-100'
          }`}
          aria-label="Toggle theme"
        >
          <span className="text-lg">{isDarkMode ? '☀️' : '🌙'}</span>
        </button>
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
        The ultimate color harmony engine for car lovers and Forza fans. 10,000+ real manufacturer colors. Curated by ResinRonin. Spin. Extract. Create.
      </p>
      <div className="mt-6">
        <a 
          href="/tuneforge"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
        >
          🔧 TuneForge Lab
        </a>
      </div>
    </header>
  )
}

export default Header