import React from 'react'

interface FooterProps {
  isDarkMode: boolean
}

const Footer: React.FC<FooterProps> = ({ isDarkMode }) => {
  return (
    <footer className={`py-8 mt-16 border-t ${
      isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-gray-200 bg-gray-50'
    }`}>
      <div className="container mx-auto px-4 text-center">
        <div className={`mb-4 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
          <h3 className="text-lg font-bold mb-2">
            <span className="bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-transparent bg-clip-text">
              Forza Color Universe
            </span>
          </h3>
          <p className="text-sm mb-4">
            Comprehensive database of automotive paint colors from Forza racing games
          </p>
        </div>
        
        <div className={`border-t pt-4 ${
          isDarkMode ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <p className={`text-sm font-semibold ${
            isDarkMode ? 'text-slate-200' : 'text-gray-800'
          }`}>
            🎨 Created by{' '}
            <span className="text-fuchsia-500 font-bold text-lg">
              ResinRonin
            </span>
          </p>
          <p className={`text-xs mt-1 ${
            isDarkMode ? 'text-slate-400' : 'text-gray-500'
          }`}>
            Original data extraction, curation, and application development
          </p>
          <p className={`text-xs mt-2 ${
            isDarkMode ? 'text-slate-500' : 'text-gray-400'
          }`}>
            © 2024 ResinRonin • All color data sourced from Forza racing games
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer