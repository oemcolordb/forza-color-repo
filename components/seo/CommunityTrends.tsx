'use client'

import React, { useEffect, useState } from 'react'
import { CarColor } from '@/types'
import { getAdvancedMaterialStyle } from '@/lib/utils/colorUtils'

interface TrendItem {
  color_id: string
  score: number
  total_interactions: number
}

interface CommunityTrendsProps {
  allColors: CarColor[]
  isDarkMode: boolean
  onColorSelect: (_color: CarColor) => void
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
      <style dangerouslySetInnerHTML={{__html: `
        .trends-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
        }
        .trends-scrollbar::-webkit-scrollbar {
          height: 8px;
          display: block;
        }
        .trends-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .trends-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .trends-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}} />
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🔥</span>
        <h2 className="font-bold uppercase tracking-widest text-sm" style={{ color: 'var(--bamboo-stalk)' }}>
          COMMUNITY TRENDS
        </h2>
      </div>

      <div 
        className="flex gap-4 overflow-x-scroll pb-4 pt-2 snap-x snap-mandatory scroll-smooth trends-scrollbar"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {trends.map((trend) => {
          const color = allColors.find(c => `${c.make}-${c.colorName}-${c.year || 'unknown'}` === trend.color_id)
          if (!color) return null

          return (
            <button
              key={trend.color_id}
              onClick={() => onColorSelect(color)}
              className="flex-shrink-0 w-32 group snap-start"
            >
              <div 
                className="w-full h-16 rounded-lg mb-2 shadow-lg group-hover:scale-105 transition-transform"
                style={getAdvancedMaterialStyle(color.color1, color.color2, color.colorType)}
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
