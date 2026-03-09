'use client'
import React, { useRef, useEffect, useState } from 'react'

export const CarStatsRadarChart = ({ stats, size = 200, isDarkMode = true }) => {
  const canvasRef = useRef(null)
  const [hoveredStat, setHoveredStat] = useState(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = size / 2
    const centerY = size / 2
    const radius = size * 0.35

    ctx.clearRect(0, 0, size, size)

    const statLabels = ['Speed', 'Handle', 'Accel', 'Launch', 'Brake', 'Offroad']
    const statValues = [
      stats.speed,
      stats.handling,
      stats.acceleration,
      stats.launch,
      stats.braking,
      stats.offroad,
    ]
    const maxValue = 10

    // Background circles with better styling
    ctx.strokeStyle = isDarkMode ? '#444' : '#ddd'
    ctx.lineWidth = 1
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, (radius * i) / 5, 0, 2 * Math.PI)
      ctx.stroke()
    }

    // Axes with improved styling
    ctx.strokeStyle = isDarkMode ? '#666' : '#bbb'
    ctx.lineWidth = 1
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 - Math.PI / 2
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle))
      ctx.stroke()
    }

    // Labels with better positioning and styling
    ctx.fillStyle = isDarkMode ? '#fff' : '#333'
    ctx.font = 'bold 10px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 - Math.PI / 2
      const labelX = centerX + (radius + 25) * Math.cos(angle)
      const labelY = centerY + (radius + 25) * Math.sin(angle)

      // Highlight hovered stat
      if (hoveredStat === i) {
        ctx.fillStyle = '#0096ff'
        ctx.font = 'bold 11px Arial'
      } else {
        ctx.fillStyle = isDarkMode ? '#fff' : '#333'
        ctx.font = 'bold 10px Arial'
      }

      ctx.fillText(statLabels[i], labelX, labelY)

      // Add stat values
      ctx.fillStyle = isDarkMode ? '#aaa' : '#666'
      ctx.font = '8px Arial'
      ctx.fillText(statValues[i].toFixed(1), labelX, labelY + 12)
    }

    // Enhanced data polygon with gradient
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
    gradient.addColorStop(0, 'rgba(0, 150, 255, 0.4)')
    gradient.addColorStop(1, 'rgba(0, 150, 255, 0.1)')

    ctx.fillStyle = gradient
    ctx.strokeStyle = '#0096ff'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 - Math.PI / 2
      const value = Math.min(statValues[i], maxValue) / maxValue
      const x = centerX + radius * value * Math.cos(angle)
      const y = centerY + radius * value * Math.sin(angle)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Enhanced data points
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 - Math.PI / 2
      const value = Math.min(statValues[i], maxValue) / maxValue
      const x = centerX + radius * value * Math.cos(angle)
      const y = centerY + radius * value * Math.sin(angle)

      // Outer glow
      ctx.fillStyle = 'rgba(0, 150, 255, 0.3)'
      ctx.beginPath()
      ctx.arc(x, y, hoveredStat === i ? 8 : 6, 0, 2 * Math.PI)
      ctx.fill()

      // Inner point
      ctx.fillStyle = '#0096ff'
      ctx.beginPath()
      ctx.arc(x, y, hoveredStat === i ? 5 : 3, 0, 2 * Math.PI)
      ctx.fill()
    }

    // Center point
    ctx.fillStyle = isDarkMode ? '#333' : '#ddd'
    ctx.beginPath()
    ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI)
    ctx.fill()
  }, [stats, size, isDarkMode, hoveredStat])

  const handleMouseMove = event => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const centerX = size / 2
    const centerY = size / 2
    const radius = size * 0.35

    // Check if mouse is near any stat point
    let nearestStat = null
    let minDistance = Infinity

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 - Math.PI / 2
      const value =
        Math.min(
          [
            stats.speed,
            stats.handling,
            stats.acceleration,
            stats.launch,
            stats.braking,
            stats.offroad,
          ][i],
          10
        ) / 10
      const pointX = centerX + radius * value * Math.cos(angle)
      const pointY = centerY + radius * value * Math.sin(angle)

      const distance = Math.sqrt((x - pointX) ** 2 + (y - pointY) ** 2)
      if (distance < 15 && distance < minDistance) {
        minDistance = distance
        nearestStat = i
      }
    }

    setHoveredStat(nearestStat)
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredStat(null)}
        className="cursor-pointer"
      />
      {hoveredStat !== null && (
        <div
          className={`absolute top-0 left-full ml-2 p-2 rounded shadow-lg z-10 ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black border'
          }`}
        >
          <div className="font-bold text-sm">
            {['Speed', 'Handling', 'Acceleration', 'Launch', 'Braking', 'Offroad'][hoveredStat]}
          </div>
          <div className="text-lg font-bold text-blue-500">
            {[
              stats.speed,
              stats.handling,
              stats.acceleration,
              stats.launch,
              stats.braking,
              stats.offroad,
            ][hoveredStat].toFixed(1)}
            /10
          </div>
        </div>
      )}
    </div>
  )
}
