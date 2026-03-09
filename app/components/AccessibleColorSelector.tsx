'use client'

import React, { useState, useRef, useEffect } from 'react'
import { CarColor } from '../types'
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation'

interface AccessibleColorSelectorProps {
  colors: CarColor[]
  onSelect: (color: CarColor) => void
  isDarkMode: boolean
}

export default function AccessibleColorSelector({
  colors,
  onSelect,
  isDarkMode,
}: AccessibleColorSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [announceText, setAnnounceText] = useState('')
  const gridRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const COLS = 6
  const totalItems = colors.length

  // Keyboard navigation
  useKeyboardNavigation({
    onArrowUp: () => {
      const newIndex = Math.max(0, focusedIndex - COLS)
      setFocusedIndex(newIndex)
      announceColor(colors[newIndex])
    },
    onArrowDown: () => {
      const newIndex = Math.min(totalItems - 1, focusedIndex + COLS)
      setFocusedIndex(newIndex)
      announceColor(colors[newIndex])
    },
    onArrowLeft: () => {
      const newIndex = Math.max(0, focusedIndex - 1)
      setFocusedIndex(newIndex)
      announceColor(colors[newIndex])
    },
    onArrowRight: () => {
      const newIndex = Math.min(totalItems - 1, focusedIndex + 1)
      setFocusedIndex(newIndex)
      announceColor(colors[newIndex])
    },
    onEnter: () => {
      if (colors[focusedIndex]) {
        onSelect(colors[focusedIndex])
        setSelectedIndex(focusedIndex)
        announceSelection(colors[focusedIndex])
      }
    },
    enabled: true,
  })

  // Focus management
  useEffect(() => {
    itemRefs.current[focusedIndex]?.focus()
  }, [focusedIndex])

  const announceColor = (color: CarColor) => {
    setAnnounceText(
      `${color.colorName} by ${color.make}. ${color.colorType} finish. ` +
        `Hue ${Math.round(color.color1.h * 360)} degrees, ` +
        `Saturation ${Math.round(color.color1.s * 100)} percent, ` +
        `Brightness ${Math.round(color.color1.b * 100)} percent.`
    )
  }

  const announceSelection = (color: CarColor) => {
    setAnnounceText(`Selected ${color.colorName} by ${color.make}`)
  }

  return (
    <div
      ref={gridRef}
      role="grid"
      aria-label="Color selector grid"
      aria-rowcount={Math.ceil(totalItems / COLS)}
      aria-colcount={COLS}
      className="focus:outline-none"
      tabIndex={-1}
    >
      {/* Screen reader announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announceText}
      </div>

      {/* Instructions */}
      <div className={`mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
        <p className="text-sm font-semibold mb-1">Keyboard Navigation:</p>
        <ul className="text-xs space-y-1">
          <li>• Arrow keys: Navigate colors</li>
          <li>• Enter: Select color</li>
          <li>• Tab: Move to next section</li>
        </ul>
      </div>

      {/* Color Grid */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {colors.map((color, index) => {
          const row = Math.floor(index / COLS) + 1
          const col = (index % COLS) + 1
          const isFocused = index === focusedIndex
          const isSelected = index === selectedIndex

          return (
            <button
              key={`${color.make}-${color.colorName}-${index}`}
              ref={el => {
                itemRefs.current[index] = el
              }}
              role="gridcell"
              aria-rowindex={row}
              aria-colindex={col}
              aria-label={`${color.colorName} by ${color.make}, ${color.colorType} finish`}
              aria-selected={isSelected}
              tabIndex={isFocused ? 0 : -1}
              onClick={() => {
                onSelect(color)
                setSelectedIndex(index)
                setFocusedIndex(index)
                announceSelection(color)
              }}
              onFocus={() => {
                setFocusedIndex(index)
                announceColor(color)
              }}
              className={`
                relative aspect-square rounded-lg transition-all
                ${isFocused ? 'ring-4 ring-blue-500 ring-offset-2' : ''}
                ${isSelected ? 'ring-2 ring-green-500' : ''}
                ${isDarkMode ? 'ring-offset-slate-900' : 'ring-offset-white'}
                hover:scale-105 focus:outline-none
              `}
              style={{
                background: `hsl(${color.color1.h * 360}, ${color.color1.s * 100}%, ${color.color1.b * 100}%)`,
              }}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-2xl drop-shadow-lg" aria-hidden="true">
                    ✓
                  </span>
                </div>
              )}

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {color.colorName}
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected Color Info */}
      {colors[selectedIndex] && (
        <div
          className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}
          role="region"
          aria-label="Selected color information"
        >
          <h3 className="text-lg font-bold mb-2">Selected Color</h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="font-semibold">Name:</dt>
              <dd>{colors[selectedIndex].colorName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-semibold">Manufacturer:</dt>
              <dd>{colors[selectedIndex].make}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-semibold">Type:</dt>
              <dd>{colors[selectedIndex].colorType}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-semibold">HSB:</dt>
              <dd>
                H:{Math.round(colors[selectedIndex].color1.h * 360)}° S:
                {Math.round(colors[selectedIndex].color1.s * 100)}% B:
                {Math.round(colors[selectedIndex].color1.b * 100)}%
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  )
}
