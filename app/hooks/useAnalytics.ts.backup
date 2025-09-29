import { useCallback } from 'react'

interface AnalyticsEvent {
  action: 'view' | 'favorite' | 'search' | 'filter'
  colorName?: string
  make?: string
  query?: string
  timestamp?: string
}

export const useAnalytics = () => {
  const track = useCallback(async (event: AnalyticsEvent) => {
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
        fetch('/.netlify/functions/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
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
        .filter((event: AnalyticsEvent) => event.action === 'view' && event.colorName)
        .reduce((acc: Record<string, number>, event: AnalyticsEvent) => {
          const key = `${event.make}-${event.colorName}`
          acc[key] = (acc[key] || 0) + 1
          return acc
        }, {})
      
      return Object.entries(colorViews)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 20)
    } catch {
      return []
    }
  }, [])

  return { track, getHeatmapData }
}