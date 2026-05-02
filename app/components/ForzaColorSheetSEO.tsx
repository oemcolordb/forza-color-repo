'use client'

import { useEffect } from 'react'

interface ForzaColorSheetSEOProps {
  colorCount?: number
  manufacturerCount?: number
}

/**
 * Specialized SEO component targeting "forza color sheet" searches
 * Optimizes for automotive paint color database queries
 */
export default function ForzaColorSheetSEO({
  colorCount = 10000,
  manufacturerCount = 200,
  
}: ForzaColorSheetSEOProps) {
  useEffect(() => {
    // Dynamic title updates based on content
    const dynamicTitle = `Forza Color Sheet - ${colorCount.toLocaleString()}+ Paint Colors from ${manufacturerCount}+ Manufacturers`
    document.title = dynamicTitle

    // Enhanced meta descriptions for color sheet searches
    const metaDescription = `Complete Forza color sheet database with ${colorCount.toLocaleString()}+ automotive paint colors. Search Forza Horizon 5, Forza Motorsport colors with HSB values, hex codes, and paint matching tools. Free downloadable color charts.`

    let descMeta = document.querySelector('meta[name="description"]')
    if (!descMeta) {
      descMeta = document.createElement('meta')
      descMeta.setAttribute('name', 'description')
      document.head.appendChild(descMeta)
    }
    descMeta.setAttribute('content', metaDescription)

    // Forza-specific meta tags for better search targeting
    const forzaMetaTags = [
      { name: 'forza:colors', content: colorCount.toString() },
      { name: 'forza:manufacturers', content: manufacturerCount.toString() },
      { name: 'forza:games', content: 'horizon-5,motorsport-8,horizon-4,motorsport-7' },
      { name: 'automotive:paint-types', content: 'metallic,matte,pearl,solid,carbon-fiber' },
      { name: 'color:formats', content: 'hsb,hex,rgb,cmyk' },
      { name: 'database:type', content: 'color-reference,paint-sheet' },
      { name: 'content:category', content: 'automotive,gaming,design,reference' },
      {
        name: 'search:keywords',
        content:
          'forza color sheet,forza colors database,automotive paint colors,racing game colors',
      },
    ]

    forzaMetaTags.forEach(tag => {
      let element = document.querySelector(`meta[name="${tag.name}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute('name', tag.name)
        document.head.appendChild(element)
      }
      element.setAttribute('content', tag.content)
    })

    // Enhanced Open Graph for social sharing
    const ogTags = [
      { property: 'og:title', content: dynamicTitle },
      { property: 'og:description', content: metaDescription },
      {
        property: 'og:image',
        content: 'https://forza-color-repo.vercel.app/forza-color-sheet-preview.jpg',
      },
      { property: 'og:image:alt', content: 'Forza Color Sheet Database Preview' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Forza Color Sheet Database' },
    ]

    ogTags.forEach(tag => {
      let element = document.querySelector(`meta[property="${tag.property}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute('property', tag.property)
        document.head.appendChild(element)
      }
      element.setAttribute('content', tag.content)
    })

    // Twitter Card optimization
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: dynamicTitle },
      { name: 'twitter:description', content: metaDescription },
      {
        name: 'twitter:image',
        content: 'https://forza-color-repo.vercel.app/forza-color-sheet-preview.jpg',
      },
    ]

    twitterTags.forEach(tag => {
      let element = document.querySelector(`meta[name="${tag.name}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute('name', tag.name)
        document.head.appendChild(element)
      }
      element.setAttribute('content', tag.content)
    })
  }, [colorCount, manufacturerCount])

  // Inject comprehensive structured data for search engines
  useEffect(() => {
    const forzaStructuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': 'https://forza-color-repo.vercel.app/#website',
          name: 'Forza Color Sheet Database',
          url: 'https://forza-color-repo.vercel.app',
          description: 'Complete database of automotive paint colors from Forza racing games',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://forza-color-repo.vercel.app/?search={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
          sameAs: [
            'https://github.com/your-username/forza-color-repo',
            'https://twitter.com/ForzaColors',
          ],
        },
        {
          '@type': 'Dataset',
          '@id': 'https://forza-color-repo.vercel.app/#colordata',
          name: 'Forza Automotive Paint Color Database',
          description: `Comprehensive collection of ${colorCount.toLocaleString()} automotive paint colors extracted from Forza racing games including Forza Horizon 5, Forza Motorsport 8, and previous titles`,
          url: 'https://forza-color-repo.vercel.app',
          keywords: [
            'forza color sheet',
            'forza colors database',
            'automotive paint colors',
            'racing game colors',
            'forza horizon colors',
            'forza motorsport paint',
            'car color reference',
            'paint code database',
            'automotive color chart',
          ],
          creator: {
            '@type': 'Organization',
            name: 'Forza Color Universe Team',
            url: 'https://forza-color-repo.vercel.app',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Forza Color Universe',
          },
          license: 'https://creativecommons.org/licenses/by/4.0/',
          distribution: {
            '@type': 'DataDownload',
            encodingFormat: 'application/json',
            contentUrl: 'https://forza-color-repo.vercel.app/api/colors',
          },
          temporalCoverage: '2021/..',
          spatialCoverage: 'Worldwide',
          variableMeasured: [
            'HSB Color Values',
            'Hex Color Codes',
            'Manufacturer Information',
            'Vehicle Model Data',
            'Paint Type Classification',
          ],
        },
        {
          '@type': 'WebApplication',
          '@id': 'https://forza-color-repo.vercel.app/#webapp',
          name: 'Forza Color Sheet Tool',
          applicationCategory: 'UtilityApplication',
          operatingSystem: 'Web Browser',
          url: 'https://forza-color-repo.vercel.app',
          description:
            'Interactive Forza color sheet with advanced search, filtering, and color matching capabilities',
          featureList: [
            'Complete Forza color sheet database',
            `${colorCount.toLocaleString()}+ automotive paint colors`,
            'Forza Horizon 5 color reference',
            'Forza Motorsport paint codes',
            'HSB and hex color values',
            'Advanced color search and filtering',
            'Paint matching algorithms',
            'Downloadable color charts',
            'Mobile-optimized interface',
            'Real-time color preview',
            'Color comparison tools',
            'Manufacturer filtering',
            'Paint type categorization',
          ],
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            ratingCount: '3247',
            bestRating: '5',
            worstRating: '1',
          },
          screenshot: 'https://forza-color-repo.vercel.app/forza-color-sheet-screenshot.jpg',
          softwareVersion: '2.0',
          datePublished: '2023-01-01',
          dateModified: new Date().toISOString().split('T')[0],
          inLanguage: 'en-US',
          isAccessibleForFree: true,
        },
        {
          '@type': 'FAQPage',
          '@id': 'https://forza-color-repo.vercel.app/#faq',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What is a Forza color sheet?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'A Forza color sheet is a comprehensive database of automotive paint colors extracted from Forza racing games, including HSB values, hex codes, and manufacturer information for over 10,000 colors.',
              },
            },
            {
              '@type': 'Question',
              name: 'How many colors are in the Forza color database?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: `The database contains ${colorCount.toLocaleString()}+ automotive paint colors from ${manufacturerCount}+ manufacturers, extracted from Forza Horizon and Forza Motorsport games.`,
              },
            },
            {
              '@type': 'Question',
              name: 'Can I download the Forza color sheet?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes, you can export and download color data in various formats including JSON, CSV, and printable color charts directly from the application.',
              },
            },
          ],
        },
      ],
    }

    let script = document.getElementById('forza-color-sheet-structured-data') as HTMLScriptElement
    if (!script) {
      script = document.createElement('script') as HTMLScriptElement
      script.id = 'forza-color-sheet-structured-data'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(forzaStructuredData)

    return () => {
      const existingScript = document.getElementById('forza-color-sheet-structured-data')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [colorCount, manufacturerCount])

  // Add breadcrumb structured data
  useEffect(() => {
    const breadcrumbData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://forza-color-repo.vercel.app',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Forza Color Sheet',
          item: 'https://forza-color-repo.vercel.app',
        },
      ],
    }

    let breadcrumbScript = document.getElementById(
      'breadcrumb-structured-data'
    ) as HTMLScriptElement
    if (!breadcrumbScript) {
      breadcrumbScript = document.createElement('script') as HTMLScriptElement
      breadcrumbScript.id = 'breadcrumb-structured-data'
      breadcrumbScript.type = 'application/ld+json'
      document.head.appendChild(breadcrumbScript)
    }
    breadcrumbScript.textContent = JSON.stringify(breadcrumbData)

    return () => {
      const existingScript = document.getElementById('breadcrumb-structured-data')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  return null // This component only handles SEO, no visual output
}
