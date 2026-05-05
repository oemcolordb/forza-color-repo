'use client'

import { useEffect, useRef } from 'react'
import { CarColor } from '../types'

interface StructuredDataProps {
  colors?: CarColor[]
  type?: 'website' | 'color' | 'collection'
}

// Sanitize string to prevent XSS in JSON
function sanitizeForJson(str: string): string {
  return str
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

const StructuredData: React.FC<StructuredDataProps> = ({ colors, type = 'website' }) => {
  const getStructuredData = () => {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Forza Color Universe',
      description:
        'Comprehensive database of 10,000+ automotive paint colors from Forza racing games',
      url: 'https://forza-color-repo.vercel.app',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://forza-color-repo.vercel.app/?search={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    }

    if (type === 'color' && colors && Array.isArray(colors) && colors.length > 0) {
      return {
        ...baseData,
        '@type': 'ItemList',
        numberOfItems: colors.length,
        itemListElement: colors.slice(0, 10).map((color, index) => ({
          '@type': 'Product',
          position: index + 1,
          name: `${color.colorName} - ${color.make}`,
          description: `${color.colorType} automotive paint color from ${color.make}`,
          brand: color.make,
          color: color.colorName,
          additionalProperty: [
            {
              '@type': 'PropertyValue',
              name: 'Hue',
              value: Math.round(color.color1.h * 360),
            },
            {
              '@type': 'PropertyValue',
              name: 'Saturation',
              value: Math.round(color.color1.s * 100),
            },
            {
              '@type': 'PropertyValue',
              name: 'Brightness',
              value: Math.round(color.color1.b * 100),
            },
          ],
        })),
      }
    }

    return baseData
  }

  const scriptRef = useRef<HTMLScriptElement>(null)

  useEffect(() => {
    if (scriptRef.current) {
      const data = getStructuredData()
      // Sanitize color data before serializing
      const sanitizedData = JSON.parse(JSON.stringify(data, (key, value) => {
        if (typeof value === 'string') {
          return sanitizeForJson(value)
        }
        return value
      }))
      scriptRef.current.textContent = JSON.stringify(sanitizedData)
    }
  }, [colors, type])

  return (
    <script
      ref={scriptRef}
      type="application/ld+json"
    />
  )
}

export default StructuredData
