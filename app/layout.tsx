import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Forza Color Universe - 10,000+ Automotive Paint Colors',
  description: 'Comprehensive database of automotive paint colors from Forza racing games. Search, compare, and explore 10,000+ official car colors with HSB values, color matching, and export tools.',
  keywords: 'forza colors, automotive paint, car colors, HSB values, color matching, paint codes, racing colors, automotive design',
  authors: [{ name: 'Forza Color Universe Team' }],
  creator: 'Forza Color Universe',
  publisher: 'Forza Color Universe',
  robots: 'index, follow',
  openGraph: {
    title: 'Forza Color Universe - 10,000+ Automotive Paint Colors',
    description: 'Comprehensive database of automotive paint colors from Forza racing games',
    url: 'https://forza-color-repo.vercel.app',
    siteName: 'Forza Color Universe',
    type: 'website',
    locale: 'en_US'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forza Color Universe - 10,000+ Automotive Paint Colors',
    description: 'Comprehensive database of automotive paint colors from Forza racing games'
  },
  alternates: {
    canonical: 'https://forza-color-repo.vercel.app'
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
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}