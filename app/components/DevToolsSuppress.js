'use client'

import { useEffect } from 'react'

export const DevToolsSuppress = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.__devToolsSuppressed) return
      window.__devToolsSuppressed = true
      
      // Suppress development console messages
      const originalLog = console.log
      console.log = (...args) => {
        const message = args[0]?.toString() || ''
        if (
          message.includes('Download the React DevTools') ||
          message.includes('Color data service loaded') ||
          message.includes('Loading Tokyo background') ||
          message.includes('Tokyo background image loaded') ||
          message.includes('content.js')
        ) {
          return // Suppress these messages
        }
        originalLog.apply(console, args)
      }
    }
  }, [])

  return null
}