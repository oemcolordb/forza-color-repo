/**
 * logger.ts — simple production-safe logger
 */

const isDev = process.env.NODE_ENV === 'development'

export const logger = {
  log: (...args: any[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(...args)
    }
  },
  error: (...args: any[]) => {
     
    console.error(...args)
    // Optional: Send to error tracking service like Sentry or Axiom
  },
  warn: (...args: any[]) => {
    if (isDev) {
       
      console.warn(...args)
    }
  },
  info: (...args: any[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.info(...args)
    }
  }
}
