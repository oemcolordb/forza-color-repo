'use client'

import React from 'react'
import { useDeviceDetection } from '../hooks/useDeviceDetection'

interface ResponsiveLayoutProps {
  children: React.ReactNode
  className?: string
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children, className = '' }) => {
  const deviceInfo = useDeviceDetection()

  const layoutClasses = React.useMemo(() => {
    const { isMobile, isTablet, isDesktop, screenWidth } = deviceInfo

    let classes = 'container mx-auto relative z-10 '

    if (isMobile) {
      classes += 'px-2 py-2 max-w-full '
      if (screenWidth < 400) {
        classes += 'text-sm '
      }
    } else if (isTablet) {
      classes += 'px-4 py-3 max-w-6xl '
    } else if (isDesktop) {
      classes += 'px-4 py-4 max-w-7xl '
    }

    return classes + className
  }, [deviceInfo, className])

  return (
    <main id="main-content" className={layoutClasses} tabIndex={-1}>
      {children}
    </main>
  )
}

export default ResponsiveLayout
