import { useEffect, useRef } from 'react'

export function useAccessibleDialog({ isOpen, onClose, dialogRef, initialFocusRef }) {
  const previousFocusRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    previousFocusRef.current = document.activeElement

    // Helper to get all focusable elements in dialog
    const getFocusableElements = () => {
      if (!dialogRef.current) return []
      const list = Array.from(
        dialogRef.current.querySelectorAll(
          'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]):not([disabled]), [contenteditable]'
        )
      )
      // Filter out elements that are invisible (e.g., hidden with display: none, visibility: hidden, or opacity: 0)
      return list.filter(el => {
        const style = window.getComputedStyle(el)
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          el.getBoundingClientRect().width > 0 &&
          el.getBoundingClientRect().height > 0
        )
      })
    }

    // Set initial focus
    const focusableElements = getFocusableElements()
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus()
    } else if (focusableElements.length > 0) {
      focusableElements[0].focus()
    } else if (dialogRef.current) {
      // If no focusable elements, focus the dialog container itself
      if (!dialogRef.current.hasAttribute('tabindex')) {
        dialogRef.current.setAttribute('tabindex', '-1')
      }
      dialogRef.current.focus()
    }

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = getFocusableElements()
      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey) {
        // Shift + Tab: loop back to last element if current is first or outside
        if (document.activeElement === first || !dialogRef.current.contains(document.activeElement)) {
          event.preventDefault()
          last.focus()
        }
      } else {
        // Tab: loop to first element if current is last or outside
        if (document.activeElement === last || !dialogRef.current.contains(document.activeElement)) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    // Prevent focus from leaving the modal when clicking/interacting outside
    const handleFocusIn = event => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        event.stopPropagation()
        const focusable = getFocusableElements()
        if (focusable.length > 0) {
          focusable[0].focus()
        } else {
          dialogRef.current.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('focusin', handleFocusIn)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('focusin', handleFocusIn)
      
      // Restore previous focus
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus()
      }
    }
  }, [dialogRef, initialFocusRef, isOpen, onClose])
}

