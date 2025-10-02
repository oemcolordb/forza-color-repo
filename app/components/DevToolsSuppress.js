'use client'

import { useEffect } from 'react'

export const DevToolsSuppress = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      // Suppress React DevTools console message
      const originalLog = console.log
      console.log = (...args) => {
        const message = args[0]?.toString() || ''
        if (message.includes('Download the React DevTools')) {
          return // Suppress this message
        }
        originalLog.apply(console, args)
      }
    }
  }, [])

  return null
}