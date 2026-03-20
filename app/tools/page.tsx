'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { CarColor, DeviceInfo } from '../types'
import { cache } from '../lib/cache'
import { handleError } from '../lib/validation'
import { useDeviceDetection } from '../hooks/useDeviceDetection'
import GamingErrorBoundary from '../components/GamingErrorBoundary'
import ColorAnalyticsDashboard from '../components/ColorAnalyticsDashboard'
import AdvancedTools from '../components/AdvancedTools'
import ColorGenerator from '../components/ColorGenerator'
import ColorRouletteHarmony from '../components/ColorRouletteHarmony'
import HarmonyVisualizer from '../components/HarmonyVisualizer'
import ImageColorExtractor from '../components/ImageColorExtractor'
import HSBPopup from '../components/HSBPopup'

export default function ToolsPage() {
  const [colors, setColors] = useState<CarColor[]>([])
  const [loading, setLoading] = useState(true)
  const [hsbPopupColor, setHsbPopupColor] = useState<CarColor | null>(null)
  const [showHsbPopup, setShowHsbPopup] = useState(false)
  const [harmonyColors, setHarmonyColors] = useState<CarColor[]>([])
  const [harmonyMode, setHarmonyMode] = useState('')
  const [activeSection, setActiveSection] = useState('analytics')
  const deviceInfo: DeviceInfo = useDeviceDetection()
  const isDarkMode = true

  useEffect(() => {
    const load = async () => {
      try {
        const cached = cache.get<CarColor[]>('color-data')
        if (cached) { setColors(cached); setLoading(false); return }
        const { getColorData } = await import('../../services/colorDataLazy')
        const data = await getColorData()
        setColors(data)
        cache.set('color-data', data, 10 * 60 * 1000)
      } catch (err) {
        handleError(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const showColorHSB = useCallback((color: CarColor) => {
    setHsbPopupColor(color)
    setShowHsbPopup(true)
  }, [])

  const handleColorsGenerated = useCallback((newColors: CarColor[]) => {
    setColors(prev => [...prev, ...newColors])
  }, [])

  const sections = [
    { id: 'analytics', label: '📊 Analytics' },
    { id: 'advanced',  label: '🛠️ Advanced'  },
    { id: 'paint',     label: '🎨 Paint Booth' },
    { id: 'roulette',  label: '🎰 Roulette'   },
    { id: 'scanner',   label: '📸 Scanner'    },
  ]

  return (
    <div className="min-h-screen bamboo-surface-dark text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <a href="/" className="text-sm bamboo-button-ghost px-3 py-2 rounded-lg">← Back</a>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            🛠️ Color Tools
          </h1>
          {!loading && (
            <span className="ml-auto text-sm text-slate-400">
              {colors.length.toLocaleString()} colors loaded
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-700 pb-4">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === s.id ? 'bamboo-button' : 'bamboo-button-ghost'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            Loading color data...
          </div>
        ) : (
          <GamingErrorBoundary>
            {activeSection === 'analytics' && (
              <ColorAnalyticsDashboard colors={colors} isDarkMode={isDarkMode} />
            )}

            {activeSection === 'advanced' && (
              <AdvancedTools
                colors={colors}
                isDarkMode={isDarkMode}
                isMobile={deviceInfo.isMobile}
                onColorSelect={showColorHSB}
              />
            )}

            {activeSection === 'paint' && (
              <div className="bamboo-surface-dark rounded-xl p-6">
                <h2 className="text-xl font-bold text-green-400 mb-4">🎨 Paint Booth</h2>
                <ColorGenerator
                  colors={colors}
                  isDarkMode={isDarkMode}
                  onColorsGenerated={handleColorsGenerated}
                  isMobile={deviceInfo.isMobile}
                />
              </div>
            )}

            {activeSection === 'roulette' && (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bamboo-surface-dark rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--bamboo-stalk)' }}>
                    🎰 Color Roulette
                  </h2>
                  <ColorRouletteHarmony
                    colors={colors}
                    isDarkMode={isDarkMode}
                    onColorSelect={showColorHSB}
                    onHarmonyGenerated={(cols: CarColor[], mode: string) => {
                      setHarmonyColors(cols)
                      setHarmonyMode(mode)
                    }}
                  />
                </div>
                <div className="bamboo-surface-dark rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--bamboo-stalk)' }}>
                    🎨 Harmony Display
                  </h2>
                  <HarmonyVisualizer
                    currentHarmony={harmonyColors}
                    harmonyMode={harmonyMode}
                    isDarkMode={isDarkMode}
                    onColorSelect={showColorHSB}
                  />
                </div>
              </div>
            )}

            {activeSection === 'scanner' && (
              <div className="bamboo-surface-dark rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--bamboo-stalk)' }}>
                  📸 Paint Scanner
                </h2>
                <ImageColorExtractor
                  colors={colors}
                  onColorsExtracted={() => {}}
                  onColorsFound={() => {}}
                  onColorSelect={showColorHSB}
                  isDarkMode={isDarkMode}
                />
                <div className="mt-4 text-sm text-center">
                  <a href="/image-match" className="hover:underline" style={{ color: 'var(--bamboo-stalk)' }}>
                    Try the standalone image-to-paint tool →
                  </a>
                </div>
              </div>
            )}
          </GamingErrorBoundary>
        )}
      </div>

      <HSBPopup
        color={hsbPopupColor}
        isOpen={showHsbPopup}
        onClose={() => setShowHsbPopup(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  )
}
