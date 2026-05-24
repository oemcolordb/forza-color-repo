'use client'
import React, { useEffect, useRef, useCallback } from 'react'

interface LowPolyGlitchBackgroundProps {
  isDarkMode: boolean
}

interface MountainLayer {
  points: number[]
  color: string
  glowColor: string
}

interface Particle {
  x: number
  y: number
  size: number
  speed: number
  alpha: number
  phase: number
  color: string
}

const PIXEL_SIZE = 4

const LowPolyGlitchBackground: React.FC<LowPolyGlitchBackgroundProps> = ({ isDarkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const sceneRef = useRef<{
    mountains: MountainLayer[]
    particles: Particle[]
    stars: { x: number; y: number; size: number; phase: number }[]
  } | null>(null)

  const generateScene = useCallback((w: number, h: number) => {
    const mountains: MountainLayer[] = []
    const horizon = h * 0.45

    const darkColors = [
      { color: 'rgb(25,10,50)', glow: 'rgba(80,40,120,0.3)' },
      { color: 'rgb(30,15,60)', glow: 'rgba(100,50,150,0.2)' },
      { color: 'rgb(18,25,55)', glow: 'rgba(60,80,140,0.2)' },
      { color: 'rgb(22,30,52)', glow: 'rgba(50,100,130,0.15)' },
      { color: 'rgb(15,35,50)', glow: 'rgba(40,120,140,0.1)' },
    ]
    const lightColors = [
      { color: 'rgb(160,140,190)', glow: 'rgba(180,160,210,0.3)' },
      { color: 'rgb(150,155,200)', glow: 'rgba(170,175,220,0.2)' },
      { color: 'rgb(140,165,195)', glow: 'rgba(160,185,215,0.2)' },
      { color: 'rgb(135,175,190)', glow: 'rgba(155,195,210,0.15)' },
      { color: 'rgb(130,180,185)', glow: 'rgba(150,200,205,0.1)' },
    ]
    const colors = isDarkMode ? darkColors : lightColors

    for (let layer = 0; layer < 5; layer++) {
      const layerHorizon = horizon - (4 - layer) * (h * 0.06)
      const amplitude = h * (0.12 - layer * 0.015)
      const segments = 12 + layer * 3
      const points: number[] = []

      for (let i = 0; i <= segments; i++) {
        const x = (i / segments) * w
        let y = layerHorizon
        const baseFreq = 2 + layer * 0.5
        y -= amplitude * Math.sin((i / segments) * Math.PI * baseFreq) *
             (0.5 + 0.5 * Math.cos((i / segments) * Math.PI * 1.3))
        y -= (Math.random() - 0.3) * amplitude * 0.4
        points.push(x, y)
      }
      mountains.push({ points, color: colors[layer].color, glowColor: colors[layer].glow })
    }

    const particleColors = isDarkMode
      ? ['rgba(120,180,255,', 'rgba(200,140,255,', 'rgba(100,220,200,', 'rgba(255,180,200,']
      : ['rgba(80,120,200,', 'rgba(150,100,200,', 'rgba(60,180,160,', 'rgba(200,130,160,']

    const particles: Particle[] = []
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.5,
        size: 1 + Math.random() * 2.5,
        speed: 0.15 + Math.random() * 0.4,
        alpha: 0.3 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
      })
    }

    const stars: { x: number; y: number; size: number; phase: number }[] = []
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * horizon * 0.7,
        size: 1 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
      })
    }

    sceneRef.current = { mountains, particles, stars }
  }, [isDarkMode])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      generateScene(canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    let time = 0
    const render = () => {
      time += 0.012
      const w = canvas.width
      const h = canvas.height
      const scene = sceneRef.current
      if (!scene) { animFrameRef.current = requestAnimationFrame(render); return }

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.5)
      if (isDarkMode) {
        skyGrad.addColorStop(0, '#0a0515')
        skyGrad.addColorStop(0.3, '#12082a')
        skyGrad.addColorStop(0.6, '#1a1040')
        skyGrad.addColorStop(1, '#1e1845')
      } else {
        skyGrad.addColorStop(0, '#c8b8e0')
        skyGrad.addColorStop(0.3, '#b8c0e8')
        skyGrad.addColorStop(0.6, '#a8cce8')
        skyGrad.addColorStop(1, '#98d0e0')
      }
      ctx.fillStyle = skyGrad
      ctx.fillRect(0, 0, w, h)

      // Water / lower area
      const waterGrad = ctx.createLinearGradient(0, h * 0.45, 0, h)
      if (isDarkMode) {
        waterGrad.addColorStop(0, '#0d1530')
        waterGrad.addColorStop(0.4, '#0a1228')
        waterGrad.addColorStop(1, '#060d1e')
      } else {
        waterGrad.addColorStop(0, '#90b8d0')
        waterGrad.addColorStop(0.4, '#80aac5')
        waterGrad.addColorStop(1, '#70a0b8')
      }
      ctx.fillStyle = waterGrad
      ctx.fillRect(0, h * 0.45, w, h * 0.55)

      // Stars (dark mode twinkle)
      if (isDarkMode) {
        for (const star of scene.stars) {
          const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(time * 0.8 + star.phase))
          ctx.fillStyle = `rgba(200,210,255,${twinkle * 0.6})`
          ctx.fillRect(
            Math.floor(star.x / PIXEL_SIZE) * PIXEL_SIZE,
            Math.floor(star.y / PIXEL_SIZE) * PIXEL_SIZE,
            Math.ceil(star.size / PIXEL_SIZE) * PIXEL_SIZE,
            Math.ceil(star.size / PIXEL_SIZE) * PIXEL_SIZE
          )
        }
      }

      // Draw mountains as low-poly stepped shapes
      for (let mi = 0; mi < scene.mountains.length; mi++) {
        const mt = scene.mountains[mi]
        const pts = mt.points

        // Subtle vertical shift for parallax
        const drift = Math.sin(time * 0.3 + mi * 0.7) * 2

        ctx.beginPath()
        ctx.moveTo(0, h)
        for (let i = 0; i < pts.length; i += 2) {
          const px = Math.floor(pts[i] / PIXEL_SIZE) * PIXEL_SIZE
          const py = Math.floor((pts[i + 1] + drift) / PIXEL_SIZE) * PIXEL_SIZE
          if (i === 0) ctx.lineTo(px, py)
          else {
            // Stepped pixel-art edges
            const prevX = Math.floor(pts[i - 2] / PIXEL_SIZE) * PIXEL_SIZE
            const prevY = Math.floor((pts[i - 1] + drift) / PIXEL_SIZE) * PIXEL_SIZE
            ctx.lineTo(prevX, py)
            ctx.lineTo(px, py)
          }
        }
        ctx.lineTo(w, h)
        ctx.closePath()
        ctx.fillStyle = mt.color
        ctx.fill()

        // Glow on mountain edges
        ctx.strokeStyle = mt.glowColor
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Water reflection lines
      const reflHorizon = h * 0.46
      for (let ry = reflHorizon; ry < h; ry += PIXEL_SIZE * 3) {
        const reflAlpha = 0.02 + 0.04 * Math.sin(time * 0.5 + ry * 0.02)
        const waveOffset = Math.sin(time * 0.8 + ry * 0.05) * 8
        ctx.fillStyle = isDarkMode
          ? `rgba(80,120,180,${reflAlpha})`
          : `rgba(120,160,200,${reflAlpha})`
        const lineW = w * (0.3 + 0.4 * Math.sin(time * 0.3 + ry * 0.01))
        const lineX = (w - lineW) / 2 + waveOffset
        ctx.fillRect(
          Math.floor(lineX / PIXEL_SIZE) * PIXEL_SIZE,
          Math.floor(ry / PIXEL_SIZE) * PIXEL_SIZE,
          Math.floor(lineW / PIXEL_SIZE) * PIXEL_SIZE,
          PIXEL_SIZE
        )
      }

      // Floating particles
      for (const p of scene.particles) {
        p.x += p.speed * 0.3
        p.y += Math.sin(time + p.phase) * 0.2
        if (p.x > w + 10) p.x = -10
        if (p.y < 0) p.y = h * 0.4
        if (p.y > h * 0.5) p.y = 0

        const pAlpha = p.alpha * (0.5 + 0.5 * Math.sin(time * 1.2 + p.phase))
        ctx.fillStyle = p.color + pAlpha + ')'
        const px = Math.floor(p.x / PIXEL_SIZE) * PIXEL_SIZE
        const py = Math.floor(p.y / PIXEL_SIZE) * PIXEL_SIZE
        const ps = Math.ceil(p.size / PIXEL_SIZE) * PIXEL_SIZE
        ctx.fillRect(px, py, ps, ps)
      }

      // Ambient glow (sun/moon area)
      const glowX = w * 0.7
      const glowY = h * 0.15
      const glowGrad = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, h * 0.25)
      if (isDarkMode) {
        glowGrad.addColorStop(0, 'rgba(120,80,200,0.12)')
        glowGrad.addColorStop(0.5, 'rgba(80,60,160,0.06)')
        glowGrad.addColorStop(1, 'rgba(40,20,80,0)')
      } else {
        glowGrad.addColorStop(0, 'rgba(255,200,150,0.15)')
        glowGrad.addColorStop(0.5, 'rgba(255,180,130,0.08)')
        glowGrad.addColorStop(1, 'rgba(255,160,110,0)')
      }
      ctx.fillStyle = glowGrad
      ctx.fillRect(0, 0, w, h * 0.5)

      // === Pixel art glitch effects ===

      // Occasional horizontal pixel-slice glitch
      if (Math.random() > 0.95) {
        const glitchY = Math.floor((Math.random() * h) / PIXEL_SIZE) * PIXEL_SIZE
        const glitchH = PIXEL_SIZE * (1 + Math.floor(Math.random() * 3))
        const safeY = Math.max(0, Math.min(h - glitchH, glitchY))
        if (safeY >= 0 && safeY + glitchH <= h) {
          const sliceData = ctx.getImageData(0, safeY, w, glitchH)
          const offset = Math.floor((Math.random() - 0.5) * 6) * PIXEL_SIZE
          ctx.putImageData(sliceData, offset, safeY)
        }
      }

      // RGB channel split glitch
      if (Math.random() > 0.97) {
        const gy = Math.floor((Math.random() * h) / PIXEL_SIZE) * PIXEL_SIZE
        const gh = PIXEL_SIZE * (2 + Math.floor(Math.random() * 4))
        const safeGy = Math.max(0, Math.min(h - gh, gy))
        if (safeGy >= 0 && safeGy + gh <= h) {
          ctx.fillStyle = 'rgba(255,0,100,0.06)'
          ctx.fillRect(PIXEL_SIZE * 2, safeGy, w, gh)
          ctx.fillStyle = 'rgba(0,100,255,0.06)'
          ctx.fillRect(-PIXEL_SIZE * 2, safeGy, w, gh)
        }
      }

      // CRT scanlines
      ctx.fillStyle = isDarkMode ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.02)'
      for (let sy = 0; sy < h; sy += PIXEL_SIZE * 2) {
        ctx.fillRect(0, sy, w, 1)
      }

      // Subtle pixel grid overlay
      ctx.strokeStyle = isDarkMode ? 'rgba(255,255,255,0.008)' : 'rgba(0,0,0,0.006)'
      ctx.lineWidth = 0.5
      for (let gx = 0; gx < w; gx += PIXEL_SIZE * 8) {
        ctx.beginPath()
        ctx.moveTo(gx, 0)
        ctx.lineTo(gx, h)
        ctx.stroke()
      }

      animFrameRef.current = requestAnimationFrame(render)
    }

    animFrameRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [isDarkMode, generateScene])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        opacity: isDarkMode ? 0.7 : 0.5,
        imageRendering: 'pixelated',
      }}
      aria-hidden
    />
  )
}

export default LowPolyGlitchBackground
