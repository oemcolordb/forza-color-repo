'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Accessibility, Eye, Activity, Check, X, ShieldAlert } from 'lucide-react'
import { useAccessibleDialog } from '@/hooks/useAccessibleDialog'
import Button from '@/components/ui/Button'

export default function AccessibilityController() {
  const [isOpen, setIsOpen] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Initialize accessibility settings on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. High contrast preference
    const storedContrast = localStorage.getItem('accessibility-high-contrast')
    const systemContrast = window.matchMedia('(prefers-contrast: high)').matches
    const initialContrast = storedContrast === 'true' || (storedContrast === null && systemContrast)
    
    setHighContrast(initialContrast)
    if (initialContrast) {
      document.documentElement.classList.add('high-contrast')
    }

    // 2. Reduced motion preference
    const storedMotion = localStorage.getItem('accessibility-reduced-motion')
    const systemMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const initialMotion = storedMotion === 'true' || (storedMotion === null && systemMotion)

    setReducedMotion(initialMotion)
    if (initialMotion) {
      document.documentElement.classList.add('reduced-motion')
    }

    // Keyboard shortcuts listener
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + A: Toggle settings panel
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      // Alt + H: Toggle High Contrast
      if (e.altKey && e.key.toLowerCase() === 'h') {
        e.preventDefault()
        toggleHighContrast()
      }
      // Alt + R: Toggle Reduced Motion
      if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault()
        toggleReducedMotion()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Hook into the focus trap for the accessibility dialog
  useAccessibleDialog({
    isOpen,
    onClose: () => setIsOpen(false),
    dialogRef,
    initialFocusRef: closeButtonRef,
  })

  const toggleHighContrast = () => {
    setHighContrast(prev => {
      const next = !prev
      localStorage.setItem('accessibility-high-contrast', String(next))
      if (next) {
        document.documentElement.classList.add('high-contrast')
      } else {
        document.documentElement.classList.remove('high-contrast')
      }
      return next
    })
  }

  const toggleReducedMotion = () => {
    setReducedMotion(prev => {
      const next = !prev
      localStorage.setItem('accessibility-reduced-motion', String(next))
      if (next) {
        document.documentElement.classList.add('reduced-motion')
      } else {
        document.documentElement.classList.remove('reduced-motion')
      }
      return next
    })
  }

  return (
    <>
      {/* Floating Accessibility Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[9999] p-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center border-2 border-white/20 focus-visible:outline focus-visible:outline-4 focus-visible:outline-blue-500/50"
        title="Accessibility Settings (Alt+A)"
        aria-label="Accessibility Settings"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Accessibility className="w-6 h-6" />
      </button>

      {/* Accessibility Dialog */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            ref={dialogRef}
            className="w-full max-w-md mx-4 p-6 rounded-2xl bg-slate-900 border border-slate-700 text-white shadow-2xl transition-all relative overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="acc-title"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 id="acc-title" className="text-xl font-bold flex items-center gap-2">
                <Accessibility className="w-5 h-5 text-blue-400" />
                Accessibility Preferences
              </h2>
              <button
                ref={closeButtonRef}
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                aria-label="Close Accessibility Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content / Options */}
            <div className="space-y-6">
              {/* Option 1: High Contrast */}
              <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-semibold">
                    <Eye className="w-4 h-4 text-blue-400" />
                    High Contrast Mode
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Forces highly distinct colors and visible outlines for maximum readability.
                  </p>
                </div>
                <button
                  onClick={toggleHighContrast}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                    highContrast ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                  role="switch"
                  aria-checked={highContrast}
                  aria-label="High Contrast Mode Toggle"
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      highContrast ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Option 2: Reduced Motion */}
              <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-semibold">
                    <Activity className="w-4 h-4 text-blue-400" />
                    Reduced Motion
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Disables page-level animations, slides, and background video loops.
                  </p>
                </div>
                <button
                  onClick={toggleReducedMotion}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                    reducedMotion ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                  role="switch"
                  aria-checked={reducedMotion}
                  aria-label="Reduced Motion Toggle"
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      reducedMotion ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Information / Shortcuts */}
              <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/40 text-xs text-slate-300">
                <div className="font-bold mb-1.5 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
                  Keyboard Shortcuts:
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div>Alt + A:</div>
                  <div className="text-right text-slate-400">Open Panel</div>
                  <div>Alt + H:</div>
                  <div className="text-right text-slate-400">Toggle Contrast</div>
                  <div>Alt + R:</div>
                  <div className="text-right text-slate-400">Toggle Motion</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
