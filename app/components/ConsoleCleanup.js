// Console cleanup and error prevention
export const ConsoleCleanup = () => {
  if (typeof window !== 'undefined') {
    // Only run once to prevent recursive calls
    if (window.__consoleCleanupApplied) return null
    window.__consoleCleanupApplied = true

    // Prevent third-party script errors from showing in console
    const originalError = console.error
    console.error = (...args) => {
      const message = args[0]?.toString() || ''

      // Filter out known third-party errors and React warnings we can't fix
      if (
        message.includes('dlnk.one') ||
        message.includes('content.js') ||
        message.includes('ConsoleCleanup.console.error') ||
        (message.includes('Failed to fetch') && message.includes('dlnk'))
      ) {
        return // Suppress these errors
      }

      originalError.apply(console, args)
    }
  }

  return null
}
