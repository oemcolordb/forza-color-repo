'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useCallback } from 'react'
import { Location, LocationType } from './types'
import { fetchLocations } from './geminiService'
import LocationCard from './LocationCard'
import MapDisplay from './MapDisplay'
import LoadingSpinner from './LoadingSpinner'

export default function LocationFinderPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(true)

  const loadLocations = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const fetchedLocations = await fetchLocations()
      setLocations(fetchedLocations)
      if (fetchedLocations.length > 0) {
        setSelectedLocation(fetchedLocations[0])
      }
    } catch (err) {
      setError('Failed to fetch locations. The AI might be taking a pit stop. Please try again later.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLocations()
  }, [loadLocations])

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
      <header className="bg-gray-800/30 backdrop-blur-md border-b border-gray-700/50 shadow-lg sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <a href="/" className="text-gray-400 hover:text-white transition-colors">
            ← Back
          </a>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="M12 10l6 3"></path>
            <path d="M12 10L6 7"></path>
            <path d="M12 10v6"></path>
          </svg>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Forza Horizon 5 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Location Finder</span>
          </h1>
        </div>
      </header>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 max-w-screen-2xl mx-auto w-full">
        <aside className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-2xl flex flex-col overflow-hidden max-h-screen">
          <div className="p-4 border-b border-gray-700 flex-shrink-0">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Mexico Hotspots</h2>
            <p className="text-sm text-gray-400">AI-curated locations to explore.</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <LoadingSpinner />
                <p className="mt-4 text-center">Asking the AI for the best spots...</p>
              </div>
            ) : error ? (
              <div className="p-4 m-2 bg-red-900/50 border border-red-700 rounded-lg text-center text-red-200">
                <p className="font-bold">An error occurred</p>
                <p>{error}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {locations.map((location) => (
                  <LocationCard
                    key={location.name}
                    location={location}
                    isSelected={selectedLocation?.name === location.name}
                    onSelect={() => setSelectedLocation(location)}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>
        <section className="lg:col-span-2 bg-gray-800/50 rounded-xl border border-gray-700/50 shadow-2xl overflow-hidden flex flex-col">
          <MapDisplay 
            selectedLocation={selectedLocation} 
            allLocations={locations}
            onLocationSelect={setSelectedLocation}
          />
        </section>
      </main>
    </div>
  )
}
