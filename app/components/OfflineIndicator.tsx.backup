'use client'

import React from 'react'
import { useOfflineStorage } from '../hooks/useOfflineStorage'

interface OfflineIndicatorProps {
  isDarkMode: boolean
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ isDarkMode }) => {
  const { isOnline, cacheSize, lastUpdated, isLoading } = useOfflineStorage()

  const formatLastUpdated = (timestamp: number | null) => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 p-3 rounded-lg shadow-lg transition-all ${
      isDarkMode 
        ? 'bg-slate-800 border border-slate-600 text-slate-200' 
        : 'bg-white border border-gray-300 text-gray-800'
    }`}>
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span className="text-sm font-medium">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
      
      {cacheSize > 0 && (
        <div className="mt-2 text-xs space-y-1">
          <div>📦 {cacheSize.toLocaleString()} colors cached</div>
          <div>🕒 Updated: {formatLastUpdated(lastUpdated)}</div>
        </div>
      )}
      
      {isLoading && (
        <div className="mt-2 flex items-center space-x-2">
          <div className="animate-spin w-3 h-3 border border-fuchsia-500 border-t-transparent rounded-full" />
          <span className="text-xs">Caching...</span>
        </div>
      )}
    </div>
  )
}

export default OfflineIndicator