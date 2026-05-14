'use client'

import React, { useEffect, useState } from 'react'
import { CarColor } from '../types'

interface TrendItem {
  color_id: string
  score: number
  total_interactions: number
}

interface CommunityTrendsProps {
  allColors: CarColor[]
  isDarkMode: boolean
  onColorSelect: (color: CarColor) => void
}

const CommunityTrends: React.FC<CommunityTrendsProps> = ({ allColors, isDarkMode, onColorSelect }) => {
  const [trends, setTrends] = useState<TrendItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await fetch('/api/analytics/community-trends')
        const data = await res.json()
        if (data.trends) {
          setTrends(data.trends)
        }
      } catch (err) {
        console.error('Failed to fetch trends', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTrends()
  }, [])

  if (loading) return <div className="animate-pulse h-20 bg-gray-800/50 rounded-xl" />
  if (trends.length === 0) return null

  return (
    <div className={`p-4 rounded-xl ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🔥</span>
        <h2 className="font-bold uppercase tracking-widest text-sm" style={{ color: 'var(--bamboo-stalk)' }}>
          COMMUNITY TRENDS
        </h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {trends.map((trend) => {
          const color = allColors.find(c => `${c.make}-${c.colorName}-${c.year || 'unknown'}` === trend.color_id)
          if (!color) return null

          return (
            <button
              key={trend.color_id}
              onClick={() => onColorSelect(color)}
              className="flex-shrink-0 w-32 group"
            >
              <div 
                className="w-full h-16 rounded-lg mb-2 shadow-lg group-hover:scale-105 transition-transform"
                style={{ 
                  background: color.color1 && color.color2
                    ? `linear-gradient(135deg, hsl(${color.color1.h * 360}, ${color.color1.s * 100}%, ${color.color1.b * 100}%), hsl(${color.color2.h * 360}, ${color.color2.s * 100}%, ${color.color2.b * 100}%))`
                    : '#ccc'
                }}
              />
              <div className="text-[10px] font-bold truncate text-left">{color.colorName}</div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-[9px] opacity-60 uppercase">{color.make}</span>
                <span className="text-[9px] bg-red-500/20 text-red-400 px-1 rounded">
                   {trend.score > 20 ? 'POPULAR' : 'TRENDING'}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CommunityTrends
