import React, { useState, useEffect } from 'react'

interface TokyoBackgroundProps {
  isDarkMode: boolean
}

const TokyoBackground: React.FC<TokyoBackgroundProps> = ({ isDarkMode: _isDarkMode }) => {
  const [currentMeme, setCurrentMeme] = useState(0)
  const [currentBg, setCurrentBg] = useState(0)
  
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

  const backgroundImages = [
    '/Tokyo-Panorama.jpg',
    '/Neon-Shibuya-crossing-Tokyo-Japan-1140x760.jpg',
    '/manuel-velasquez-ssfp9okORYs-unsplash-1200x801.jpg',
    '/1-5.jpeg',
    '/2-3.jpeg',
    '/3-4.jpeg',
    '/4-4.jpeg'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMeme((prev) => (prev + 1) % forzaMemes.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [forzaMemes.length])

  useEffect(() => {
    const bgInterval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgroundImages.length)
    }, 15000) // Change background every 15 seconds
    return () => clearInterval(bgInterval)
  }, [backgroundImages.length])

  return (
    <>
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Dynamic Background Images */}
      <div className="absolute inset-0">
        {backgroundImages.map((img, index) => (
          <div
            key={img}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-2000 ${
              index === currentBg ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${img})`,
              filter: _isDarkMode ? 'brightness(0.4) contrast(1.2) saturate(1.3)' : 'brightness(0.7) contrast(1.1)'
            }}
          />
        ))}
        
        {/* Dynamic Overlay Based on Mode */}
        <div className={`absolute inset-0 transition-all duration-1000 ${
          _isDarkMode 
            ? 'bg-gradient-to-b from-purple-900/60 via-blue-900/70 to-black/90' 
            : 'bg-gradient-to-b from-blue-200/30 via-purple-200/40 to-gray-800/60'
        }`} />
      </div>
      
      {/* Enhanced Tokyo Cityscape Overlay */}
      <div className="absolute inset-0">
        
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
        
        {/* Tokyo Skyscrapers - Enhanced and Larger */}
        <div className="absolute bottom-0 w-full flex items-end justify-center z-10">
          {/* Skyscraper 1 - Left Mega Tower */}
          <div className="w-48 h-96 bg-gradient-to-t from-gray-900 via-gray-800 to-gray-700 mr-4 relative shadow-2xl">
            {/* Detailed Building Structure */}
            <div className="absolute inset-x-2 top-4 bottom-4 border-l border-r border-gray-600 opacity-50"></div>
            <div className="absolute inset-y-2 left-4 right-4 border-t border-b border-gray-600 opacity-30"></div>
            
            {/* Animated Windows Grid */}
            {[...Array(60)].map((_, i) => {
              const row = Math.floor(i / 6)
              const col = i % 6
              const isLit = _isDarkMode && Math.random() > 0.3
              return (
                <div key={i} 
                     className={`absolute w-4 h-3 transition-all duration-1000 ${
                       isLit ? 'bg-yellow-300 shadow-lg shadow-yellow-300/50' : 'bg-gray-800 border border-gray-700'
                     }`}
                     style={{
                       left: `${8 + col * 7}px`,
                       top: `${20 + row * 6}px`,
                       animationDelay: `${i * 0.1}s`
                     }} />
              )
            })}
            
            {/* Rooftop Details */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-12 bg-red-500 animate-pulse"></div>
            <div className="absolute top-2 left-4 w-6 h-6 bg-gray-600 border border-gray-500"></div>
            <div className="absolute top-2 right-4 w-6 h-6 bg-gray-600 border border-gray-500"></div>
            
            {/* Large Neon Sign */}
            <div className="absolute top-32 left-2 w-44 h-16 bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-lg font-bold text-white neon-flicker shadow-lg shadow-pink-500/50">
              HONDA RACING
            </div>
          </div>
          
          {/* Skyscraper 2 - Center Mega Tower */}
          <div className="w-56 h-[28rem] bg-gradient-to-t from-gray-950 via-gray-900 to-gray-800 mr-2 relative shadow-2xl">
            {/* Detailed Architecture */}
            <div className="absolute inset-x-3 top-6 bottom-6 border-l border-r border-gray-600 opacity-40"></div>
            <div className="absolute left-6 right-6 top-1/3 h-px bg-gray-600 opacity-60"></div>
            <div className="absolute left-6 right-6 top-2/3 h-px bg-gray-600 opacity-60"></div>
            
            {/* Massive Windows Grid */}
            {[...Array(84)].map((_, i) => {
              const row = Math.floor(i / 7)
              const col = i % 7
              const isLit = _isDarkMode && Math.random() > 0.25
              return (
                <div key={i} 
                     className={`absolute w-5 h-4 transition-all duration-1500 ${
                       isLit ? 'bg-cyan-300 shadow-lg shadow-cyan-300/50' : 'bg-gray-900 border border-gray-700'
                     }`}
                     style={{
                       left: `${10 + col * 7}px`,
                       top: `${30 + row * 9}px`,
                       animationDelay: `${i * 0.08}s`
                     }} />
              )
            })}
            
            {/* Massive Billboard */}
            <div className="absolute top-48 left-4 w-48 h-20 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white neon-text shadow-2xl shadow-cyan-500/50">
              {forzaMemes[currentMeme]}
            </div>
            
            {/* Rooftop Antenna */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-20 bg-red-400 animate-pulse"></div>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          
          {/* Enhanced Tokyo Tower */}
          <div className="w-24 h-80 bg-gradient-to-t from-red-700 to-red-500 mr-4 relative shadow-2xl">
            {/* Tower Structure Details */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-24 bg-red-400"></div>
            <div className="absolute top-24 left-3 w-18 h-2 bg-red-400"></div>
            <div className="absolute top-48 left-3 w-18 h-2 bg-red-400"></div>
            <div className="absolute top-64 left-4 w-16 h-2 bg-red-400"></div>
            
            {/* Cross Beams */}
            <div className="absolute top-16 left-6 w-12 h-px bg-red-300 transform rotate-45"></div>
            <div className="absolute top-16 right-6 w-12 h-px bg-red-300 transform -rotate-45"></div>
            <div className="absolute top-40 left-6 w-12 h-px bg-red-300 transform rotate-45"></div>
            <div className="absolute top-40 right-6 w-12 h-px bg-red-300 transform -rotate-45"></div>
            
            {/* Enhanced Tower Lights */}
            <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full animate-pulse shadow-lg shadow-white/50"></div>
            <div className="absolute top-28 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full animate-pulse shadow-lg shadow-white/50"></div>
            <div className="absolute top-52 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full animate-pulse shadow-lg shadow-white/50"></div>
            <div className="absolute top-68 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full animate-pulse shadow-lg shadow-white/50"></div>
          </div>
          
          {/* Skyscraper 3 - Right Mega Tower */}
          <div className="w-44 h-72 bg-gradient-to-t from-gray-900 via-gray-800 to-gray-700 mr-2 relative shadow-2xl">
            {/* Building Details */}
            <div className="absolute inset-x-2 top-4 bottom-4 border-l border-r border-gray-600 opacity-50"></div>
            
            {/* Windows with Animation */}
            {[...Array(48)].map((_, i) => {
              const row = Math.floor(i / 6)
              const col = i % 6
              const isLit = _isDarkMode && Math.random() > 0.35
              return (
                <div key={i} 
                     className={`absolute w-4 h-3 transition-all duration-1200 ${
                       isLit ? 'bg-green-300 shadow-lg shadow-green-300/50' : 'bg-gray-800 border border-gray-700'
                     }`}
                     style={{
                       left: `${8 + col * 6}px`,
                       top: `${25 + row * 8}px`,
                       animationDelay: `${i * 0.12}s`
                     }} />
              )
            })}
            
            {/* Enhanced Neon Sign */}
            <div className="absolute top-36 left-2 w-40 h-12 bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-lg font-bold text-white neon-text shadow-lg shadow-green-500/50">
              NISSAN GTR
            </div>
          </div>
          
          {/* Skyscraper 4 - Far Right Tower */}
          <div className="w-36 h-64 bg-gradient-to-t from-gray-950 via-gray-900 to-gray-800 relative shadow-2xl">
            {/* Windows Grid */}
            {[...Array(36)].map((_, i) => {
              const row = Math.floor(i / 6)
              const col = i % 6
              const isLit = _isDarkMode && Math.random() > 0.4
              return (
                <div key={i} 
                     className={`absolute w-3 h-3 transition-all duration-1000 ${
                       isLit ? 'bg-purple-300 shadow-lg shadow-purple-300/50' : 'bg-gray-900 border border-gray-700'
                     }`}
                     style={{
                       left: `${6 + col * 5}px`,
                       top: `${20 + row * 7}px`,
                       animationDelay: `${i * 0.15}s`
                     }} />
              )
            })}
            
            {/* Neon Sign */}
            <div className="absolute top-32 left-2 w-32 h-10 bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white neon-flicker shadow-lg shadow-purple-500/50">
              TOYOTA SUPRA
            </div>
          </div>
        </div>
        
        {/* Street Level Neon Signs - Visual Only */}
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
        
        {/* AI-Generated Particle Effects */}
        {[...Array(25)].map((_, i) => (
          <div key={`particle-${i}`} 
               className={`absolute rounded-full animate-float transition-all duration-1000`}
               style={{
                 left: `${Math.random() * 100}%`,
                 top: `${20 + Math.random() * 60}%`,
                 width: `${2 + Math.random() * 4}px`,
                 height: `${2 + Math.random() * 4}px`,
                 backgroundColor: _isDarkMode 
                   ? ['#ff0080', '#00ffff', '#ffff00', '#ff4000', '#8000ff', '#00ff80'][Math.floor(Math.random() * 6)]
                   : ['#ff6b9d', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'][Math.floor(Math.random() * 6)],
                 animationDelay: `${Math.random() * 3}s`,
                 animationDuration: `${3 + Math.random() * 4}s`,
                 boxShadow: `0 0 ${_isDarkMode ? '15px' : '8px'} currentColor`,
                 opacity: _isDarkMode ? 0.8 : 0.6
               }} />
        ))}
        
        {/* Dynamic Weather Effects */}
        {_isDarkMode && [...Array(40)].map((_, i) => (
          <div key={`rain-${i}`}
               className="absolute w-px bg-gradient-to-b from-transparent via-cyan-200 to-transparent animate-rain"
               style={{
                 left: `${Math.random() * 100}%`,
                 height: `${40 + Math.random() * 80}px`,
                 top: `${Math.random() * 30}%`,
                 animationDelay: `${Math.random() * 2}s`,
                 animationDuration: `${1 + Math.random() * 1.5}s`
               }} />
        ))}
        
        {/* Atmospheric Glow with Dynamic Colors */}
        <div className={`absolute inset-0 transition-all duration-2000 ${
          _isDarkMode 
            ? 'bg-gradient-radial from-purple-500/20 via-cyan-500/10 to-transparent'
            : 'bg-gradient-radial from-blue-300/15 via-purple-300/10 to-transparent'
        }`} />
        
        {/* Final Atmospheric Layer */}
        <div className={`absolute inset-0 transition-all duration-1000 ${
          _isDarkMode 
            ? 'bg-gradient-to-t from-black/70 via-transparent to-purple-900/30'
            : 'bg-gradient-to-t from-gray-900/40 via-transparent to-blue-200/20'
        }`} />
      </div>
    </div>
    
    {/* Clickable Signs Layer */}
    <div className="fixed inset-0 pointer-events-none z-50">
      <button 
        className="absolute bottom-32 left-8 w-32 h-8 bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white neon-flicker transform -rotate-2 cursor-pointer hover:scale-105 transition-transform pointer-events-auto"
        onClick={() => {
          if (confirm('Open Google Sheets color database in a new tab?')) {
            window.open('https://docs.google.com/spreadsheets/d/1wLXN4PusGWD7zcpLiS-uizYm6iZc2WM1EbBMurlAlj4/edit?gid=0#gid=0', '_blank')
          }
        }}
      >
        FORZA COLORS
      </button>
      
      <button 
        className="absolute bottom-40 right-12 w-28 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-xs font-bold text-black neon-text transform rotate-1 cursor-pointer hover:scale-105 transition-transform pointer-events-auto"
        onClick={() => {
          if (confirm('Open Google Sheets color database in a new tab?')) {
            window.open('https://docs.google.com/spreadsheets/d/1wLXN4PusGWD7zcpLiS-uizYm6iZc2WM1EbBMurlAlj4/edit?gid=0#gid=0', '_blank')
          }
        }}
      >
        10K+ PAINTS
      </button>
    </div>
    </>
  )
}

export default TokyoBackground