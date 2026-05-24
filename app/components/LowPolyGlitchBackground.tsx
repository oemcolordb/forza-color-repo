'use client'
import React, { useEffect, useRef, useCallback } from 'react'

interface LowPolyGlitchBackgroundProps {
  isDarkMode: boolean
}

interface Triangle {
  x1: number; y1: number
  x2: number; y2: number
  x3: number; y3: number
  baseColor: [number, number, number]
  alpha: number
  glitchOffset: number
  glitchPhase: number
}

const LowPolyGlitchBackground: React.FC<LowPolyGlitchBackgroundProps> = ({ isDarkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const trianglesRef = useRef<Triangle[]>([])

  const generateTriangles = useCallback((w: number, h: number): Triangle[] => {
    const tris: Triangle[] = []
    const cols = 14
    const rows = 10
    const cellW = w / cols
    const cellH = h / rows

    const paletteDark: [number, number, number][] = [
      [15, 10, 40],   [25, 15, 55],   [10, 25, 50],
      [35, 10, 45],   [5, 30, 45],    [20, 8, 60],
      [40, 15, 35],   [10, 40, 55],   [50, 20, 60],
      [8, 15, 35],
    ]
    const paletteLight: [number, number, number][] = [
      [200, 210, 230], [180, 195, 220], [190, 200, 240],
      [210, 200, 230], [175, 210, 225], [220, 210, 240],
      [195, 185, 215], [185, 215, 230], [225, 215, 235],
      [170, 200, 215],
    ]

    const palette = isDarkMode ? paletteDark : paletteLight

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cellW
        const y = r * cellH
        const jitter = () => (Math.random() - 0.5) * cellW * 0.4

        const p1 = { x: x + jitter(), y: y + jitter() }
        const p2 = { x: x + cellW + jitter(), y: y + jitter() }
        const p3 = { x: x + jitter(), y: y + cellH + jitter() }
        const p4 = { x: x + cellW + jitter(), y: y + cellH + jitter() }

        const color1 = palette[Math.floor(Math.random() * palette.length)]
        const color2 = palette[Math.floor(Math.random() * palette.length)]

        tris.push({
          x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, x3: p3.x, y3: p3.y,
          baseColor: color1, alpha: 0.6 + Math.random() * 0.4,
          glitchOffset: 0, glitchPhase: Math.random() * Math.PI * 2,
        })
        tris.push({
          x1: p2.x, y1: p2.y, x2: p4.x, y2: p4.y, x3: p3.x, y3: p3.y,
          baseColor: color2, alpha: 0.6 + Math.random() * 0.4,
          glitchOffset: 0, glitchPhase: Math.random() * Math.PI * 2,
        })
      }
    }
    return tris
  }, [isDarkMode])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      trianglesRef.current = generateTriangles(canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    let time = 0
    const render = () => {
      time += 0.016
      const w = canvas.width
      const h = canvas.height

      ctx.clearRect(0, 0, w, h)

      const tris = trianglesRef.current
      for (let i = 0; i < tris.length; i++) {
        const tri = tris[i]
        const glitchChance = Math.sin(time * 1.5 + tri.glitchPhase) > 0.92
        const colorShift = glitchChance ? Math.floor(Math.random() * 40) - 20 : 0
        const xShift = glitchChance ? (Math.random() - 0.5) * 12 : 0

        const flickerAlpha = tri.alpha + Math.sin(time * 0.8 + tri.glitchPhase) * 0.08

        const r = Math.min(255, Math.max(0, tri.baseColor[0] + colorShift))
        const g = Math.min(255, Math.max(0, tri.baseColor[1] + (glitchChance ? -colorShift : 0)))
        const b = Math.min(255, Math.max(0, tri.baseColor[2] + colorShift * 0.5))

        ctx.beginPath()
        ctx.moveTo(tri.x1 + xShift, tri.y1)
        ctx.lineTo(tri.x2 + xShift, tri.y2)
        ctx.lineTo(tri.x3 + xShift, tri.y3)
        ctx.closePath()
        ctx.fillStyle = `rgba(${r},${g},${b},${flickerAlpha})`
        ctx.fill()
      }

      // Horizontal glitch scanlines
      if (Math.random() > 0.93) {
        const glitchY = Math.random() * h
        const glitchH = 2 + Math.random() * 8
        const sliceData = ctx.getImageData(0, glitchY, w, glitchH)
        const offset = (Math.random() - 0.5) * 30
        ctx.putImageData(sliceData, offset, glitchY)
      }

      // Occasional full-screen color flash
      if (Math.random() > 0.985) {
        const flashColors = isDarkMode
          ? ['rgba(100,0,255,0.04)', 'rgba(0,255,200,0.03)', 'rgba(255,0,100,0.03)']
          : ['rgba(100,0,255,0.03)', 'rgba(0,200,255,0.02)', 'rgba(255,100,200,0.02)']
        ctx.fillStyle = flashColors[Math.floor(Math.random() * flashColors.length)]
        ctx.fillRect(0, 0, w, h)
      }

      // Scan line effect
      ctx.fillStyle = isDarkMode ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.02)'
      for (let sy = 0; sy < h; sy += 4) {
        ctx.fillRect(0, sy, w, 1)
      }

      animFrameRef.current = requestAnimationFrame(render)
    }

    animFrameRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [isDarkMode, generateTriangles])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: isDarkMode ? 0.6 : 0.4 }}
      aria-hidden
    />
  )
}

export default LowPolyGlitchBackground
