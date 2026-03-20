'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useMemo } from 'react'
import { Location, LocationType } from './types'
import LocationCard from './LocationCard'
import MapDisplay from './MapDisplay'
import locationData from '@/public/data/fh5-locations.json'
import { useMapPersistence } from '../hooks/useMapPersistence'

export default function LocationFinderPage() {
  const [locations] = useState<Location[]>(locationData.locations as Location[])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState<LocationType | 'all'>('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const {
    progress,
    isLoading,
    lastSynced,
    syncError,
    markLocationVisited,
    toggleFavoriteLocation,
    setLastViewed,
  } = useMapPersistence()

  const visitedSet = useMemo(() => new Set(progress.visitedLocations), [progress.visitedLocations])
  const favoritesSet = useMemo(() => new Set(progress.favoriteLocations), [progress.favoriteLocations])

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
    if (isLoading || selectedLocation) return
    if (progress.lastViewedLocation) {
      const last = locations.find(l => l.id === progress.lastViewedLocation)
      if (last) { setSelectedLocation(last); return }
    }
    if (filteredLocations.length > 0) setSelectedLocation(filteredLocations[0])
  }, [isLoading]) // eslint-disable-line react-hooks/exhaustive-deps

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

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-100 overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 bg-gray-900 border-b border-gray-800 z-20">
        <a href="/" className="text-gray-400 hover:text-white transition-colors text-sm">← Back</a>
        <h1 className="font-bold text-white text-base sm:text-lg flex-1 truncate">
          FH5{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
            Location Finder
          </span>
        </h1>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          {isLoading ? (
            <span className="text-yellow-400">⟳ Loading</span>
          ) : syncError ? (
            <span className="text-red-400" title={syncError}>⚠ Offline</span>
          ) : lastSynced ? (
            <span className="text-green-400" title={`Synced: ${lastSynced.toLocaleTimeString()}`}>☁ Synced</span>
          ) : null}
          <span className="hidden sm:inline text-gray-500">
            {progress.visitedLocations.length} visited · {progress.favoriteLocations.length} ❤
          </span>
        </div>

        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="lg:hidden p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
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
            flex-shrink-0 w-72 bg-gray-900 border-r border-gray-800 flex flex-col
            lg:relative lg:translate-x-0 lg:flex
            absolute inset-y-0 left-0 z-30 transition-transform duration-200
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {/* Sidebar search + filter */}
          <div className="flex-shrink-0 p-3 border-b border-gray-800 space-y-2">
            <input
              type="search"
              placeholder="Search locations…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <select
              value={activeType}
              onChange={e => setActiveType(e.target.value as LocationType | 'all')}
              className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All types ({locations.length})</option>
              {locationTypes.map(t => (
                <option key={t} value={t}>{t}</option>
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

          <div className="flex-shrink-0 px-3 py-2 border-t border-gray-800 text-xs text-gray-500">
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
          <MapDisplay />
        </main>
      </div>
    </div>
  )
}
