'use client'

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Location, LocationType } from './types'

// Map dimensions for coordinate calculations
const MAP_IMG_W = 3840
const MAP_IMG_H = 2160

interface NeonRoadMapProps {
  selectedLocation: Location | null
  allLocations: Location[]
  filters: LocationType[]
  onFiltersChange: (_filters: LocationType[]) => void
  onLocationSelect: (location: Location) => void
}

// Road network data - simplified representation of FH5 Mexico's main roads
// Coordinates are in percentage (0-100) of map dimensions
interface RoadSegment {
  id: string
  path: string // SVG path commands
  type: 'highway' | 'main' | 'dirt' | 'trail'
  name?: string
}

// Simplified road network for FH5 Mexico map
const ROAD_NETWORK: RoadSegment[] = [
  // Highway 1 - Main coastal highway (west side)
  {
    id: 'hwy-1',
    type: 'highway',
    name: 'Coastal Highway',
    path: 'M 5,75 Q 15,70 25,72 T 45,70 T 65,68 T 85,65'
  },
  // Highway 2 - Cross-country highway (central)
  {
    id: 'hwy-2',
    type: 'highway',
    name: 'Trans-Mexico Highway',
    path: 'M 10,50 Q 25,45 40,48 T 70,45 T 95,50'
  },
  // Highway 3 - Northern highway
  {
    id: 'hwy-3',
    type: 'highway',
    name: 'Northern Highway',
    path: 'M 15,25 Q 30,22 50,25 T 80,22 T 95,25'
  },
  // Highway 4 - Eastern coastal
  {
    id: 'hwy-4',
    type: 'highway',
    name: 'Eastern Coast Road',
    path: 'M 75,30 Q 78,40 75,50 T 78,70 T 75,85'
  },
  // Main Road 1 - Canyon pass
  {
    id: 'main-1',
    type: 'main',
    name: 'Canyon Pass',
    path: 'M 30,60 Q 35,50 40,40 T 50,25'
  },
  // Main Road 2 - Mountain road
  {
    id: 'main-2',
    type: 'main',
    name: 'Sierra Road',
    path: 'M 20,35 Q 35,35 50,38 T 70,35'
  },
  // Main Road 3 - Jungle route
  {
    id: 'main-3',
    type: 'main',
    name: 'Jungle Route',
    path: 'M 60,75 Q 65,60 70,50 T 75,35'
  },
  // Dirt Road 1 - Beach access
  {
    id: 'dirt-1',
    type: 'dirt',
    name: 'Beach Trail',
    path: 'M 25,72 Q 28,78 25,85'
  },
  // Dirt Road 2 - Mountain trail
  {
    id: 'dirt-2',
    type: 'dirt',
    name: 'Mountain Trail',
    path: 'M 45,30 Q 48,25 50,15'
  },
  // Dirt Road 3 - Swamp path
  {
    id: 'dirt-3',
    type: 'dirt',
    name: 'Swamp Path',
    path: 'M 55,65 Q 60,70 62,78'
  },
  // Trail 1 - Hidden path
  {
    id: 'trail-1',
    type: 'trail',
    name: 'Hidden Path',
    path: 'M 35,55 Q 38,58 35,62'
  },
  // Trail 2 - Ruins access
  {
    id: 'trail-2',
    type: 'trail',
    name: 'Ruins Trail',
    path: 'M 65,40 Q 68,35 72,32'
  },
  // Additional connector roads
  {
    id: 'connector-1',
    type: 'main',
    path: 'M 40,48 Q 45,55 50,58'
  },
  {
    id: 'connector-2',
    type: 'main',
    path: 'M 60,45 Q 58,55 60,65'
  },
  {
    id: 'connector-3',
    type: 'dirt',
    path: 'M 15,50 Q 12,60 10,70'
  },
  {
    id: 'connector-4',
    type: 'dirt',
    path: 'M 85,50 Q 88,60 90,70'
  },
  // Southern network
  {
    id: 'south-1',
    type: 'main',
    path: 'M 30,80 Q 45,82 60,80 T 75,78'
  },
  {
    id: 'south-2',
    type: 'dirt',
    path: 'M 50,85 Q 52,88 55,90'
  },
  // Northern network
  {
    id: 'north-1',
    type: 'main',
    path: 'M 35,15 Q 50,18 65,15'
  },
  {
    id: 'north-2',
    type: 'dirt',
    path: 'M 20,20 Q 18,15 20,10'
  },
  // Cross connections
  {
    id: 'cross-1',
    type: 'main',
    path: 'M 25,45 Q 30,55 35,65'
  },
  {
    id: 'cross-2',
    type: 'main',
    path: 'M 70,40 Q 72,50 70,60'
  },
]

// LED color mapping for location types
const LED_COLORS: Record<LocationType, { color: string; glow: string; label: string }> = {
  // Collectibles
  [LocationType.BarnFind]: { color: '#ef4444', glow: 'rgba(239,68,68,0.8)', label: 'Barn Find' },
  [LocationType.FastTravelBoard]: { color: '#3b82f6', glow: 'rgba(59,130,246,0.8)', label: 'Fast Travel' },
  [LocationType.XPBoard]: { color: '#eab308', glow: 'rgba(234,179,8,0.8)', label: 'XP Board' },
  [LocationType.Treasure]: { color: '#a855f7', glow: 'rgba(168,85,247,0.8)', label: 'Treasure' },
  
  // Locations
  [LocationType.Landmark]: { color: '#22c55e', glow: 'rgba(34,197,94,0.8)', label: 'Landmark' },
  [LocationType.FestivalSite]: { color: '#ec4899', glow: 'rgba(236,72,153,0.8)', label: 'Festival' },
  [LocationType.PlayerHouse]: { color: '#06b6d4', glow: 'rgba(6,182,212,0.8)', label: 'House' },
  [LocationType.Expedition]: { color: '#6366f1', glow: 'rgba(99,102,241,0.8)', label: 'Expedition' },
  [LocationType.Showcase]: { color: '#f97316', glow: 'rgba(249,115,22,0.8)', label: 'Showcase' },
  [LocationType.PlaygroundGame]: { color: '#84cc16', glow: 'rgba(132,204,22,0.8)', label: 'Playground' },
  
  // Race Events
  [LocationType.RoadRacingEvent]: { color: '#2563eb', glow: 'rgba(37,99,235,0.8)', label: 'Road Race' },
  [LocationType.DirtRacingEvent]: { color: '#d97706', glow: 'rgba(217,119,6,0.8)', label: 'Dirt Race' },
  [LocationType.CrossCountryEvent]: { color: '#059669', glow: 'rgba(5,150,105,0.8)', label: 'Cross Country' },
  [LocationType.StreetRacingEvent]: { color: '#7c3aed', glow: 'rgba(124,58,237,0.8)', label: 'Street Race' },
  [LocationType.DragRacingEvent]: { color: '#e11d48', glow: 'rgba(225,29,72,0.8)', label: 'Drag Race' },
  
  // PR Stunts
  [LocationType.DangerSign]: { color: '#dc2626', glow: 'rgba(220,38,38,0.8)', label: 'Danger Sign' },
  [LocationType.SpeedTrap]: { color: '#0284c7', glow: 'rgba(2,132,199,0.8)', label: 'Speed Trap' },
  [LocationType.SpeedZone]: { color: '#0d9488', glow: 'rgba(13,148,136,0.8)', label: 'Speed Zone' },
  [LocationType.DriftZone]: { color: '#c026d3', glow: 'rgba(192,38,211,0.8)', label: 'Drift Zone' },
  [LocationType.Trailblazer]: { color: '#65a30d', glow: 'rgba(101,163,13,0.8)', label: 'Trailblazer' },
  [LocationType.TrailblazerFinish]: { color: '#84cc16', glow: 'rgba(132,204,22,0.8)', label: 'Trail Finish' },
  
  // Horizon Stories
  [LocationType.BornFast]: { color: '#9333ea', glow: 'rgba(147,51,234,0.8)', label: 'Born Fast' },
  [LocationType.ElCamino]: { color: '#9333ea', glow: 'rgba(147,51,234,0.8)', label: 'El Camino' },
  [LocationType.LuchaDeCarreteras]: { color: '#9333ea', glow: 'rgba(147,51,234,0.8)', label: 'Lucha' },
  [LocationType.TestDriver]: { color: '#9333ea', glow: 'rgba(147,51,234,0.8)', label: 'Test Driver' },
  [LocationType.V10]: { color: '#9333ea', glow: 'rgba(147,51,234,0.8)', label: 'V10' },
  [LocationType.Vocho]: { color: '#9333ea', glow: 'rgba(147,51,234,0.8)', label: 'Vocho' },
  
  // Other
  [LocationType.ExpeditionAccolade]: { color: '#818cf8', glow: 'rgba(129,140,248,0.8)', label: 'Accolade' },
  [LocationType.Miscellaneous]: { color: '#6b7280', glow: 'rgba(107,114,128,0.8)', label: 'Misc' },
  [LocationType.Vehicle]: { color: '#6b7280', glow: 'rgba(107,114,128,0.8)', label: 'Vehicle' },
}

// Road styling based on type
const ROAD_STYLES: Record<RoadSegment['type'], { color: string; width: number; glow: string; glowWidth: number }> = {
  highway: { 
    color: '#fbbf24', 
    width: 4, 
    glow: '#f59e0b',
    glowWidth: 12
  },
  main: { 
    color: '#60a5fa', 
    width: 3, 
    glow: '#3b82f6',
    glowWidth: 10
  },
  dirt: { 
    color: '#a8a29e', 
    width: 2.5, 
    glow: '#78716c',
    glowWidth: 8
  },
  trail: { 
    color: '#86efac', 
    width: 2, 
    glow: '#4ade80',
    glowWidth: 6
  },
}

const NeonRoadMap: React.FC<NeonRoadMapProps> = ({
  selectedLocation,
  allLocations,
  filters,
  onFiltersChange,
  onLocationSelect,
}) => {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [hoveredRoad, setHoveredRoad] = useState<string | null>(null)
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)
  const [showLEDs, setShowLEDs] = useState(true)
  
  const dragStart = useRef<{ x: number; y: number } | null>(null)
  const panStart = useRef<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 })

  // Track container size
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setContainerSize({ w: width, h: height })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Compute map canvas dimensions
  const { mapW, mapH } = useMemo(() => {
    const { w, h } = containerSize
    if (w === 0 || h === 0) return { mapW: 0, mapH: 0 }
    const imgAspect = MAP_IMG_W / MAP_IMG_H
    const containerAspect = w / h
    if (containerAspect > imgAspect) {
      return { mapW: h * imgAspect, mapH: h }
    }
    return { mapW: w, mapH: w / imgAspect }
  }, [containerSize])

  // Pan event handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
    panStart.current = { x: pan.x, y: pan.y }
    const target = e.target as HTMLElement
    if (target && typeof target.setPointerCapture === 'function') {
      target.setPointerCapture(e.pointerId)
    }
  }, [pan])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || !dragStart.current || !panStart.current) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    const canvasW = (mapW || containerSize.w) * zoom
    const canvasH = (mapH || containerSize.h) * zoom
    let newX = panStart.current.x + (dx / canvasW) * 100
    let newY = panStart.current.y + (dy / canvasH) * 100
    newX = Math.max(-100, Math.min(100, newX))
    newY = Math.max(-100, Math.min(100, newY))
    setPan({ x: newX, y: newY })
  }, [dragging, zoom, mapW, mapH, containerSize])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setDragging(false)
    dragStart.current = null
    panStart.current = null
    const upTarget = e.target as HTMLElement
    if (upTarget && typeof upTarget.releasePointerCapture === 'function') {
      upTarget.releasePointerCapture(e.pointerId)
    }
  }, [])

  // Filter toggle
  const toggleFilter = useCallback((type: LocationType) => {
    onFiltersChange(
      filters.includes(type) ? filters.filter(t => t !== type) : [...filters, type]
    )
  }, [filters, onFiltersChange])

  // Get filtered locations
  const filteredLocations = useMemo(() => {
    return allLocations.filter(l => filters.includes(l.type))
  }, [allLocations, filters])

  // Calculate LED position from coordinates
  const getLEDPosition = useCallback((coords: { x: number; y: number }) => {
    const x = coords.x > 100 ? (coords.x / MAP_IMG_W) * 100 : coords.x
    const y = coords.y > 100 ? (coords.y / MAP_IMG_H) * 100 : coords.y
    return { x, y }
  }, [])

  // Get unique location types present in data
  const activeTypes = useMemo(() => {
    const types = new Set(filteredLocations.map(l => l.type))
    return Array.from(types)
  }, [filteredLocations])

  return (
    <div className="w-full h-full flex flex-col bg-gray-950">
      {/* Controls Bar */}
      <div className="p-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50 shadow-lg">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Filter toggles - grouped by category */}
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs text-gray-500 font-semibold mr-2">FILTERS:</span>
            
            {/* Collectibles */}
            <div className="flex gap-1">
              {[LocationType.BarnFind, LocationType.XPBoard, LocationType.FastTravelBoard, LocationType.Treasure].map(type => (
                <button
                  key={type}
                  onClick={() => toggleFilter(type)}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all border ${
                    filters.includes(type)
                      ? 'border-current shadow-lg scale-105'
                      : 'border-gray-600 opacity-40 hover:opacity-70'
                  }`}
                  style={{
                    backgroundColor: filters.includes(type) ? LED_COLORS[type].color + '30' : 'transparent',
                    color: LED_COLORS[type].color,
                    boxShadow: filters.includes(type) ? `0 0 10px ${LED_COLORS[type].glow}` : 'none',
                  }}
                  title={LED_COLORS[type].label}
                >
                  {LED_COLORS[type].label.split(' ')[0]}
                </button>
              ))}
            </div>
            
            <div className="w-px h-6 bg-gray-700 mx-1" />
            
            {/* Events */}
            <div className="flex gap-1">
              {[LocationType.RoadRacingEvent, LocationType.DirtRacingEvent, LocationType.DangerSign, LocationType.DriftZone].map(type => (
                <button
                  key={type}
                  onClick={() => toggleFilter(type)}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all border ${
                    filters.includes(type)
                      ? 'border-current shadow-lg scale-105'
                      : 'border-gray-600 opacity-40 hover:opacity-70'
                  }`}
                  style={{
                    backgroundColor: filters.includes(type) ? LED_COLORS[type].color + '30' : 'transparent',
                    color: LED_COLORS[type].color,
                    boxShadow: filters.includes(type) ? `0 0 10px ${LED_COLORS[type].glow}` : 'none',
                  }}
                  title={LED_COLORS[type].label}
                >
                  {LED_COLORS[type].label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* View Controls */}
          <div className="flex gap-2 items-center">
            {/* LED toggle */}
            <button
              onClick={() => setShowLEDs(!showLEDs)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                showLEDs ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-gray-700 text-gray-400 border border-gray-600'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showLEDs ? 'bg-green-400' : 'bg-gray-500'}`} />
              LEDs
            </button>
            
            
            {/* Zoom controls */}
            <button
              onClick={() => setZoom(Math.min(zoom + 0.5, 4))}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold text-sm transition-all hover:scale-105 active:scale-95"
            >
              +
            </button>
            <span className="text-xs text-gray-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.max(zoom - 0.5, 0.5))}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold text-sm transition-all hover:scale-105 active:scale-95"
            >
              −
            </button>
            <button
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-gray-300 text-xs font-semibold transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={containerRef} 
        className="flex-grow relative overflow-hidden bg-gray-950 cursor-grab active:cursor-grabbing"
      >
        <div
          className="relative transition-transform duration-75 ease-out"
          style={{
            width: mapW || '100%',
            height: mapH || 'auto',
            flexShrink: 0,
            transform: `scale(${zoom}) translate(${pan.x}%, ${pan.y}%)`,
            transformOrigin: 'center',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Base map image */}
          <img
            src="/maps/fh5-mexico.jpg"
            alt="Forza Horizon 5 Mexico Map"
            className="w-full h-full select-none block"
            draggable={false}
            style={{ filter: 'brightness(0.7) contrast(1.1)' }}
          />
          
          {/* Neon Road Network SVG Overlay */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-auto"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ overflow: 'visible' }}
          >
            <defs>
              {/* Glow filters for neon effect */}
              {Object.entries(ROAD_STYLES).map(([type, style]) => (
                <filter key={type} id={`glow-${type}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation={style.glowWidth / 10} result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
              
              {/* LED glow filter */}
              <filter id="led-glow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              
              {/* Static LEDs - no animation to keep pins stationary */}
            </defs>
            
            {/* Road network */}
            {ROAD_NETWORK.map((road) => {
              const style = ROAD_STYLES[road.type]
              const isHovered = hoveredRoad === road.id
              
              return (
                <g key={road.id}>
                  {/* Glow effect path */}
                  <path
                    d={road.path}
                    fill="none"
                    stroke={style.glow}
                    strokeWidth={isHovered ? style.glowWidth * 1.5 : style.glowWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter={`url(#glow-${road.type})`}
                    opacity={isHovered ? 0.8 : 0.5}
                    className="transition-all duration-300"
                  />
                  {/* Main road path */}
                  <path
                    d={road.path}
                    fill="none"
                    stroke={style.color}
                    strokeWidth={isHovered ? style.width * 1.5 : style.width}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredRoad(road.id)}
                    onMouseLeave={() => setHoveredRoad(null)}
                    style={{
                      filter: isHovered ? 'brightness(1.5)' : 'none',
                    }}
                  />
                </g>
              )
            })}
            
            {/* LED Light Bulbs for Locations */}
            {showLEDs && filteredLocations.map((location, index) => {
              const coords = location.coordinates
              if (!coords) return null
              
              const pos = getLEDPosition(coords)
              const ledStyle = LED_COLORS[location.type]
              const isHovered = hoveredLocation === location.id
              const isSelected = selectedLocation?.id === location.id
              
              // No animation - pins remain stationary
              
              return (
                <g
                  key={location.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredLocation(location.id)}
                  onMouseLeave={() => setHoveredLocation(null)}
                  onClick={() => onLocationSelect(location)}
                >
                  {/* Outer glow ring - static */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 3 : isHovered ? 2.5 : 1.8}
                    fill={ledStyle.glow}
                    opacity={0.4}
                    filter="url(#led-glow)"
                  />
                  
                  {/* LED bulb core - static */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 2 : isHovered ? 1.5 : 1}
                    fill={ledStyle.color}
                    stroke="white"
                    strokeWidth={isSelected ? 0.4 : 0.2}
                    filter="url(#led-glow)"
                  />
                  
                  {/* Label for selected/hovered */}
                  {(isHovered || isSelected) && (
                    <g>
                      <rect
                        x={pos.x + 3}
                        y={pos.y - 8}
                        width={60}
                        height={14}
                        rx={3}
                        fill="rgba(0,0,0,0.8)"
                        stroke={ledStyle.color}
                        strokeWidth={0.3}
                      />
                      <text
                        x={pos.x + 6}
                        y={pos.y - 1}
                        fill="white"
                        fontSize="4"
                        fontWeight="bold"
                        fontFamily="system-ui, sans-serif"
                      >
                        {location.name.slice(0, 18)}{location.name.length > 18 ? '...' : ''}
                      </text>
                      <text
                        x={pos.x + 6}
                        y={pos.y + 3}
                        fill={ledStyle.color}
                        fontSize="3"
                        fontFamily="system-ui, sans-serif"
                      >
                        {ledStyle.label}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}
          </svg>
          
          {/* Selected location indicator */}
          {selectedLocation && selectedLocation.coordinates && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${getLEDPosition(selectedLocation.coordinates).x}%`,
                top: `${getLEDPosition(selectedLocation.coordinates).y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="relative">
                {/* Static selection rings - no animation */}
                <div className="absolute inset-0 w-8 h-8 -m-4 rounded-full border-2 border-orange-500 opacity-30" />
                <div className="absolute inset-0 w-12 h-12 -m-6 rounded-full border border-orange-400 opacity-20" />
                
                {/* Center marker */}
                <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-lg shadow-orange-500/50" />
                
                {/* Label */}
                <div className="absolute left-6 top-0 whitespace-nowrap">
                  <div className="bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-orange-400">
                    {selectedLocation.name}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Legend overlay */}
        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md border border-gray-700/50 rounded-xl p-3 text-xs max-w-xs">
          <h4 className="font-bold text-gray-300 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-blue-500" />
            Neon Road Network
          </h4>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-1 rounded bg-amber-400 shadow shadow-amber-400/50" />
              <span className="text-gray-400">Highway (Fast Travel)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-1 rounded bg-blue-400 shadow shadow-blue-400/50" />
              <span className="text-gray-400">Main Road</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-1 rounded bg-stone-400 shadow shadow-stone-400/50" />
              <span className="text-gray-400">Dirt Road</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-1 rounded bg-green-400 shadow shadow-green-400/50" />
              <span className="text-gray-400">Trail / Path</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-700/50">
            <p className="text-gray-500 text-[10px]">
              {filteredLocations.length} LED markers active • Drag to pan • Scroll to zoom
            </p>
          </div>
        </div>
        
        {/* Quick filter presets */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => onFiltersChange(Object.values(LocationType))}
            className="px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur border border-gray-600 rounded-lg text-xs text-gray-300 transition-all"
          >
            Show All
          </button>
          <button
            onClick={() => onFiltersChange([])}
            className="px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur border border-gray-600 rounded-lg text-xs text-gray-300 transition-all"
          >
            Hide All
          </button>
          <button
            onClick={() => onFiltersChange([LocationType.BarnFind, LocationType.XPBoard, LocationType.FastTravelBoard])}
            className="px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur border border-gray-600 rounded-lg text-xs text-gray-300 transition-all"
          >
            Collectibles Only
          </button>
        </div>
      </div>
    </div>
  )
}

export default NeonRoadMap
