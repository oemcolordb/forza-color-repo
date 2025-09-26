import React from 'react'

interface HeaderProps {
  isDarkMode: boolean
  onToggleTheme: () => void
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, onToggleTheme }) => {
  return (
    <header className="py-8 text-center bg-transparent relative">
      <button
        onClick={onToggleTheme}
        className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
          isDarkMode ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
        }`}
        aria-label="Toggle theme"
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>
      <h1 className={`text-4xl md:text-6xl font-bold tracking-tight ${
        isDarkMode ? 'text-slate-100' : 'text-gray-900'
      }`}>
        <span className="bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-transparent bg-clip-text">
          Forza Color Universe
        </span>
      </h1>
      <p className={`mt-4 text-lg max-w-2xl mx-auto ${
        isDarkMode ? 'text-slate-300' : 'text-gray-600'
      }`}>
        10 Thousand official manufacturer colors
      </p>
      <div className={`mt-6 text-center ${
        isDarkMode ? 'text-slate-400' : 'text-gray-500'
      }`}>
        <p className="text-sm">
          Created by{' '}
          <span className="font-bold text-fuchsia-500">
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