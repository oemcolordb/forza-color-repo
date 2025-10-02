// Console cleanup and error prevention
export const ConsoleCleanup = () => {
  if (typeof window !== 'undefined') {
    // Prevent third-party script errors from showing in console
    const originalError = console.error
    console.error = (...args) => {
      const message = args[0]?.toString() || ''
      
      // Filter out known third-party errors
      if (
        message.includes('dlnk.one') ||
        message.includes('content.js') ||
        message.includes('Failed to fetch') && message.includes('dlnk')
      ) {
        return // Suppress these errors
      }
      
      originalError.apply(console, args)
    }
    
    // Prevent CORS errors from third-party scripts
    const originalFetch = window.fetch
    window.fetch = (...args) => {
      const url = args[0]?.toString() || ''
      
      // Block known problematic domains
      if (url.includes('dlnk.one')) {
        return Promise.reject(new Error('Blocked third-party request'))
      }
      
      return originalFetch.apply(window, args)
    }
  }
  
  return null
}