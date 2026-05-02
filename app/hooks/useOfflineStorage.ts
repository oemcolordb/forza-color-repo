import { useState, useEffect, useCallback } from 'react'

interface OfflineStorageState {
  isOnline: boolean
  cacheSize: number
  lastUpdated: string | null
  isLoading: boolean
  error: string | null
}

export function useOfflineStorage() {
  const [state, setState] = useState<OfflineStorageState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    cacheSize: 0,
    lastUpdated: null,
    isLoading: false,
    error: null,
  })

  const cacheColors = useCallback(async (colors: unknown[]) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    try {
      localStorage.setItem('forza-offline-colors', JSON.stringify(colors))
      setState(prev => ({
        ...prev,
        isLoading: false,
        cacheSize: colors.length,
        lastUpdated: new Date().toISOString(),
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Caching failed',
      }))
    }
  }, [])

  const getOfflineColors = useCallback((): unknown[] => {
    try {
      const cached = localStorage.getItem('forza-offline-colors')
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return {
    ...state,
    cacheColors,
    getOfflineColors,
  }
}
