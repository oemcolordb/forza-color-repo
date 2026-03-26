'use client'

import React, { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'nfs-garage-audio-enabled'

export default function NFSGarageAudio() {
  const [enabled, setEnabled] = useState(false)
  const [supported, setSupported] = useState(true)
  const audioContextRef = useRef<AudioContext | null>(null)
  const intervalRef = useRef<number | null>(null)
  const stepRef = useRef(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const canUseAudio = typeof window.AudioContext !== 'undefined' || typeof (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext !== 'undefined'
    setSupported(canUseAudio)

    const saved = window.localStorage.getItem(STORAGE_KEY)
    setEnabled(saved === '1')
  }, [])

  useEffect(() => {
    if (!supported) return
    if (!enabled) {
      stopAudio()
      return
    }

    startAudio()

    return () => {
      stopAudio()
    }
  }, [enabled, supported])

  const startAudio = () => {
    if (typeof window === 'undefined') return

    const AudioCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtor) return

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtor()
    }

    const ctx = audioContextRef.current
    if (!ctx) return

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {
        // ignore resume failures without user gesture
      })
    }

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
    }

    intervalRef.current = window.setInterval(() => {
      playGarageStep(ctx, stepRef.current)
      stepRef.current = (stepRef.current + 1) % 8
    }, 420)

    playGarageStep(ctx, stepRef.current)
    stepRef.current = (stepRef.current + 1) % 8
  }

  const stopAudio = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {
        // ignore close failures
      })
      audioContextRef.current = null
    }
  }

  const playGarageStep = (ctx: AudioContext, step: number) => {
    const now = ctx.currentTime
    const kickPattern = [true, false, false, true, true, false, false, false]
    const hatPattern = [false, true, false, true, false, true, false, true]
    const bassAccent = [true, false, false, false, true, false, false, false]

    if (kickPattern[step]) {
      const kick = ctx.createOscillator()
      const kickGain = ctx.createGain()
      kick.type = 'sine'
      kick.frequency.setValueAtTime(72, now)
      kick.frequency.exponentialRampToValueAtTime(41, now + 0.15)
      kickGain.gain.setValueAtTime(0.0001, now)
      kickGain.gain.exponentialRampToValueAtTime(0.05, now + 0.012)
      kickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
      kick.connect(kickGain).connect(ctx.destination)
      kick.start(now)
      kick.stop(now + 0.2)
    }

    if (hatPattern[step]) {
      const hat = ctx.createOscillator()
      const hatGain = ctx.createGain()
      const hatFilter = ctx.createBiquadFilter()
      hat.type = 'square'
      hat.frequency.setValueAtTime(1700, now)
      hatFilter.type = 'highpass'
      hatFilter.frequency.setValueAtTime(900, now)
      hatGain.gain.setValueAtTime(0.0001, now)
      hatGain.gain.exponentialRampToValueAtTime(0.012, now + 0.01)
      hatGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)
      hat.connect(hatFilter).connect(hatGain).connect(ctx.destination)
      hat.start(now)
      hat.stop(now + 0.09)
    }

    if (bassAccent[step]) {
      const hum = ctx.createOscillator()
      const humGain = ctx.createGain()
      const humFilter = ctx.createBiquadFilter()
      hum.type = 'triangle'
      hum.frequency.setValueAtTime(95, now)
      humFilter.type = 'lowpass'
      humFilter.frequency.setValueAtTime(520, now)
      humGain.gain.setValueAtTime(0.0001, now)
      humGain.gain.exponentialRampToValueAtTime(0.018, now + 0.1)
      humGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38)
      hum.connect(humFilter).connect(humGain).connect(ctx.destination)
      hum.start(now)
      hum.stop(now + 0.4)
    }
  }

  const toggleAudio = () => {
    const next = !enabled
    setEnabled(next)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
    }
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
        className={`nfs-garage-audio-btn tap-target rounded-lg px-3 py-2 text-xs font-semibold ${enabled ? 'is-on' : ''}`}
        aria-label={enabled ? 'Disable garage soundtrack' : 'Enable garage soundtrack'}
      >
        {enabled ? 'Soundtrack: On' : 'Soundtrack: Off'}
      </button>
      <span className="hidden sm:inline text-[11px] text-white/60">Underground Garage Mix</span>
    </div>
  )
}
