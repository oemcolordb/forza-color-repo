'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Clean, minimal transitions - no flashy effects
export type TransitionType = 'fade' | 'crossfade' | 'soft-fade'

interface TransitionProps {
  isActive: boolean
  onComplete: () => void
  primaryColor?: string
}

// Simple clean fade in/out
export const FadeTransition: React.FC<TransitionProps> = ({
  isActive,
  onComplete
}) => {
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(onComplete, 400)
      return () => clearTimeout(timer)
    }
  }, [isActive, onComplete])

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[9999] pointer-events-none bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut', times: [0, 0.5, 1] }}
        />
      )}
    </AnimatePresence>
  )
}

// Crossfade between pages
export const CrossfadeTransition: React.FC<TransitionProps> = ({
  isActive,
  onComplete
}) => {
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(onComplete, 500)
      return () => clearTimeout(timer)
    }
  }, [isActive, onComplete])

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[9999] pointer-events-none bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.2, 0.2, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut', times: [0, 0.3, 0.7, 1] }}
        />
      )}
    </AnimatePresence>
  )
}

// Very soft subtle fade
export const SoftFadeTransition: React.FC<TransitionProps> = ({
  isActive,
  onComplete
}) => {
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(onComplete, 350)
      return () => clearTimeout(timer)
    }
  }, [isActive, onComplete])

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[9999] pointer-events-none bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.15, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut', times: [0, 0.5, 1] }}
        />
      )}
    </AnimatePresence>
  )
}

// ============================================
// TRANSITION METADATA
// Clean descriptions for the gallery
// ============================================
export interface TransitionMeta {
  id: TransitionType
  name: string
  description: string
  style: 'subtle' | 'modern' | 'elegant'
  duration: number
  color?: string
  icon?: React.ReactNode
}

export const TRANSITION_METADATA: TransitionMeta[] = [
  {
    id: 'fade',
    name: 'Clean Fade',
    description: 'Simple, clean opacity fade between pages',
    style: 'subtle',
    duration: 400
  },
  {
    id: 'crossfade',
    name: 'Crossfade',
    description: 'Smooth crossfade with slight pause',
    style: 'modern',
    duration: 500
  },
  {
    id: 'soft-fade',
    name: 'Soft Fade',
    description: 'Very subtle, barely noticeable fade',
    style: 'elegant',
    duration: 350
  }
]

// ============================================
// TRANSITION DISPATCHER
// Get random transition or specific one
// ============================================
export const getRandomTransition = (): TransitionType => {
  const transitions: TransitionType[] = ['fade', 'crossfade', 'soft-fade']
  return transitions[Math.floor(Math.random() * transitions.length)]
}

// Component mapping for dynamic rendering
export const TRANSITION_COMPONENTS = {
  'fade': FadeTransition,
  'crossfade': CrossfadeTransition,
  'soft-fade': SoftFadeTransition
}

// ============================================
// PAGE TRANSITION WRAPPER
// Main component used by TransitionWrapper
// ============================================
interface PageTransitionProps {
  type: TransitionType
  isActive: boolean
  onComplete: () => void
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  type,
  isActive,
  onComplete
}) => {
  const TransitionComponent = TRANSITION_COMPONENTS[type] || FadeTransition

  return <TransitionComponent isActive={isActive} onComplete={onComplete} />
}
