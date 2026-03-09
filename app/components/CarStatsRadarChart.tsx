'use client'

import React from 'react'

interface CarStats {
  speed: number
  handling: number
  acceleration: number
  launch: number
  braking: number
  offroad: number
}

interface CarStatsRadarChartProps {
  stats: CarStats
  size?: number
  isDarkMode?: boolean
}

export function CarStatsRadarChart({
  stats,
  size = 200,
  isDarkMode = true,
}: CarStatsRadarChartProps) {
  const center = size / 2
  const radius = size / 2 - 20
  const maxValue = 10

  const statKeys = ['speed', 'handling', 'acceleration', 'launch', 'braking', 'offroad'] as const
  const statLabels = ['SPD', 'HAN', 'ACC', 'LAU', 'BRA', 'OFF']

  const points = statKeys.map((key, index) => {
    const angle = (index * 60 - 90) * (Math.PI / 180)
    const value = stats[key] / maxValue
    const x = center + Math.cos(angle) * radius * value
    const y = center + Math.sin(angle) * radius * value
    return { x, y, value: stats[key] }
  })

  const gridLines = [0.2, 0.4, 0.6, 0.8, 1.0].map(scale => {
    return statKeys.map((_, index) => {
      const angle = (index * 60 - 90) * (Math.PI / 180)
      const x = center + Math.cos(angle) * radius * scale
      const y = center + Math.sin(angle) * radius * scale
      return { x, y }
    })
  })

  const axisLines = statKeys.map((_, index) => {
    const angle = (index * 60 - 90) * (Math.PI / 180)
    const x = center + Math.cos(angle) * radius
    const y = center + Math.sin(angle) * radius
    return { x, y, label: statLabels[index] }
  })

  const pathData =
    points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ') +
    ' Z'

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid lines */}
        {gridLines.map((line, gridIndex) => (
          <polygon
            key={gridIndex}
            points={line.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={isDarkMode ? '#374151' : '#d1d5db'}
            strokeWidth="1"
            opacity={0.3}
          />
        ))}

        {/* Axis lines */}
        {axisLines.map((axis, index) => (
          <g key={index}>
            <line
              x1={center}
              y1={center}
              x2={axis.x}
              y2={axis.y}
              stroke={isDarkMode ? '#6b7280' : '#9ca3af'}
              strokeWidth="1"
              opacity={0.5}
            />
            <text
              x={axis.x + (axis.x - center) * 0.15}
              y={axis.y + (axis.y - center) * 0.15}
              textAnchor="middle"
              dominantBaseline="middle"
              className={`text-xs font-medium ${isDarkMode ? 'fill-gray-300' : 'fill-gray-600'}`}
            >
              {axis.label}
            </text>
          </g>
        ))}

        {/* Data area */}
        <path
          d={pathData}
          fill={isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(37, 99, 235, 0.3)'}
          stroke={isDarkMode ? '#3b82f6' : '#2563eb'}
          strokeWidth="2"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={isDarkMode ? '#3b82f6' : '#2563eb'}
            stroke={isDarkMode ? '#1f2937' : '#ffffff'}
            strokeWidth="2"
          />
        ))}

        {/* Center point */}
        <circle cx={center} cy={center} r="2" fill={isDarkMode ? '#6b7280' : '#9ca3af'} />
      </svg>
    </div>
  )
}
