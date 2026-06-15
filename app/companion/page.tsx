import React, { Suspense } from 'react'
import { Metadata } from 'next'
import CompanionClient from './CompanionClient'

export const metadata: Metadata = {
  title: 'Paint Booth Companion | Forza Color Universe',
  description: 'Fullscreen, high-contrast display for Forza paint values. Perfect for using your phone as a second screen while painting in-game.',
}

export default function CompanionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Companion Mode...</div>}>
      <CompanionClient />
    </Suspense>
  )
}
