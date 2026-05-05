'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Car } from '../types/car'
import { countryFlags } from '../lib/countryFlags'
import Breadcrumbs from '../components/Breadcrumbs'

const PI_CLASS_COLORS: Record<string, string> = {
  D: 'bg-gray-500 text-white',
  C: 'bg-yellow-600 text-white',
  B: 'bg-blue-600 text-white',
  A: 'bg-green-600 text-white',
  S1: 'bg-purple-600 text-white',
  S2: 'bg-red-600 text-white',
  X: 'bg-pink-600 text-white',
}

const RARITY_COLORS: Record<string, string> = {
  Common: 'text-gray-400',
  Rare: 'text-blue-400',
  Epic: 'text-purple-400',
  Legendary: 'text-yellow-400',
}

function StatBar({ label, value, max = 10 }: { label: string; value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="flex items-center gap-1 text-[11px]">
      <span className="text-gray-500 w-8 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-gray-400 w-6 text-right">{value}</span>
    </div>
  )
}

function CarCard({ car, isDarkMode }: { car: Car; isDarkMode: boolean }) {
  const flag = countryFlags[car.country] ?? '🌐'
  const piColor = PI_CLASS_COLORS[car.pi.class] ?? 'bg-gray-600 text-white'
  const rarityColor = RARITY_COLORS[car.rarity] ?? 'text-gray-400'

  return (
    <div
      className={`rounded-xl border p-3 flex flex-col gap-2 transition-all hover:scale-[1.01] hover:shadow-xl ${
        isDarkMode
          ? 'bamboo-surface-dark border-gray-700/60'
          : 'bamboo-surface border-gray-200'
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className={`font-bold text-sm leading-tight truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {car.manufacturer}
          </div>
          <div className={`text-xs truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {car.model}
          </div>
        </div>
        <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${piColor}`}>
          {car.pi.class} {car.pi.value}
        </span>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-2 text-[11px]">
        <span>{flag}</span>
        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{car.year}</span>
        <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>·</span>
        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>{car.type}</span>
        <span className={`ml-auto font-semibold ${rarityColor}`}>{car.rarity}</span>
      </div>

      {/* Stat bars */}
      <div className="flex flex-col gap-0.5 pt-1 border-t border-gray-700/30">
        <StatBar label="Spd" value={car.stats.speed} />
        <StatBar label="Hdl" value={car.stats.handling} />
        <StatBar label="Acc" value={car.stats.acceleration} />
        <StatBar label="Brk" value={car.stats.braking} />
      </div>

      {/* Tune link */}
      <a
        href={`/tuneforge?car=${encodeURIComponent(`${car.manufacturer} ${car.model}`)}`}
        className="mt-1 text-center text-xs font-semibold py-1.5 rounded-lg bamboo-button transition-all"
      >
        🔧 Tune this car
      </a>
    </div>
  )
}

export default function GaragePage() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [filterManufacturer, setFilterManufacturer] = useState('')
  const [filterPIClass, setFilterPIClass] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterRarity, setFilterRarity] = useState('')
  const [sortBy, setSortBy] = useState<string>('manufacturer')

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    setIsDarkMode(saved !== 'light')
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    import('../../services/carDatabase')
      .then(({ carDatabase }) => carDatabase.getAllCars())
      .then(data => {
        if (!cancelled) {
          setCars(data)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load cars')
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [])

  const manufacturers = useMemo(() => [...new Set(cars.map(c => c.manufacturer))].sort(), [cars])
  const types = useMemo(() => [...new Set(cars.map(c => c.type))].sort(), [cars])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return cars
      .filter(c => {
        if (q && !c.manufacturer.toLowerCase().includes(q) && !c.model.toLowerCase().includes(q)) return false
        if (filterManufacturer && c.manufacturer !== filterManufacturer) return false
        if (filterPIClass && c.pi.class !== filterPIClass) return false
        if (filterType && c.type !== filterType) return false
        if (filterRarity && c.rarity !== filterRarity) return false
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'pi') return b.pi.value - a.pi.value
        if (sortBy === 'speed') return b.stats.speed - a.stats.speed
        if (sortBy === 'handling') return b.stats.handling - a.stats.handling
        if (sortBy === 'price') return b.price - a.price
        // default: manufacturer A-Z
        const mn = a.manufacturer.localeCompare(b.manufacturer)
        return mn !== 0 ? mn : a.model.localeCompare(b.model)
      })
  }, [cars, search, filterManufacturer, filterPIClass, filterType, filterRarity, sortBy])

  const clearFilters = useCallback(() => {
    setSearch('')
    setFilterManufacturer('')
    setFilterPIClass('')
    setFilterType('')
    setFilterRarity('')
    setSortBy('manufacturer')
  }, [])

  const hasActiveFilters = search || filterManufacturer || filterPIClass || filterType || filterRarity

  const inputCls = `w-full rounded-lg px-3 py-2 text-sm border outline-none focus:ring-2 focus:ring-blue-500 ${
    isDarkMode
      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`
  const selectCls = `w-full rounded-lg px-3 py-2 text-sm border outline-none focus:ring-2 focus:ring-blue-500 ${
    isDarkMode
      ? 'bg-gray-800 border-gray-600 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  }`

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 border-b px-4 py-3 flex items-center gap-3 ${
        isDarkMode ? 'bg-gray-900/95 backdrop-blur border-gray-700' : 'bg-white/95 backdrop-blur border-gray-200'
      }`}>
        <a href="/" className="text-gray-400 hover:text-white transition-colors shrink-0">← Back</a>
        <span className="text-2xl">🏎️</span>
        <div>
          <h1 className="font-bold text-lg leading-tight">FH5 Car Database</h1>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {loading ? 'Loading…' : `${filtered.length} of ${cars.length} cars`}
          </p>
        </div>
        <a
          href="/tuneforge"
          className="ml-auto shrink-0 bamboo-button text-sm px-3 py-1.5 rounded-lg font-semibold"
        >
          🔧 Open TuneForge
        </a>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 py-4">
        <Breadcrumbs isDarkMode={isDarkMode} />

        {/* Filters */}
        <div className={`rounded-xl border p-4 mb-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 ${
          isDarkMode ? 'bamboo-surface-dark border-gray-700' : 'bamboo-surface border-gray-200'
        }`}>
          <input
            type="text"
            placeholder="Search make or model…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`${inputCls} col-span-2 sm:col-span-3 lg:col-span-2`}
          />
          <select value={filterManufacturer} onChange={e => setFilterManufacturer(e.target.value)} className={selectCls}>
            <option value="">All Manufacturers</option>
            {manufacturers.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={filterPIClass} onChange={e => setFilterPIClass(e.target.value)} className={selectCls}>
            <option value="">All PI Classes</option>
            {['D','C','B','A','S1','S2','X'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className={selectCls}>
            <option value="">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterRarity} onChange={e => setFilterRarity(e.target.value)} className={selectCls}>
            <option value="">All Rarities</option>
            {['Common','Rare','Epic','Legendary'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <div className="col-span-2 sm:col-span-3 lg:col-span-5 flex items-center gap-3">
            <label className={`text-xs font-medium shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sort:</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={`${selectCls} flex-1`}>
              <option value="manufacturer">Manufacturer A–Z</option>
              <option value="pi">PI Value (high first)</option>
              <option value="speed">Top Speed (high first)</option>
              <option value="handling">Handling (high first)</option>
              <option value="price">Price (high first)</option>
            </select>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="shrink-0 text-xs px-3 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-900/20 p-4 mb-4 text-red-400 text-sm">
            Failed to load car database: {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
            <span className="animate-spin text-2xl">⟳</span>
            <span>Loading car database…</span>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                No cars match your filters.{' '}
                <button onClick={clearFilters} className="underline text-blue-400">Clear filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
                {filtered.map((car, i) => (
                  <CarCard key={`${car.manufacturer}-${car.model}-${car.year}-${i}`} car={car} isDarkMode={isDarkMode} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
