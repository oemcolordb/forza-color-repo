'use client'

import { useState, useEffect, useCallback } from 'react'

export interface ZoomLevel {
  zoom: number
  scale: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  columns: number
  cardSize: 'compact' | 'normal' | 'large'
  fontSize: 'xs' | 'sm' | 'base' | 'lg'
  spacing: 'tight' | 'normal' | 'relaxed'
}

const getZoomLevel = (): number => {
  if (typeof window === 'undefined') return 100

  // Calculate zoom from devicePixelRatio and window dimensions
  const screenWidth = window.screen.width
  const windowWidth = window.innerWidth
  const devicePixelRatio = window.devicePixelRatio || 1
  
  // Estimate zoom level
  const estimatedZoom = Math.round((windowWidth / screenWidth) * devicePixelRatio * 100)
  
  return estimatedZoom
}

const getScaleFromZoom = (zoom: number): ZoomLevel['scale'] => {
  if (zoom <= 50) return 'xs'
  if (zoom <= 75) return 'sm'
  if (zoom <= 100) return 'md'
  if (zoom <= 125) return 'lg'
  if (zoom <= 150) return 'xl'
  return 'xxl'
}

const getColumnsFromZoom = (zoom: number, baseColumns: number = 6): number => {
  if (zoom <= 50) return Math.min(12, baseColumns * 2)
  if (zoom <= 67) return Math.min(10, Math.ceil(baseColumns * 1.5))
  if (zoom <= 75) return Math.min(8, baseColumns + 2)
  if (zoom <= 100) return baseColumns
  if (zoom <= 125) return Math.max(2, baseColumns - 1)
  if (zoom <= 150) return Math.max(2, baseColumns - 2)
  return Math.max(1, baseColumns - 3)
}

const getCardSizeFromZoom = (zoom: number): ZoomLevel['cardSize'] => {
  if (zoom <= 67) return 'compact'
  if (zoom <= 125) return 'normal'
  return 'large'
}

const getFontSizeFromZoom = (zoom: number): ZoomLevel['fontSize'] => {
  if (zoom <= 50) return 'xs'
  if (zoom <= 75) return 'sm'
  if (zoom <= 125) return 'base'
  return 'lg'
}

const getSpacingFromZoom = (zoom: number): ZoomLevel['spacing'] => {
  if (zoom <= 67) return 'tight'
  if (zoom <= 125) return 'normal'
  return 'relaxed'
}

export const useZoomDetection = () => {
  const [zoomInfo, setZoomInfo] = useState<ZoomLevel>({
    zoom: 100,
    scale: 'md',
    columns: 6,
    cardSize: 'normal',
    fontSize: 'base',
    spacing: 'normal',
  })

  const [isTransitioning, setIsTransitioning] = useState(false)

  const updateZoomInfo = useCallback(() => {
    const zoom = getZoomLevel()
    
    setZoomInfo(prev => {
      const newScale = getScaleFromZoom(zoom)
      
      // Only trigger transition if scale changed
      if (prev.scale !== newScale) {
        setIsTransitioning(true)
        setTimeout(() => setIsTransitioning(false), 500)
      }
      
      return {
        zoom,
        scale: newScale,
        columns: getColumnsFromZoom(zoom),
        cardSize: getCardSizeFromZoom(zoom),
        fontSize: getFontSizeFromZoom(zoom),
        spacing: getSpacingFromZoom(zoom),
      }
    })
  }, [])

  useEffect(() => {
    // Initial detection
    updateZoomInfo()

    // Listen for resize events (zoom changes trigger resize)
    const handleResize = () => {
      updateZoomInfo()
    }

    // Use ResizeObserver for more accurate detection
    const resizeObserver = new ResizeObserver(() => {
      updateZoomInfo()
    })

    if (document.body) {
      resizeObserver.observe(document.body)
    }

    window.addEventListener('resize', handleResize)

    // Also check periodically for zoom changes that don't trigger resize
    const intervalId = setInterval(updateZoomInfo, 1000)

    return () => {
      window.removeEventListener('resize', handleResize)
      resizeObserver.disconnect()
      clearInterval(intervalId)
    }
  }, [updateZoomInfo])

  return { ...zoomInfo, isTransitioning }
}

export default useZoomDetection
