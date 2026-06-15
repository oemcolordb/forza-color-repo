'use client'

import React, { useEffect, useState } from 'react'

interface DeviceInfo {
  isMobile?: boolean
  isTablet?: boolean
  isDesktop?: boolean
  screenSize?: string
}

interface PerformanceMonitorProps {
  isDarkMode: boolean
  deviceInfo: DeviceInfo
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ isDarkMode, deviceInfo }) => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    renderTime: 0,
  })
  const [showMetrics, setShowMetrics] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number

    const measurePerformance = () => {
      const currentTime = performance.now()
      frameCount++

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        const memory = (performance as any).memory
          ? Math.round((performance as any).memory.usedJSHeapSize / 1048576)
          : 0

        setMetrics(prev => ({
          ...prev,
          fps,
          memory,
        }))

        frameCount = 0
        lastTime = currentTime
      }

      animationId = requestAnimationFrame(measurePerformance)
    }

    measurePerformance()

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  if (process.env.NODE_ENV !== 'development' || !showMetrics) {
    return (
      <button
        onClick={() => setShowMetrics(true)}
        className={`fixed bottom-4 right-4 w-8 h-8 rounded-full text-xs font-mono z-50 ${
          isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-200 text-gray-700'
        }`}
        title="Show performance metrics"
      >
        📊
      </button>
    )
  }

  return (
    <div
      className={`fixed bottom-4 right-4 p-2 rounded-lg text-xs font-mono z-50 ${
        isDarkMode
          ? 'bg-slate-800/90 text-slate-300 border border-slate-600'
          : 'bg-white/90 text-gray-700 border border-gray-300'
      }`}
    >
      <div className="flex justify-between items-center mb-1">
        <span>Performance</span>
        <button onClick={() => setShowMetrics(false)} className="text-xs hover:text-red-500">
          ×
        </button>
      </div>
      <div>FPS: {metrics.fps}</div>
      <div>Memory: {metrics.memory}MB</div>
      <div>
        Device: {deviceInfo?.isMobile ? 'Mobile' : deviceInfo?.isTablet ? 'Tablet' : 'Desktop'}
      </div>
      <div>Screen: {deviceInfo?.screenSize || 'Unknown'}</div>
    </div>
  )
}

export default PerformanceMonitor
