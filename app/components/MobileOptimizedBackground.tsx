'use client'

import React from 'react'

interface MobileOptimizedBackgroundProps {
  isDarkMode: boolean
}

const MobileOptimizedBackground: React.FC<MobileOptimizedBackgroundProps> = ({ isDarkMode }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className={`absolute inset-0 ${
        isDarkMode 
          ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-black' 
          : 'bg-gradient-to-b from-blue-50 via-white to-gray-100'
      }`} />
      
      {/* Minimal city silhouette for mobile */}
      <div className="absolute bottom-0 w-full h-24 opacity-20">
        <div className={`absolute bottom-0 w-full h-16 ${
          isDarkMode ? 'bg-slate-700' : 'bg-gray-400'
        }`}>
          {/* Simplified building shapes */}
          <div className={`absolute bottom-0 left-8 w-6 h-12 ${
            isDarkMode ? 'bg-slate-600' : 'bg-gray-500'
          }`} />
          <div className={`absolute bottom-0 left-16 w-8 h-16 ${
            isDarkMode ? 'bg-slate-600' : 'bg-gray-500'
          }`} />
          <div className={`absolute bottom-0 right-16 w-6 h-10 ${
            isDarkMode ? 'bg-slate-600' : 'bg-gray-500'
          }`} />
          <div className={`absolute bottom-0 right-8 w-5 h-8 ${
            isDarkMode ? 'bg-slate-600' : 'bg-gray-500'
          }`} />
        </div>
      </div>
    </div>
  )
}

export default MobileOptimizedBackground