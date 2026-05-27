'use client'

import React, { useState, useCallback, useMemo } from 'react'
import {
  hsbToRgb,
  hsbToHex,
  hexToHsb,
  rgbToHex,
  validateHSB,
  validateHex,
  clampHSB,
  formatHSBValues,
} from '../lib/colorUtils'

interface RealTimeColorVisualizerProps {
  onColorSelect?: (color: { h: number; s: number; b: number; hex: string; rgb: string }) => void
  defaultColor?: string // HEX color
  showAdvanced?: boolean
}

export default function RealTimeColorVisualizer({
  onColorSelect,
  defaultColor = '#3B82F6',
  showAdvanced = true,
}: RealTimeColorVisualizerProps) {
  // Parse initial color
  const initialHsb = useMemo(() => {
    const parsed = hexToHsb(defaultColor)
    return parsed || { h: 0, s: 0, b: 1 }
  }, [defaultColor])

  // HSB state
  const [hue, setHue] = useState(initialHsb.h)
  const [saturation, setSaturation] = useState(initialHsb.s)
  const [brightness, setBrightness] = useState(initialHsb.b)

  // Input modes
  const [inputMode, setInputMode] = useState<'hsb' | 'hex' | 'rgb'>('hsb')
  const [hexInput, setHexInput] = useState(defaultColor)
  const [rgbInput, setRgbInput] = useState('0 0 0')

  // Computed values
  const currentHsb = useMemo(() => clampHSB(hue, saturation, brightness), [hue, saturation, brightness])
  const currentRgb = useMemo(() => hsbToRgb(currentHsb.h, currentHsb.s, currentHsb.b), [currentHsb])
  const currentHex = useMemo(() => hsbToHex(currentHsb.h, currentHsb.s, currentHsb.b), [currentHsb])
  const currentCss = useMemo(() => `rgb(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b})`, [currentRgb])

  // Brightness-only preview (for saturation slider)
  const saturationPreview = useMemo(
    () => hsbToRgb(currentHsb.h, 1, currentHsb.b),
    [currentHsb]
  )

  // Handle HSB changes
  const handleHueChange = useCallback((value: number) => {
    setHue(value / 360)
    setInputMode('hsb')
  }, [])

  const handleSaturationChange = useCallback((value: number) => {
    setSaturation(value / 100)
    setInputMode('hsb')
  }, [])

  const handleBrightnessChange = useCallback((value: number) => {
    setBrightness(value / 100)
    setInputMode('hsb')
  }, [])

  // Handle HEX input
  const handleHexChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setHexInput(value)

    if (validateHex(value)) {
      const parsed = hexToHsb(value)
      if (parsed) {
        setHue(parsed.h)
        setSaturation(parsed.s)
        setBrightness(parsed.b)
        setInputMode('hex')
      }
    }
  }, [])

  // Handle RGB input
  const handleRgbChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setRgbInput(value)

    const parts = value.split(/\s+/).map(p => parseInt(p, 10))
    if (parts.length === 3 && parts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
      const hsb = require('../lib/colorUtils').rgbToHsb(parts[0], parts[1], parts[2])
      setHue(hsb.h)
      setSaturation(hsb.s)
      setBrightness(hsb.b)
      setInputMode('rgb')
    }
  }, [])

  // Trigger callback when color changes
  React.useEffect(() => {
    if (onColorSelect) {
      onColorSelect({
        h: currentHsb.h,
        s: currentHsb.s,
        b: currentHsb.b,
        hex: currentHex,
        rgb: `rgb(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b})`,
      })
    }
  }, [currentHsb, currentHex, currentRgb, onColorSelect])

  // Copy to clipboard
  const copyToClipboard = useCallback((text: string, format: string) => {
    navigator.clipboard.writeText(text)
    // Simple feedback (in production, use toast)
    console.log(`Copied ${format}: ${text}`)
  }, [])

  // Export as JSON
  const exportAsJson = useCallback(() => {
    const data = {
      hsb: {
        h: Math.round(currentHsb.h * 360),
        s: Math.round(currentHsb.s * 100),
        b: Math.round(currentHsb.b * 100),
      },
      hex: currentHex,
      rgb: currentRgb,
      css: currentCss,
      exported: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `color-${currentHex.slice(1)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [currentHsb, currentHex, currentRgb, currentCss])

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-gray-900 rounded-xl border border-gray-800">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">🎨 Real-Time Color Visualizer</h2>
        <p className="text-gray-400 text-sm">Manipulate HSB values and preview colors in real-time</p>
      </div>

      {/* Color Preview */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <div
          className="w-full h-40 rounded-lg border-2 border-gray-700 shadow-lg transition-colors"
          style={{ backgroundColor: currentCss }}
        />
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="text-xs text-gray-400">HEX</div>
          <div className="text-xs text-gray-400">RGB</div>
          <div className="text-xs text-gray-400">HSB</div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="text-sm font-mono text-white cursor-pointer hover:text-blue-400" onClick={() => copyToClipboard(currentHex, 'HEX')}>
            {currentHex.toUpperCase()}
          </div>
          <div className="text-sm font-mono text-white cursor-pointer hover:text-blue-400" onClick={() => copyToClipboard(`${currentRgb.r} ${currentRgb.g} ${currentRgb.b}`, 'RGB')}>
            {currentRgb.r} {currentRgb.g} {currentRgb.b}
          </div>
          <div className="text-sm font-mono text-white cursor-pointer hover:text-blue-400" onClick={() => copyToClipboard(formatHSBValues(currentHsb), 'HSB')}>
            {formatHSBValues(currentHsb)}
          </div>
        </div>
      </div>

      {/* HSB Sliders */}
      <div className="space-y-6 mb-6">
        {/* Hue Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold text-white">Hue</label>
            <span className="text-sm font-mono text-gray-400">{Math.round(hue * 360)}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={Math.round(hue * 360)}
            onChange={e => handleHueChange(parseFloat(e.target.value))}
            className="w-full h-3 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 to-red-500 rounded-lg appearance-none cursor-pointer slider-thumb"
            style={{
              background: `linear-gradient(to right,
                hsl(0, 100%, 50%),
                hsl(60, 100%, 50%),
                hsl(120, 100%, 50%),
                hsl(180, 100%, 50%),
                hsl(240, 100%, 50%),
                hsl(300, 100%, 50%),
                hsl(360, 100%, 50%))`,
            }}
          />
        </div>

        {/* Saturation Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold text-white">Saturation</label>
            <span className="text-sm font-mono text-gray-400">{Math.round(saturation * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(saturation * 100)}
            onChange={e => handleSaturationChange(parseFloat(e.target.value))}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer slider-thumb"
            style={{
              background: `linear-gradient(to right,
                rgb(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}),
                rgb(${Math.round((currentRgb.r + 255) / 2)}, ${Math.round((currentRgb.g + 255) / 2)}, ${Math.round((currentRgb.b + 255) / 2)}))`,
            }}
          />
        </div>

        {/* Brightness Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold text-white">Brightness</label>
            <span className="text-sm font-mono text-gray-400">{Math.round(brightness * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(brightness * 100)}
            onChange={e => handleBrightnessChange(parseFloat(e.target.value))}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer slider-thumb"
            style={{
              background: `linear-gradient(to right, #000000, rgb(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}))`,
            }}
          />
        </div>
      </div>

      {/* Input Mode Tabs */}
      {showAdvanced && (
        <div className="mb-6">
          <div className="flex gap-2 mb-3 border-b border-gray-700">
            {(['hsb', 'hex', 'rgb'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setInputMode(mode)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  inputMode === mode
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {mode.toUpperCase()}
              </button>
            ))}
          </div>

          {inputMode === 'hex' && (
            <input
              type="text"
              value={hexInput}
              onChange={handleHexChange}
              placeholder="#000000"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm font-mono"
            />
          )}

          {inputMode === 'rgb' && (
            <input
              type="text"
              value={rgbInput}
              onChange={handleRgbChange}
              placeholder="255 128 0"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm font-mono"
            />
          )}

          {inputMode === 'hsb' && (
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                min="0"
                max="360"
                value={Math.round(hue * 360)}
                onChange={e => handleHueChange(parseFloat(e.target.value))}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                placeholder="H"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={Math.round(saturation * 100)}
                onChange={e => handleSaturationChange(parseFloat(e.target.value))}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                placeholder="S"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={Math.round(brightness * 100)}
                onChange={e => handleBrightnessChange(parseFloat(e.target.value))}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                placeholder="B"
              />
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => copyToClipboard(currentHex, 'HEX')}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded transition-colors"
        >
          📋 Copy HEX
        </button>
        <button
          onClick={() => copyToClipboard(`${currentRgb.r} ${currentRgb.g} ${currentRgb.b}`, 'RGB')}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded transition-colors"
        >
          📋 Copy RGB
        </button>
        <button
          onClick={() => copyToClipboard(formatHSBValues(currentHsb), 'HSB')}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded transition-colors"
        >
          📋 Copy HSB
        </button>
        <button
          onClick={exportAsJson}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
        >
          📥 Export JSON
        </button>
      </div>
    </div>
  )
}
