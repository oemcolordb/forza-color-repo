import React, { useState, useEffect } from 'react'

interface TokyoBackgroundProps {
  isDarkMode: boolean
}

const TokyoBackground: React.FC<TokyoBackgroundProps> = ({ isDarkMode: _isDarkMode }) => {
  const [currentMeme, setCurrentMeme] = useState(0)
  
  const forzaMemes = [
    "DRIFT KING",
    "VTEC KICKED IN",
    "BOOST LIFE",
    "TURBO GANG",
    "STANCE NATION",
    "JDM LEGEND",
    "TOKYO DRIFT",
    "NEON GENESIS",
    "SPEED DEMON",
    "NITROUS OXIDE"
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMeme((prev) => (prev + 1) % forzaMemes.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [forzaMemes.length])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Tokyo Cityscape Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-blue-900/60 to-black/80">
        
        {/* Distant Mountains */}
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-gray-800 to-gray-600 opacity-60">
          <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-black to-transparent"></div>
        </div>
        
        {/* Highway/Roads */}
        <div className="absolute bottom-0 w-full h-24">
          {/* Main Highway */}
          <div className="absolute bottom-8 w-full h-8 bg-gray-700 transform perspective-1000 rotateX-12">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-pulse"></div>
            {/* Road Lines */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-yellow-300 opacity-60 animate-pulse"></div>
            {/* Car Light Trails */}
            <div className="absolute top-2 left-10 w-32 h-1 bg-red-400 opacity-80 animate-pulse"></div>
            <div className="absolute top-5 right-20 w-24 h-1 bg-white opacity-90 animate-pulse"></div>
          </div>
        </div>
        
        {/* Tokyo Skyscrapers */}
        <div className="absolute bottom-0 w-full flex items-end justify-center">
          {/* Skyscraper 1 - Left */}
          <div className="w-24 h-64 bg-gradient-to-t from-gray-800 to-gray-700 mr-2 relative">
            {/* Building lights pattern */}
            {[...Array(12)].map((_, i) => (
              <div key={i} className={`absolute w-2 h-2 bg-yellow-400 animate-pulse`} 
                   style={{
                     left: `${10 + (i % 3) * 8}px`,
                     top: `${20 + Math.floor(i / 3) * 20}px`,
                     animationDelay: `${i * 0.3}s`
                   }} />
            ))}
            {/* Neon Sign */}
            <div className="absolute top-16 left-1 w-20 h-8 bg-pink-500/80 flex items-center justify-center text-xs font-bold text-white neon-flicker">
              HONDA
            </div>
          </div>
          
          {/* Skyscraper 2 - Center Tall */}
          <div className="w-32 h-80 bg-gradient-to-t from-gray-900 to-gray-700 mr-1 relative">
            {/* Building lights */}
            {[...Array(20)].map((_, i) => (
              <div key={i} className={`absolute w-2 h-2 bg-cyan-400 animate-pulse`}
                   style={{
                     left: `${8 + (i % 4) * 8}px`,
                     top: `${30 + Math.floor(i / 4) * 18}px`,
                     animationDelay: `${i * 0.2}s`
                   }} />
            ))}
            {/* Large Neon Billboard */}
            <div className="absolute top-32 left-2 w-28 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white neon-text">
              {forzaMemes[currentMeme]}
            </div>
          </div>
          
          {/* Tokyo Tower */}
          <div className="w-16 h-72 bg-gradient-to-t from-red-600 to-red-400 mr-2 relative">
            {/* Tower Structure */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-16 bg-red-300"></div>
            <div className="absolute top-16 left-2 w-12 h-1 bg-red-300"></div>
            <div className="absolute top-32 left-2 w-12 h-1 bg-red-300"></div>
            {/* Tower Lights */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white animate-pulse"></div>
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white animate-pulse"></div>
            <div className="absolute top-36 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white animate-pulse"></div>
          </div>
          
          {/* Skyscraper 3 - Right */}
          <div className="w-28 h-56 bg-gradient-to-t from-gray-800 to-gray-600 mr-1 relative">
            {/* Building lights */}
            {[...Array(15)].map((_, i) => (
              <div key={i} className={`absolute w-2 h-2 bg-green-400 animate-pulse`}
                   style={{
                     left: `${6 + (i % 4) * 7}px`,
                     top: `${25 + Math.floor(i / 4) * 15}px`,
                     animationDelay: `${i * 0.4}s`
                   }} />
            ))}
            {/* Neon Sign */}
            <div className="absolute top-24 left-2 w-24 h-6 bg-green-500/80 flex items-center justify-center text-xs font-bold text-white neon-text">
              NISSAN
            </div>
          </div>
          
          {/* Skyscraper 4 - Far Right */}
          <div className="w-20 h-48 bg-gradient-to-t from-gray-900 to-gray-700 relative">
            {/* Building lights */}
            {[...Array(10)].map((_, i) => (
              <div key={i} className={`absolute w-2 h-2 bg-purple-400 animate-pulse`}
                   style={{
                     left: `${4 + (i % 3) * 6}px`,
                     top: `${20 + Math.floor(i / 3) * 16}px`,
                     animationDelay: `${i * 0.5}s`
                   }} />
            ))}
            {/* Neon Sign */}
            <div className="absolute top-20 left-1 w-18 h-6 bg-purple-500/80 flex items-center justify-center text-xs font-bold text-white neon-flicker">
              TOYOTA
            </div>
          </div>
        </div>
        
        {/* Street Level Neon Signs */}
        <div className="absolute bottom-32 left-8 w-32 h-8 bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white neon-flicker transform -rotate-2">
          FORZA COLORS
        </div>
        
        <div className="absolute bottom-40 right-12 w-28 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-xs font-bold text-black neon-text transform rotate-1">
          10K+ PAINTS
        </div>
        
        {/* Traffic Lights */}
        <div className="absolute bottom-28 left-1/3 w-2 h-8 bg-gray-800 rounded">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mb-1"></div>
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mb-1"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        
        {/* Floating Neon Particles */}
        {[...Array(15)].map((_, i) => (
          <div key={i} 
               className={`absolute w-1 h-1 rounded-full animate-bounce`}
               style={{
                 left: `${Math.random() * 100}%`,
                 top: `${20 + Math.random() * 40}%`,
                 backgroundColor: ['#ff0080', '#00ffff', '#ffff00', '#ff4000', '#8000ff'][Math.floor(Math.random() * 5)],
                 animationDelay: `${Math.random() * 2}s`,
                 animationDuration: `${2 + Math.random() * 2}s`,
                 boxShadow: `0 0 10px currentColor`
               }} />
        ))}
        
        {/* Rain Effect */}
        {[...Array(30)].map((_, i) => (
          <div key={i}
               className="absolute w-px bg-gradient-to-b from-transparent via-blue-200 to-transparent tokyo-rain"
               style={{
                 left: `${Math.random() * 100}%`,
                 height: `${30 + Math.random() * 60}px`,
                 top: `${Math.random() * 50}%`,
                 animationDelay: `${Math.random() * 3}s`,
                 animationDuration: `${1.5 + Math.random() * 1.5}s`
               }} />
        ))}
        
        {/* Atmospheric Glow */}
        <div className="absolute inset-0 bg-gradient-radial from-purple-500/10 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-purple-900/20"></div>
      </div>
    </div>
  )
}

export default TokyoBackground