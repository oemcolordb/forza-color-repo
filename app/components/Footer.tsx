import React from 'react'

interface FooterProps {
  isDarkMode: boolean
}

const Footer: React.FC<FooterProps> = ({ isDarkMode }) => {
  return (
    <footer
      className={`py-5 mt-8 border-t ${
        isDarkMode
          ? 'bamboo-surface-dark border-[color:var(--bamboo-border)]'
          : 'bamboo-surface border-[color:var(--bamboo-border)]'
      }`}
    >
      <div className="container mx-auto px-4 text-center">
        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
          Credits: To the GTPlanet community, with special thanks to Terronium-12 (original
          creator), Frizbe (revival), and ongoing contributors Mitcho2001, JaCor653, and
          MadaraxUchiha, whose dedication built and maintained the Forza Color Database Spreadsheet.
          {/* 🌿 hidden easter egg — barely visible, hover to reveal */}
          <span
            className="inline-block opacity-[0.04] hover:opacity-100 cursor-default transition-all duration-700 ml-2 text-green-500 hover:animate-leaf-spin align-middle select-none"
            title="psst… try ↑↑↓↓←→←→BA 😏"
            aria-hidden="true"
          >
            🌿
          </span>
        </p>
        <p className="mt-2 text-sm font-medium opacity-70 text-slate-600">
          Paint Tunes & ♥ By ResiRonin
        </p>
      </div>
    </footer>
  )
}

export default Footer
