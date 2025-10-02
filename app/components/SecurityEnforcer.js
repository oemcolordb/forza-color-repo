'use client'

import { useEffect } from 'react'

export const SecurityEnforcer = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // XSS Protection
    const sanitizeInput = (str) => {
      const div = document.createElement('div')
      div.textContent = str
      return div.innerHTML
    }

    // Override dangerous DOM methods
    const originalInnerHTML = Element.prototype.innerHTML
    Object.defineProperty(Element.prototype, 'innerHTML', {
      set: function(value) {
        if (typeof value === 'string' && /<script|javascript:|data:|vbscript:/i.test(value)) {
          console.warn('Blocked potentially malicious HTML')
          return
        }
        originalInnerHTML.call(this, value)
      },
      get: function() {
        return originalInnerHTML.call(this)
      }
    })

    // Block eval and Function constructor
    window.eval = () => { throw new Error('eval() blocked for security') }
    window.Function = () => { throw new Error('Function() blocked for security') }

    // Prevent clickjacking
    if (window.top !== window.self) {
      window.top.location = window.self.location
    }

    // Rate limiting for API calls
    const rateLimiter = new Map()
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const url = args[0]?.toString() || ''
      const now = Date.now()
      const key = url.split('?')[0]
      
      if (rateLimiter.has(key)) {
        const lastCall = rateLimiter.get(key)
        if (now - lastCall < 100) { // 100ms minimum between calls
          throw new Error('Rate limit exceeded')
        }
      }
      rateLimiter.set(key, now)
      
      return originalFetch.apply(window, args)
    }

    // Input validation for localStorage
    const originalSetItem = Storage.prototype.setItem
    Storage.prototype.setItem = function(key, value) {
      if (typeof key !== 'string' || key.length > 100) return
      if (typeof value !== 'string' || value.length > 50000) return
      originalSetItem.call(this, key, value)
    }

    // Disable dangerous console methods in production
    if (process.env.NODE_ENV === 'production') {
      console.log = console.warn = console.error = () => {}
    }

  }, [])

  return null
}