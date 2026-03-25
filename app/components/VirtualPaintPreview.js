'use client'

import React, { useMemo, useState } from 'react'

const lightingOptions = [
  {
    id: 'showroom',
    label: 'Showroom',
    overlay: 'linear-gradient(145deg, rgba(255,255,255,0.2), rgba(0,0,0,0.1))',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    overlay: 'linear-gradient(145deg, rgba(255,180,120,0.24), rgba(65,15,0,0.2))',
  },
  {
    id: 'night',
    label: 'Night',
    overlay: 'linear-gradient(145deg, rgba(80,140,255,0.18), rgba(0,0,0,0.32))',
  },
]

const VirtualPaintPreview = ({ color, isDarkMode }) => {
  const [lighting, setLighting] = useState(lightingOptions[0])

  const baseColor = useMemo(() => {
    if (!color) return 'linear-gradient(135deg, #1e2433, #141824)'
    const h = Math.round(color.color1.h * 360)
    const s = Math.round(color.color1.s * 100)
    const l = Math.max(18, Math.round(color.color1.b * 65))
    return `hsl(${h}, ${s}%, ${l}%)`
  }, [color])

  return (
    <section className={`mb-5 rounded-2xl p-4 md:p-5 ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="premium-title text-lg font-bold text-white">Virtual Paint Preview</h2>
        <span className="text-xs text-white/55">Apply selected paint to a stylized coupe preview</span>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 p-3">
        <div className="relative mx-auto h-40 w-full max-w-xl overflow-hidden rounded-xl border border-white/10 bg-[#0f1523]">
          <div className="absolute inset-0" style={{ background: baseColor }} />
          <div className="absolute inset-0" style={{ background: lighting.overlay, mixBlendMode: 'screen' }} />
          <div className="absolute inset-x-0 bottom-0 h-10 bg-black/35" />

          <svg viewBox="0 0 640 220" className="absolute inset-0 h-full w-full">
            <path d="M86 152c18-28 48-42 92-46l96-12c62-8 138-9 200 14l42 16c14 5 24 17 27 31l3 12h-42c-3-21-21-37-43-37s-40 16-43 37H233c-4-22-21-37-43-37-22 0-40 15-43 37H83z" fill="rgba(255,255,255,0.18)"/>
            <path d="M104 148c12-20 33-31 65-35l95-12c59-8 132-9 189 12l37 14c10 4 18 13 21 23l2 8h-26c-3-16-16-28-33-28-16 0-30 12-33 28H240c-3-16-17-28-34-28s-31 12-34 28h-67z" fill="rgba(255,255,255,0.25)"/>
            <circle cx="205" cy="162" r="27" fill="rgba(10,14,26,0.82)" />
            <circle cx="205" cy="162" r="11" fill="rgba(255,255,255,0.18)" />
            <circle cx="458" cy="162" r="27" fill="rgba(10,14,26,0.82)" />
            <circle cx="458" cy="162" r="11" fill="rgba(255,255,255,0.18)" />
          </svg>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {lightingOptions.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => setLighting(option)}
              className={`rounded-lg px-3 py-1.5 text-xs transition ${lighting.id === option.id ? 'bamboo-button' : 'bamboo-button-ghost'}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <p className="mt-2 text-xs text-white/60">
          {color
            ? `Previewing ${color.make} ${color.colorName}`
            : 'Select a color card to update the vehicle preview.'}
        </p>
      </div>
    </section>
  )
}

export default VirtualPaintPreview
