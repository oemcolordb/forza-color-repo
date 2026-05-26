'use client'

import React from 'react'
import { DeviceInfo } from '../types'

interface OptimizedStatsBarProps {
  totalColors: number
  totalMakes: number
  favorites: number
  colorHistory: number
  filteredCount: number
  isDarkMode: boolean
  deviceInfo: DeviceInfo
}

const OptimizedStatsBar = React.memo<OptimizedStatsBarProps>(
  ({ totalColors, totalMakes, favorites, colorHistory, filteredCount, isDarkMode, deviceInfo }) => {
    const stats = React.useMemo(
      () => [
        { label: 'Colors', value: totalColors.toLocaleString(), color: 'text-fuchsia-500' },
        { label: 'Makes', value: totalMakes, color: 'text-cyan-500' },
        { label: 'Favorites', value: favorites, color: 'text-red-500' },
        { label: 'Viewed', value: colorHistory, color: 'text-green-500' },
        ...(filteredCount !== totalColors
          ? [{ label: 'Filtered', value: filteredCount.toLocaleString(), color: 'text-yellow-500' }]
          : []),
      ],
      [totalColors, totalMakes, favorites, colorHistory, filteredCount]
    )

    const containerClasses = React.useMemo(() => {
      const base = `mb-4 rounded-lg backdrop-blur-sm shadow-lg gpu-accelerated ${
        isDarkMode ? 'bg-gray-800/95 border border-gray-700' : 'bg-white/95 border border-gray-200'
      }`

      if (deviceInfo.isMobile) {
        return `${base} p-2`
      } else if (deviceInfo.isTablet) {
        return `${base} p-3`
      } else {
        return `${base} p-3`
      }
    }, [isDarkMode, deviceInfo])

    const gridClasses = React.useMemo(() => {
      if (deviceInfo.isMobile) {
        return 'grid grid-cols-2 gap-2 text-center'
      } else if (deviceInfo.isTablet) {
        return 'flex flex-wrap justify-center gap-4 text-center'
      } else {
        return 'flex flex-wrap justify-center gap-6 text-center'
      }
    }, [deviceInfo])

    const textSizes = React.useMemo(() => {
      if (deviceInfo.isMobile) {
        return { value: 'text-base', label: 'text-2xs' }
      } else if (deviceInfo.isTablet) {
        return { value: 'text-lg', label: 'text-xs' }
      } else {
        return { value: 'text-lg', label: 'text-xs' }
      }
    }, [deviceInfo])

    return (
      <div className={containerClasses}>
        <div className={gridClasses}>
          {stats.map((stat, index) => (
            <div key={stat.label} className={deviceInfo.isMobile ? 'min-w-0' : 'flex-1 min-w-0'}>
              <div className={`${textSizes.value} font-bold ${stat.color}`}>{stat.value}</div>
              <div
                className={`${textSizes.label} text-readable-tight ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
)

OptimizedStatsBar.displayName = 'OptimizedStatsBar'

export default OptimizedStatsBar
