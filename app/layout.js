import { Inter } from 'next/font/google'
import './globals.css'
import ErrorBoundary from './components/ErrorBoundary'
import { DevToolsSuppress } from './components/DevToolsSuppress'
import { ThirdPartyErrorBoundary } from './components/ThirdPartyErrorBoundary'
import { SecurityEnforcer } from './components/SecurityEnforcer'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true
})

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://forza-colors.netlify.app'),
  title: {
    default: 'Forza Color Universe - Official FH5 & FM Paint Colors Database',
    template: '%s | Forza Colors'
  },
  description: 'Ultimate Forza Horizon 5 and Forza Motorsport paint color database. 10,000+ official car colors, livery creator tool, custom paint codes, and FH5 color matching for racing game enthusiasts.',
  keywords: [
    // Gaming SEO - Long-tail keywords
    'Forza Horizon 5 livery creator', 'FH5 custom paint tool', 'Forza Motorsport colors',
    'Forza Horizon 5 paint codes', 'FH5 color database', 'Forza livery designer',
    'Forza Horizon 5 car customization', 'FH5 paint job creator', 'Forza color picker',
    'Forza Motorsport livery editor', 'FH5 racing stripes', 'Forza custom designs',
    // Core automotive terms
    'automotive paint colors', 'car colors database', 'racing game colors',
    'paint codes lookup', 'car paint matching', 'HSB color values',
    // Brand-specific gaming searches
    'Ferrari Forza colors', 'Porsche FH5 paints', 'BMW Forza liveries',
    'Mercedes racing colors', 'Lamborghini Forza paints', 'McLaren FH5 colors',
    // Gaming community terms
    'Forza community colors', 'racing game paint jobs', 'car game customization',
    'Forza tuning colors', 'FH5 drift car colors', 'Forza drag racing paints'
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
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://forza-colors.netlify.app',
    title: 'Forza Color Universe - FH5 Livery Creator & Paint Database',
    description: 'Ultimate Forza Horizon 5 paint color database with 10,000+ official car colors. Create custom liveries, find paint codes, and design racing masterpieces.',
    siteName: 'Forza Color Universe',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Forza Color Universe - FH5 Paint Colors & Livery Creator'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forza Color Universe - FH5 Livery Creator & Paint Database',
    description: 'Ultimate Forza Horizon 5 paint color database with 10,000+ official car colors for custom liveries.',
    creator: '@ResinRonin',
    images: ['/og-image.jpg']
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || 'https://forza-colors.netlify.app'
  },
  other: {
    'application-name': 'Forza Colors',
    'apple-mobile-web-app-title': 'Forza Colors',
    'msapplication-TileColor': '#0f172a',
    // Gaming-specific meta tags
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent'
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
}

export default function RootLayout({ children }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Forza Color Universe",
    "alternateName": "FH5 Livery Creator",
    "description": "Ultimate Forza Horizon 5 and Forza Motorsport paint color database with livery creator tools",
    "url": process.env.NEXT_PUBLIC_APP_URL || "https://forza-colors.netlify.app",
    "applicationCategory": ["GameApplication", "UtilitiesApplication"],
    "operatingSystem": "Web Browser",
    "genre": ["Racing", "Automotive", "Design Tools"],
    "gamePlatform": ["Web Browser", "Mobile", "Desktop"],
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Person",
      "name": "ResinRonin"
    },
    "featureList": [
      "10,000+ Forza Horizon 5 paint colors",
      "Forza Motorsport color database",
      "Custom livery creator tool",
      "FH5 paint code lookup",
      "Image color matching for racing games",
      "Advanced search and filtering",
      "HSB color values for game modding",
      "Manufacturer and model data",
      "Mobile-optimized for gaming on-the-go"
    ],
    "about": {
      "@type": "VideoGame",
      "name": "Forza Horizon 5",
      "alternateName": "FH5"
    }
  }

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'nonce-forza2024'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://fonts.gstatic.com; media-src 'self' data: blob:; connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://generativelanguage.googleapis.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests;" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=(), payment=()" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" href="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <SecurityEnforcer />
        <DevToolsSuppress />
        <ThirdPartyErrorBoundary />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}