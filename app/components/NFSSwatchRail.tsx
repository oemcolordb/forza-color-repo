'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
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
  const [focusedSwatch, setFocusedSwatch] = useState<CarColor | null>(null)
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const containerRef = useRef<HTMLElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)

  const hsbToRgb = (h: number, s: number, b: number) => {
    const i = Math.floor(h * 6)
    const f = h * 6 - i
    const p = b * (1 - s)
    const q = b * (1 - f * s)
    const t = b * (1 - (1 - f) * s)

    let r = 0
    let g = 0
    let bl = 0
    switch (i % 6) {
      case 0: r = b; g = t; bl = p; break
      case 1: r = q; g = b; bl = p; break
      case 2: r = p; g = b; bl = t; break
      case 3: r = p; g = q; bl = b; break
      case 4: r = t; g = p; bl = b; break
      case 5: r = b; g = p; bl = q; break
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(bl * 255),
    }
  }

  const rgbToHex = (r: number, g: number, b: number) =>
    `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase()}`

  const swatchCode = (layer: CarColor['color1']) => {
    const rgb = hsbToRgb(layer.h, layer.s, layer.b)
    return {
      hsb: `${layer.h.toFixed(2)} ${layer.s.toFixed(2)} ${layer.b.toFixed(2)}`,
      hex: rgbToHex(rgb.r, rgb.g, rgb.b),
    }
  }

  const makeOptions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const color of colors) {
      counts.set(color.make, (counts.get(color.make) || 0) + 1)
    }

    return [
      { make: 'All', count: colors.length },
      ...Array.from(counts.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([make, count]) => ({ make, count })),
    ]
  }, [colors])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return colors.filter(color => {
      if (activeMake !== 'All' && color.make !== activeMake) return false
      if (!q) return true

      return (
        color.colorName.toLowerCase().includes(q) ||
        color.make.toLowerCase().includes(q) ||
        (color.model && color.model.toLowerCase().includes(q)) ||
        String(color.year || '').includes(q)
      )
    })
  }, [colors, query, activeMake])

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount])

  useEffect(() => {
    if (!focusedSwatch) return

    const closeOnOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (popoverRef.current && !popoverRef.current.contains(target)) {
        setFocusedSwatch(null)
      }
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFocusedSwatch(null)
    }

    document.addEventListener('mousedown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('mousedown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [focusedSwatch])

  useEffect(() => {
    if (!focusedSwatch || !popoverRef.current) return
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const animation = popoverRef.current.animate(
      [
        { opacity: 0, transform: 'translateY(-6px) scale(0.94)' },
        { opacity: 1, transform: 'translateY(0px) scale(1.015)', offset: 0.72 },
        { opacity: 1, transform: 'translateY(0px) scale(1)' },
      ],
      {
        duration: 300,
        easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
        fill: 'both',
      }
    )

    return () => animation.cancel()
  }, [focusedSwatch, popoverPos])

  return (
    <section ref={containerRef} className="relative nfs-garage-panel mb-4 rounded-xl p-3 md:p-4 panel-sheen kinetic-hover">
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

      <div className="mb-3">
        <label htmlFor="nfs-swatch-make" className="mb-1 block text-[11px] text-white/65">
          Brand
        </label>
        <select
          id="nfs-swatch-make"
          value={activeMake}
          onChange={e => {
            setActiveMake(e.target.value)
            setVisibleCount(PAGE_SIZE)
          }}
          className="w-full rounded-md border border-white/15 bg-black/35 px-3 py-2 text-xs text-white"
          aria-label="Filter swatches by brand"
        >
          {makeOptions.map(option => (
            <option key={option.make} value={option.make} className="text-gray-900">
              {option.make} ({option.count.toLocaleString()})
            </option>
          ))}
        </select>
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
                onClick={event => {
                  onSelectColor(color)

                  const buttonRect = event.currentTarget.getBoundingClientRect()
                  const containerRect = containerRef.current?.getBoundingClientRect()
                  if (containerRect) {
                    const cardWidth = 300
                    const idealLeft = buttonRect.left - containerRect.left + buttonRect.width / 2 - cardWidth / 2
                    const clampedLeft = Math.max(8, Math.min(idealLeft, containerRect.width - cardWidth - 8))
                    const top = buttonRect.bottom - containerRect.top + 10
                    setPopoverPos({ top, left: clampedLeft })
                  }

                  setFocusedSwatch(color)
                }}
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

      {focusedSwatch && (
        <div
          ref={popoverRef}
          className="absolute z-20 w-[300px] rounded-lg border border-white/15 bg-[#0d121bcc] p-3 shadow-2xl backdrop-blur-md reveal-up"
          style={{ top: popoverPos.top, left: popoverPos.left }}
        >
          <div className="mb-2 flex items-center gap-2">
            <div
              className="h-7 w-12 rounded border border-white/20"
              style={{
                background: createForzaGradient(focusedSwatch.color1, focusedSwatch.color2),
              }}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">
                {focusedSwatch.make} {focusedSwatch.colorName}
              </p>
              <p className="text-[11px] text-white/65">
                {focusedSwatch.year ? focusedSwatch.year : 'Year N/A'} · {focusedSwatch.colorType || 'Standard'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFocusedSwatch(null)}
              className="ml-auto rounded-md px-2 py-1 text-[11px] bamboo-button-ghost"
            >
              Close
            </button>
          </div>

          <div
            className="pointer-events-none absolute -top-2 h-3 w-3 rotate-45 border-l border-t border-white/15 bg-[#0d121b]"
            style={{ left: '50%', transform: 'translateX(-50%) rotate(45deg)' }}
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-md border border-white/10 bg-black/30 p-2">
              <p className="text-[11px] font-semibold text-white/80">Color 1</p>
              <p className="mt-1 font-mono text-[11px] text-sky-200">
                HEX {swatchCode(focusedSwatch.color1).hex}
              </p>
              <p className="font-mono text-[11px] text-white/75">
                HSB {swatchCode(focusedSwatch.color1).hsb}
              </p>
            </div>

            <div className="rounded-md border border-white/10 bg-black/30 p-2">
              <p className="text-[11px] font-semibold text-white/80">Color 2</p>
              <p className="mt-1 font-mono text-[11px] text-fuchsia-200">
                HEX {swatchCode(focusedSwatch.color2).hex}
              </p>
              <p className="font-mono text-[11px] text-white/75">
                HSB {swatchCode(focusedSwatch.color2).hsb}
              </p>
            </div>
          </div>
        </div>
      )}

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
