import { useCallback } from 'react'

interface AnalyticsEvent {
  action?: string
  colorName?: string
  make?: string
  timestamp?: string
  [key: string]: unknown
}

export const useAnalytics = () => {
  const track = useCallback(async (event: AnalyticsEvent) => {
    try {
      const analytics: AnalyticsEvent[] = JSON.parse(localStorage.getItem('forza-analytics') || '[]')
      analytics.push({
        ...event,
        timestamp: event.timestamp || new Date().toISOString(),
      })

      if (analytics.length > 1000) {
        analytics.splice(0, analytics.length - 1000)
      }

      localStorage.setItem('forza-analytics', JSON.stringify(analytics))
    } catch (error) {
      // Fail silently — analytics should never break the app
      console.warn('Analytics track failed:', error)
    }
  }, [])

  const getHeatmapData = useCallback((): [string, number][] => {
    try {
      const analytics: AnalyticsEvent[] = JSON.parse(localStorage.getItem('forza-analytics') || '[]')
      const colorViews = analytics
        .filter(event => event.action === 'view' && event.colorName)
        .reduce<Record<string, number>>((acc, event) => {
          const key = `${event.make}-${event.colorName}`
          acc[key] = (acc[key] || 0) + 1
          return acc
        }, {})

      return Object.entries(colorViews)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
    } catch (error) {
      console.warn('Analytics getHeatmapData failed:', error)
      return []
    }
  }, [])

  return { track, getHeatmapData }
}
