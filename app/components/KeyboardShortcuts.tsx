'use client'

import React, { useEffect, useState } from 'react'
import DialogShell from './ui/DialogShell'
import Button from './ui/Button'

interface KeyboardShortcutsProps {
  onToggleTheme: () => void
  onToggleSearch: () => void
  onToggleComparison: () => void
  isDarkMode: boolean
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  onToggleTheme,
  onToggleSearch,
  onToggleComparison,
  isDarkMode,
}) => {
  const [showHelp, setShowHelp] = useState(false)
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null)
  const triggerButtonRef = React.useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'd':
            e.preventDefault()
            onToggleTheme()
            break
          case 'k':
            e.preventDefault()
            onToggleSearch()
            break
          case 'c':
            e.preventDefault()
            onToggleComparison()
            break
          case '/':
            e.preventDefault()
            setShowHelp(!showHelp)
            break
        }
      }

      if (e.key === 'Escape') {
        setShowHelp(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onToggleTheme, onToggleSearch, onToggleComparison, showHelp])

  useEffect(() => {
    if (!showHelp) return
    return () => {
      triggerButtonRef.current?.focus()
    }
  }, [showHelp])

  if (!showHelp) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          ref={triggerButtonRef}
          onClick={() => setShowHelp(true)}
          variant="ghost"
          size="md"
          className={`rounded-full ${
            isDarkMode
              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          title="Keyboard shortcuts (Ctrl+/)"
        >
          ⌨️
        </Button>
      </div>
    )
  }

  return (
    <DialogShell
      isOpen={showHelp}
      onClose={() => setShowHelp(false)}
      titleId="keyboard-shortcuts-title"
      initialFocusRef={closeButtonRef}
      panelClassName={`p-6 rounded-lg max-w-md w-full mx-4 ${
        isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'
      }`}
    >
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 id="keyboard-shortcuts-title" className="text-lg font-semibold">
            ⌨️ Keyboard Shortcuts
          </h3>
          <Button ref={closeButtonRef} onClick={() => setShowHelp(false)} variant="ghost" size="sm" className="text-xl min-w-[32px] min-h-[32px]">
            ×
          </Button>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Toggle Theme</span>
            <kbd className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Ctrl+D</kbd>
          </div>
          <div className="flex justify-between">
            <span>Advanced Search</span>
            <kbd className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Ctrl+K</kbd>
          </div>
          <div className="flex justify-between">
            <span>Color Comparison</span>
            <kbd className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Ctrl+C</kbd>
          </div>
          <div className="flex justify-between">
            <span>Show/Hide Help</span>
            <kbd className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Ctrl+/</kbd>
          </div>
          <div className="flex justify-between">
            <span>Close Dialogs</span>
            <kbd className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Esc</kbd>
          </div>
        </div>
      </div>
    </DialogShell>
  )
}

export default KeyboardShortcuts
