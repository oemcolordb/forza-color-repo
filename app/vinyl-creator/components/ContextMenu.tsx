import React, { useMemo, useRef, useEffect } from 'react'
import { VinylDesign, Shape } from '../types/vinyl'

interface ContextMenuProps {
  position: { x: number; y: number }
  design: VinylDesign
  groupMode: 'layer' | 'color' | 'role'
  selectedShapeId: string | null
  onSelectShape: (_shapeId: string) => void
  onStartReconstruction: (_shapeId: string) => void
  onClose: () => void
}

export default function ContextMenu({
  position,
  design,
  groupMode,
  selectedShapeId,
  onSelectShape,
  onStartReconstruction,
  onClose,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [adjustedPosition, setAdjustedPosition] = React.useState(position)

  // Adjust position to prevent off-screen rendering
  React.useLayoutEffect(() => {
    if (!menuRef.current) return

    // Small delay to allow DOM to render first
    const timer = requestAnimationFrame(() => {
      const menuRect = menuRef.current?.getBoundingClientRect()
      if (!menuRect) return

      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let x = position.x
      let y = position.y

      // Adjust for right edge
      if (x + menuRect.width > viewportWidth) {
        x = Math.max(10, viewportWidth - menuRect.width - 10)
      }

      // Adjust for bottom edge
      if (y + menuRect.height > viewportHeight) {
        y = Math.max(10, viewportHeight - menuRect.height - 10)
      }

      setAdjustedPosition({ x, y })
    })

    return () => cancelAnimationFrame(timer)
  }, [position])

  // Group shapes based on mode
  const groupedShapes = useMemo(() => {
    const groups: Record<string, Shape[]> = {}

    design.shapes.forEach(shape => {
      let key = ''
      if (groupMode === 'layer') {
        key = `Layer ${shape.layer}`
      } else if (groupMode === 'color') {
        key = shape.color
      } else {
        key = shape.role.charAt(0).toUpperCase() + shape.role.slice(1)
      }

      if (!groups[key]) groups[key] = []
      groups[key].push(shape)
    })

    return groups
  }, [design.shapes, groupMode])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className="fixed bg-slate-900 border border-purple-500 rounded-lg shadow-2xl z-50 max-w-sm"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
      }}
    >
      <div className="max-h-96 overflow-y-auto">
        {/* Group headers and shapes */}
        {Object.entries(groupedShapes).map(([groupName, shapes]) => (
          <div key={groupName} className="border-t border-slate-700 first:border-t-0">
            <div className="bg-slate-800/50 px-3 py-2 sticky top-0 text-xs font-semibold text-purple-300">
              {groupMode === 'color' ? (
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded border border-slate-600"
                    style={{ backgroundColor: groupName }}
                  />
                  {groupName}
                </div>
              ) : (
                groupName
              )}
            </div>

            {/* Shape items */}
            <div className="space-y-0">
              {shapes.map(shape => (
                <ShapeMenuItem
                  key={shape.id}
                  shape={shape}
                  isSelected={shape.id === selectedShapeId}
                  onSelect={() => onSelectShape(shape.id)}
                  onReconstruct={() => onStartReconstruction(shape.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 bg-slate-800/30 px-3 py-2 text-xs text-slate-400">
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          ✖ Close
        </button>
      </div>
    </div>
  )
}

function ShapeMenuItem({
  shape,
  isSelected,
  onSelect,
  onReconstruct,
}: {
  shape: Shape
  isSelected: boolean
  onSelect: () => void
  onReconstruct: () => void
}) {
  const roleIcons: Record<string, string> = {
    base: '🟢',
    accent: '🔵',
    shadow: '⚫',
    highlight: '⭐',
    detail: '📍',
  }

  return (
    <div
      className={`px-3 py-2 border-b border-slate-800 last:border-b-0 transition-colors cursor-pointer ${
        isSelected ? 'bg-purple-900/50' : 'hover:bg-slate-800/40'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-2 mb-1">
        {/* Thumbnail/color indicator */}
        <div
          className="w-6 h-6 rounded flex-shrink-0 border border-slate-600"
          style={{ backgroundColor: shape.color }}
        />

        {/* Shape info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-white truncate">{shape.name}</span>
            <span className="text-xs text-slate-500">{roleIcons[shape.role]}</span>
          </div>
          <div className="text-xs text-slate-400 space-x-1">
            <span>L{shape.layer}</span>
            <span>•</span>
            <span>{shape.role}</span>
          </div>
        </div>

        {/* Reconstruct button */}
        <button
          onClick={e => {
            e.stopPropagation()
            onReconstruct()
          }}
          className="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors flex-shrink-0 whitespace-nowrap"
        >
          ▶️
        </button>
      </div>

      {isSelected && (
        <div className="text-xs text-slate-400 ml-8">
          ✓ Selected
        </div>
      )}
    </div>
  )
}
