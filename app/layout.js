import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import './wrench-scrollbar.css'
import ErrorBoundary from './components/ErrorBoundary'
import { DevToolsSuppress } from './components/DevToolsSuppress'
import { ThirdPartyErrorBoundary } from './components/ThirdPartyErrorBoundary'
import { SecurityEnforcer } from './components/SecurityEnforcer'

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
  themeColor: '#0f172a',
}

export default function RootLayout({ children }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Forza Color Sheet',
    alternateName: 'Official Forza Color Sheet 2019-2024',
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
    },
    creator: {
      '@type': 'Person',
      name: 'ResinRonin',
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
    ],
    about: {
      '@type': 'VideoGame',
      name: 'Forza Horizon 5',
      alternateName: 'FH5',
    },
  }

  return (
    <html lang="en" className={inter.className}>
      <head>
        <meta
          name="google-site-verification"
          content="vG2Z9j6nstH8oDSGfxfICIrbefBCUu0cIttuSxMIiOk"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-192.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  // Only register service worker in production
                  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                    navigator.serviceWorker.register('/sw.js')
                      .then(() => console.log('SW registered'))
                      .catch(error => console.warn('SW registration failed', error))
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
      <body className={`${inter.className} antialiased`}>
        <SecurityEnforcer />
        <DevToolsSuppress />
        <ThirdPartyErrorBoundary />
        <ErrorBoundary>{children}</ErrorBoundary>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
