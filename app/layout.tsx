import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ErrorBoundary from './components/ErrorBoundary'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: {
    default: 'Forza Color Universe - 10,000+ Official Automotive Paint Colors',
    template: '%s | Forza Color Universe'
  },
  description: 'Discover and explore over 10,000 official automotive paint colors from Forza racing games. Search by manufacturer, model, year, or upload images to find matching car colors. Complete HSB color data included.',
  keywords: [
    'Forza colors', 'automotive paint colors', 'car colors', 'racing game colors',
    'paint codes', 'automotive color database', 'car paint matching', 'HSB color values',
    'Ferrari colors', 'Porsche colors', 'BMW colors', 'Mercedes colors',
    'color picker', 'automotive design', 'car customization', 'paint reference'
  ],
  authors: [{ name: 'ResinRonin', url: 'https://github.com/ResinRonin' }],
  creator: 'ResinRonin',
  publisher: 'Forza Color Universe',
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
    title: 'Forza Color Universe - 10,000+ Official Automotive Paint Colors',
    description: 'Discover and explore over 10,000 official automotive paint colors from Forza racing games. Search, filter, and find matching colors with our advanced tools.',
    siteName: 'Forza Color Universe',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Forza Color Universe - Automotive Color Database'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forza Color Universe - 10,000+ Official Automotive Paint Colors',
    description: 'Discover and explore over 10,000 official automotive paint colors from Forza racing games.',
    creator: '@ResinRonin',
    images: ['/og-image.jpg']
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || 'https://forza-colors.netlify.app'
  },
  other: {
    'application-name': 'Forza Color Universe',
    'apple-mobile-web-app-title': 'Forza Colors',
    'msapplication-TileColor': '#0f172a'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Forza Color Universe",
    "description": "Discover and explore over 10,000 official automotive paint colors from Forza racing games",
    "url": process.env.NEXT_PUBLIC_APP_URL || "https://forza-colors.netlify.app",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web Browser",
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
      "10,000+ automotive paint colors",
      "Image color matching",
      "Advanced search and filtering",
      "HSB color values",
      "Manufacturer and model data"
    ]
  }

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
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
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}