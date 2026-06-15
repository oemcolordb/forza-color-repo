'use client'



import { redirect } from 'next/navigation'

// This page redirects to the main app but provides a dedicated URL for "forza color sheet" searches
export default function ForzaColorSheetPage() {
  redirect('/?utm_source=forza-color-sheet&utm_medium=seo')
}
