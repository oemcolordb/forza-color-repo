import { useState, useEffect, useRef } from 'react'

export const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouch: false,
    isLandscape: true,
    screenWidth: 1024,
    screenHeight: 768,
    pixelRatio: 1,
  })

  const lastUpdateRef = useRef<number>(0)

  useEffect(() => {
    const updateDeviceInfo = () => {
      // Throttle updates for performance (max once per 100ms)
      const now = Date.now()
      if (now - lastUpdateRef.current < 100) return
      lastUpdateRef.current = now

      const width = window.innerWidth
      const height = window.innerHeight
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      setDeviceInfo({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isTouch,
        isLandscape: width > height,
        screenWidth: width,
        screenHeight: height,
        pixelRatio: window.devicePixelRatio || 1,
      })
    }

    updateDeviceInfo()
    
    // Use passive listeners for better scroll/touch performance
    window.addEventListener('resize', updateDeviceInfo, { passive: true })
    window.addEventListener('orientationchange', updateDeviceInfo, { passive: true })
    
    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
      window.removeEventListener('orientationchange', updateDeviceInfo)
    }
  }, [])

  return deviceInfo
}
