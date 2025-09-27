import React, { useState, useEffect } from 'react'
import WindSystem from './WindSystem'

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
        
        {/* Tokyo Skyscrapers - Ultra Realistic */}
        <div className="absolute bottom-0 w-full flex items-end justify-center z-10">
          {/* Skyscraper 1 - Modern Glass Tower */}
          <div className="w-52 h-[28rem] mr-3 relative shadow-2xl transform perspective-1000">
            {/* Main Building Structure */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-slate-800 to-slate-700 rounded-t-sm">
              {/* Glass Facade Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-cyan-900/30 rounded-t-sm"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/5 to-transparent rounded-t-sm"></div>
            </div>
            
            {/* Structural Lines */}
            <div className="absolute inset-x-0 top-0 bottom-0">
              {[...Array(8)].map((_, i) => (
                <div key={`vline-${i}`} className="absolute top-0 bottom-0 w-px bg-slate-600/40" style={{ left: `${12 + i * 16}%` }} />
              ))}
              {[...Array(15)].map((_, i) => (
                <div key={`hline-${i}`} className="absolute left-0 right-0 h-px bg-slate-600/30" style={{ top: `${8 + i * 6}%` }} />
              ))}
            </div>
            
            {/* Realistic Windows Grid */}
            {[...Array(84)].map((_, i) => {
              const row = Math.floor(i / 7)
              const col = i % 7
              const lightChance = _isDarkMode ? 0.75 : 0.15
              const isLit = Math.random() > (1 - lightChance)
              const lightColors = _isDarkMode ? ['bg-amber-200', 'bg-yellow-200', 'bg-orange-200', 'bg-blue-200'] : ['bg-slate-300']
              const colorIndex = Math.floor(Math.random() * lightColors.length)
              return (
                <div key={i} 
                     className={`absolute w-5 h-4 transition-all duration-2000 animate-window-pulse ${
                       isLit ? `${lightColors[colorIndex]} shadow-lg glow-effect` : (_isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-slate-200 border border-slate-400')
                     }`}
                     style={{
                       left: `${12 + col * 11}px`,
                       top: `${25 + row * 8}px`,
                       animationDelay: `${i * 0.08}s`,
                       borderRadius: '1px',
                       boxShadow: isLit ? `0 0 8px ${lightColors[colorIndex].replace('bg-', '').replace('-200', '')}, inset 0 0 4px rgba(255,255,255,0.3)` : 'inset 0 0 2px rgba(0,0,0,0.5)'
                     }} />
              )
            })}
            
            {/* Rooftop Infrastructure */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-16 bg-slate-700 rounded-t">
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-8 bg-red-500 animate-pulse rounded-full"></div>
              <div className="absolute top-1 left-2 w-2 h-2 bg-slate-600 rounded"></div>
              <div className="absolute top-1 right-2 w-2 h-2 bg-slate-600 rounded"></div>
            </div>
            
            {/* Holographic Billboard */}
            <div className="absolute top-40 left-1 w-50 h-20 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold text-white neon-text shadow-2xl shadow-cyan-500/50 rounded border border-cyan-400/50">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              HONDA RACING
            </div>
          </div>
          
          {/* Skyscraper 2 - Futuristic Central Tower */}
          <div className="w-60 h-[32rem] mr-2 relative shadow-2xl transform perspective-1000">
            {/* Main Structure with Curved Design */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-800 rounded-t-lg">
              {/* Holographic Glass Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/15 rounded-t-lg"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/8 to-transparent rounded-t-lg animate-glow-pulse"></div>
            </div>
            
            {/* Architectural Details */}
            <div className="absolute inset-x-4 top-8 bottom-8">
              {/* Vertical Supports */}
              {[...Array(6)].map((_, i) => (
                <div key={`support-${i}`} className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-600 to-slate-700" style={{ left: `${i * 20}%` }} />
              ))}
              {/* Horizontal Floors */}
              {[...Array(20)].map((_, i) => (
                <div key={`floor-${i}`} className="absolute left-0 right-0 h-px bg-slate-600/50" style={{ top: `${i * 5}%` }} />
              ))}
            </div>
            
            {/* Advanced Windows Grid */}
            {[...Array(96)].map((_, i) => {
              const row = Math.floor(i / 8)
              const col = i % 8
              const lightChance = _isDarkMode ? 0.8 : 0.2
              const isLit = Math.random() > (1 - lightChance)
              const lightColors = _isDarkMode ? ['bg-cyan-200', 'bg-blue-200', 'bg-teal-200', 'bg-sky-200', 'bg-indigo-200'] : ['bg-slate-300']
              const colorIndex = Math.floor(Math.random() * lightColors.length)
              return (
                <div key={i} 
                     className={`absolute w-5 h-5 transition-all duration-1800 animate-window-shimmer ${
                       isLit ? `${lightColors[colorIndex]} shadow-lg glow-effect` : (_isDarkMode ? 'bg-slate-950 border border-slate-800' : 'bg-slate-200 border border-slate-400')
                     }`}
                     style={{
                       left: `${8 + col * 11}px`,
                       top: `${35 + row * 8}px`,
                       animationDelay: `${i * 0.05}s`,
                       borderRadius: '2px',
                       boxShadow: isLit ? `0 0 12px ${lightColors[colorIndex].replace('bg-', '').replace('-200', '')}, inset 0 0 6px rgba(255,255,255,0.4)` : 'inset 0 0 3px rgba(0,0,0,0.6)'
                     }} />
              )
            })}
            
            {/* Massive Holographic Billboard */}
            <div className="absolute top-52 left-2 w-56 h-24 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white neon-text shadow-2xl shadow-cyan-500/60 rounded-lg border-2 border-cyan-300/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse transform skew-x-12"></div>
              <div className="relative z-10">{forzaMemes[currentMeme]}</div>
            </div>
            
            {/* Advanced Rooftop */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-24 bg-slate-700 rounded-t-lg">
              <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-3 h-12 bg-red-500 animate-pulse rounded-full shadow-lg shadow-red-500/50"></div>
              <div className="absolute top-1 left-2 w-3 h-3 bg-slate-600 rounded border border-slate-500"></div>
              <div className="absolute top-1 right-2 w-3 h-3 bg-slate-600 rounded border border-slate-500"></div>
              <div className="absolute top-6 left-1 w-2 h-8 bg-slate-600 rounded"></div>
              <div className="absolute top-6 right-1 w-2 h-8 bg-slate-600 rounded"></div>
            </div>
          </div>
          
          {/* Ultra-Realistic Tokyo Tower */}
          <div className="w-28 h-[22rem] mr-4 relative shadow-2xl">
            {/* Main Tower Structure */}
            <div className="absolute inset-0 bg-gradient-to-t from-red-800 via-red-600 to-red-500 transform perspective-1000">
              {/* Metallic Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
            </div>
            
            {/* Detailed Tower Framework */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-5 h-28 bg-red-400 rounded-t"></div>
            
            {/* Horizontal Platforms */}
            {[...Array(4)].map((_, i) => (
              <div key={`platform-${i}`} 
                   className="absolute bg-red-400 shadow-lg" 
                   style={{
                     left: `${12 - i * 2}px`,
                     right: `${12 - i * 2}px`,
                     top: `${24 + i * 24}px`,
                     height: '3px',
                     borderRadius: '1px'
                   }} />
            ))}
            
            {/* Cross Beam Structure */}
            {[...Array(8)].map((_, i) => {
              const section = Math.floor(i / 2)
              const isLeft = i % 2 === 0
              return (
                <div key={`beam-${i}`} 
                     className="absolute w-16 h-0.5 bg-red-300 shadow-sm" 
                     style={{
                       left: isLeft ? '2px' : '6px',
                       top: `${20 + section * 24 + (i % 2) * 12}px`,
                       transform: `rotate(${isLeft ? 45 : -45}deg)`,
                       transformOrigin: 'left center'
                     }} />
              )
            })}
            
            {/* Advanced Tower Lights */}
            {[...Array(6)].map((_, i) => (
              <div key={`light-${i}`}
                   className={`absolute w-4 h-4 rounded-full transition-all duration-1000 ${
                     _isDarkMode ? 'bg-red-400 animate-pulse shadow-lg shadow-red-400/80 glow-effect' : 'bg-red-200 shadow-sm shadow-red-200/40'
                   }`}
                   style={{
                     left: '50%',
                     top: `${16 + i * 16}px`,
                     transform: 'translateX(-50%)',
                     boxShadow: _isDarkMode ? '0 0 16px #f87171, 0 0 32px #ef4444' : '0 0 8px #fca5a5'
                   }} />
            ))}
            
            {/* Observation Deck */}
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-8 h-6 bg-red-300 rounded border border-red-200 shadow-lg">
              <div className="absolute inset-1 bg-yellow-200 rounded opacity-60"></div>
            </div>
            
            {/* Antenna Details */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-12 bg-red-300 rounded-full"></div>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/60"></div>
          </div>
          
          {/* Skyscraper 3 - Eco-Tech Tower */}
          <div className="w-48 h-80 mr-2 relative shadow-2xl">
            {/* Main Structure */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-800 to-slate-700 rounded-t">
              {/* Green Tech Glass Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-transparent to-green-500/20 rounded-t"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/6 to-transparent rounded-t"></div>
            </div>
            
            {/* Vertical Garden Strips */}
            {[...Array(3)].map((_, i) => (
              <div key={`garden-${i}`} 
                   className="absolute top-8 bottom-8 w-2 bg-gradient-to-b from-green-400 to-emerald-600 opacity-70" 
                   style={{ left: `${20 + i * 25}%` }} />
            ))}
            
            {/* Smart Windows Grid */}
            {[...Array(60)].map((_, i) => {
              const row = Math.floor(i / 6)
              const col = i % 6
              const lightChance = _isDarkMode ? 0.7 : 0.15
              const isLit = Math.random() > (1 - lightChance)
              const lightColors = _isDarkMode ? ['bg-emerald-200', 'bg-green-200', 'bg-lime-200', 'bg-teal-200'] : ['bg-slate-300']
              const colorIndex = Math.floor(Math.random() * lightColors.length)
              return (
                <div key={i} 
                     className={`absolute w-5 h-4 transition-all duration-1600 animate-window-twinkle ${
                       isLit ? `${lightColors[colorIndex]} shadow-lg glow-effect` : (_isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-slate-200 border border-slate-300')
                     }`}
                     style={{
                       left: `${10 + col * 12}px`,
                       top: `${30 + row * 8}px`,
                       animationDelay: `${i * 0.15}s`,
                       borderRadius: '2px',
                       boxShadow: isLit ? `0 0 10px ${lightColors[colorIndex].replace('bg-', '').replace('-200', '')}, inset 0 0 4px rgba(255,255,255,0.3)` : 'inset 0 0 2px rgba(0,0,0,0.5)'
                     }} />
              )
            })}
            
            {/* Eco-Tech Billboard */}
            <div className="absolute top-44 left-1 w-46 h-16 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 flex items-center justify-center text-lg font-bold text-white neon-text shadow-xl shadow-green-500/60 rounded border border-green-400/50">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-pulse"></div>
              <div className="relative z-10">NISSAN GTR</div>
            </div>
            
            {/* Rooftop Solar Panels */}
            <div className="absolute top-2 left-2 right-2 h-8 bg-gradient-to-r from-blue-900 to-indigo-900 rounded border border-blue-700">
              {[...Array(6)].map((_, i) => (
                <div key={`solar-${i}`} className="absolute top-1 bottom-1 w-1 bg-blue-400 opacity-60" style={{ left: `${10 + i * 15}%` }} />
              ))}
            </div>
          </div>
          
          {/* Skyscraper 4 - Luxury Residential Tower */}
          <div className="w-40 h-72 relative shadow-2xl">
            {/* Main Structure */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-800 rounded-t-sm">
              {/* Luxury Glass Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-violet-500/15 rounded-t-sm"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/5 to-transparent rounded-t-sm"></div>
            </div>
            
            {/* Balcony Details */}
            {[...Array(8)].map((_, i) => (
              <div key={`balcony-${i}`} 
                   className="absolute left-1 right-1 h-1 bg-slate-600 shadow-sm" 
                   style={{ top: `${25 + i * 8}%` }} />
            ))}
            
            {/* Luxury Windows */}
            {[...Array(48)].map((_, i) => {
              const row = Math.floor(i / 6)
              const col = i % 6
              const lightChance = _isDarkMode ? 0.65 : 0.12
              const isLit = Math.random() > (1 - lightChance)
              const lightColors = _isDarkMode ? ['bg-purple-200', 'bg-violet-200', 'bg-fuchsia-200', 'bg-pink-200'] : ['bg-slate-300']
              const colorIndex = Math.floor(Math.random() * lightColors.length)
              return (
                <div key={i} 
                     className={`absolute w-4 h-4 transition-all duration-1800 animate-window-shimmer ${
                       isLit ? `${lightColors[colorIndex]} shadow-lg glow-effect` : (_isDarkMode ? 'bg-slate-950 border border-slate-800' : 'bg-slate-200 border border-slate-300')
                     }`}
                     style={{
                       left: `${8 + col * 10}px`,
                       top: `${25 + row * 8}px`,
                       animationDelay: `${i * 0.12}s`,
                       borderRadius: '2px',
                       boxShadow: isLit ? `0 0 8px ${lightColors[colorIndex].replace('bg-', '').replace('-200', '')}, inset 0 0 3px rgba(255,255,255,0.4)` : 'inset 0 0 2px rgba(0,0,0,0.6)'
                     }} />
              )
            })}
            
            {/* Luxury Brand Sign */}
            <div className="absolute top-36 left-1 w-38 h-12 bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 flex items-center justify-center text-sm font-bold text-white neon-flicker shadow-xl shadow-purple-500/60 rounded border border-purple-400/50">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              <div className="relative z-10">TOYOTA SUPRA</div>
            </div>
            
            {/* Penthouse Details */}
            <div className="absolute top-2 left-2 right-2 h-6 bg-slate-700 rounded border border-slate-600">
              <div className="absolute top-1 left-1 right-1 h-1 bg-gradient-to-r from-yellow-400 to-amber-400 rounded opacity-80"></div>
            </div>
          </div>
        </div>
        
        {/* Atmospheric Depth Effects */}
        <div className="absolute bottom-0 w-full h-96 bg-gradient-to-t from-transparent via-slate-900/20 to-transparent pointer-events-none"></div>
        
        {/* City Glow Effect */}
        <div className={`absolute bottom-0 w-full h-64 transition-all duration-3000 ${
          _isDarkMode 
            ? 'bg-gradient-radial from-cyan-500/20 via-purple-500/10 to-transparent'
            : 'bg-gradient-radial from-orange-300/15 via-yellow-200/10 to-transparent'
        }`}></div>
        
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
        
        {/* Wind-driven atmospheric particles */}
        {[...Array(_isDarkMode ? 15 : 6)].map((_, i) => (
          <div key={`atmo-${i}`} 
               className={`absolute rounded-full transition-all duration-2000 animate-atmospheric-flow ${
                 _isDarkMode ? 'glow-effect' : ''
               }`}
               style={{
                 left: `${-100 + Math.random() * 50}px`,
                 top: `${20 + Math.random() * 60}%`,
                 width: _isDarkMode ? `${2 + Math.random() * 4}px` : `${1 + Math.random() * 2}px`,
                 height: _isDarkMode ? `${2 + Math.random() * 4}px` : `${1 + Math.random() * 2}px`,
                 backgroundColor: _isDarkMode 
                   ? ['#ff0080', '#00ffff', '#ffff00', '#ff4000', '#8000ff', '#00ff80'][Math.floor(Math.random() * 6)]
                   : ['#d1d5db', '#e5e7eb', '#f3f4f6'][Math.floor(Math.random() * 3)],
                 animationDelay: `${Math.random() * 8}s`,
                 animationDuration: `${6 + Math.random() * 4}s`,
                 boxShadow: _isDarkMode ? `0 0 12px currentColor` : `0 0 4px currentColor`,
                 opacity: _isDarkMode ? 0.7 : 0.3
               }} />
        ))}
        
        {/* Light rain effect (WindSystem handles main rain) */}
        {[...Array(_isDarkMode ? 15 : 8)].map((_, i) => (
          <div key={`light-rain-${i}`}
               className="absolute w-px bg-gradient-to-b from-transparent via-blue-200 to-transparent animate-wind-rain"
               style={{
                 left: `${Math.random() * 100}%`,
                 height: `${20 + Math.random() * 40}px`,
                 top: `${Math.random() * 30}%`,
                 animationDelay: `${Math.random() * 4}s`,
                 animationDuration: `${2 + Math.random() * 2}s`,
                 opacity: 0.3
               }} />
        ))}
        
        {/* Ambient light particles */}
        {[...Array(_isDarkMode ? 20 : 8)].map((_, i) => (
          <div key={`ambient-${i}`} 
               className={`absolute rounded-full transition-all duration-3000 animate-wind-gust ${
                 _isDarkMode ? 'glow-effect' : ''
               }`}
               style={{
                 left: `${Math.random() * 100}%`,
                 top: `${30 + Math.random() * 40}%`,
                 width: _isDarkMode ? `${2 + Math.random() * 3}px` : `${1 + Math.random() * 2}px`,
                 height: _isDarkMode ? `${2 + Math.random() * 3}px` : `${1 + Math.random() * 2}px`,
                 backgroundColor: _isDarkMode 
                   ? ['#ff0080', '#00ffff', '#ffff00', '#ff4000', '#8000ff', '#00ff80'][Math.floor(Math.random() * 6)]
                   : ['#d1d5db', '#e5e7eb', '#f3f4f6'][Math.floor(Math.random() * 3)],
                 animationDelay: `${Math.random() * 6}s`,
                 animationDuration: `${4 + Math.random() * 4}s`,
                 boxShadow: _isDarkMode ? `0 0 15px currentColor` : `0 0 5px currentColor`,
                 opacity: _isDarkMode ? 0.6 : 0.25
               }} />
        ))}
        
        {/* Background weather ambiance */}
        {_isDarkMode && [...Array(20)].map((_, i) => (
          <div key={`bg-weather-${i}`}
               className="absolute w-px bg-gradient-to-b from-transparent via-cyan-200 to-transparent animate-wind-rain"
               style={{
                 left: `${Math.random() * 100}%`,
                 height: `${30 + Math.random() * 50}px`,
                 top: `${Math.random() * 40}%`,
                 animationDelay: `${Math.random() * 3}s`,
                 animationDuration: `${1.5 + Math.random() * 2}s`,
                 opacity: 0.4
               }} />
        ))}
        
        {/* Atmospheric Glow with Dynamic Colors */}
        <div className={`absolute inset-0 transition-all duration-3000 ${
          _isDarkMode 
            ? 'bg-gradient-radial from-purple-500/30 via-cyan-500/15 via-pink-500/10 to-transparent animate-glow-pulse'
            : 'bg-gradient-radial from-blue-200/20 via-purple-200/10 to-transparent'
        }`} />
        
        {/* Final Atmospheric Layer */}
        <div className={`absolute inset-0 transition-all duration-2000 ${
          _isDarkMode 
            ? 'bg-gradient-to-t from-black/80 via-purple-900/20 via-transparent to-indigo-900/40'
            : 'bg-gradient-to-t from-gray-800/50 via-transparent to-blue-100/30'
        }`} />
      </div>
      
      {/* Wind System Integration */}
      <WindSystem isDarkMode={_isDarkMode} intensity={0.8} />
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