'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { CarColor } from '../types'

interface AdvancedToolsProps {
  colors: CarColor[]
  isDarkMode: boolean
  isMobile: boolean
  onColorSelect: (_color: CarColor) => void
}

const AdvancedTools: React.FC<AdvancedToolsProps> = ({
  colors,
  isDarkMode,
  isMobile,
  onColorSelect,
}) => {
  const [activeTab, setActiveTab] = useState('analytics')
  const [exportFormat, setExportFormat] = useState('json')
  const [searchHex, setSearchHex] = useState('')
  const [comparisonColors, setComparisonColors] = useState<CarColor[]>([])

  // Color Analytics
  const analytics = useMemo(() => {
    const makeStats = colors.reduce(
      (acc, color) => {
        acc[color.make] = (acc[color.make] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const typeStats = colors.reduce(
      (acc, color) => {
        const type = color.colorType || 'Unknown'
        acc[type] = (acc[type] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const hueDistribution = colors.reduce(
      (acc, color) => {
        const hue = Math.floor(color.color1.h * 12) // 12 hue buckets
        const hueName = [
          'Red',
          'Orange',
          'Yellow',
          'Yellow-Green',
          'Green',
          'Blue-Green',
          'Cyan',
          'Blue',
          'Purple',
          'Magenta',
          'Pink',
          'Red-Pink',
        ][hue]
        acc[hueName] = (acc[hueName] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      total: colors.length,
      topMakes: Object.entries(makeStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5),
      topTypes: Object.entries(typeStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5),
      hueDistribution: Object.entries(hueDistribution).sort(([, a], [, b]) => b - a),
    }
  }, [colors])

  // HEX to HSB converter
  const hexToHsb = useCallback((hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const diff = max - min

    let h = 0
    if (diff !== 0) {
      switch (max) {
        case r:
          h = (g - b) / diff + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / diff + 2
          break
        case b:
          h = (r - g) / diff + 4
          break
      }
      h /= 6
    }

    const s = max === 0 ? 0 : diff / max

    return { h, s, b }
  }, [])

  // Find closest colors by HEX
  const findClosestColors = useCallback(
    (hex: string) => {
      if (!/^#[0-9A-F]{6}$/i.test(hex)) return []

      const targetHsb = hexToHsb(hex)

      return colors
        .map(color => ({
          color,
          distance: Math.sqrt(
            Math.pow(color.color1.h - targetHsb.h, 2) +
              Math.pow(color.color1.s - targetHsb.s, 2) +
              Math.pow(color.color1.b - targetHsb.b, 2)
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10)
        .map(item => item.color)
    },
    [colors, hexToHsb]
  )

  // Export functions
  const exportColors = useCallback(
    (format: string) => {
      let data: string
      let filename: string
      let mimeType: string

      switch (format) {
        case 'json':
          data = JSON.stringify(colors, null, 2)
          filename = 'forza-colors.json'
          mimeType = 'application/json'
          break
        case 'csv':
          const headers = 'Make,Model,Year,ColorName,ColorType,H1,S1,B1,H2,S2,B2'
          const rows = colors.map(
            c =>
              `"${c.make}","${c.model || ''}","${c.year || ''}","${c.colorName}","${c.colorType || ''}",${c.color1.h},${c.color1.s},${c.color1.b},${c.color2.h},${c.color2.s},${c.color2.b}`
          )
          data = [headers, ...rows].join('\n')
          filename = 'forza-colors.csv'
          mimeType = 'text/csv'
          break
        case 'palette':
          const palette = colors
            .slice(0, 100)
            .map(
              c =>
                `${c.colorName}: hsl(${c.color1.h * 360}, ${c.color1.s * 100}%, ${c.color1.b * 100}%)`
            )
            .join('\n')
          data = palette
          filename = 'forza-palette.txt'
          mimeType = 'text/plain'
          break
        default:
          return
      }

      const blob = new Blob([data], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    },
    [colors]
  )

  const tabs = [
    { id: 'analytics', name: '📊 Analytics', icon: '📊' },
    { id: 'search', name: '🔍 HEX Search', icon: '🔍' },
    { id: 'compare', name: '⚖️ Compare', icon: '⚖️' },
    { id: 'export', name: '💾 Export', icon: '💾' },
  ]

  return (
    <div
      className={`${isMobile ? 'p-3' : 'p-4'} rounded-lg ${
        isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'
      }`}
    >
      {/* Tab Navigation */}
      <div
        className={`flex ${isMobile ? 'flex-wrap gap-1' : 'gap-2'} mb-4 border-b ${
          isDarkMode ? 'border-gray-600' : 'border-gray-300'
        }`}
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'} rounded-t transition-colors ${
              activeTab === tab.id
                ? 'bamboo-button'
                : 'bamboo-button-ghost'
            }`}
          >
            {isMobile ? tab.icon : tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <h3
            className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}
          >
            📊 Color Database Analytics
          </h3>

          <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'}`}>
            <div className={`p-3 rounded ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
              <h4 className="font-medium mb-2">
                Top Manufacturers
              </h4>
              {analytics.topMakes.map(([make, count]) => (
                <div
                  key={make}
                  className="flex justify-between text-sm opacity-90"
                >
                  <span>{make}</span>
                  <span>{count} colors</span>
                </div>
              ))}
            </div>

            <div className={`p-3 rounded ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
              <h4 className="font-medium mb-2">
                Color Types
              </h4>
              {analytics.topTypes.map(([type, count]) => (
                <div
                  key={type}
                  className="flex justify-between text-sm opacity-90"
                >
                  <span>{type}</span>
                  <span>{count} colors</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-3 rounded ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
            <h4 className="font-medium mb-2">
              Hue Distribution
            </h4>
            <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-2 text-sm`}>
              {analytics.hueDistribution.slice(0, 8).map(([hue, count]) => (
                <div
                  key={hue}
                  className="flex justify-between opacity-90"
                >
                  <span>{hue}</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="space-y-4">
          <h3
            className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}
          >
            🔍 HEX Color Search
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="#FF0000"
              value={searchHex}
              onChange={e => setSearchHex(e.target.value.toUpperCase())}
              className="flex-1 px-3 py-2 rounded bamboo-input"
            />
            <div
              className="w-12 h-10 rounded border"
              style={{ backgroundColor: /^#[0-9A-F]{6}$/i.test(searchHex) ? searchHex : '#000000' }}
            />
          </div>

          {/^#[0-9A-F]{6}$/i.test(searchHex) && (
            <div className="space-y-2">
              <h4 className="font-medium">
                Closest Matches:
              </h4>
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-5'} gap-2`}>
                {findClosestColors(searchHex).map((color, index) => (
                  <button
                    key={index}
                    onClick={() => onColorSelect(color)}
                    className={`p-2 rounded border text-xs bamboo-surface-dark hover:opacity-80 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
                  >
                    <div
                      className="w-full h-8 rounded mb-1"
                      style={{
                        backgroundColor: `hsl(${color.color1.h * 360}, ${color.color1.s * 100}%, ${color.color1.b * 100}%)`,
                      }}
                    />
                    <div className="truncate opacity-90">
                      {color.colorName}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'compare' && (
        <div className="space-y-4">
          <h3
            className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}
          >
            ⚖️ Color Comparison
          </h3>

          <div className={`p-3 rounded ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
            <p className="text-sm opacity-90 mb-2">
              Click colors in the gallery to add them for comparison (max 4)
            </p>

            {comparisonColors.length > 0 ? (
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-2`}>
                {comparisonColors.map((color, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded border ${isDarkMode ? 'bamboo-surface-dark border-gray-600' : 'bamboo-surface border-gray-300'}`}
                  >
                    <div
                      className="w-full h-12 rounded mb-2"
                      style={{
                        backgroundColor: `hsl(${color.color1.h * 360}, ${color.color1.s * 100}%, ${color.color1.b * 100}%)`,
                      }}
                    />
                    <div className="text-xs opacity-90">
                      <div className="font-medium truncate">{color.colorName}</div>
                      <div>{color.make}</div>
                      <div>
                        H:{(color.color1.h * 360).toFixed(0)}° S:{(color.color1.s * 100).toFixed(0)}
                        % B:{(color.color1.b * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="text-center py-8 opacity-75"
              >
                No colors selected for comparison
              </div>
            )}

            {comparisonColors.length > 0 && (
              <button
                onClick={() => setComparisonColors([])}
                className="mt-3 px-3 py-1 text-sm rounded text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="space-y-4">
          <h3
            className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}
          >
            💾 Export Color Data
          </h3>

          <div className="space-y-3">
            <div>
              <label
                className="block text-sm font-medium mb-2"
              >
                Export Format:
              </label>
              <select
                value={exportFormat}
                onChange={e => setExportFormat(e.target.value)}
                aria-label="Export format"
                className="w-full px-3 py-2 bamboo-input"
              >
                <option value="json">JSON (Complete Data)</option>
                <option value="csv">CSV (Spreadsheet)</option>
                <option value="palette">Palette (Text)</option>
              </select>
            </div>

            <div className={`p-3 rounded ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}>
              <div className="text-sm opacity-90 mb-2">
                Export includes {colors.length.toLocaleString()} colors
              </div>
              <div className="text-xs opacity-75">
                {exportFormat === 'json' &&
                  'Complete color data with HSB values, manufacturer info, and metadata'}
                {exportFormat === 'csv' &&
                  'Spreadsheet format compatible with Excel, Google Sheets'}
                {exportFormat === 'palette' &&
                  'Color palette format for design applications (first 100 colors)'}
              </div>
            </div>

            <button
              onClick={() => exportColors(exportFormat)}
              className="w-full py-3 px-4 rounded font-medium transition-colors bamboo-button"
            >
              💾 Export {exportFormat.toUpperCase()}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedTools
