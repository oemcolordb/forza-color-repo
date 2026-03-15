'use client'

import React, { useMemo } from 'react'

interface CreditsBackgroundProps {
  isDarkMode: boolean
}

const CreditsBackground: React.FC<CreditsBackgroundProps> = ({ isDarkMode }) => {
  const credits = [
    'Terronium-12',
    'Frizbe (revival)',
    'Mitcho2001',
    'JaCor653',
    'MadaraxUchiha',
    'Altf4toQu1t',
    'ResinRonin',
  ]

  // Generate positions for credits scattered across the page
  const creditPositions = useMemo(() => {
    return credits.map((credit, index) => {
      // Use a seeded random for consistent positioning
      const seed = index * 73 // Prime number for better distribution
      const pseudoRandom = (n: number) => Math.sin(seed + n) * 10000 - Math.floor(Math.sin(seed + n) * 10000)

      return {
        credit,
        top: `${pseudoRandom(1) % 80 + 10}%`,
        left: `${pseudoRandom(2) % 85 + 5}%`,
        rotation: (pseudoRandom(3) % 360 - 180) * 0.3, // Subtle rotation (-54 to 54 degrees)
        delay: index * 0.2,
        scale: 0.8 + (pseudoRandom(4) % 40) / 100, // Between 0.8 and 1.2
      }
    })
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <style>{`
        @keyframes credit-drift {
          0%, 100% {
            opacity: 0.15;
            transform: translateY(0);
          }
          50% {
            opacity: 0.08;
            transform: translateY(-8px);
          }
        }
      `}</style>

      {creditPositions.map((position, index) => (
        <div
          key={`credit-${index}`}
          className={`absolute font-mono text-sm font-bold whitespace-nowrap ${
            isDarkMode
              ? 'text-slate-600/30'
              : 'text-slate-400/20'
          }`}
          style={{
            top: position.top,
            left: position.left,
            transform: `rotate(${position.rotation}deg) scale(${position.scale})`,
            letterSpacing: '2px',
            textShadow: isDarkMode
              ? '0 0 20px rgba(100, 116, 139, 0.15)'
              : '0 0 15px rgba(148, 163, 184, 0.1)',
            animation: `credit-drift ${4 + index * 0.3}s ease-in-out infinite`,
            animationDelay: `${position.delay}s`,
          }}
        >
          {position.credit}
        </div>
      ))}
    </div>
  )
}

export default CreditsBackground
