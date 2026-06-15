import { useEffect, useRef } from 'react'

export function useAccessibleDialog({ isOpen, onClose, dialogRef, initialFocusRef }) {
  const previousFocusRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    previousFocusRef.current = document.activeElement
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus()
    }

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus()
      }
    }
  }, [dialogRef, initialFocusRef, isOpen, onClose])
}
