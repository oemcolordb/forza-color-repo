import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Location, LocationType } from './types'
import styles from './MapDisplay.module.css'

// Actual pixel dimensions of /maps/fh5-mexico.jpg — used for pin coordinate maths
const MAP_IMG_W = 3840
const MAP_IMG_H = 2160

interface MapDisplayProps {
  selectedLocation: Location | null
  allLocations: Location[]
  filters: LocationType[]
  onFiltersChange: (_filters: LocationType[]) => void
}

const getMarkerColor = (type: LocationType) => {
  switch (type) {
    // Collectibles
    case LocationType.BarnFind:
      return 'bg-red-500'
    case LocationType.FastTravelBoard:
      return 'bg-blue-500'
    case LocationType.XPBoard:
      return 'bg-yellow-500'
    case LocationType.Treasure:
      return 'bg-purple-500'

    // Locations
    case LocationType.Landmark:
      return 'bg-green-500'
    case LocationType.FestivalSite:
      return 'bg-pink-500'
    case LocationType.PlayerHouse:
      return 'bg-cyan-500'
    case LocationType.Expedition:
      return 'bg-indigo-500'
    case LocationType.Showcase:
      return 'bg-orange-500'
    case LocationType.PlaygroundGame:
      return 'bg-lime-500'

    // Race Events
    case LocationType.RoadRacingEvent:
      return 'bg-blue-600'
    case LocationType.DirtRacingEvent:
      return 'bg-amber-600'
    case LocationType.CrossCountryEvent:
      return 'bg-emerald-600'
    case LocationType.StreetRacingEvent:
      return 'bg-violet-600'
    case LocationType.DragRacingEvent:
      return 'bg-rose-600'

    // PR Stunts
    case LocationType.DangerSign:
      return 'bg-red-600'
    case LocationType.SpeedTrap:
      return 'bg-sky-600'
    case LocationType.SpeedZone:
      return 'bg-teal-600'
    case LocationType.DriftZone:
      return 'bg-fuchsia-600'
    case LocationType.Trailblazer:
      return 'bg-lime-600'
    case LocationType.TrailblazerFinish:
      return 'bg-lime-400'

    // Horizon Stories
    case LocationType.BornFast:
    case LocationType.ElCamino:
    case LocationType.LuchaDeCarreteras:
    case LocationType.TestDriver:
    case LocationType.V10:
    case LocationType.Vocho:
      return 'bg-purple-600'

    // Other
    case LocationType.ExpeditionAccolade:
      return 'bg-indigo-400'
    case LocationType.Miscellaneous:
    case LocationType.Vehicle:
    default:
      return 'bg-gray-500'
  }
}

const MapDisplay: React.FC<MapDisplayProps> = ({
  selectedLocation,
  allLocations,
  filters,
  onFiltersChange,
}) => {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 }) // percent of map canvas width/height
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef<{ x: number; y: number } | null>(null)
  const panStart = useRef<{ x: number; y: number } | null>(null)

  // Track container size so we can compute the exact object-contain dimensions
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 })

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

  // Compute the pixel dimensions of the map canvas using object-contain logic
  // so pins always align with image content regardless of container size.
  const { mapW, mapH } = useMemo(() => {
    const { w, h } = containerSize
    if (w === 0 || h === 0) return { mapW: 0, mapH: 0 }
    const imgAspect = MAP_IMG_W / MAP_IMG_H
    const containerAspect = w / h
    if (containerAspect > imgAspect) {
      // Container is wider → height is the limiting dimension
      return { mapW: h * imgAspect, mapH: h }
    }
    // Container is taller → width is the limiting dimension
    return { mapW: w, mapH: w / imgAspect }
  }, [containerSize])
  // Pan event handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragging(true)
    ;(dragStart as React.MutableRefObject<{ x: number; y: number } | null>).current = {
      x: e.clientX,
      y: e.clientY,
    }
    if (panStart.current) {
      panStart.current.x = pan.x
      panStart.current.y = pan.y
    } else {
      panStart.current = { x: pan.x, y: pan.y }
    }
    const target = e.target as HTMLElement | null
    if (target && typeof target.setPointerCapture === 'function') {
      target.setPointerCapture(e.pointerId)
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !dragStart.current || !panStart.current) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    // Pan is in percent, so scale by zoom and container size
    // We'll use 100vw/100vh as the base, but clamp pan to [-100, 100] for safety
    // Pan in % of the map canvas dimensions (same unit the CSS translate() uses)
    const canvasW = (mapW || containerSize.w) * zoom
    const canvasH = (mapH || containerSize.h) * zoom
    let newX = panStart.current.x + (dx / canvasW) * 100
    let newY = panStart.current.y + (dy / canvasH) * 100
    newX = Math.max(-100, Math.min(100, newX))
    newY = Math.max(-100, Math.min(100, newY))
    setPan({ x: newX, y: newY })
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragging(false)
    ;(dragStart as React.MutableRefObject<{ x: number; y: number } | null>).current = null
    ;(panStart as React.MutableRefObject<{ x: number; y: number } | null>).current = null
    const upTarget = e.target as HTMLElement | null
    if (upTarget && typeof upTarget.releasePointerCapture === 'function') {
      upTarget.releasePointerCapture(e.pointerId)
    }
  }
  const [mapImageError, setMapImageError] = useState(false)
  const [mapImageSrc, setMapImageSrc] = useState('/maps/fh5-mexico.jpg')
  const uploadedMapUrlRef = useRef<string | null>(null)

  const selectedCoords = selectedLocation?.coordinates || null

  const [markerPos, setMarkerPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 })
  const [arrowRotationDeg, setArrowRotationDeg] = useState(0)
  const [showArrow, setShowArrow] = useState(false)
  const arrivalTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (uploadedMapUrlRef.current) {
        URL.revokeObjectURL(uploadedMapUrlRef.current)
      }
    }
  }, [])

  const handleMapUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (uploadedMapUrlRef.current) {
      URL.revokeObjectURL(uploadedMapUrlRef.current)
    }

    const uploadedUrl = URL.createObjectURL(file)
    uploadedMapUrlRef.current = uploadedUrl
    setMapImageSrc(uploadedUrl)
    setMapImageError(false)
  }

  useEffect(() => {
    if (!selectedCoords) return

    const dx = selectedCoords.x - markerPos.x
    const dy = selectedCoords.y - markerPos.y

    if (dx === 0 && dy === 0) {
      setShowArrow(false)
      return
    }

    const angleFromXAxisDeg = (Math.atan2(dy, dx) * 180) / Math.PI
    const rotation = angleFromXAxisDeg - 90

    setArrowRotationDeg(rotation)
    setShowArrow(true)
    setMarkerPos({ x: selectedCoords.x, y: selectedCoords.y })

    if (arrivalTimerRef.current) {
      window.clearTimeout(arrivalTimerRef.current)
    }
    arrivalTimerRef.current = window.setTimeout(() => {
      setShowArrow(false)
    }, 550)

    return () => {
      if (arrivalTimerRef.current) {
        window.clearTimeout(arrivalTimerRef.current)
      }
    }
  }, [selectedCoords, markerPos.x, markerPos.y])

  const toggleFilter = (type: LocationType) => {
    onFiltersChange(filters.includes(type) ? filters.filter(t => t !== type) : [...filters, type])
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
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-semibold shadow-lg transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Map Container — the outer div measures available space; the inner div is
           sized to the image's intrinsic aspect ratio so pin %coords always align. */}
      <div
        ref={containerRef}
        className="flex-grow relative overflow-hidden bg-gray-950 flex items-center justify-center"
      >
        <div
          className={`relative ${styles['fh5-map-pan']} ${!dragging ? styles['fh5-map-anim'] : ''}`}
          style={{
            // Match the image's natural aspect ratio — prevents object-cover cropping
            width: mapW || '100%',
            height: mapH || 'auto',
            flexShrink: 0,
            transform: `scale(${zoom}) translate(${pan.x}%, ${pan.y}%)`,
            transformOrigin: 'center',
            transition: dragging ? 'none' : undefined,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {!mapImageError ? (
            <img
              src={mapImageSrc}
              alt="Forza Horizon 5 Mexico Map"
              className="w-full h-full select-none block"
              draggable={false}
              onError={() => {
                if (mapImageSrc === '/maps/fh5-mexico.jpg') {
                  setMapImageSrc('/maps/fh5-mexico.png')
                } else if (mapImageSrc === '/maps/fh5-mexico.png') {
                  setMapImageSrc('/maps/fh5-mexico.webp')
                } else {
                  setMapImageError(true)
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-950 text-gray-200">
              <div className="max-w-md text-center px-6">
                <div className="text-lg font-bold">Map image missing</div>
                <div className="text-sm text-gray-400 mt-2">
                  Add a Mexico map image at
                  <span className="text-gray-200 font-mono"> public/maps/fh5-mexico.webp</span>
                  <div className="mt-2">
                    Fallbacks supported:
                    <span className="text-gray-200 font-mono"> .jpg </span>
                    and
                    <span className="text-gray-200 font-mono"> .png</span>
                  </div>
                  <div className="mt-4">
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer transition-colors">
                      Upload map image
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleMapUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All Pins Overlay — coordinates are 0-100% of the map image dimensions */}
          <div className="absolute inset-0">
            {allLocations
              .filter(l => filters.includes(l.type))
              .map(l => {
                const coords = l.coordinates
                if (!coords) return null
                // Normalise raw pixel coords if someone accidentally stored them as > 100
                const x = coords.x > 100 ? (coords.x / MAP_IMG_W) * 100 : coords.x
                const y = coords.y > 100 ? (coords.y / MAP_IMG_H) * 100 : coords.y
                const isSelected = selectedLocation?.id === l.id
                return (
                  <div
                    key={l.id}
                    className={styles['fh5-map-marker']}
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    <div
                      className={`-translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-white/60 shadow ${
                        isSelected ? 'ring-2 ring-white scale-150' : ''
                      } ${getMarkerColor(l.type)}`}
                    />
                  </div>
                )
              })}
          </div>

          {/* Selected Location Arrow Overlay */}
          {selectedLocation && selectedCoords && (
            <div
              className={styles['fh5-map-arrow']}
              style={{
                left: `${markerPos.x}%`,
                top: `${markerPos.y}%`,
              }}
            >
              <div className="relative -translate-x-1/2 -translate-y-full">
                <div className="absolute left-1/2 -top-10 -translate-x-1/2 whitespace-nowrap bg-orange-600/95 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xl border border-white/20">
                  {selectedLocation.name}
                </div>
                <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
                <div
                  className={`mx-auto w-0 h-0 border-l-[10px] border-r-[10px] border-t-[14px] border-l-transparent border-r-transparent border-t-orange-500 drop-shadow-lg transition-opacity duration-200 ${
                    showArrow ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ transform: `rotate(${arrowRotationDeg}deg)` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="p-3 bg-gray-800/95 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>🗺️ Forza Horizon 5 Mexico • Community-sourced, estimated locations</span>
          <span>
            {allLocations.filter(l => filters.includes(l.type)).length} locations available
          </span>
        </div>
      </div>
    </div>
  )
}

export default MapDisplay
