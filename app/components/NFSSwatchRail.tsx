'use client'

import React, { useMemo, useState } from 'react'
import { CarColor } from '../types'
import { createForzaGradient } from '../lib/colorUtils'

interface NFSSwatchRailProps {
  colors: CarColor[]
  selectedColorId?: string | null
  onSelectColor: (color: CarColor) => void
}

const PAGE_SIZE = 240

export default function NFSSwatchRail({ colors, selectedColorId, onSelectColor }: NFSSwatchRailProps) {
  const [query, setQuery] = useState('')
  const [activeMake, setActiveMake] = useState('All')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const topMakes = useMemo(() => {
    const counts = new Map<string, number>()
    for (const color of colors) {
      counts.set(color.make, (counts.get(color.make) || 0) + 1)
    }
    return ['All', ...Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 9).map(([make]) => make)]
  }, [colors])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return colors

    return colors.filter(color => {
      if (activeMake !== 'All' && color.make !== activeMake) return false
      return (
        color.colorName.toLowerCase().includes(q) ||
        color.make.toLowerCase().includes(q) ||
        (color.model && color.model.toLowerCase().includes(q)) ||
        String(color.year || '').includes(q)
      )
    })
  }, [colors, query, activeMake])

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount])

  return (
    <section className="nfs-garage-panel mb-4 rounded-xl p-3 md:p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="nfs-garage-label text-xs font-semibold">Swatch Selector</h3>
        <span className="text-xs text-white/60">{filtered.length.toLocaleString()} available</span>
        <button
          type="button"
          onClick={() => setVisibleCount(filtered.length || PAGE_SIZE)}
          className="ml-auto nfs-garage-audio-btn rounded-md px-2.5 py-1 text-[11px]"
        >
          Load all swatches
        </button>
      </div>

      <input
        type="text"
        value={query}
        onChange={e => {
          setQuery(e.target.value)
          setVisibleCount(PAGE_SIZE)
        }}
        placeholder="Find swatches by color, make, model, or year"
        className="mb-3 w-full rounded-md border border-white/15 bg-black/35 px-3 py-2 text-xs text-white placeholder:text-white/45"
        aria-label="Search NFS swatches"
      />

      <div className="mb-3 flex flex-wrap gap-1.5">
        {topMakes.map(make => (
          <button
            key={make}
            type="button"
            onClick={() => {
              setActiveMake(make)
              setVisibleCount(PAGE_SIZE)
            }}
            className={`rounded-md px-2 py-1 text-[11px] transition ${
              activeMake === make ? 'nfs-garage-audio-btn is-on' : 'nfs-garage-audio-btn'
            }`}
          >
            {make}
          </button>
        ))}
      </div>

      <div className="max-h-40 overflow-y-auto pr-1">
        <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-12 lg:grid-cols-16">
          {visible.map((color, index) => {
            const colorId = `${color.make}-${color.colorName}-${color.year || 'unknown'}`
            const isSelected = selectedColorId === colorId
            return (
              <button
                key={`${colorId}-${index}`}
                type="button"
                onClick={() => onSelectColor(color)}
                className={`relative h-7 rounded-sm border transition ${
                  isSelected
                    ? 'border-amber-300 ring-1 ring-amber-300'
                    : 'border-white/20 hover:border-sky-300'
                }`}
                style={{ background: createForzaGradient(color.color1, color.color2) }}
                title={`${color.make} ${color.colorName}${color.year ? ` (${color.year})` : ''}`}
                aria-label={`Select ${color.make} ${color.colorName}`}
              >
                <span className="sr-only">{color.colorName}</span>
              </button>
            )
          })}
        </div>
      </div>

      {visible.length < filtered.length && (
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount(prev => Math.min(prev + PAGE_SIZE, filtered.length))}
            className="nfs-garage-audio-btn rounded-md px-3 py-1.5 text-xs"
          >
            Show more swatches ({visible.length.toLocaleString()} / {filtered.length.toLocaleString()})
          </button>
        </div>
      )}
    </section>
  )
}
