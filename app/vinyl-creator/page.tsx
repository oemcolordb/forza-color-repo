'use client'

import React from 'react'
import VinylDesigner from './components/VinylDesigner'

export default function VinylCreatorPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎨 Vinyl Creator Studio</h1>
          <p className="text-purple-300">
            Design vinyl stickers with layered shapes. Right-click on canvas to explore shapes and learn step-by-step assembly.
          </p>
        </div>
        <VinylDesigner />
      </div>
    </main>
  )
}
