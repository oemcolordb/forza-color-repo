'use client'

import { useState, useEffect, useCallback } from 'react'
import { CarColor } from '../types'

interface LazyLoadConfig {
  chunkSize: number
  preloadThreshold: number
  useWorker: boolean
}

export function useLazyLoadColors(config: LazyLoadConfig = {
  chunkSize: 100,
  preloadThreshold: 0.8,
  useWorker: true
}) {
  const [allColors, setAllColors] = useState<CarColor[]>([])
  const [displayedColors, setDisplayedColors] = useState<CarColor[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentChunk, setCurrentChunk] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [worker, setWorker] = useState<Worker | null>(null)

  // Initialize Web Worker
  useEffect(() => {
    if (config.useWorker && typeof Worker !== 'undefined') {
      const colorWorker = new Worker(new URL('../workers/colorWorker.ts', import.meta.url))
      setWorker(colorWorker)

      colorWorker.onmessage = (e) => {
        const { type, payload } = e.data

        switch (type) {
          case 'COLORS_LOADED':
            setAllColors(payload)
            loadNextChunk(payload, 0)
            setLoading(false)
            break

          case 'COLORS_FILTERED':
            setDisplayedColors(payload)
            setLoadingMore(false)
            break

          case 'ERROR':
            console.error('Worker error:', payload)
            setLoading(false)
            setLoadingMore(false)
            break
        }
      }

      // Load initial data
      colorWorker.postMessage({ type: 'LOAD_COLORS' })

      return () => colorWorker.terminate()
    } else {
      // Fallback without worker
      loadColorsFallback()
    }
  }, [config.useWorker])

  const loadColorsFallback = async () => {
    try {
      const { default: colors } = await import('../../services/colorData')
      setAllColors(colors)
      loadNextChunk(colors, 0)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load colors:', error)
      setLoading(false)
    }
  }

  const loadNextChunk = useCallback((colors: CarColor[], chunk: number) => {
    const start = chunk * config.chunkSize
    const end = start + config.chunkSize
    const newColors = colors.slice(start, end)

    if (newColors.length === 0) {
      setHasMore(false)
      return
    }

    setDisplayedColors(prev => [...prev, ...newColors])
    setCurrentChunk(chunk)
    setHasMore(end < colors.length)
    setLoadingMore(false)
  }, [config.chunkSize])

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    
    // Simulate async loading
    setTimeout(() => {
      loadNextChunk(allColors, currentChunk + 1)
    }, 100)
  }, [loadingMore, hasMore, allColors, currentChunk, loadNextChunk])

  const filterColors = useCallback((filters: {
    make?: string
    type?: string
    search?: string
  }) => {
    if (worker) {
      worker.postMessage({
        type: 'FILTER_COLORS',
        payload: { colors: allColors, filters }
      })
    } else {
      // Fallback filtering
      const filtered = allColors.filter(color => {
        if (filters.make && color.make !== filters.make) return false
        if (filters.type && color.colorType !== filters.type) return false
        if (filters.search) {
          const search = filters.search.toLowerCase()
          return color.colorName.toLowerCase().includes(search) ||
                 color.make.toLowerCase().includes(search)
        }
        return true
      })
      setDisplayedColors(filtered)
    }
  }, [allColors, worker])

  return {
    colors: displayedColors,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    filterColors,
    totalColors: allColors.length
  }
}

// Intersection Observer hook for infinite scroll
export function useInfiniteScroll(
  callback: () => void,
  options: IntersectionObserverInit = {}
) {
  const [node, setNode] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback()
        }
      },
      { threshold: 0.1, ...options }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [node, callback, options])

  return setNode
}

// Image lazy loading hook
export function useLazyImage(src: string) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    if (!imageRef) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setImageSrc(src)
          observer.disconnect()
        }
      },
      { rootMargin: '50px' }
    )

    observer.observe(imageRef)

    return () => observer.disconnect()
  }, [imageRef, src])

  return { imageSrc, setImageRef }
}
