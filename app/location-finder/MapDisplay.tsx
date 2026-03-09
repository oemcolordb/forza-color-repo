import React, { useState, useEffect } from 'react'
import { Location, LocationType } from './types'

interface MapDisplayProps {
  selectedLocation: Location | null
  allLocations: Location[]
  onLocationSelect: (location: Location) => void
}

const locationCoordinates: Record<string, { x: number; y: number }> = {
  Guanajuato: { x: 50, y: 35 },
  'Playa Azul': { x: 20, y: 70 },
  Estadio: { x: 55, y: 40 },
  'La Gran Caldera': { x: 75, y: 25 },
  Tulum: { x: 85, y: 60 },
  'Dunas Blancas': { x: 30, y: 20 },
  'Hotel Castillo': { x: 52, y: 38 },
  'Cascadas de Agua Azul': { x: 65, y: 55 },
  'Aeródromo en la Selva': { x: 90, y: 65 },
  'Copper Canyon': { x: 25, y: 30 },
  'Ek Balam': { x: 48, y: 36 },
  'Horizon Festival': { x: 40, y: 25 },
  Mulege: { x: 18, y: 72 },
  Teotihuacan: { x: 70, y: 20 },
  'Horizon Apex': { x: 60, y: 45 },
  'Puente de Piedra': { x: 45, y: 50 },
  'Mirador Balderrama': { x: 35, y: 28 },
  'Pantano de las Ranas': { x: 68, y: 62 },
  'Aeródromo Desértico': { x: 28, y: 18 },
  'Cañón de Cobre': { x: 22, y: 32 },
  'Playa Soledad': { x: 15, y: 75 },
  'Horizon Baja': { x: 25, y: 15 },
  'Horizon Wilds': { x: 72, y: 58 },
  'Horizon Rush': { x: 32, y: 22 },
  'Horizon Street Scene': { x: 51, y: 37 },
  Cordillera: { x: 38, y: 25 },
  'Selva Tropical': { x: 75, y: 60 },
  Desierto: { x: 30, y: 15 },
  'Bahía de Plata': { x: 12, y: 68 },
  'Mirador del Océano': { x: 10, y: 70 },
  'Casa Bella': { x: 53, y: 42 },
  'Puente Colgante': { x: 42, y: 48 },
  'Mirador de las Montañas': { x: 33, y: 26 },
  'Playa Tranquila': { x: 17, y: 78 },
  'Aeródromo Central': { x: 58, y: 35 },
  'Ruinas del Templo': { x: 78, y: 52 },
  'Cañón Profundo': { x: 27, y: 34 },
  'Pueblo Fantasma': { x: 36, y: 18 },
  'Mirador del Valle': { x: 44, y: 29 },
  'Playa del Sol': { x: 14, y: 73 },
}

const getMarkerColor = (type: LocationType) => {
  switch (type) {
    case LocationType.Parking:
      return 'bg-blue-500'
    case LocationType.PhotoOp:
      return 'bg-purple-500'
    case LocationType.Landmark:
      return 'bg-green-500'
    case LocationType.ScenicView:
      return 'bg-yellow-500'
    default:
      return 'bg-gray-500'
  }
}

const MapDisplay: React.FC<MapDisplayProps> = ({
  selectedLocation,
  allLocations,
  onLocationSelect,
}) => {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)
  const [filters, setFilters] = useState<LocationType[]>(Object.values(LocationType))

  useEffect(() => {
    if (selectedLocation && locationCoordinates[selectedLocation.name]) {
      setPosition(locationCoordinates[selectedLocation.name])
      setZoom(2.5)
    }
  }, [selectedLocation])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
  }

  const toggleFilter = (type: LocationType) => {
    setFilters(prev => (prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]))
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-900">
      {/* Controls Bar */}
      <div className="p-3 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 shadow-lg">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {Object.values(LocationType).map(type => (
              <button
                key={type}
                onClick={() => toggleFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filters.includes(type)
                    ? `${getMarkerColor(type)} text-white shadow-lg`
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Zoom Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => setZoom(Math.min(zoom + 0.5, 4))}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-bold shadow-lg transition-all hover:scale-105"
            >
              +
            </button>
            <button
              onClick={() => setZoom(Math.max(zoom - 0.5, 0.5))}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-bold shadow-lg transition-all hover:scale-105"
            >
              −
            </button>
            <button
              onClick={() => {
                setZoom(1)
                setPosition({ x: 50, y: 50 })
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-semibold shadow-lg transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-grow relative overflow-hidden">
        <iframe
          src="https://mapgenie.io/forza-horizon-5/maps/mexico"
          className="w-full h-full border-0"
          title="Forza Horizon 5 Map"
          allow="fullscreen"
        />

        {/* Selected Location Banner - Top of map */}
        {selectedLocation && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-none z-50">
            <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 px-6 py-3 rounded-xl shadow-2xl border-4 border-white animate-pulse">
              <div className="text-white font-bold text-xl text-center">
                📍 {selectedLocation.name}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-3 bg-gray-800/95 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>🗺️ Interactive MapGenie map • Search locations in the map interface</span>
          <span>
            {allLocations.filter(l => filters.includes(l.type)).length} locations available
          </span>
        </div>
      </div>
    </div>
  )
}

export default MapDisplay
