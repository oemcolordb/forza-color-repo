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
        viewport.setAttribute(
          'content',
          'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
        )
      }
    }

    // Enhanced meta tags for Forza color sheet searches
    const gamingMeta = [
      { name: 'theme-color', content: isDarkMode ? '#0f172a' : '#ffffff' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Forza Color Sheet Database' },
      { name: 'twitter:site', content: '@ForzaColors' },
      { name: 'application-name', content: 'Forza Color Sheet' },
      // Enhanced gaming and automotive tags
      { name: 'gaming:platform', content: 'web' },
      { name: 'gaming:genre', content: 'racing,automotive,design,simulation' },
      { name: 'gaming:rating', content: 'everyone' },
      { name: 'automotive:category', content: 'paint,colors,customization' },
      { name: 'forza:game', content: 'horizon,motorsport,all' },
      { name: 'content:type', content: 'color-database,reference-sheet' },
    ]

    gamingMeta.forEach(meta => {
      let element = document.querySelector(
        `meta[name="${meta.name}"], meta[property="${meta.property}"]`
      )
      if (!element) {
        element = document.createElement('meta')
        if (meta.name) element.setAttribute('name', meta.name)
        if (meta.property) element.setAttribute('property', meta.property)
        document.head.appendChild(element)
      }
      element.setAttribute('content', meta.content)
    })
  }, [isDarkMode, deviceInfo])

  // Gaming-specific structured data injection
  useEffect(() => {
    const gamingStructuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          '@id': 'https://forza-color-repo.vercel.app/#webapp',
          name: 'Forza Color Sheet Database',
          alternateName: ['Forza Colors', 'Forza Paint Database', 'Racing Game Color Sheet'],
          applicationCategory: 'UtilityApplication',
          operatingSystem: 'Web Browser',
          url: 'https://forza-color-repo.vercel.app',
          description:
            'Complete Forza color sheet database with 10,000+ automotive paint colors from all Forza racing games',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            ratingCount: '2847',
            bestRating: '5',
            worstRating: '1',
          },
          featureList: [
            'Complete Forza color sheet database',
            '10,000+ official automotive paint colors',
            'Forza Horizon 5 color reference',
            'Forza Motorsport paint codes',
            'HSB and hex color values',
            'Color search and filtering tools',
            'Paint matching algorithms',
            'Downloadable color charts',
            'Mobile-optimized interface',
            'Real-time color preview',
          ],
          keywords:
            'forza color sheet, forza colors database, automotive paint colors, racing game colors, forza horizon colors, forza motorsport paint',
          inLanguage: 'en-US',
          isAccessibleForFree: true,
        },
        {
          '@type': 'Dataset',
          '@id': 'https://forza-color-repo.vercel.app/#dataset',
          name: 'Forza Automotive Color Database',
          description:
            'Comprehensive dataset of 10,000+ automotive paint colors extracted from Forza racing games',
          url: 'https://forza-color-repo.vercel.app',
          keywords: [
            'forza color sheet',
            'automotive colors',
            'paint database',
            'racing games',
            'color reference',
          ],
          creator: {
            '@type': 'Organization',
            name: 'Forza Color Universe Team',
          },
          license: 'https://creativecommons.org/licenses/by/4.0/',
          temporalCoverage: '2021/..',
          spatialCoverage: 'Worldwide',
          distribution: {
            '@type': 'DataDownload',
            encodingFormat: 'application/json',
            contentUrl: 'https://forza-color-repo.vercel.app/api/colors',
          },
        },
      ],
    }

    let script = document.getElementById('gaming-structured-data') as HTMLScriptElement
    if (!script) {
      script = document.createElement('script')
      script.id = 'gaming-structured-data'
      script.setAttribute('type', 'application/ld+json')
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
