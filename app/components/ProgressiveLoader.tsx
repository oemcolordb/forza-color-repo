'use client'

import React from 'react'
import { DeviceInfo } from '../types'

interface ProgressiveLoaderProps {
  progress: number
  isDarkMode: boolean
  deviceInfo: DeviceInfo
}

const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({ progress, isDarkMode, deviceInfo }) => {
  if (progress >= 100) return null

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 ${
        isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'
      } backdrop-blur-sm`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className="h-1 bg-gradient-to-r from-[color:var(--bamboo-stalk)] to-[color:var(--bamboo-moss)] transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
      <div
        className={`text-center py-2 ${deviceInfo.isMobile ? 'text-sm' : 'text-base'} ${
          isDarkMode ? 'text-slate-200' : 'text-gray-700'
        }`}
      >
        Loading colors: {Math.round(progress)}%
      </div>
    </div>
  )
}

export default ProgressiveLoader
