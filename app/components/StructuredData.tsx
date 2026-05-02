'use client'

import { CarColor } from '../types'

interface StructuredDataProps {
  colors?: CarColor[]
  type?: 'website' | 'color' | 'collection'
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(getStructuredData()) }}
    />
  )
}

export default StructuredData
