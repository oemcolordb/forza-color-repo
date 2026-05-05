'use client'

import { useState, useEffect } from 'react'

export const useLazyColorLoader = () => {
  const [colors, setColors] = useState([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const loadColorsInChunks = async () => {
      try {
        // Load first 100 colors immediately for instant UI
        const { getColorChunk } = await import('../../services/colorDataLazy')
        const firstChunk = await getColorChunk(0, 100)
        setColors(firstChunk)
        setProgress(10)
        setLoading(false)

        // Load remaining colors in background
        const totalColors = 10000 // Approximate total
        const chunkSize = 500

        for (let i = 100; i < totalColors; i += chunkSize) {
          const chunk = await getColorChunk(i, chunkSize)
          if (chunk.length === 0) break

          setColors(prev => [...prev, ...chunk])
          setProgress(Math.min(100, (i / totalColors) * 100))

          // Small delay to prevent blocking
          await new Promise(resolve => setTimeout(resolve, 10))
        }

        setProgress(100)
      } catch (error) {
        console.error('Failed to load colors:', error)
        setLoading(false)
      }
    }

    loadColorsInChunks()
  }, [])

  return { colors, loading, progress }
}
