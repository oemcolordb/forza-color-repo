/**
 * Self polyfill for Node.js environment
 * This ensures 'self' is defined as 'globalThis' before any code runs
 */
;(function() {
  'use strict'
  // Only define self if it doesn't exist and we're not in a browser
  if (typeof self === 'undefined' && typeof window === 'undefined') {
    try {
      Object.defineProperty(globalThis, 'self', {
        value: globalThis,
        configurable: true,
        writable: true,
      })
    } catch (e) {
      // Fallback if defineProperty fails
      globalThis.self = globalThis
    }
  }
})()
