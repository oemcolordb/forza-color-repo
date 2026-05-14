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
      // 1. Local Storage Tracking (Offline/Legacy)
      const analytics: AnalyticsEvent[] = JSON.parse(localStorage.getItem('forza-analytics') || '[]')
      const timestamp = event.timestamp || new Date().toISOString()
      analytics.push({ ...event, timestamp })

      if (analytics.length > 1000) {
        analytics.splice(0, analytics.length - 1000)
      }
      localStorage.setItem('forza-analytics', JSON.stringify(analytics))

      // 2. Remote Tracking (New Community Analytics)
      // Derive color_id if present
      if (event.colorName && event.make) {
        const color_id = `${event.make}-${event.colorName}-${event.year || 'unknown'}`
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            color_id,
            action: event.action || 'view',
            user_id: localStorage.getItem('forza-user-id') || null
          })
        }).catch(() => {}) // Silent fail for analytics
      }
    } catch {
      // Fail silently
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
    } catch {
      return []
    }
  }, [])

  return { track, getHeatmapData }
}
