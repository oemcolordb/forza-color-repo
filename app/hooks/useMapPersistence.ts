'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { LocationType } from '../location-finder/types'

interface MapProgress {
  visitedLocations: string[]
  favoriteLocations: string[]
  activeFilters: LocationType[]
  lastViewedLocation: string | null
  zoomLevel: number
}

const STORAGE_KEY = 'forza-map-progress'
const SYNC_INTERVAL = 30000 // 30 seconds
const DEBOUNCE_DELAY = 2000 // 2 seconds

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  let sessionId = localStorage.getItem('forza-session-id')
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('forza-session-id', sessionId)
  }
  return sessionId
}

export function useMapPersistence() {
  const [progress, setProgress] = useState<MapProgress>({
    visitedLocations: [],
    favoriteLocations: [],
    activeFilters: Object.values(LocationType),
    lastViewedLocation: null,
    zoomLevel: 1,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pendingChangesRef = useRef(false)

  // Load progress from localStorage first, then try cloud
  useEffect(() => {
    const loadProgress = async () => {
      try {
        // Load from localStorage immediately
        const localData = localStorage.getItem(STORAGE_KEY)
        if (localData) {
          const parsed = JSON.parse(localData)
          setProgress(prev => ({ ...prev, ...parsed }))
        }

        // Try to load from cloud
        const sessionId = getSessionId()
        const response = await fetch(`/api/map-progress?sessionId=${sessionId}`)
        
        if (response.ok) {
          const cloudData = await response.json()
          if (cloudData.lastUpdated) {
            // Cloud data exists, check if it's newer
            const localTimestamp = localStorage.getItem(`${STORAGE_KEY}-timestamp`)
            const cloudTimestamp = new Date(cloudData.lastUpdated).getTime()
            
            if (!localTimestamp || cloudTimestamp > parseInt(localTimestamp)) {
              setProgress({
                visitedLocations: cloudData.visitedLocations || [],
                favoriteLocations: cloudData.favoriteLocations || [],
                activeFilters: cloudData.activeFilters?.length > 0 
                  ? cloudData.activeFilters 
                  : Object.values(LocationType),
                lastViewedLocation: cloudData.lastViewedLocation,
                zoomLevel: cloudData.zoomLevel || 1,
              })
              setLastSynced(new Date(cloudData.lastUpdated))
            }
          }
        }
      } catch (error) {
        console.error('Failed to load map progress:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProgress()
  }, [])

  // Save to localStorage immediately, debounce cloud sync
  const saveProgress = useCallback((newProgress: Partial<MapProgress>) => {
    setProgress(prev => {
      const updated = { ...prev, ...newProgress }
      
      // Save to localStorage immediately
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      localStorage.setItem(`${STORAGE_KEY}-timestamp`, Date.now().toString())
      
      pendingChangesRef.current = true
      
      return updated
    })

    // Debounce cloud sync
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    debounceTimerRef.current = setTimeout(() => {
      syncToCloud()
    }, DEBOUNCE_DELAY)
  }, [])

  // Sync to cloud
  const syncToCloud = useCallback(async () => {
    if (!pendingChangesRef.current) return
    
    try {
      const sessionId = getSessionId()
      const currentProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      
      const response = await fetch('/api/map-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          ...currentProgress,
        }),
      })

      if (response.ok) {
        setLastSynced(new Date())
        setSyncError(null)
        pendingChangesRef.current = false
      } else {
        throw new Error('Sync failed')
      }
    } catch (error) {
      console.error('Cloud sync failed:', error)
      setSyncError('Failed to sync to cloud')
    }
  }, [])

  // Periodic sync interval
  useEffect(() => {
    syncIntervalRef.current = setInterval(() => {
      if (pendingChangesRef.current) {
        syncToCloud()
      }
    }, SYNC_INTERVAL)

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [syncToCloud])

  // Sync before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingChangesRef.current) {
        const sessionId = getSessionId()
        const currentProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
        
        // Use sendBeacon for reliable sync on page close
        navigator.sendBeacon(
          '/api/map-progress',
          JSON.stringify({
            sessionId,
            ...currentProgress,
          })
        )
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Helper functions
  const markLocationVisited = useCallback((locationId: string) => {
    setProgress(prev => {
      if (prev.visitedLocations.includes(locationId)) return prev
      const updated = {
        ...prev,
        visitedLocations: [...prev.visitedLocations, locationId],
      }
      saveProgress(updated)
      return updated
    })
  }, [saveProgress])

  const toggleFavoriteLocation = useCallback((locationId: string) => {
    setProgress(prev => {
      const isFavorite = prev.favoriteLocations.includes(locationId)
      const updated = {
        ...prev,
        favoriteLocations: isFavorite
          ? prev.favoriteLocations.filter(id => id !== locationId)
          : [...prev.favoriteLocations, locationId],
      }
      saveProgress(updated)
      return updated
    })
  }, [saveProgress])

  const setFilters = useCallback((filters: LocationType[]) => {
    saveProgress({ activeFilters: filters })
  }, [saveProgress])

  const setLastViewed = useCallback((locationId: string | null) => {
    saveProgress({ lastViewedLocation: locationId })
  }, [saveProgress])

  const setZoom = useCallback((zoom: number) => {
    saveProgress({ zoomLevel: zoom })
  }, [saveProgress])

  return {
    progress,
    isLoading,
    lastSynced,
    syncError,
    markLocationVisited,
    toggleFavoriteLocation,
    setFilters,
    setLastViewed,
    setZoom,
    syncToCloud,
  }
}
