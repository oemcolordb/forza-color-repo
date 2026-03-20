'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useMemo } from 'react'
import nextDynamic from 'next/dynamic'
import { Location, LocationType } from './types'
import LocationCard from './LocationCard'
import NFSThemeWrapper from '../components/NFSThemeWrapper'
import { useMapPersistence } from '../hooks/useMapPersistence'

// Leaflet uses `window` — must be client-only, no SSR
const ProfessionalMap = nextDynamic(() => import('./ProfessionalMap'), { ssr: false })

// Use fetch for mapgenie so webpack never tries to bundle the optional file
const loadLocationData = async (): Promise<Location[]> => {
  try {
    const res = await fetch('/data/fh5-locations-mapgenie.json')
    if (!res.ok) throw new Error('not found')
    const json = await res.json()
    return json.locations as Location[]
  } catch {
    try {
      const enhancedData = await import('@/public/data/fh5-locations-enhanced.json')
      return enhancedData.default.locations as Location[]
    } catch {
      const fallbackData = await import('@/public/data/fh5-locations.json')
      return fallbackData.default.locations as Location[]
    }
  }
}

export default function LocationFinderPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState<LocationType | 'all'>('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [nfsTheme, setNfsTheme] = useState(false)
  const [loading, setLoading] = useState(true)

  const {
    progress,
    isLoading: persistenceLoading,
    lastSynced,
    syncError,
    markLocationVisited,
    toggleFavoriteLocation,
    setLastViewed,
  } = useMapPersistence()

  const visitedSet = useMemo(() => new Set(progress.visitedLocations), [progress.visitedLocations])
  const favoritesSet = useMemo(() => new Set(progress.favoriteLocations), [progress.favoriteLocations])

  // Load location data
  useEffect(() => {
    loadLocationData().then(data => {
      setLocations(data)
      setLoading(false)
    })
  }, [])

  const filteredLocations = useMemo(() => {
    return locations.filter(l => {
      const matchesType = activeType === 'all' || l.type === activeType
      const matchesSearch =
        !search ||
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.description?.toLowerCase().includes(search.toLowerCase())
      return matchesType && matchesSearch
    })
  }, [locations, activeType, search])

  useEffect(() => {
    if (persistenceLoading || selectedLocation || loading) return
    if (progress.lastViewedLocation) {
      const last = locations.find(l => l.id === progress.lastViewedLocation)
      if (last) {
        setSelectedLocation(last)
        return
      }
    }
    if (filteredLocations.length > 0) setSelectedLocation(filteredLocations[0])
  }, [persistenceLoading, loading]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (location: Location) => {
    setSelectedLocation(location)
    setLastViewed(location.id)
    markLocationVisited(location.id)
    setSidebarOpen(false)
  }

  const locationTypes = useMemo(
    () => Array.from(new Set(locations.map(l => l.type))).sort(),
    [locations]
  )

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl font-bold">Loading FH5 Map...</p>
          <p className="text-gray-400 mt-2">Preparing location data</p>
        </div>
      </div>
    )
  }

  return (
    <NFSThemeWrapper enabled={nfsTheme}>
      <div className="h-screen flex flex-col bg-gray-950 text-gray-100 overflow-hidden">
        {/* Header */}
        <header className={`flex-shrink-0 flex items-center gap-3 px-4 py-2.5 border-b z-20 ${
          nfsTheme 
            ? 'nfs-card border-nfs-neon-blue/30' 
            : 'bg-gray-900 border-gray-800'
        }`}>
          <a href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
            ← Back
          </a>
          
          <h1 className={`font-bold flex-1 truncate text-base sm:text-lg ${
            nfsTheme ? 'nfs-text-neon-blue' : 'text-white'
          }`}>
            FH5{' '}
            <span className={nfsTheme ? 'nfs-text-neon-pink' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300'}>
              Location Finder
            </span>
          </h1>

          {/* Theme Toggle */}
          <button
            onClick={() => setNfsTheme(!nfsTheme)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              nfsTheme
                ? 'nfs-button'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
            title="Toggle NFS Theme"
          >
            {nfsTheme ? '🏎️ NFS' : '🎨 Theme'}
          </button>

          {/* Sync Status */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {persistenceLoading ? (
              <span className="text-yellow-400">⟳ Loading</span>
            ) : syncError ? (
              <span className="text-red-400" title={syncError}>⚠ Offline</span>
            ) : lastSynced ? (
              <span className="text-green-400" title={`Synced: ${lastSynced.toLocaleTimeString()}`}>
                ☁ Synced
              </span>
            ) : null}
            <span className="hidden sm:inline text-gray-500">
              {progress.visitedLocations.length} visited · {progress.favoriteLocations.length} ❤
            </span>
          </div>

          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              nfsTheme
                ? 'nfs-button'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
            aria-label="Toggle location list"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Sidebar */}
          <aside
            className={`
              flex-shrink-0 w-72 border-r flex flex-col
              lg:relative lg:translate-x-0 lg:flex
              absolute inset-y-0 left-0 z-30 transition-transform duration-200
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              ${nfsTheme ? 'nfs-card border-nfs-neon-blue/30' : 'bg-gray-900 border-gray-800'}
            `}
          >
            {/* Sidebar search + filter */}
            <div className={`flex-shrink-0 p-3 border-b space-y-2 ${
              nfsTheme ? 'border-nfs-neon-blue/30' : 'border-gray-800'
            }`}>
              <input
                type="search"
                placeholder="Search locations…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg transition-colors focus:outline-none ${
                  nfsTheme
                    ? 'bg-gray-950/50 border border-nfs-neon-blue/30 text-white placeholder-gray-500 focus:border-nfs-neon-blue'
                    : 'bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
                }`}
              />
              <select
                value={activeType}
                onChange={e => setActiveType(e.target.value as LocationType | 'all')}
                className={`w-full px-3 py-2 text-sm rounded-lg transition-colors focus:outline-none ${
                  nfsTheme
                    ? 'bg-gray-950/50 border border-nfs-neon-blue/30 text-white focus:border-nfs-neon-blue'
                    : 'bg-gray-800 border border-gray-700 text-white focus:border-blue-500'
                }`}
              >
                <option value="all">All types ({locations.length})</option>
                {locationTypes.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Location list */}
            <div className="flex-1 overflow-y-auto">
              {filteredLocations.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">No locations found</div>
              ) : (
                filteredLocations.map(location => (
                  <LocationCard
                    key={location.id}
                    location={location}
                    isSelected={selectedLocation?.id === location.id}
                    isFavorite={favoritesSet.has(location.id)}
                    isVisited={visitedSet.has(location.id)}
                    onSelect={() => handleSelect(location)}
                    onToggleFavorite={() => toggleFavoriteLocation(location.id)}
                  />
                ))
              )}
            </div>

            <div className={`flex-shrink-0 px-3 py-2 border-t text-xs text-gray-500 ${
              nfsTheme ? 'border-nfs-neon-blue/30' : 'border-gray-800'
            }`}>
              {filteredLocations.length} of {locations.length} locations
            </div>
          </aside>

          {/* Backdrop for mobile sidebar */}
          {sidebarOpen && (
            <div
              className="lg:hidden absolute inset-0 bg-black/60 z-20"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Map */}
          <main className="flex-1 overflow-hidden">
            <ProfessionalMap
              locations={filteredLocations}
              selectedLocation={selectedLocation}
              onLocationSelect={handleSelect}
              activeFilters={activeType === 'all' ? [] : [activeType]}
              isDarkMode={true}
            />
          </main>
        </div>

        {/* NFS Gauge Cluster (when NFS theme is active) */}
        {nfsTheme && (
          <div className="fixed bottom-4 right-4 nfs-gauge-cluster z-[1001]">
            <div className="nfs-speedometer" title="Locations Found">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold nfs-text-neon-blue">{filteredLocations.length}</div>
                  <div className="text-xs text-gray-400">FOUND</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="nfs-heat-level">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`nfs-heat-pip ${i < Math.min(5, Math.floor(progress.visitedLocations.length / 20)) ? 'active' : ''}`}
                  />
                ))}
              </div>
              <div className="text-xs text-center text-gray-400">
                PROGRESS
              </div>
            </div>
          </div>
        )}
      </div>
    </NFSThemeWrapper>
  )
}
