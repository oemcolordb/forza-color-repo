'use client'
import React, { useRef, useEffect, useMemo } from 'react'

// ─── TelemetryMap ────────────────────────────────────────────────────────────
// Uses <canvas> for high-performance rendering (#5).
// Draws previous lap in muted colour and current lap in bright colour (#14).
// Re-draws only when coords arrays change (memoised draw call).

const WIDTH  = 600
const HEIGHT = 300
const PAD    = 20  // px padding inside canvas

function projectCoords(coords: [number, number][], w: number, h: number) {
  if (!coords || coords.length < 2) return []
  const xs = coords.map(c => c[0])
  const ys = coords.map(c => c[1])
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1
  const drawW = w - PAD * 2
  const drawH = h - PAD * 2
  const scale  = Math.min(drawW / rangeX, drawH / rangeY)
  const offX   = PAD + (drawW - rangeX * scale) / 2
  const offY   = PAD + (drawH - rangeY * scale) / 2
  return coords.map(([x, y]) => [
    offX + (x - minX) * scale,
    offY + (y - minY) * scale,
  ])
}

function drawPath(ctx: CanvasRenderingContext2D, points: number[][], color: string, lineWidth: number) {
  if (points.length < 2) return
  ctx.beginPath()
  ctx.moveTo(points[0][0], points[0][1])
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1])
  }
  ctx.strokeStyle = color
  ctx.lineWidth   = lineWidth
  ctx.lineCap     = 'round'
  ctx.lineJoin    = 'round'
  ctx.stroke()
}

type Coord = [number, number]

interface TelemetryMapProps {
  lapCoords: Coord[]
  prevLapCoords: Coord[]
}

const TelemetryMap = React.memo<TelemetryMapProps>(function TelemetryMap({ lapCoords, prevLapCoords }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Project both sets of coords once per change
  const projected    = useMemo(() => projectCoords(lapCoords,     WIDTH, HEIGHT), [lapCoords])
  const projectedPrev = useMemo(() => projectCoords(prevLapCoords, WIDTH, HEIGHT), [prevLapCoords])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, WIDTH, HEIGHT)

    // Background
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    // Previous lap — grey (#14)
    if (projectedPrev.length > 1) {
      drawPath(ctx, projectedPrev, 'rgba(148,163,184,0.35)', 1.5)
    }

    // Current lap — bright green/orange gradient by progress
    if (projected.length > 1) {
      drawPath(ctx, projected, '#22c55e', 2)

      // Current car position dot
      const [cx, cy] = projected[projected.length - 1]
      ctx.beginPath()
      ctx.arc(cx, cy, 5, 0, Math.PI * 2)
      ctx.fillStyle = '#ef4444'
      ctx.fill()
    }

    // Label
    ctx.fillStyle = 'rgba(148,163,184,0.6)'
    ctx.font      = '10px monospace'
    ctx.fillText('MAP TRACE', PAD, HEIGHT - 6)
    if (prevLapCoords.length > 1) {
      ctx.fillStyle = 'rgba(148,163,184,0.4)'
      ctx.fillText('— prev lap', 100, HEIGHT - 6)
    }
  }, [projected, projectedPrev, prevLapCoords.length])

  return (
    <div className="p-3 rounded bamboo-surface-dark">
      <div className="text-sm text-white/70 mb-2">Live Map Trace</div>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        className="w-full rounded"
        style={{ imageRendering: 'pixelated', maxHeight: 240 }}
      />
      <div className="flex gap-4 mt-1 text-xs text-white/40">
        <span><span className="inline-block w-3 h-0.5 bg-green-500 mr-1 align-middle" />Current lap ({lapCoords.length} pts)</span>
        {prevLapCoords.length > 1 && <span><span className="inline-block w-3 h-0.5 bg-slate-400 mr-1 align-middle opacity-40" />Previous lap</span>}
      </div>
    </div>
  )
})

export default TelemetryMap
