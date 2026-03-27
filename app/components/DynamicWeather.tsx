'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'

type WeatherState = 'clear' | 'breezy' | 'light-rain' | 'mist'

interface DynamicWeatherProps {
  isDarkMode: boolean
}

// How long each weather phase lasts (ms). Randomly chosen between min/max each cycle.
const PHASE_MIN_MS = 45_000
const PHASE_MAX_MS = 90_000

const CYCLE: WeatherState[] = ['clear', 'breezy', 'light-rain', 'mist']

// Seeded list of rain-streak positions so they don't jump on re-render
const RAIN_STREAKS = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 7.3 + 3) % 98}%`,
  delay: `${(i * 0.41) % 5.7}s`,
  duration: `${4.8 + (i * 0.23) % 1.8}s`,
  height: `${60 + (i * 11) % 40}px`,
  opacity: 0.18 + (i * 0.032) % 0.14,
}))

const BREEZY_PARTICLES = Array.from({ length: 9 }, (_, i) => ({
  top: `${10 + (i * 9.7) % 75}%`,
  left: `${5 + (i * 11.3) % 85}%`,
  delay: `${(i * 1.27) % 11.4}s`,
  size: 6 + (i * 3) % 6,
  hue: ['text-emerald-300', 'text-yellow-200', 'text-amber-300'][i % 3],
}))

const MIST_BANDS = [
  { top: '20%', delay: '0s', duration: '34.3s', opacity: 0.06 },
  { top: '42%', delay: '8.6s', duration: '28.6s', opacity: 0.05 },
  { top: '65%', delay: '17.1s', duration: '40s', opacity: 0.07 },
]

const DynamicWeather: React.FC<DynamicWeatherProps> = ({ isDarkMode }) => {
  const [weather, setWeather] = useState<WeatherState>('clear')
  const [visible, setVisible] = useState(true)
  const phaseIndex = useRef(0)

  const scheduleNextPhase = useCallback(() => {
    const duration = PHASE_MIN_MS + Math.random() * (PHASE_MAX_MS - PHASE_MIN_MS)

    const timer = window.setTimeout(() => {
      // Fade out
      setVisible(false)
      window.setTimeout(() => {
        phaseIndex.current = (phaseIndex.current + 1) % CYCLE.length
        setWeather(CYCLE[phaseIndex.current])
        setVisible(true)
        scheduleNextPhase()
      }, 1800) // cross-fade gap
    }, duration)

    return timer
  }, [])

  useEffect(() => {
    const timer = scheduleNextPhase()
    return () => window.clearTimeout(timer)
  }, [scheduleNextPhase])

  const baseTransition =
    'transition-opacity duration-[1800ms] ease-in-out pointer-events-none fixed inset-0 z-[1] overflow-hidden'

  return (
    <>
      {/* ── Light Rain ─────────────────────────────────────────── */}
      <div
        className={`${baseTransition} ${weather === 'light-rain' && visible ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden="true"
      >
        {RAIN_STREAKS.map((streak, i) => (
          <div
            key={i}
            className="absolute top-0 w-px animate-rain rounded-full"
            style={{
              left: streak.left,
              height: streak.height,
              animationDelay: streak.delay,
              animationDuration: streak.duration,
              opacity: isDarkMode ? streak.opacity + 0.06 : streak.opacity,
              background: isDarkMode
                ? 'linear-gradient(to bottom, transparent, rgba(147,210,255,0.7), transparent)'
                : 'linear-gradient(to bottom, transparent, rgba(100,160,220,0.5), transparent)',
            }}
          />
        ))}
        {/* Wet-ground shimmer */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24"
          style={{
            background: isDarkMode
              ? 'linear-gradient(to top, rgba(100,200,255,0.04), transparent)'
              : 'linear-gradient(to top, rgba(80,150,200,0.05), transparent)',
          }}
        />
      </div>

      {/* ── Breezy (floating leaves / petals) ─────────────────── */}
      <div
        className={`${baseTransition} ${weather === 'breezy' && visible ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden="true"
      >
        {BREEZY_PARTICLES.map((p, i) => (
          <div
            key={i}
            className={`absolute animate-wind-leaf ${p.hue}`}
            style={{
              top: p.top,
              left: p.left,
              fontSize: p.size,
              animationDelay: p.delay,
              opacity: isDarkMode ? 0.25 : 0.18,
            }}
          >
            {i % 3 === 0 ? '🍂' : i % 3 === 1 ? '🌿' : '✦'}
          </div>
        ))}
        {/* Gentle haze shift */}
        <div
          className="absolute inset-0 animate-dust-swirl"
          style={{
            background: isDarkMode
              ? 'radial-gradient(ellipse 60% 20% at 50% 60%, rgba(200,220,255,0.02), transparent)'
              : 'radial-gradient(ellipse 60% 20% at 50% 60%, rgba(210,230,255,0.04), transparent)',
          }}
        />
      </div>

      {/* ── Mist ───────────────────────────────────────────────── */}
      <div
        className={`${baseTransition} ${weather === 'mist' && visible ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden="true"
      >
        {MIST_BANDS.map((band, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-32 animate-atmospheric-flow"
            style={{
              top: band.top,
              animationDelay: band.delay,
              animationDuration: band.duration,
              opacity: isDarkMode ? band.opacity + 0.02 : band.opacity,
              background: isDarkMode
                ? 'linear-gradient(to right, transparent, rgba(180,210,255,0.5), rgba(220,235,255,0.4), transparent)'
                : 'linear-gradient(to right, transparent, rgba(220,235,255,0.6), rgba(240,248,255,0.5), transparent)',
              filter: 'blur(18px)',
            }}
          />
        ))}
      </div>

      {/* ── Clear (very quiet atmospheric drift) ──────────────── */}
      <div
        className={`${baseTransition} ${weather === 'clear' && visible ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden="true"
      >
        <div
          className="absolute inset-0"
          style={{
            background: isDarkMode
              ? 'radial-gradient(ellipse 80% 30% at 50% 80%, rgba(30,60,120,0.04), transparent)'
              : 'radial-gradient(ellipse 80% 30% at 50% 80%, rgba(200,220,255,0.05), transparent)',
          }}
        />
      </div>
    </>
  )
}

export default DynamicWeather
