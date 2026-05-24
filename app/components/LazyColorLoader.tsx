'use client'

import { useState, useEffect } from 'react'
import { CarColor } from '../types'

export const useLazyColorLoader = () => {
  const [colors, setColors] = useState<CarColor[]>([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const loadColors = async () => {
      try {
        const { getColorData } = await import('../../services/colorDataLazy')
        const allColors = await getColorData()

        const firstChunk = allColors.slice(0, 100)
        setColors(firstChunk)
        setProgress(10)
        setLoading(false)

        const chunkSize = 500
        for (let i = 100; i < allColors.length; i += chunkSize) {
          const chunk = allColors.slice(i, i + chunkSize)
          setColors(prev => [...prev, ...chunk])
          setProgress(Math.min(100, (i / allColors.length) * 100))
          await new Promise(resolve => setTimeout(resolve, 10))
        }

        setProgress(100)
      } catch (error) {
        console.error('Failed to load colors:', error)
        setLoading(false)
      }
    }

    loadColors()
  }, [])

  return { colors, loading, progress }
}
