import { useState, useEffect, useCallback } from 'react'
import { offlineStorage } from '../lib/offlineStorage'

export function useOfflineStorage() {
  const [state, setState] = useState({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    cacheSize: 0,
    lastUpdated: null,
    isLoading: false,
    error: null
  })

  const updateCacheInfo = useCallback(async () => {
    try {
      const info = await offlineStorage.getCacheInfo()
      setState(prev => ({
        ...prev,
        cacheSize: info.size,
        lastUpdated: info.lastUpdated
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Cache info failed'
      }))
    }
  }, [])

  const cacheColors = useCallback(async (colors) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      await offlineStorage.storeColors(colors)
      await updateCacheInfo()
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Caching failed'
      }))
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [updateCacheInfo])

  const getOfflineColors = useCallback(async () => {
    try {
      return await offlineStorage.getColors()
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Offline retrieval failed'
      }))
      return []
    }
  }, [])

  const searchOfflineColors = useCallback(async (query) => {
    try {
      return await offlineStorage.searchColors(query)
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Offline search failed'
      }))
      return []
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Initialize cache info
    updateCacheInfo()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [updateCacheInfo])

  return {
    ...state,
    cacheColors,
    getOfflineColors,
    searchOfflineColors,
    updateCacheInfo
  }
}