import { useCallback } from 'react'

export const usePerformance = () => {
  const measureAsync = useCallback(async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    const start = performance.now()
    try {
      const result = await fn()
      const end = performance.now()
      const duration = end - start
      
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Performance: ${name} took ${duration.toFixed(2)}ms`)
      }
      
      return result
    } catch (error) {
      const end = performance.now()
      const duration = end - start
      
      if (process.env.NODE_ENV === 'development') {
        console.error(`Performance: ${name} failed after ${duration.toFixed(2)}ms`, error)
      }
      
      throw error
    }
  }, [])

  return {
    measureAsync,
  }
}