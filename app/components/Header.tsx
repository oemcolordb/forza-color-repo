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
      <h1 className={`text-4xl md:text-6xl font-bold tracking-tight animate-fade-in-up ${
        isDarkMode ? 'text-blue-100' : 'text-blue-900'
      }`}>
        <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 bg-[length:200%_200%] animate-gradient text-transparent bg-clip-text">
          Forza Color Universe
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