export const usePerformance = () => ({
  measureAsync: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    const start = performance.now()
    const result = await fn()
    console.log(`${name}: ${performance.now() - start}ms`)
    return result
  },
})
