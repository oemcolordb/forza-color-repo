import { useEffect } from 'react'

interface DeviceInfo {
  isMobile?: boolean
  isTablet?: boolean
  isDesktop?: boolean
}

interface GamingSEOProps {
  isDarkMode: boolean
  deviceInfo?: DeviceInfo
}

/**
 * Gaming SEO Component - Optimizes for gaming-related searches
 * Handles mobile performance and gaming community SEO
 */
export default function GamingSEO({ isDarkMode, deviceInfo }: GamingSEOProps) {
  useEffect(() => {
    // Mobile gaming performance optimizations
    if (deviceInfo?.isMobile) {
      // Reduce animations on mobile for better performance
      document.documentElement.style.setProperty('--animation-duration', '0.2s')
      
      // Optimize touch interactions for mobile gamers
      document.body.style.touchAction = 'manipulation'
      
      // Prevent zoom on mobile gaming devices
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
        )
      }
    }

    // Gaming-specific meta tags for better discoverability
    const gamingMeta = [
      { name: 'theme-color', content: isDarkMode ? '#0f172a' : '#ffffff' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Forza Color Universe' },
      { name: 'twitter:site', content: '@ForzaColors' },
      { name: 'application-name', content: 'Forza Colors' },
      // Gaming community tags
      { name: 'gaming:platform', content: 'web' },
      { name: 'gaming:genre', content: 'racing,automotive,design' },
      { name: 'gaming:rating', content: 'everyone' }
    ]

    gamingMeta.forEach(meta => {
      let element = document.querySelector(`meta[name="${meta.name}"], meta[property="${meta.property}"]`)
      if (!element) {
        element = document.createElement('meta')
        if (meta.name) element.setAttribute('name', meta.name)
        if (meta.property) element.setAttribute('property', meta.property)
        document.head.appendChild(element)
      }
      element.setAttribute('content', meta.content)
    })

    // Preload critical gaming fonts for better performance
    if (!document.querySelector('link[href*="UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2"]')) {
      const fontPreload = document.createElement('link')
      fontPreload.rel = 'preload'
      fontPreload.href = 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
      fontPreload.as = 'font'
      fontPreload.type = 'font/woff2'
      fontPreload.crossOrigin = 'anonymous'
      document.head.appendChild(fontPreload)
    }

  }, [isDarkMode, deviceInfo])

  // Gaming-specific structured data injection
  useEffect(() => {
    const gamingStructuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Forza Color Universe",
      "applicationCategory": "GameApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "1250"
      },
      "featureList": [
        "Forza Horizon 5 livery creator",
        "FH5 custom paint tool",
        "10,000+ racing game colors",
        "Mobile-optimized for gaming"
      ]
    }

    let script = document.getElementById('gaming-structured-data')
    if (!script) {
      script = document.createElement('script')
      script.id = 'gaming-structured-data'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(gamingStructuredData)

    return () => {
      const existingScript = document.getElementById('gaming-structured-data')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  return null // This component only handles SEO, no visual output
}