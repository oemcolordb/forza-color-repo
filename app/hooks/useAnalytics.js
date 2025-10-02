import { useCallback } from 'react'
import { sanitizeInput, secureApiCall } from '../lib/security'

export const useAnalytics = () => {
  const track = useCallback(async (event) => {
    try {
      const analytics = JSON.parse(localStorage.getItem('forza-analytics') || '[]')
      analytics.push({
        ...event,
        timestamp: event.timestamp || new Date().toISOString()
      })
      
      if (analytics.length > 1000) {
        analytics.splice(0, analytics.length - 1000)
      }
      
      localStorage.setItem('forza-analytics', JSON.stringify(analytics))
      
      if (navigator.onLine) {
        secureApiCall('/.netlify/functions/analytics', {
          method: 'POST',
          body: JSON.stringify({
            ...event,
            colorName: sanitizeInput(event.colorName),
            make: sanitizeInput(event.make)
          })
        }).catch(() => {})
      }
    } catch {
      // Fail silently
    }
  }, [])

  const getHeatmapData = useCallback(() => {
    try {
      const analytics = JSON.parse(localStorage.getItem('forza-analytics') || '[]')
      const colorViews = analytics
        .filter((event) => event.action === 'view' && event.colorName)
        .reduce((acc, event) => {
          const key = `${event.make}-${event.colorName}`
          acc[key] = (acc[key] || 0) + 1
          return acc
        }, {})
      
      return Object.entries(colorViews)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20)
    } catch {
      return []
    }
  }, [])

  return { track, getHeatmapData }
}