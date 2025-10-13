import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Forza Color Sheet Visualiser - Made by ResinRonin',
  description: 'Forza Color Sheet Visualiser made by ResinRonin - Interactive database of 10,000+ automotive paint colors from Forza games with advanced search and visualization tools.',
  keywords: 'forza color sheet, forza colors database, forza paint colors, forza horizon colors, forza motorsport colors, automotive paint sheet, car color database, racing game colors, forza livery colors, paint codes forza, forza color chart, car paint reference, automotive color guide, forza color picker, racing paint database, ResinRonin',
  authors: [{ name: 'ResinRonin' }],
  creator: 'ResinRonin',
  publisher: 'ResinRonin',
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  openGraph: {
    title: 'Forza Color Sheet Visualiser - Made by ResinRonin',
    description: 'Forza Color Sheet Visualiser made by ResinRonin - Interactive database of 10,000+ automotive paint colors from Forza games',
    url: 'https://forza-color-repo.vercel.app',
    siteName: 'Forza Color Sheet Visualiser',
    type: 'website',
    locale: 'en_US',
    images: [{
      url: 'https://forza-color-repo.vercel.app/forza-color-sheet-preview.jpg',
      width: 1200,
      height: 630,
      alt: 'Forza Color Sheet - Complete automotive paint color database'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forza Color Sheet Visualiser - Made by ResinRonin',
    description: 'Forza Color Sheet Visualiser made by ResinRonin - Interactive database of 10,000+ automotive paint colors from Forza games',
    images: ['https://forza-color-repo.vercel.app/forza-color-sheet-preview.jpg']
  },
  alternates: {
    canonical: 'https://forza-color-repo.vercel.app'
  },
  other: {
    'google-site-verification': 'your-google-verification-code',
    'msvalidate.01': 'your-bing-verification-code'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://forza-color-repo.vercel.app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e293b" />
        
        {/* Enhanced SEO for Forza Color Sheet searches */}
        <meta name="description" content="Forza Color Sheet Visualiser made by ResinRonin - Interactive database of 10,000+ automotive paint colors from Forza games with advanced search and visualization tools." />
        <meta name="keywords" content="forza color sheet, forza colors, forza paint database, forza horizon colors, forza motorsport paint, automotive color chart, racing game colors, car paint codes, forza livery colors" />
        
        {/* Structured Data for Search Engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Dataset",
              "name": "Forza Color Sheet Visualiser",
              "description": "Forza Color Sheet Visualiser made by ResinRonin - Interactive database of 10,000+ automotive paint colors from Forza games",
              "url": "https://forza-color-repo.vercel.app",
              "keywords": ["forza color sheet", "automotive colors", "racing game colors", "paint database", "ResinRonin"],
              "creator": {
                "@type": "Person",
                "name": "ResinRonin"
              },
              "distribution": {
                "@type": "DataDownload",
                "encodingFormat": "application/json",
                "contentUrl": "https://forza-color-repo.vercel.app/api/colors"
              },
              "temporalCoverage": "2021/..",
              "spatialCoverage": "Worldwide",
              "license": "https://creativecommons.org/licenses/by/4.0/"
            })
          }}
        />
        
        {/* Additional Structured Data for Gaming/Automotive */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Forza Color Sheet Visualiser",
              "applicationCategory": "UtilityApplication",
              "operatingSystem": "Web Browser",
              "url": "https://forza-color-repo.vercel.app",
              "description": "Forza Color Sheet Visualiser made by ResinRonin - Interactive database with searchable automotive paint colors",
              "featureList": [
                "10,000+ Forza paint colors",
                "Color search and filtering",
                "HSB and hex color values",
                "Paint code reference",
                "Color matching tools",
                "Downloadable color sheets"
              ],
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(registration => console.log('SW registered'))
                    .catch(error => console.log('SW registration failed'))
                })
              }
            `
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}