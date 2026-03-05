import { useEffect } from 'react'

interface KeyboardNavigationOptions {
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onEnter?: () => void
  onEscape?: () => void
  enabled?: boolean
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions) {
  const { enabled = true } = options

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          options.onArrowUp?.()
          break
        case 'ArrowDown':
          e.preventDefault()
          options.onArrowDown?.()
          break
        case 'ArrowLeft':
          e.preventDefault()
          options.onArrowLeft?.()
          break
        case 'ArrowRight':
          e.preventDefault()
          options.onArrowRight?.()
          break
        case 'Enter':
          options.onEnter?.()
          break
        case 'Escape':
          options.onEscape?.()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, options])
}
