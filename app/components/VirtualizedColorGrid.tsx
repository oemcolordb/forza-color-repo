'use client'

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import ColorCard from './ColorCard'
import { CarColor } from '../types'

interface VirtualizedColorGridProps {
  colors: CarColor[]
  favorites: string[]
  onColorSelect: (color: CarColor) => void
  onToggleFavorite: (colorId: string) => void
  isDarkMode: boolean
  showManufacturerBorders?: boolean
}

const VirtualizedColorGrid: React.FC<VirtualizedColorGridProps> = React.memo(
  ({
    colors,
    favorites,
    onColorSelect,
    onToggleFavorite,
    isDarkMode,
    showManufacturerBorders = true,
  }) => {
    const [scrollTop, setScrollTop] = useState(0)
    const [containerHeight, setContainerHeight] = useState(800)
    const [selectedColors, setSelectedColors] = useState(new Set<string>())
    const [sortBy, setSortBy] = useState('manufacturer')
    const containerRef = useRef<HTMLDivElement>(null)

    const ITEM_HEIGHT = 160
    const ITEMS_PER_ROW = 6
    const OVERSCAN = 5

    // Advanced sorting
    const processedColors = useMemo(() => {
      const sorted = [...colors]

      switch (sortBy) {
        case 'manufacturer':
          sorted.sort(
            (a, b) => a.make.localeCompare(b.make) || a.colorName.localeCompare(b.colorName)
          )
          break
        case 'hue':
          sorted.sort((a, b) => (a.color1?.h || 0) - (b.color1?.h || 0))
          break
        case 'brightness':
          sorted.sort((a, b) => (b.color1?.b || 0) - (a.color1?.b || 0))
          break
        case 'saturation':
          sorted.sort((a, b) => (b.color1?.s || 0) - (a.color1?.s || 0))
          break
        case 'year':
          sorted.sort((a, b) => (b.year || 0) - (a.year || 0))
          break
      }

      return sorted
    }, [colors, sortBy])

    // True virtualization calculations
    const totalRows = Math.ceil(processedColors.length / ITEMS_PER_ROW)
    const totalHeight = totalRows * ITEM_HEIGHT

    const startRow = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN)
    const endRow = Math.min(
      totalRows,
      Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN
    )

    // Ensure we always show at least some rows initially
    const safeStartRow = containerHeight > 0 ? startRow : 0
    const safeEndRow = containerHeight > 0 ? endRow : Math.min(10, totalRows)

    const visibleItems = useMemo(() => {
      const items = []
      for (let row = safeStartRow; row < safeEndRow; row++) {
        const startIndex = row * ITEMS_PER_ROW
        const endIndex = Math.min(startIndex + ITEMS_PER_ROW, processedColors.length)

        for (let i = startIndex; i < endIndex; i++) {
          if (processedColors[i]) {
            items.push({
              color: processedColors[i],
              index: i,
              row,
              col: i % ITEMS_PER_ROW,
              top: row * ITEM_HEIGHT,
            })
          }
        }
      }
      return items
    }, [processedColors, safeStartRow, safeEndRow, ITEMS_PER_ROW, ITEM_HEIGHT])

    // Scroll handler
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop)
    }, [])

    // Resize observer
    useEffect(() => {
      if (!containerRef.current) return

      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          setContainerHeight(entry.contentRect.height)
        }
      })

      resizeObserver.observe(containerRef.current)
      return () => resizeObserver.disconnect()
    }, [])

    // Bulk selection handlers
    const toggleColorSelection = useCallback((colorId: string) => {
      setSelectedColors(prev => {
        const newSet = new Set(prev)
        if (newSet.has(colorId)) {
          newSet.delete(colorId)
        } else {
          newSet.add(colorId)
        }
        return newSet
      })
    }, [])

    const selectAll = useCallback(() => {
      setSelectedColors(
        new Set(processedColors.map(c => `${c.make}-${c.colorName}-${c.year || 'unknown'}`))
      )
    }, [processedColors])

    const clearSelection = useCallback(() => {
      setSelectedColors(new Set())
    }, [])

    // Keyboard navigation
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) {
          switch (e.key) {
            case 'a':
              e.preventDefault()
              selectAll()
              break
            case 'd':
              e.preventDefault()
              clearSelection()
              break
          }
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectAll, clearSelection])

    // Debug info
    console.log('VirtualizedColorGrid render:', {
      colorsLength: colors.length,
      processedLength: processedColors.length,
      visibleItemsLength: visibleItems.length,
      containerHeight,
      totalHeight,
    })

    if (colors.length === 0) {
      return (
        <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          No colors available
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* Advanced Controls */}
        <div
          className={`flex flex-wrap items-center gap-2 p-3 rounded-lg border ${
            isDarkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-gray-50 border-gray-300'
          }`}
        >
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className={`text-xs px-2 py-1 rounded border ${
              isDarkMode
                ? 'bg-slate-700 text-white border-slate-600'
                : 'bg-white text-gray-900 border-gray-300'
            }`}
          >
            <option value="manufacturer">🏭 Manufacturer</option>
            <option value="hue">🌈 Hue</option>
            <option value="brightness">☀️ Brightness</option>
            <option value="saturation">🎨 Saturation</option>
            <option value="year">📅 Year</option>
          </select>

          {selectedColors.size > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs">{selectedColors.size} selected</span>
              <button
                onClick={clearSelection}
                className={`text-xs px-2 py-1 rounded ${
                  isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                } text-white`}
              >
                Clear
              </button>
              <button
                onClick={() => {
                  selectedColors.forEach(colorId => {
                    onToggleFavorite(colorId)
                  })
                }}
                className={`text-xs px-2 py-1 rounded ${
                  isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
              >
                ❤️ Favorite All
              </button>
            </div>
          )}
        </div>

        {/* Virtualized Container */}
        <div
          ref={containerRef}
          className="relative overflow-auto"
          style={{ height: '70vh' }}
          onScroll={handleScroll}
        >
          <div style={{ height: totalHeight, position: 'relative' }}>
            {visibleItems.map(({ color, index, top }) => {
              const colorId = `${color.make}-${color.colorName}-${color.year || 'unknown'}`
              const isFavorite = favorites.includes(colorId)
              const isSelected = selectedColors.has(colorId)

              return (
                <div
                  key={`${colorId}-${index}`}
                  style={{
                    position: 'absolute',
                    top,
                    left: `${(index % ITEMS_PER_ROW) * (100 / ITEMS_PER_ROW)}%`,
                    width: `${100 / ITEMS_PER_ROW}%`,
                    height: ITEM_HEIGHT,
                    padding: '4px',
                  }}
                >
                  <div
                    className={`relative h-full ${
                      isSelected ? 'ring-2 ring-blue-500 ring-opacity-75' : ''
                    }`}
                    onClick={e => {
                      if (e.ctrlKey || e.metaKey) {
                        e.preventDefault()
                        toggleColorSelection(colorId)
                      }
                    }}
                  >
                    {isSelected && (
                      <div className="absolute top-1 right-1 z-10 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                    <ColorCard
                      color={color}
                      onSelect={onColorSelect}
                      isFavorite={isFavorite}
                      onToggleFavorite={() => onToggleFavorite(colorId)}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Performance Stats */}
        <div className={`text-xs opacity-60 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Showing {visibleItems.length} of {processedColors.length} colors • Rows {safeStartRow}-
          {safeEndRow} of {totalRows}
        </div>
      </div>
    )
  }
)

VirtualizedColorGrid.displayName = 'VirtualizedColorGrid'

export default VirtualizedColorGrid
