'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CarColor } from '@/types'
import { cache } from '@/lib/utils/cache'
import CompanionView from '@/components/companion/CompanionView'

export default function CompanionClient() {
  const searchParams = useSearchParams()
  const colorId = searchParams.get('id')
  
  const [color, setColor] = useState<CarColor | null>(null)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!colorId) {
      setError('No color ID provided')
      setLoading(false)
      return
    }

    const loadColor = async () => {
      try {
        // Try to find the color in the cache first (it's very likely there if they navigated from the gallery)
        const cachedColors = cache.get<CarColor[]>('color-data')
        
        let foundColor = null

        if (cachedColors) {
          foundColor = cachedColors.find(c => `${c.make}-${c.colorName}-${c.year || 'unknown'}` === colorId)
        }
        
        // If not in cache, we need to fetch it (e.g. they opened a bookmarked link directly)
        if (!foundColor) {
          const { getColorData } = await import('@/lib/services/colorDataLazy')
          const rawColors = await getColorData()
          foundColor = rawColors.find((c: CarColor) => `${c.make}-${c.colorName}-${c.year || 'unknown'}` === colorId)
        }

        if (foundColor) {
          setColor(foundColor)
        } else {
          setError('Color not found in the database')
        }
      } catch (err) {
        console.error(err)
        setError('Failed to load color data')
      } finally {
        setLoading(false)
      }
    }

    loadColor()
  }, [colorId])

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Paint Values...</div>
  }

  return <CompanionView color={color} error={error} />
}
