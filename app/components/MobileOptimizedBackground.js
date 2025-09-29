'use client'

import React from 'react'

const MobileOptimizedBackground = ({ isDarkMode }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className={`absolute inset-0 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900' 
          : 'bg-gradient-to-br from-blue-50 via-purple-50/30 to-blue-50'
      }`} />
      
      {/* Subtle animated elements - GPU accelerated */}
      <div className="absolute inset-0 opacity-30 will-change-transform">
        <div className={`absolute top-20 left-10 w-32 h-32 rounded-full blur-xl animate-pulse ${
          isDarkMode ? 'bg-fuchsia-500/10' : 'bg-blue-400/20'
        }`} style={{ animationDuration: '8s', transform: 'translateZ(0)' }} />
        <div className={`absolute bottom-32 right-8 w-24 h-24 rounded-full blur-lg animate-pulse ${
          isDarkMode ? 'bg-cyan-500/10' : 'bg-purple-400/20'
        }`} style={{ animationDuration: '6s', animationDelay: '2s', transform: 'translateZ(0)' }} />
        <div className={`absolute top-1/2 left-1/2 w-20 h-20 rounded-full blur-lg animate-pulse ${
          isDarkMode ? 'bg-yellow-500/10' : 'bg-pink-400/20'
        }`} style={{ animationDuration: '10s', animationDelay: '4s', transform: 'translateZ(0)' }} />
      </div>
    </div>
  )
}

export default MobileOptimizedBackground