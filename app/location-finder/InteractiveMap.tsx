'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'

// Dynamic import to avoid SSR issues with Leaflet
const LeafletMap = dynamic(() => import('./LeafletMapClient'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading interactive map...</p>
      </div>
    </div>
  ),
})

interface InteractiveMapProps {
  selectedLocation?: { id: string; coordinates: { x: number; y: number } } | null
  onLocationClick?: (locationId: string) => void
  activeFilters?: string[]
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  selectedLocation,
  onLocationClick,
  activeFilters = [],
}) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Initializing map...</p>
        </div>
      </div>
    )
  }

  return (
    <LeafletMap
      selectedLocation={selectedLocation}
      onLocationClick={onLocationClick}
      activeFilters={activeFilters}
    />
  )
}

export default InteractiveMap
