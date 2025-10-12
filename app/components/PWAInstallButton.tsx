'use client'

import React, { useState, useEffect } from 'react'

interface PWAInstallButtonProps {
  isDarkMode: boolean
}

const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ isDarkMode }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
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

  // Temporarily always show for testing
  // if (!showInstall) return null

  return (
    <button
      onClick={handleInstall}
      className={`px-3 py-2 text-sm font-medium rounded-lg border-2 transition-colors ${
        isDarkMode
          ? 'bg-green-600 text-white border-green-500 hover:bg-green-700'
          : 'bg-green-600 text-white border-green-500 hover:bg-green-700'
      }`}
      title="Install app"
    >
      📱 Install
    </button>
  )
}

export default PWAInstallButton