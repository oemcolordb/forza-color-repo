'use client'

/**
 * 🌿 EasterEgg420 — hidden throughout the app.
 *
 * Easter eggs:
 *  1.  Konami code (↑↑↓↓←→←→BA) → 5-second weed-leaf rain shower
 *  2.  Real clock hits 4:20 (AM or PM) → green toast pops up for 10 s
 *  3.  Type "420" anywhere (not in an input) → quick leaf burst
 *  4.  Idle for 4 min 20 sec → a single floating leaf drifts across the screen
 */

import { useEffect, useState, useRef, useCallback } from 'react'

const KONAMI = [
  'ArrowUp','ArrowUp',
  'ArrowDown','ArrowDown',
  'ArrowLeft','ArrowRight',
  'ArrowLeft','ArrowRight',
  'b','a',
]

interface Leaf {
  id: number
  left: number
  delay: number
  dur: number
  size: number
  rot: number
  emoji: string
}

const LEAF_EMOJIS = ['🌿', '🍃', '🌱', '🌿', '🍃', '🌿']

function makeLeaves(count: number): Leaf[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 96 + 2,
    delay: Math.random() * 2.5,
    dur: 2.8 + Math.random() * 2.4,
    size: 18 + Math.floor(Math.random() * 22),
    rot: Math.floor(Math.random() * 360),
    emoji: LEAF_EMOJIS[Math.floor(Math.random() * LEAF_EMOJIS.length)],
  }))
}

// Inline SVG cannabis leaf (simplified 7-finger silhouette)
function CannabisLeafSVG({ size = 40, className = '', style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 110"
      fill="currentColor"
      className={className}
      style={style}
      aria-hidden
    >
      {/* stem */}
      <rect x="47" y="68" width="6" height="38" rx="3" />
      {/* center top finger */}
      <path d="M50 65 C44 48 42 30 50 15 C58 30 56 48 50 65Z" />
      {/* upper-left finger */}
      <path d="M48 62 C36 52 22 46 12 32 C24 28 40 40 48 62Z" />
      {/* upper-right finger */}
      <path d="M52 62 C64 52 78 46 88 32 C76 28 60 40 52 62Z" />
      {/* mid-left finger */}
      <path d="M46 70 C30 65 12 62 2 48 C14 42 36 56 46 70Z" />
      {/* mid-right finger */}
      <path d="M54 70 C70 65 88 62 98 48 C86 42 64 56 54 70Z" />
      {/* lower-left nub */}
      <path d="M45 76 C34 76 22 78 16 70 C22 64 38 70 45 76Z" />
      {/* lower-right nub */}
      <path d="M55 76 C66 76 78 78 84 70 C78 64 62 70 55 76Z" />
    </svg>
  )
}

export default function EasterEgg420() {
  const [leaves, setLeaves] = useState<Leaf[]>([])
  const [showRain, setShowRain] = useState(false)
  const [show420, setShow420] = useState(false)
  const [showIdleLeaf, setShowIdleLeaf] = useState(false)

  const konamiProgress = useRef<string[]>([])
  const typedRef = useRef('')
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastMinute = useRef(-1)
  const rainTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Leaf rain trigger ──────────────────────────────────────────────
  const triggerRain = useCallback((count = 28) => {
    setLeaves(makeLeaves(count))
    setShowRain(true)
    if (rainTimer.current) clearTimeout(rainTimer.current)
    rainTimer.current = setTimeout(() => {
      setShowRain(false)
      setLeaves([])
    }, 5500)
  }, [])

  // ── Konami code ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      // Don't capture inside inputs/textareas
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      konamiProgress.current = [...konamiProgress.current, e.key].slice(-KONAMI.length)
      if (konamiProgress.current.join(',') === KONAMI.join(',')) {
        konamiProgress.current = []
        triggerRain(40)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [triggerRain])

  // ── Type "420" anywhere to trigger small burst ─────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      typedRef.current = (typedRef.current + e.key).slice(-3)
      if (typedRef.current === '420') {
        typedRef.current = ''
        triggerRain(18)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [triggerRain])

  // ── 4:20 clock detector ────────────────────────────────────────────
  useEffect(() => {
    const check = () => {
      const now = new Date()
      const h = now.getHours()
      const m = now.getMinutes()
      if (m !== lastMinute.current && (h === 4 || h === 16) && m === 20) {
        lastMinute.current = m
        setShow420(true)
        setTimeout(() => setShow420(false), 12000)
      }
    }
    check()
    const interval = setInterval(check, 15000)
    return () => clearInterval(interval)
  }, [])

  // ── 4 min 20 sec idle leaf drift ───────────────────────────────────
  useEffect(() => {
    const resetIdle = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => {
        setShowIdleLeaf(true)
        setTimeout(() => setShowIdleLeaf(false), 7000)
      }, 4 * 60 * 1000 + 20 * 1000) // exactly 4:20
    }
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach(ev => window.addEventListener(ev, resetIdle, { passive: true }))
    resetIdle()
    return () => {
      events.forEach(ev => window.removeEventListener(ev, resetIdle))
      if (idleTimer.current) clearTimeout(idleTimer.current)
    }
  }, [])

  return (
    <>
      {/* ── Leaf rain overlay ─────────────────────────────────────── */}
      {showRain && (
        <div
          className="fixed inset-0 pointer-events-none overflow-hidden z-[9990]"
          aria-hidden
        >
          {/* Big central glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-green-400/20 font-black select-none animate-blaze-pulse"
              style={{ fontSize: '22vw', lineHeight: 1 }}
            >
              420
            </span>
          </div>

          {/* Falling leaves */}
          {leaves.map(leaf => (
            <span
              key={leaf.id}
              className="absolute animate-leaf-fall select-none"
              style={{
                left: `${leaf.left}%`,
                top: '-60px',
                fontSize: `${leaf.size}px`,
                animationDelay: `${leaf.delay}s`,
                ['--leaf-dur' as string]: `${leaf.dur}s`,
                ['--leaf-rot' as string]: `${leaf.rot}deg`,
              }}
            >
              {leaf.emoji}
            </span>
          ))}

          {/* Konami hint */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-green-400/70 text-sm font-mono animate-420-slide-in">
            🌿 stay elevated 🌿
          </div>
        </div>
      )}

      {/* ── 4:20 toast ───────────────────────────────────────────── */}
      {show420 && (
        <div
          className="fixed bottom-6 right-6 z-[9991] rounded-2xl px-6 py-4 shadow-2xl border animate-420-slide-in backdrop-blur-md select-none"
          style={{
            background: 'rgba(5, 46, 22, 0.92)',
            borderColor: 'rgba(74, 222, 128, 0.6)',
            color: '#86efac',
          }}
          aria-hidden
        >
          <div className="flex items-center gap-3">
            <CannabisLeafSVG size={36} className="text-green-400 animate-leaf-sway shrink-0" />
            <div>
              <div className="text-2xl font-black tracking-widest animate-blaze-pulse">4:20</div>
              <div className="text-xs opacity-70 mt-0.5">it's that time 😏</div>
            </div>
            <CannabisLeafSVG size={36} className="text-green-400 animate-leaf-sway shrink-0" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      )}

      {/* ── Idle drift leaf ───────────────────────────────────────── */}
      {showIdleLeaf && (
        <div
          className="fixed pointer-events-none z-[9989] top-1/4 left-[-60px] text-green-500/50 text-5xl select-none"
          style={{
            animation: 'leaf-sway 3s ease-in-out infinite, leaf-fall 7s linear forwards',
            ['--leaf-dur' as string]: '7s',
            ['--leaf-rot' as string]: '15deg',
          }}
          aria-hidden
        >
          🍃
        </div>
      )}
    </>
  )
}
