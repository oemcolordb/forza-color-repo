'use client'

import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { MapContainer, ImageOverlay, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import locationData from '@/public/data/fh5-locations-enhanced.json'
import { Location, LocationType } from './types'

// Fix Leaflet default marker icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface LeafletMapClientProps {
  selectedLocation?: { id: string; coordinates: { x: number; y: number } } | null
  onLocationClick?: (locationId: string) => void
  activeFilters?: string[]
}

// Custom marker icons by type
const createCustomIcon = (type: string, isSelected: boolean = false) => {
  const colors: Record<string, string> = {
    'Barn Find': '#ef4444',
    'Fast Travel Board': '#3b82f6',
    'XP Board': '#eab308',
    'Treasure': '#a855f7',
    'Landmark': '#22c55e',
    'Festival Site': '#ec4899',
    'Player House': '#06b6d4',
    'Expedition': '#6366f1',
    'Showcase': '#f97316',
    'Road Racing Event': '#2563eb',
    'Dirt Racing Event': '#f59e0b',
    'Cross Country Event': '#10b981',
    'Street Racing Event': '#8b5cf6',
    'Drag Racing Event': '#f43f5e',
    'Danger Sign': '#dc2626',
    'Speed Trap': '#0ea5e9',
    'Speed Zone': '#14b8a6',
    'Drift Zone': '#d946ef',
    'Trailblazer': '#84cc16',
  }

  const color = colors[type] || '#6b7280'
  const size = isSelected ? 16 : 12

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ${isSelected ? 'animation: pulse 1.5s infinite;' : ''}
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// Component to handle map view updates
const MapViewController: React.FC<{
  selectedLocation?: { coordinates: { x: number; y: number } } | null
}> = ({ selectedLocation }) => {
  const map = useMap()

  useEffect(() => {
    if (selectedLocation) {
      const { x, y } = selectedLocation.coordinates
      // Convert percentage to Leaflet coordinates
      const lat = -y * 20.48 // Scale to match image bounds
      const lng = x * 20.48
      map.flyTo([lat, lng], 4, { duration: 0.5 })
    }
  }, [selectedLocation, map])

  return null
}

// Component to handle map clicks
const MapClickHandler: React.FC<{ onMapClick: () => void }> = ({ onMapClick }) => {
  useMapEvents({
    click: () => {
      onMapClick()
    },
  })
  return null
}

const LeafletMapClient: React.FC<LeafletMapClientProps> = ({
  selectedLocation,
  onLocationClick,
  activeFilters = [],
}) => {
  const [locations] = useState<Location[]>(locationData.locations as Location[])
  const mapRef = useRef<L.Map | null>(null)

  // Filter locations based on active filters
  const filteredLocations = activeFilters.length > 0
    ? locations.filter(loc => activeFilters.includes(loc.type))
    : locations

  // Map bounds (image is 2048x2048, we'll use a coordinate system that matches)
  const bounds: L.LatLngBoundsExpression = [
    [-2048, 0],
    [0, 2048],
  ]

  const handleMapClick = () => {
    // Deselect location when clicking on empty map area
    if (onLocationClick) {
      onLocationClick('')
    }
  }

  return (
    <div className="w-full h-full relative">
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
        }
        .leaflet-container {
          background: #1a1a1a;
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          background: rgba(17, 24, 39, 0.95);
          color: white;
          border-radius: 8px;
          padding: 0;
        }
        .leaflet-popup-content {
          margin: 12px;
          font-size: 14px;
        }
        .leaflet-popup-tip {
          background: rgba(17, 24, 39, 0.95);
        }
        .custom-marker {
          background: transparent;
          border: none;
        }
      `}</style>

      <MapContainer
        center={[-1024, 1024]}
        zoom={2}
        minZoom={1}
        maxZoom={5}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        attributionControl={false}
        ref={mapRef}
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
      >
        {/* Map image overlay - using a placeholder dark background for now */}
        <ImageOverlay
          url="/maps/fh5-mexico.jpg"
          bounds={bounds}
          opacity={1}
        />

        {/* Map click handler */}
        <MapClickHandler onMapClick={handleMapClick} />

        {/* View controller */}
        <MapViewController selectedLocation={selectedLocation} />

        {/* Location markers */}
        {filteredLocations.map(location => {
          const isSelected = selectedLocation?.id === location.id
          const lat = -location.coordinates.y * 20.48
          const lng = location.coordinates.x * 20.48

          return (
            <Marker
              key={location.id}
              position={[lat, lng]}
              icon={createCustomIcon(location.type, isSelected)}
              eventHandlers={{
                click: () => {
                  if (onLocationClick) {
                    onLocationClick(location.id)
                  }
                },
              }}
            >
              <Popup>
                <div className="space-y-2">
                  <div className="font-bold text-base">{location.name}</div>
                  <div className="text-xs text-gray-400">{location.type}</div>
                  {location.description && (
                    <div className="text-sm text-gray-300">{location.description}</div>
                  )}
                  {(location as any).reward && (
                    <div className="text-sm text-green-400">
                      🏆 {(location as any).reward}
                    </div>
                  )}
                  {(location as any).cost && (
                    <div className="text-sm text-yellow-400">
                      💰 {(location as any).cost}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-gray-900/95 backdrop-blur-sm rounded-lg p-3 shadow-xl border border-gray-700 max-w-xs z-[1000]">
        <div className="text-xs font-bold text-white mb-2">Map Legend</div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {[
            { type: 'Barn Find', color: '#ef4444' },
            { type: 'Fast Travel Board', color: '#3b82f6' },
            { type: 'XP Board', color: '#eab308' },
            { type: 'Treasure', color: '#a855f7' },
            { type: 'Festival Site', color: '#ec4899' },
            { type: 'Player House', color: '#06b6d4' },
            { type: 'Danger Sign', color: '#dc2626' },
            { type: 'Speed Trap', color: '#0ea5e9' },
          ].map(({ type, color }) => (
            <div key={type} className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full border border-white"
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-300 truncate">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls hint */}
      <div className="absolute top-4 left-4 bg-gray-900/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-xl border border-gray-700 z-[1000]">
        <div className="text-xs text-gray-300">
          🖱️ Click markers • 🔍 Zoom with scroll • 🤚 Drag to pan
        </div>
      </div>
    </div>
  )
}

export default LeafletMapClient
