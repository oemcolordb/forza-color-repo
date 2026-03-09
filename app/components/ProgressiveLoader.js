'use client'

import React from 'react'

const ProgressiveLoader = ({ progress, isDarkMode, deviceInfo }) => {
  if (progress >= 100) return null

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 ${
        isDarkMode ? 'bg-slate-900/95' : 'bg-white/95'
      } backdrop-blur-sm`}
    >
      <div
        className={`h-1 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300`}
        style={{ width: `${progress}%` }}
      />
      <div
        className={`text-center py-2 ${deviceInfo.isMobile ? 'text-sm' : 'text-base'} ${
          isDarkMode ? 'text-slate-300' : 'text-gray-700'
        }`}
      >
        Loading colors... {Math.round(progress)}%
      </div>
    </div>
  )
}

export default ProgressiveLoader
