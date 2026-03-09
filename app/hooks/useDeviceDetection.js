'use client'

import { useState, useEffect } from 'react'

export const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    screenSize: 'lg',
    orientation: 'landscape',
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

      const deviceInfo = {
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isTouchDevice,
        screenSize: width < 640 ? 'sm' : width < 768 ? 'md' : width < 1024 ? 'lg' : 'xl',
        orientation: width > height ? 'landscape' : 'portrait',
      }

      setDeviceInfo(deviceInfo)
    }

    updateDeviceInfo()

    const debouncedUpdate = debounce(updateDeviceInfo, 150)
    window.addEventListener('resize', debouncedUpdate)
    window.addEventListener('orientationchange', debouncedUpdate)

    return () => {
      window.removeEventListener('resize', debouncedUpdate)
      window.removeEventListener('orientationchange', debouncedUpdate)
    }
  }, [])

  return deviceInfo
}

const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
