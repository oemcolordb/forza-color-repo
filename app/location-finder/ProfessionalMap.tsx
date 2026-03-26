'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Location } from './types'
import { MAP_IMAGE_HEIGHT, MAP_IMAGE_WIDTH, percentToLeafletLatLng } from './coordinates'

interface ProfessionalMapProps {
  locations: Location[]
  selectedLocation?: Location | null
  onLocationSelect?: (location: Location) => void
  activeFilters?: string[]
  isDarkMode?: boolean
}

// Marker color scheme
const MARKER_COLORS: Record<string, string> = {
  'Barn Find': '#ef4444',
  'Fast Travel Board': '#3b82f6',
  'XP Board': '#eab308',
  'Treasure': '#a855f7',
  'Landmark': '#22c55e',
  'Festival Site': '#ec4899',
  'Player House': '#06b6d4',
  'Expedition': '#6366f1',
  'Showcase': '#f97316',
  'Playground Game': '#84cc16',
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
  'Trailblazer Finish': '#65a30d',
}

type OverlayKey = 'road-piece' | 'waldo'

const OVERLAYS: Record<OverlayKey, { label: string; src: string; emoji: string }> = {
  'road-piece': { label: 'Road Pieces', src: '/maps/road-piece-ref.webp', emoji: '🛣️' },
  'waldo':      { label: 'Waldo Ref',   src: '/maps/waldo-ref.webp',      emoji: '🔍' },
}

const ProfessionalMap: React.FC<ProfessionalMapProps> = ({
  locations,
  selectedLocation,
  onLocationSelect,
  activeFilters = [],
  isDarkMode = true,
}) => {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const overlayLayersRef = useRef<Partial<Record<OverlayKey, L.ImageOverlay>>>({})
  const [mapReady, setMapReady] = useState(false)
  const [activeOverlays, setActiveOverlays] = useState<Set<OverlayKey>>(new Set())
  const [overlayOpacity, setOverlayOpacity] = useState(0.55)

  // Filter locations
  const filteredLocations = useMemo(() => {
    if (activeFilters.length === 0) return locations
    return locations.filter(loc => activeFilters.includes(loc.type))
  }, [locations, activeFilters])

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Create map with custom styling
    const map = L.map(containerRef.current, {
      crs: L.CRS.Simple,
      minZoom: -2,
      maxZoom: 3,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
    })

    // Set bounds for actual map image dimensions
    const bounds = L.latLngBounds([0, 0], [MAP_IMAGE_HEIGHT, MAP_IMAGE_WIDTH])
    
    // Add map image
    L.imageOverlay('/maps/fh5-mexico.jpg', bounds, {
      opacity: 1,
      interactive: false,
    }).addTo(map)

    map.setMaxBounds(bounds.pad(0.1))
    map.fitBounds(bounds)

    // Add custom zoom control
    L.control.zoom({
      position: 'topright',
    }).addTo(map)

    // Add scale
    L.control.scale({
      position: 'bottomleft',
      imperial: false,
    }).addTo(map)

    // Pre-create overlay layers (hidden by default)
    ;(Object.keys(OVERLAYS) as OverlayKey[]).forEach(key => {
      const layer = L.imageOverlay(OVERLAYS[key].src, bounds, {
        opacity: 0,
        interactive: false,
        className: 'reference-overlay',
      }).addTo(map)
      overlayLayersRef.current[key] = layer
    })

    mapRef.current = map
    setMapReady(true)

    return () => {
      map.remove()
      mapRef.current = null
      overlayLayersRef.current = {}
    }
  }, [])

  // Create custom marker icon
  const createMarkerIcon = (type: string, isSelected: boolean = false) => {
    const color = MARKER_COLORS[type] || '#6b7280'
    const size = isSelected ? 20 : 14
    const pulseClass = isSelected ? 'marker-pulse' : ''

    return L.divIcon({
      className: `custom-marker ${pulseClass}`,
      html: `
        <div class="marker-pin" style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border: 3px solid ${isDarkMode ? '#1f2937' : '#ffffff'};
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          transition: all 0.2s ease;
          ${isSelected ? 'transform: scale(1.2);' : ''}
        "></div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
    })
  }

  // Update markers when locations or filters change
  useEffect(() => {
    if (!mapReady || !mapRef.current) return

    const map = mapRef.current

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current.clear()

    // Add filtered markers
    filteredLocations.forEach(location => {
      const [lat, lng] = percentToLeafletLatLng(location.coordinates)

      const isSelected = selectedLocation?.id === location.id
      const marker = L.marker([lat, lng], {
        icon: createMarkerIcon(location.type, isSelected),
        title: location.name,
        riseOnHover: true,
      })

      // Create popup content
      const popupContent = `
        <div class="custom-popup" style="
          background: ${isDarkMode ? '#1f2937' : '#ffffff'};
          color: ${isDarkMode ? '#f3f4f6' : '#1f2937'};
          padding: 12px;
          border-radius: 8px;
          min-width: 200px;
        ">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">
            ${location.name}
          </div>
          <div style="
            font-size: 11px;
            color: ${MARKER_COLORS[location.type] || '#6b7280'};
            font-weight: 600;
            margin-bottom: 8px;
          ">
            ${location.type}
          </div>
          ${location.description ? `
            <div style="font-size: 12px; color: ${isDarkMode ? '#9ca3af' : '#6b7280'}; margin-bottom: 8px;">
              ${location.description}
            </div>
          ` : ''}
          ${location.reward ? `
            <div style="
              font-size: 12px;
              color: #22c55e;
              background: rgba(34, 197, 94, 0.1);
              padding: 4px 8px;
              border-radius: 4px;
              margin-bottom: 4px;
            ">
              🏆 ${location.reward}
            </div>
          ` : ''}
          ${location.cost ? `
            <div style="
              font-size: 12px;
              color: #eab308;
              background: rgba(234, 179, 8, 0.1);
              padding: 4px 8px;
              border-radius: 4px;
            ">
              💰 ${location.cost}
            </div>
          ` : ''}
        </div>
      `

      marker.bindPopup(popupContent, {
        closeButton: true,
        className: 'custom-leaflet-popup',
      })

      marker.on('click', () => {
        if (onLocationSelect) {
          onLocationSelect(location)
        }
      })

      marker.addTo(map)
      markersRef.current.set(location.id, marker)
    })
  }, [mapReady, filteredLocations, selectedLocation, onLocationSelect, isDarkMode])

  // Sync overlay visibility + opacity
  useEffect(() => {
    if (!mapReady) return
    ;(Object.keys(OVERLAYS) as OverlayKey[]).forEach(key => {
      const layer = overlayLayersRef.current[key]
      if (!layer) return
      layer.setOpacity(activeOverlays.has(key) ? overlayOpacity : 0)
    })
  }, [mapReady, activeOverlays, overlayOpacity])

  const toggleOverlay = (key: OverlayKey) => {
    setActiveOverlays(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  // Pan to selected location
  useEffect(() => {
    if (!mapReady || !mapRef.current || !selectedLocation) return

    const marker = markersRef.current.get(selectedLocation.id)
    if (marker) {
      const map = mapRef.current
      map.flyTo(marker.getLatLng(), 1, {
        duration: 0.5,
        easeLinearity: 0.25,
      })
      marker.openPopup()
    }
  }, [mapReady, selectedLocation])

  return (
    <div className="relative w-full h-full">
      <style jsx global>{`
        .custom-marker {
          background: transparent;
          border: none;
        }
        .marker-pulse .marker-pin {
          animation: marker-pulse 1.5s ease-in-out infinite;
        }
        @keyframes marker-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.8;
          }
        }
        .leaflet-container {
          background: ${isDarkMode ? '#0f172a' : '#f1f5f9'};
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          background: transparent;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          padding: 0;
        }
        .leaflet-popup-tip {
          background: ${isDarkMode ? '#1f2937' : '#ffffff'};
        }
        .leaflet-control-zoom a {
          background: ${isDarkMode ? '#1f2937' : '#ffffff'};
          color: ${isDarkMode ? '#f3f4f6' : '#1f2937'};
          border: 1px solid ${isDarkMode ? '#374151' : '#e5e7eb'};
        }
        .leaflet-control-zoom a:hover {
          background: ${isDarkMode ? '#374151' : '#f3f4f6'};
        }
      `}</style>

      <div ref={containerRef} className="w-full h-full" />

      {/* Loading overlay */}
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 z-[1000]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-lg font-semibold">Loading Map...</p>
            <p className="text-gray-400 text-sm mt-2">Preparing {locations.length} locations</p>
          </div>
        </div>
      )}

      {/* Stats overlay */}
      {mapReady && (
        <div className={`absolute top-4 left-4 ${isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-sm rounded-lg px-4 py-3 shadow-xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} z-[1000]`}>
          <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
            🗺️ FH5 Mexico Map
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {filteredLocations.length} of {locations.length} locations
          </div>
        </div>
      )}

      {/* Reference overlay controls */}
      {mapReady && (
        <div className={`absolute top-4 right-14 flex flex-col gap-2 z-[1000]`}>
          <div className={`${isDarkMode ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-sm rounded-lg px-3 py-2 shadow-xl border`}>
            <div className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>📎 Reference Overlays</div>
            <div className="flex flex-col gap-1.5">
              {(Object.keys(OVERLAYS) as OverlayKey[]).map(key => (
                <button
                  key={key}
                  onClick={() => toggleOverlay(key)}
                  className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    activeOverlays.has(key)
                      ? 'bg-blue-600 text-white'
                      : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{OVERLAYS[key].emoji}</span>
                  <span>{OVERLAYS[key].label}</span>
                  {activeOverlays.has(key) && <span className="ml-auto">✓</span>}
                </button>
              ))}
            </div>
            {activeOverlays.size > 0 && (
              <div className="mt-2">
                <div className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Opacity: {Math.round(overlayOpacity * 100)}%
                </div>
                <input
                  type="range" min="10" max="100" step="5"
                  value={Math.round(overlayOpacity * 100)}
                  onChange={e => setOverlayOpacity(Number(e.target.value) / 100)}
                  className="w-full h-1.5 accent-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Controls hint */}
      {mapReady && (
        <div className={`absolute bottom-4 left-4 ${isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-sm rounded-lg px-4 py-2 shadow-xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} z-[1000]`}>
          <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center gap-3`}>
            <span>🖱️ Click markers</span>
            <span>•</span>
            <span>🔍 Scroll to zoom</span>
            <span>•</span>
            <span>🤚 Drag to pan</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfessionalMap
