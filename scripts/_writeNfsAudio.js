// Temp script — writes the full Lofi NFS Tokyo Drift synthesizer. Delete after use.
const fs   = require('fs')
const path = require('path')

const dest = path.resolve(__dirname, '../app/components/NFSGarageAudio.tsx')

const content = `'use client'

import React, { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'nfs-garage-audio-enabled'

// ── Lofi NFS Tokyo Drift synthesizer — 88 BPM, 32-step, B minor ──────────────
// Hip-hop groove, vinyl crackle, mellow Rhodes keys, sub bass riff, chord pads.
// All synthesis is pure Web Audio API — no samples, no files.
const BPM     = 88
const STEPS   = 32
const STEP_MS = Math.round((60 / BPM / 4) * 1000) // ~170 ms per 16th note

// ── Note frequencies — B minor pentatonic ────────────────────────────────────
const A2 = 110.00, B2 = 123.47, D3 = 146.83, E3 = 164.81, FS3 = 185.00
const A3 = 220.00, B3 = 246.94, D4 = 293.66, FS4 = 369.99

// ── 32-step patterns (2-bar loop) ────────────────────────────────────────────
const KICK  = [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,0,0]
const SNARE = [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1]
const GHOST = [0,0,1,0, 0,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,1,0, 0,0,0,0, 0,1,0,0, 0,0,1,0]
const HAT_C = [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0]
const HAT_O = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0]

// Sub-bass groove riff — Bm pentatonic, walks up and down
const BASS: number[] = [
  B2,  0,  0, B2,   0,  0, D3,  0,   E3,  0, D3,  0,  B2,  0,  0,  0,
  B2,  0,  0, A2,   0, B2,  0,  0,   D3,  0, E3,  0,  D3, B2,  0,  0,
]

// Rhodes melody — loose stabs, Tokyo Drift triplet feel
const KEYS: number[] = [
  B3,  0, D4,  0,   0, FS4,  0, D4,   B3,  0,  0,  0,  A3,   0, B3,  0,
   0,  0, D4,  0,  B3,  0,  A3,  0,    0, FS3,  0,  0,  E3,   0,  0,  0,
]

// Chord pad stabs on bar/half-bar downbeats — Bm7 / Dmaj / Em7 / F#m
const PADS: Record<number, number[]> = {
   0: [B2, FS3, A3, D3],   //  Bm7
   8: [D3,  A3,  D4],      //  Dmaj
  16: [E3,  A3,  B3],      //  Em7
  24: [FS3, A3, FS4],      //  F#m
}

// ── DSP helpers ───────────────────────────────────────────────────────────────

type AudioCtx = AudioContext

/** White noise buffer (2 seconds, loopable) */
function makeNoise(ctx: AudioCtx): AudioBuffer {
  const len = ctx.sampleRate * 2
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  return buf
}

/** Vinyl crackle — sparse impulse buffer, looped at low gain */
function startCrackle(ctx: AudioCtx, out: AudioNode): AudioBufferSourceNode {
  const len = ctx.sampleRate * 4
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) {
    d[i] = Math.random() < 0.0015 ? (Math.random() * 2 - 1) * 0.7 : 0
  }
  const src = ctx.createBufferSource()
  src.buffer = buf; src.loop = true
  const filt = ctx.createBiquadFilter()
  filt.type = 'bandpass'; filt.frequency.value = 1800; filt.Q.value = 0.4
  const g = ctx.createGain(); g.gain.value = 0.032
  src.connect(filt).connect(g).connect(out)
  src.start(); return src
}

/** Peak envelope: attack then exponential decay */
function env(ctx: AudioCtx, peak: number, att: number, rel: number, now: number): GainNode {
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, now)
  g.gain.linearRampToValueAtTime(peak, now + att)
  g.gain.exponentialRampToValueAtTime(0.0001, now + att + rel)
  return g
}

/** Create + start an oscillator, auto-stop at t1 */
function mkOsc(ctx: AudioCtx, type: OscillatorType, freq: number, t0: number, t1: number): OscillatorNode {
  const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq
  o.start(t0); o.stop(t1); return o
}

// ── Step renderer ─────────────────────────────────────────────────────────────
function playStep(ctx: AudioCtx, noise: AudioBuffer, out: AudioNode, step: number) {
  const now = ctx.currentTime

  // KICK — deep sub-sine + transient click
  if (KICK[step]) {
    const g = env(ctx, 0.72, 0.003, 0.38, now)
    const o = mkOsc(ctx, 'sine', 72, now, now + 0.42)
    o.frequency.exponentialRampToValueAtTime(28, now + 0.35)
    o.connect(g).connect(out)
    // click transient
    const cg = env(ctx, 0.16, 0.001, 0.022, now)
    const cn = ctx.createBufferSource(); cn.buffer = noise
    const cf = ctx.createBiquadFilter(); cf.type = 'bandpass'; cf.frequency.value = 3500; cf.Q.value = 1
    cn.connect(cf).connect(cg).connect(out); cn.start(now); cn.stop(now + 0.025)
  }

  // SNARE — fat lofi noise burst + light tonal body
  if (SNARE[step]) {
    const ng = env(ctx, 0.36, 0.002, 0.20, now)
    const ns = ctx.createBufferSource(); ns.buffer = noise
    const nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 1700; nf.Q.value = 0.5
    ns.connect(nf).connect(ng).connect(out); ns.start(now); ns.stop(now + 0.22)
    const bg = env(ctx, 0.13, 0.002, 0.11, now)
    const bo = mkOsc(ctx, 'triangle', 160, now, now + 0.13)
    bo.frequency.exponentialRampToValueAtTime(72, now + 0.11)
    bo.connect(bg).connect(out)
  }

  // GHOST snare — very quiet filtered noise
  if (GHOST[step]) {
    const g = env(ctx, 0.05, 0.001, 0.07, now)
    const ns = ctx.createBufferSource(); ns.buffer = noise
    const nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 2100; nf.Q.value = 0.6
    ns.connect(nf).connect(g).connect(out); ns.start(now); ns.stop(now + 0.08)
  }

  // CLOSED HI-HAT — every 8th note, muted lofi feel
  if (HAT_C[step] && !HAT_O[step]) {
    const vel = step % 8 === 0 ? 0.042 : 0.022
    const g = env(ctx, vel, 0.001, 0.038, now)
    const ns = ctx.createBufferSource(); ns.buffer = noise
    const nf = ctx.createBiquadFilter(); nf.type = 'highpass'; nf.frequency.value = 9000
    ns.connect(nf).connect(g).connect(out); ns.start(now); ns.stop(now + 0.044)
  }

  // OPEN HI-HAT
  if (HAT_O[step]) {
    const g = env(ctx, 0.052, 0.001, 0.28, now)
    const ns = ctx.createBufferSource(); ns.buffer = noise
    const nf = ctx.createBiquadFilter(); nf.type = 'highpass'; nf.frequency.value = 6500
    ns.connect(nf).connect(g).connect(out); ns.start(now); ns.stop(now + 0.30)
  }

  // SUB BASS — sine dominant + tiny sawtooth grit, heavy lowpass
  const bassHz = BASS[step]
  if (bassHz > 0) {
    const g  = env(ctx, 0.56, 0.006, 0.24, now)
    const o1 = mkOsc(ctx, 'sine',     bassHz, now, now + 0.32)
    const o2 = mkOsc(ctx, 'sawtooth', bassHz, now, now + 0.32)
    const filt = ctx.createBiquadFilter()
    filt.type = 'lowpass'; filt.frequency.value = 210; filt.Q.value = 1.4
    const sg = ctx.createGain(); sg.gain.value = 0.08
    const mg = ctx.createGain(); mg.gain.value = 0.92
    o1.connect(mg).connect(filt)
    o2.connect(sg).connect(filt)
    filt.connect(g).connect(out)
  }

  // RHODES KEYS — triangle + detuned sine ≈ mellow electric piano
  const keyHz = KEYS[step]
  if (keyHz > 0) {
    const g  = env(ctx, 0.17, 0.009, 0.60, now)
    const o1 = mkOsc(ctx, 'triangle', keyHz,         now, now + 0.70)
    const o2 = mkOsc(ctx, 'sine',     keyHz * 1.004, now, now + 0.70)
    const filt = ctx.createBiquadFilter()
    filt.type = 'lowpass'; filt.frequency.value = 3000; filt.Q.value = 0.5
    o1.connect(filt); o2.connect(filt)
    filt.connect(g).connect(out)
  }

  // CHORD PADS — detuned sawtooth pair, heavy filter, slow fade
  const chord = PADS[step]
  if (chord) {
    chord.forEach(freq => {
      const g  = env(ctx, 0.052, 0.020, 0.52, now)
      const o1 = mkOsc(ctx, 'sawtooth', freq,         now, now + 0.60)
      const o2 = mkOsc(ctx, 'sawtooth', freq * 1.007, now, now + 0.60)
      const filt = ctx.createBiquadFilter()
      filt.type = 'lowpass'; filt.frequency.value = 780; filt.Q.value = 0.4
      o1.connect(filt); o2.connect(filt)
      filt.connect(g).connect(out)
    })
  }
}

// ── React component ───────────────────────────────────────────────────────────
export default function NFSGarageAudio() {
  const [enabled, setEnabled]   = useState(false)
  const [supported, setSupported] = useState(true)

  const ctxRef      = useRef<AudioCtx | null>(null)
  const noiseRef    = useRef<AudioBuffer | null>(null)
  const outRef      = useRef<AudioNode | null>(null)
  const crackleRef  = useRef<AudioBufferSourceNode | null>(null)
  const intervalRef = useRef<number | null>(null)
  const stepRef     = useRef(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const win = window as Window & { webkitAudioContext?: typeof AudioContext }
    const canUse = typeof window.AudioContext !== 'undefined' || typeof win.webkitAudioContext !== 'undefined'
    setSupported(canUse)
    const saved = window.localStorage.getItem(STORAGE_KEY)
    setEnabled(saved === '1')
  }, [])

  useEffect(() => {
    if (!supported) return
    if (!enabled) { stopAudio(); return }
    startAudio()
    return () => { stopAudio() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, supported])

  const startAudio = () => {
    if (typeof window === 'undefined') return
    const win = window as Window & { webkitAudioContext?: typeof AudioContext }
    const Ctor = window.AudioContext || win.webkitAudioContext
    if (!Ctor) return

    if (!ctxRef.current) {
      ctxRef.current = new Ctor()
      const master = ctxRef.current.createGain()
      master.gain.value = 0.72
      const comp = ctxRef.current.createDynamicsCompressor()
      comp.threshold.value = -18; comp.ratio.value = 3; comp.knee.value = 8
      master.connect(comp)
      comp.connect(ctxRef.current.destination)
      outRef.current = master
      noiseRef.current = makeNoise(ctxRef.current)
      crackleRef.current = startCrackle(ctxRef.current, outRef.current)
    }

    const ctx = ctxRef.current
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    if (intervalRef.current) window.clearInterval(intervalRef.current)

    const tick = () => {
      if (ctxRef.current && noiseRef.current && outRef.current) {
        playStep(ctxRef.current, noiseRef.current, outRef.current, stepRef.current)
        stepRef.current = (stepRef.current + 1) % STEPS
      }
    }
    tick()
    intervalRef.current = window.setInterval(tick, STEP_MS)
  }

  const stopAudio = () => {
    if (intervalRef.current) { window.clearInterval(intervalRef.current); intervalRef.current = null }
    if (crackleRef.current) {
      try { crackleRef.current.stop() } catch (_) {}
      crackleRef.current = null
    }
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {})
      ctxRef.current = null; outRef.current = null; noiseRef.current = null
    }
  }

  const toggleAudio = () => {
    const next = !enabled
    setEnabled(next)
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
  }

  if (!supported) {
    return (
      <div className="nfs-garage-panel rounded-lg px-3 py-2 text-[11px] text-white/70">
        Garage ambience unavailable in this browser
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleAudio}
        className={\`nfs-garage-audio-btn tap-target rounded-lg px-3 py-2 text-xs font-semibold \${enabled ? 'is-on' : ''}\`}
        aria-label={enabled ? 'Disable garage soundtrack' : 'Enable garage soundtrack'}
      >
        {enabled ? 'Soundtrack: On' : 'Soundtrack: Off'}
      </button>
      <span className="hidden sm:inline text-[11px] text-white/60">Tokyo Drift Lofi Mix</span>
    </div>
  )
}
`

fs.writeFileSync(dest, content, 'utf8')
console.log('NFSGarageAudio.tsx written successfully (' + content.length + ' bytes)')
