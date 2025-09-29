import React from 'react'
import { useAuth } from './AuthProvider'

interface HeaderProps {
  isDarkMode: boolean
  onToggleTheme: () => void
  onShowAuth?: () => void
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, onToggleTheme, onShowAuth }) => {
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
          className={`p-2 rounded-lg transition-colors ${
            isDarkMode ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
          aria-label="Toggle theme"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
      <h1 className={`text-4xl md:text-6xl font-bold tracking-tight animate-fade-in-up ${
        isDarkMode ? 'text-blue-100' : 'text-blue-900'
      }`}>
        <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 bg-[length:200%_200%] animate-gradient text-transparent bg-clip-text hover:animate-pulse transition-all duration-300">
          🎨 Forza Color Universe
        </span>
      </h1>
      <p className={`mt-4 text-lg max-w-2xl mx-auto ${
        isDarkMode ? 'text-blue-200' : 'text-blue-700'
      }`}>
        10 Thousand official manufacturer colors
      </p>
      <div className={`mt-6 text-center ${
        isDarkMode ? 'text-blue-300' : 'text-blue-600'
      }`}>
        <p className="text-sm">
          Created by{' '}
          <span className="font-bold text-blue-400">
            ResinRonin
          </span>
        </p>
        <p className="text-xs mt-1 opacity-75">
          Original Forza color data extraction and curation
        </p>
      </div>
    </header>
  )
}

export default Header