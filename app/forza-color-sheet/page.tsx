import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Forza Color Sheet - Complete Automotive Paint Database | 10,000+ Colors',
  description: 'Access the complete Forza color sheet with 10,000+ automotive paint colors from Forza Horizon 5, Forza Motorsport 8, and all racing games. Search, filter, and download color data with HSB values and paint codes.',
  keywords: 'forza color sheet, forza colors database, forza paint colors, forza horizon 5 colors, forza motorsport colors, automotive color sheet, car paint database, racing game colors, forza livery colors, paint codes',
  alternates: {
    canonical: 'https://forza-color-repo.vercel.app/forza-color-sheet'
  },
  openGraph: {
    title: 'Forza Color Sheet - Complete Automotive Paint Database',
    description: 'Access 10,000+ automotive paint colors from Forza racing games with HSB values and paint codes',
    url: 'https://forza-color-repo.vercel.app/forza-color-sheet',
    type: 'website'
  }
}

// This page redirects to the main app but provides a dedicated URL for "forza color sheet" searches
export default function ForzaColorSheetPage() {
  redirect('/?utm_source=forza-color-sheet&utm_medium=seo')
}