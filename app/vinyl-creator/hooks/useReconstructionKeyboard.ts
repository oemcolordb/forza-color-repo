/**
 * Keyboard Shortcuts Hook
 * Handles keyboard shortcuts for reconstruction controls
 */

import { useEffect } from 'react'

export interface KeyboardShortcutHandlers {
  onPlayPause?: () => void
  onNextStep?: () => void
  onPreviousStep?: () => void
  onFirstStep?: () => void
  onLastStep?: () => void
  onClose?: () => void
  onReset?: () => void
}

/**
 * Hook to handle keyboard shortcuts for reconstruction
 */
export function useReconstructionKeyboard(handlers: KeyboardShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          handlers.onPlayPause?.()
          break
        case 'ArrowRight':
          e.preventDefault()
          handlers.onNextStep?.()
          break
        case 'ArrowLeft':
          e.preventDefault()
          handlers.onPreviousStep?.()
          break
        case 'Home':
          e.preventDefault()
          handlers.onFirstStep?.()
          break
        case 'End':
          e.preventDefault()
          handlers.onLastStep?.()
          break
        case 'Escape':
          e.preventDefault()
          handlers.onClose?.()
          break
        case 'KeyR':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            handlers.onReset?.()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}

/**
 * Get keyboard shortcut display text
 */
export function getShortcutText(action: string): string {
  const shortcuts: Record<string, string> = {
    playPause: 'Space',
    nextStep: '→',
    previousStep: '←',
    firstStep: 'Home',
    lastStep: 'End',
    close: 'Esc',
    reset: 'Ctrl+R'
  }
  return shortcuts[action] || ''
}
