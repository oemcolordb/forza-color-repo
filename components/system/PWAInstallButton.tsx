'use client'

import React, { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAInstallButtonProps {
  isDarkMode: boolean
}

const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ isDarkMode: _isDarkMode }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstall(false)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShowInstall(false)
    }

    setDeferredPrompt(null)
  }

  if (!showInstall) return null

  return (
    <button
      onClick={handleInstall}
      className="bamboo-button px-3 py-2 text-sm"
      title="Install app"
    >
      📱 Install
    </button>
  )
}

export default PWAInstallButton
