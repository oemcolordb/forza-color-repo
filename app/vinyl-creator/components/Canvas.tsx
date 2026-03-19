import React, { useMemo } from 'react'
import { VinylDesign } from '../types/vinyl'

interface CanvasProps {
  design: VinylDesign
  selectedShapeId: string | null
  reconstructionMode: boolean
  shapesUpToStep: string[] | null
  onContextMenu: (_e: React.MouseEvent) => void
}

export default function Canvas({
  design,
  selectedShapeId,
  reconstructionMode,
  shapesUpToStep,
  onContextMenu,
}: CanvasProps) {
  const displayShapeIds = useMemo(() => {
    if (reconstructionMode && shapesUpToStep) {
      return new Set(shapesUpToStep)
    }
    return new Set(design.shapes.map(s => s.id))
  }, [reconstructionMode, shapesUpToStep, design])

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 600 500"
      onContextMenu={onContextMenu}
      className="select-none"
    >
      {/* Background */}
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#1e1b4b', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#2d1b69', stopOpacity: 1 }} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="600" height="500" fill="url(#bgGradient)" />

      {/* Grid pattern */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffffff" strokeWidth="0.1" opacity="0.1" />
        </pattern>
      </defs>
      <rect width="600" height="500" fill="url(#grid)" />

      {/* Render shapes */}
      {design.shapes.map((shape, _idx) => {
        const isVisible = displayShapeIds.has(shape.id)
        const isSelected = selectedShapeId === shape.id
        const isReconstructionHighlight = reconstructionMode && shapesUpToStep && shapesUpToStep.length === shapesUpToStep.indexOf(shape.id) + 1

        if (!isVisible) return null

        const opacity = reconstructionMode && !isReconstructionHighlight ? shape.opacity * 0.3 : shape.opacity

        return (
          <g
            key={shape.id}
            transform={`translate(${shape.transform.x},${shape.transform.y}) rotate(${shape.transform.rotation}) scale(${shape.transform.scaleX},${shape.transform.scaleY})`}
            filter={isReconstructionHighlight ? 'url(#glow)' : undefined}
            className="transition-all duration-300"
          >
            <path
              d={shape.pathData}
              fill={shape.color}
              opacity={opacity}
              stroke={isSelected ? '#FF00FF' : isReconstructionHighlight ? '#00FF00' : 'none'}
              strokeWidth={isSelected || isReconstructionHighlight ? '2' : '0'}
              className="cursor-pointer hover:opacity-100 transition-opacity"
              onContextMenu={onContextMenu}
            />
          </g>
        )
      })}

      {/* Info text for reconstruction */}
      {reconstructionMode && shapesUpToStep && (
        <text x="300" y="480" textAnchor="middle" fill="#9CA3AF" fontSize="12">
          Step {shapesUpToStep.length}/{design.buildOrder.length}
        </text>
      )}
    </svg>
  )
}
