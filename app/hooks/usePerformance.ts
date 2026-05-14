import { useCallback } from 'react'

export const usePerformance = () => {
  const measureAsync = useCallback(async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    const start = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - start

      if (process.env.NODE_ENV === 'development') {
        console.warn(`Performance: ${name.replace(/[\r\n]/g, '')} took ${duration.toFixed(2)}ms`)
      }

      return result
    } catch (error) {
      const duration = performance.now() - start

      if (process.env.NODE_ENV === 'development') {
        console.error(`Performance: ${name.replace(/[\r\n]/g, '')} failed after ${duration.toFixed(2)}ms`)
      }

      throw error
    }
  }, [])

  return { measureAsync }
}
