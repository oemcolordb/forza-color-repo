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
    default: 'Forza Color Universe',
    template: '%s | Forza Color Universe'
  },
  description: 'Explore 10,000+ official automotive colors from Forza racing games. Interactive color catalog with detailed information about paint colors, manufacturers, and visual representations.',
  keywords: ['Forza', 'colors', 'automotive', 'paint', 'racing', 'cars', 'color palette'],
  authors: [{ name: 'ResinRonin' }],
  creator: 'ResinRonin',
  publisher: 'ResinRonin',
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
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'Forza Color Universe',
    description: 'Explore 10,000+ official automotive colors from Forza racing games',
    siteName: 'Forza Color Universe',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forza Color Universe',
    description: 'Explore 10,000+ official automotive colors from Forza racing games',
    creator: '@ResinRonin',
  },
  verification: {
    google: 'your-google-verification-code',
  },
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
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}