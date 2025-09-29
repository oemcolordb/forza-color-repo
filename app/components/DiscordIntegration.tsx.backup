'use client'

import React, { useEffect, useState } from 'react'
import { CarColor } from '../types/color'

interface DiscordIntegrationProps {
  selectedColor?: CarColor | null
  isDarkMode: boolean
}

const DiscordIntegration: React.FC<DiscordIntegrationProps> = ({ selectedColor, isDarkMode }) => {
  const [discordConnected, setDiscordConnected] = useState(false)

  useEffect(() => {
    // Check if Discord is available (desktop app)
    if (typeof window !== 'undefined' && (window as any).DiscordSDK) {
      setDiscordConnected(true)
      updateRichPresence()
    }
  }, [selectedColor])

  const updateRichPresence = () => {
    if (!(window as any).DiscordSDK) return

    const presence = {
      details: selectedColor 
        ? `Viewing ${selectedColor.colorName}`
        : 'Browsing automotive colors',
      state: selectedColor 
        ? `${selectedColor.make} ${selectedColor.model || ''}`
        : '10,000+ official paint colors',
      largeImageKey: 'forza-colors-logo',
      largeImageText: 'Forza Color Universe',
      smallImageKey: selectedColor ? 'car-icon' : 'palette-icon',
      smallImageText: selectedColor ? 'Car Color' : 'Color Palette',
      startTimestamp: Date.now(),
      buttons: [
        {
          label: 'View Colors',
          url: 'https://forza-colors.netlify.app'
        }
      ]
    }

    ;(window as any).DiscordSDK.updateActivity(presence)
  }

  const shareToDiscord = async (color: CarColor) => {
    const webhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL
    if (!webhookUrl) {
      // Fallback to Discord share URL
      const shareText = `🎨 Check out this ${color.make} color: **${color.colorName}**\n\n🚗 ${color.make} ${color.model || ''} ${color.year || ''}\n🎯 HSB: ${Math.round(color.color1.h * 360)}°, ${Math.round(color.color1.s * 100)}%, ${Math.round(color.color1.b * 100)}%\n\n🌐 Explore more colors: https://forza-colors.netlify.app`
      
      const discordUrl = `https://discord.com/channels/@me?message=${encodeURIComponent(shareText)}`
      window.open(discordUrl, '_blank')
      return
    }

    try {
      const embed = {
        title: `🎨 ${color.colorName}`,
        description: `${color.make} ${color.model || ''} ${color.year || ''}`,
        color: parseInt(hsbToHex(color.color1.h * 360, color.color1.s, color.color1.b).replace('#', ''), 16),
        fields: [
          {
            name: '🎯 HSB Values',
            value: `H: ${Math.round(color.color1.h * 360)}°\nS: ${Math.round(color.color1.s * 100)}%\nB: ${Math.round(color.color1.b * 100)}%`,
            inline: true
          },
          {
            name: '🏷️ Color Type',
            value: color.colorType || 'Standard',
            inline: true
          }
        ],
        footer: {
          text: 'Forza Color Universe',
          icon_url: 'https://forza-colors.netlify.app/icon.svg'
        },
        timestamp: new Date().toISOString(),
        url: 'https://forza-colors.netlify.app'
      }

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [embed],
          username: 'Forza Colors Bot',
          avatar_url: 'https://forza-colors.netlify.app/icon.svg'
        })
      })
    } catch (error) {
      console.error('Discord share failed:', error)
    }
  }

  const hsbToHex = (h: number, s: number, b: number) => {
    const c = b * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = b - c
    let r = 0, g = 0, bl = 0

    if (h >= 0 && h < 60) { r = c; g = x; bl = 0 }
    else if (h >= 60 && h < 120) { r = x; g = c; bl = 0 }
    else if (h >= 120 && h < 180) { r = 0; g = c; bl = x }
    else if (h >= 180 && h < 240) { r = 0; g = x; bl = c }
    else if (h >= 240 && h < 300) { r = x; g = 0; bl = c }
    else if (h >= 300 && h < 360) { r = c; g = 0; bl = x }

    return `#${Math.round((r + m) * 255).toString(16).padStart(2, '0')}${Math.round((g + m) * 255).toString(16).padStart(2, '0')}${Math.round((bl + m) * 255).toString(16).padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-2">
      {discordConnected && (
        <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
          isDarkMode ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800'
        }`}>
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Discord
        </div>
      )}
      
      {selectedColor && (
        <button
          onClick={() => shareToDiscord(selectedColor)}
          className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
            isDarkMode
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-indigo-500 hover:bg-indigo-600 text-white'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          Share
        </button>
      )}
    </div>
  )
}

export default DiscordIntegration