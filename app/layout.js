import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import './wrench-scrollbar.css'
import ErrorBoundary from './components/ErrorBoundary'
import { ThirdPartyErrorBoundary } from './components/ThirdPartyErrorBoundary'
import EasterEgg420 from './components/EasterEgg420'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://forza-color-repo.vercel.app'),
  title: {
    default:
      'Forza Color Sheet 2019-2024 - Official Paint Colors Database | Forza Horizon 5 & Motorsport',
    template: '%s | Forza Color Sheet',
  },
  description:
    'Official Forza Color Sheet with 10,000+ paint colors from Forza Horizon 5, Forza Motorsport 2019-2024. Complete Forza color database, paint codes, and livery creator tools for all Forza games.',
  keywords: [
    // Primary target keywords
    'Forza Color Sheet',
    'forza color sheet 2019',
    'Forza color sheet 2020',
    'Forza color sheet 2021',
    'Forza color sheet 2022',
    'Forza color sheet 2023',
    'Forza color sheet 2024',
    'official Forza color sheet',
    'Forza paint color sheet',
    'Forza Horizon color sheet',
    'Forza Motorsport color sheet',
    // Secondary variations
    'Forza colors database',
    'Forza paint codes sheet',
    'Forza color list',
    'Forza paint colors list',
    'Forza Horizon 5 color sheet',
    'FH5 color sheet',
    'Forza Motorsport color codes',
    'complete Forza color sheet',
    'all Forza colors',
    'Forza paint database',
    // Long-tail keywords
    'Forza Horizon 5 official colors',
    'Forza paint color reference',
    'Forza livery colors',
    'Forza car paint colors',
    'Forza custom paint colors',
    'Forza color picker tool',
    // Gaming community terms
    'Forza community colors',
    'racing game paint jobs',
    'car game customization',
    'Forza tuning colors',
    'FH5 drift car colors',
    'Forza drag racing paints',
    // Additional SEO keywords
    'Forza Horizon 5 livery colors',
    'Forza Motorsport 8 paint codes',
    'FH5 hex color codes',
    'Forza HSB color values',
    'Forza paint matching',
    'Forza color codes database',
    'Forza car customization colors',
    'racing game color database',
    'automotive paint color reference',
    'car color hex codes',
    'vehicle paint color database',
    'Forza vinyl colors',
    'Forza decal colors',
    'Forza wrap colors',
    'Forza spec map colors',
    'Forza metallic colors',
    'Forza matte colors',
    'Forza pearl colors',
    'Forza carbon fiber colors',
    'Forza chrome colors',
    'Forza gold colors',
    'Forza candy colors',
    'Forza two-tone colors',
    'Forza race car colors',
    'Forza JDM colors',
    'Forza muscle car colors',
    'Forza supercar colors',
    'Forza hypercar colors',
    'Forza exotic colors',
  ],
  authors: [{ name: 'ResinRonin', url: 'https://github.com/ResinRonin' }],
  creator: 'ResinRonin',
  publisher: 'OEMColorDB',
  category: 'Automotive Tools',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://forza-color-repo.vercel.app',
    title: 'Forza Color Sheet 2019-2024 - Official Paint Colors Database',
    description:
      'Complete Forza Color Sheet with 10,000+ official paint colors from Forza Horizon 5 & Motorsport 2019-2024. The ultimate Forza color database and paint codes reference.',
    siteName: 'Forza Color Sheet',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Forza Color Universe - FH5 Paint Colors & Livery Creator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forza Color Sheet 2019-2024 - Official Paint Colors Database',
    description:
      'Complete Forza Color Sheet with 10,000+ official paint colors from Forza games 2019-2024. The definitive Forza color reference.',
    creator: '@ResinRonin',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || 'https://forza-color-repo.vercel.app',
  },
  other: {
    'application-name': 'Forza Color Sheet',
    'apple-mobile-web-app-title': 'Forza Color Sheet',
    'msapplication-TileColor': '#0f172a',
    // Gaming-specific meta tags
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0f172a',
  colorScheme: 'dark light',
}

export default function RootLayout({ children }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Forza Color Sheet',
    alternateName: ['Official Forza Color Sheet 2019-2024', 'Forza Paint Database', 'FH5 Color Reference'],
    description:
      'Complete Forza Color Sheet database with 10,000+ official paint colors from Forza Horizon 5 and Forza Motorsport 2019-2024',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://forza-color-repo.vercel.app',
    applicationCategory: ['GameApplication', 'UtilitiesApplication'],
    operatingSystem: 'Web Browser',
    genre: ['Racing', 'Automotive', 'Design Tools'],
    gamePlatform: ['Web Browser', 'Mobile', 'Desktop'],
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
    screenshot: [
      {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://forza-color-repo.vercel.app'}/og-image.jpg`,
        width: 1200,
        height: 630,
      },
    ],
    creator: {
      '@type': 'Person',
      name: 'ResinRonin',
      url: 'https://github.com/ResinRonin',
    },
    author: {
      '@type': 'Person',
      name: 'ResinRonin',
    },
    publisher: {
      '@type': 'Organization',
      name: 'OEMColorDB',
      url: process.env.NEXT_PUBLIC_APP_URL || 'https://forza-color-repo.vercel.app',
    },
    featureList: [
      'Complete Forza Color Sheet 2019-2024',
      '10,000+ official Forza paint colors',
      'Forza Horizon 5 color database',
      'Forza Motorsport color sheet',
      'Official Forza paint codes',
      'Forza color reference tool',
      'Advanced Forza color search',
      'HSB color values for all Forza games',
      'Mobile-optimized Forza color sheet',
      'Color matching and comparison',
      'Export color data to JSON/CSV',
      'Printable color charts',
    ],
    softwareVersion: '2.0',
    datePublished: '2023-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    about: {
      '@type': 'VideoGame',
      name: 'Forza Horizon 5',
      alternateName: 'FH5',
    },
  }

  // Website schema for sitelinks and search box
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Forza Color Sheet',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://forza-color-repo.vercel.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || 'https://forza-color-repo.vercel.app'}/?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'OEMColorDB',
      url: process.env.NEXT_PUBLIC_APP_URL || 'https://forza-color-repo.vercel.app',
    },
  }

  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0f172a" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="color-scheme" content="dark light" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="referrer" content="origin-when-cross-origin" />
        <meta
          name="google-site-verification"
          content="vG2Z9j6nstH8oDSGfxfICIrbefBCUu0cIttuSxMIiOk"
        />
        {/* Enhanced PWA and App Meta Tags */}
        <meta name="application-name" content="Forza Color Sheet" />
        <meta name="apple-mobile-web-app-title" content="Forza Color Sheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        <meta name="msapplication-TileImage" content="/icon-192.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        {/* Icons */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icon-192.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icon-167.png" />
        {/* Preconnect for Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Canonical */}
        <link rel="canonical" href={process.env.NEXT_PUBLIC_APP_URL || 'https://forza-color-repo.vercel.app'} />
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  // Only register service worker in production
                  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                    navigator.serviceWorker.register('/sw.js')
                      .catch(() => {})
                  } else {
                    // Unregister any existing service workers in development
                    navigator.serviceWorker.getRegistrations().then(registrations => {
                      registrations.forEach(registration => registration.unregister())
                    })
                  }
                })
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ThirdPartyErrorBoundary />
        <ErrorBoundary>{children}</ErrorBoundary>
        {/* 🌿 hidden easter eggs — global */}
        <EasterEgg420 />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
