'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CarColor } from '@/types'
import { cache } from '@/lib/utils/cache'
import CompanionView from '@/components/companion/CompanionView'

export default function CompanionClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const colorId = searchParams.get('id')
  
  const [color, setColor] = useState<CarColor | null>(null)
  const [allColors, setAllColors] = useState<CarColor[]>([])
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
        const cachedColors = cache.get<CarColor[]>('color-data')
        let colorsToSearch = cachedColors
        
        if (!colorsToSearch) {
          const { getColorData } = await import('@/lib/services/colorDataLazy')
          colorsToSearch = await getColorData()
        }

        if (colorsToSearch) {
          setAllColors(colorsToSearch)
          const foundColor = colorsToSearch.find(c => `${c.make}-${c.colorName}-${c.year || 'unknown'}` === colorId)
          if (foundColor) {
            setColor(foundColor)
          } else {
            setError('Color not found in the database')
          }
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

  // Context: swipe cycles through other colors of the SAME manufacturer
  const makeColors = useMemo(() => {
    if (!color || !allColors.length) return []
    return allColors.filter(c => c.make === color.make)
  }, [color, allColors])

  const { nextColor, prevColor } = useMemo(() => {
    if (!color || !makeColors.length) return { nextColor: null, prevColor: null }
    const currentIndex = makeColors.findIndex(c => `${c.make}-${c.colorName}-${c.year || 'unknown'}` === colorId)
    if (currentIndex === -1) return { nextColor: null, prevColor: null }
    
    const nextIdx = (currentIndex + 1) % makeColors.length
    const prevIdx = (currentIndex - 1 + makeColors.length) % makeColors.length
    
    return {
      nextColor: makeColors[nextIdx],
      prevColor: makeColors[prevIdx]
    }
  }, [color, makeColors, colorId])

  const handleNext = () => {
    if (nextColor) {
      router.replace(`/companion?id=${encodeURIComponent(`${nextColor.make}-${nextColor.colorName}-${nextColor.year || 'unknown'}`)}`)
    }
  }

  const handlePrev = () => {
    if (prevColor) {
      router.replace(`/companion?id=${encodeURIComponent(`${prevColor.make}-${prevColor.colorName}-${prevColor.year || 'unknown'}`)}`)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Paint Values...</div>
  }

  return (
    <CompanionView 
      color={color} 
      error={error} 
      onNext={nextColor ? handleNext : undefined} 
      onPrev={prevColor ? handlePrev : undefined} 
    />
  )
}
