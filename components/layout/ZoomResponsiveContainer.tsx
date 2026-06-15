'use client'

import React, { useEffect, useState } from 'react'
import { useZoomDetection, ZoomLevel } from '@/hooks/useZoomDetection'

interface ZoomResponsiveContainerProps {
  children: React.ReactNode
  isDarkMode?: boolean
  className?: string
}

const ZoomResponsiveContainer: React.FC<ZoomResponsiveContainerProps> = ({
  children,
  isDarkMode: _isDarkMode = true,
  className = '',
}) => {
  const zoomInfo = useZoomDetection()
  const [showIndicator, setShowIndicator] = useState(false)
  const [prevScale, setPrevScale] = useState<ZoomLevel['scale']>(zoomInfo.scale)

  // Show colorful indicator when zoom changes - SKIP on mobile for performance
  useEffect(() => {
    // Don't show fancy animations on mobile/touch devices
    if (zoomInfo.isMobile || zoomInfo.isTouch) return

    if (zoomInfo.scale !== prevScale) {
      setShowIndicator(true)
      setPrevScale(zoomInfo.scale)
      const timer = setTimeout(() => setShowIndicator(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [zoomInfo.scale, zoomInfo.isMobile, zoomInfo.isTouch, prevScale])

  // Dynamic classes based on zoom level
  const getContainerClasses = () => {
    const baseClasses = 'transition-all duration-500 ease-out'
    
    const spacingClasses = {
      tight: 'gap-2 p-2',
      normal: 'gap-4 p-4',
      relaxed: 'gap-6 p-6',
    }

    const fontClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
    }

    return `${baseClasses} ${spacingClasses[zoomInfo.spacing]} ${fontClasses[zoomInfo.fontSize]} ${className}`
  }

  // Get gradient colors for the transition indicator
  const getGradientColors = () => {
    const gradients = {
      xs: 'from-purple-500 via-pink-500 to-red-500',
      sm: 'from-blue-500 via-cyan-500 to-teal-500',
      md: 'from-green-500 via-emerald-500 to-teal-500',
      lg: 'from-yellow-500 via-orange-500 to-red-500',
      xl: 'from-pink-500 via-rose-500 to-red-500',
      xxl: 'from-indigo-500 via-purple-500 to-pink-500',
    }
    return gradients[zoomInfo.scale]
  }

  const getScaleLabel = () => {
    const labels = {
      xs: 'Ultra Compact',
      sm: 'Compact',
      md: 'Standard',
      lg: 'Expanded',
      xl: 'Large',
      xxl: 'Extra Large',
    }
    return labels[zoomInfo.scale]
  }

  return (
    <div 
      className={getContainerClasses()}
      data-zoom-scale={zoomInfo.scale}
      data-zoom-level={zoomInfo.zoom}
    >
      {/* Animated zoom transition indicator */}
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
          showIndicator 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
        }`}
      >
        <div
          className={`px-6 py-3 rounded-full bg-gradient-to-r ${getGradientColors()} shadow-2xl backdrop-blur-sm`}
        >
          <div className="flex items-center gap-3">
            {/* Animated icon */}
            <div className="relative w-8 h-8">
              <div className={`absolute inset-0 rounded-full bg-white/30 animate-ping`} />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg 
                  className="w-5 h-5 text-white animate-pulse" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" 
                  />
                </svg>
              </div>
            </div>
            
            {/* Text content */}
            <div className="text-white">
              <div className="text-sm font-bold tracking-wide">
                {getScaleLabel()} View
              </div>
              <div className="text-xs opacity-80">
                {zoomInfo.zoom}% • {zoomInfo.columns} columns
              </div>
            </div>

            {/* Colorful dots animation */}
            <div className="flex gap-1 ml-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-white animate-bounce"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Rainbow trail effect */}
        <div className="absolute inset-0 -z-10">
          <div 
            className={`absolute inset-0 rounded-full bg-gradient-to-r ${getGradientColors()} blur-xl opacity-50 animate-pulse`}
          />
        </div>
      </div>

      {/* Transitioning overlay effect - Skip on mobile for performance */}
      {zoomInfo.isTransitioning && !zoomInfo.isMobile && !zoomInfo.isTouch && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {/* Corner sparkles */}
          {[
            'top-0 left-0',
            'top-0 right-0',
            'bottom-0 left-0',
            'bottom-0 right-0',
          ].map((position, i) => (
            <div
              key={position}
              className={`absolute ${position} w-32 h-32`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div
                className={`w-full h-full bg-gradient-to-br ${getGradientColors()} opacity-30 blur-2xl animate-pulse`}
              />
            </div>
          ))}

          {/* Center ripple effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {[1, 2, 3].map((ring) => (
                <div
                  key={ring}
                  className={`absolute inset-0 rounded-full border-2 border-white/20 animate-ping`}
                  style={{
                    width: `${ring * 100}px`,
                    height: `${ring * 100}px`,
                    marginLeft: `-${ring * 50}px`,
                    marginTop: `-${ring * 50}px`,
                    animationDelay: `${ring * 150}ms`,
                    animationDuration: '1s',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pass zoom context to children */}
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          if (typeof child.type === 'string') {
            return child
          }
          return React.cloneElement(child as React.ReactElement<any>, {
            zoomInfo,
          })
        }
        return child
      })}
    </div>
  )
}

export default ZoomResponsiveContainer
