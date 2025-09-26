import { useEffect } from 'react'

export const SecurityHeaders = () => {
  useEffect(() => {
    // Content Security Policy
    const meta = document.createElement('meta')
    meta.httpEquiv = 'Content-Security-Policy'
    meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://generativelanguage.googleapis.com"
    document.head.appendChild(meta)

    // Prevent clickjacking
    if (window.self !== window.top) {
      window.top!.location.href = window.self.location.href
    }

    return () => {
      document.head.removeChild(meta)
    }
  }, [])

  return null
}