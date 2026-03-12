'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { Location, LocationType } from './types'
import LocationCard from './LocationCard'
import MapDisplay from './MapDisplay'
import locationData from '@/public/data/fh5-locations.json'

export default function LocationFinderPage() {
  const [locations] = useState<Location[]>(locationData.locations as Location[])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    locationData.locations[0] as Location
  )
  const [filters, setFilters] = useState<LocationType[]>(Object.values(LocationType))

  const filteredLocations = locations.filter(l => filters.includes(l.type))
  const sidebarBackgrounds = ['/2-3.jpeg', '/3-4.jpeg', '/4-4.jpeg', '/5-5.jpeg', '/6-6.jpg']
  const selectedIndex = selectedLocation
    ? Math.max(
        0,
        filteredLocations.findIndex(location => location.id === selectedLocation.id)
      )
    : 0
  const activeSidebarBackground = sidebarBackgrounds[selectedIndex % sidebarBackgrounds.length]

  useEffect(() => {
    if (!selectedLocation) return
    if (filters.includes(selectedLocation.type)) return

    if (filteredLocations.length > 0) {
      setSelectedLocation(filteredLocations[0])
    } else {
      setSelectedLocation(null)
    }
  }, [filters, filteredLocations, selectedLocation])

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
      <header className="bg-gray-800/30 backdrop-blur-md border-b border-gray-700/50 shadow-lg sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <a href="/" className="text-gray-400 hover:text-white transition-colors">
            ← Back
          </a>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-blue-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="M12 10l6 3"></path>
            <path d="M12 10L6 7"></path>
            <path d="M12 10v6"></path>
          </svg>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Forza Horizon 5{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
              Location Finder
            </span>
          </h1>
        </div>
      </header>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 max-w-screen-2xl mx-auto w-full">
        <aside
          className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-2xl flex flex-col overflow-hidden max-h-screen relative"
          style={{
            backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.88)), url(${activeSidebarBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="p-4 border-b border-gray-700 flex-shrink-0">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
              FH5 Locations
            </h2>
            <p className="text-sm text-gray-400">Collectibles, events, and landmarks.</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-2">
              {filteredLocations.map(location => (
                <LocationCard
                  key={location.id}
                  location={location}
                  isSelected={selectedLocation?.id === location.id}
                  onSelect={() => setSelectedLocation(location)}
                />
              ))}
            </div>
          </div>
        </aside>
        <section className="lg:col-span-2 bg-gray-800/50 rounded-xl border border-gray-700/50 shadow-2xl overflow-hidden flex flex-col">
          <MapDisplay
            selectedLocation={selectedLocation}
            allLocations={locations}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </section>
      </main>
    </div>
  )
}
