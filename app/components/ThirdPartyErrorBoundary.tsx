'use client'

import { useEffect } from 'react'

export const ThirdPartyErrorBoundary = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        const reason = event.reason?.toString() || ''

        // Suppress known third-party errors
        if (
          reason.includes('dlnk.one') ||
          reason.includes('Failed to fetch') ||
          reason.includes('CORS') ||
          reason.includes('content.js')
        ) {
          event.preventDefault()
          return false
        }
      }

      const handleError = (event: ErrorEvent) => {
        const message = event.message?.toString() || ''
        const filename = event.filename?.toString() || ''

        // Suppress known third-party errors
        if (
          message.includes('dlnk.one') ||
          filename.includes('content.js') ||
          message.includes('Script error')
        ) {
          event.preventDefault()
          return false
        }
      }

      window.addEventListener('unhandledrejection', handleUnhandledRejection)
      window.addEventListener('error', handleError)

      return () => {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection)
        window.removeEventListener('error', handleError)
      }
    }
  }, [])

  return null
}
