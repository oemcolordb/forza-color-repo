import { useEffect } from 'react'

export const SecurityHeaders = () => {
  useEffect(() => {
    // Content Security Policy
    const meta = document.createElement('meta')
    meta.httpEquiv = 'Content-Security-Policy'
    meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://generativelanguage.googleapis.com"
    document.head.appendChild(meta)

    // Prevent clickjacking
    if (window.self !== window.top) {
      window.top.location.href = window.self.location.href
    }

    return () => {
      document.head.removeChild(meta)
    }
  }, [])

  return null
}