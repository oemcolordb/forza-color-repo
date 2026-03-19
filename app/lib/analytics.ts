/**
 * Analytics Tracking Utility
 * Tracks user interactions and events
 */

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

export interface PageView {
  path: string;
  title?: string;
  referrer?: string;
}

class AnalyticsManager {
  private isEnabled = true;
  private queue: AnalyticsEvent[] = [];
  private sessionId: string;
  private userId: string | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    // Delay loadUserId until client-side
    if (typeof window !== 'undefined') {
      this.loadUserId();
    }
  }

  /**
   * Track a custom event
   * @param event - Event data
   */
  track(event: AnalyticsEvent): void {
    if (!this.isEnabled) return;

    const enrichedEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    };

    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.metadata
      });
    }

    // Send to custom analytics endpoint
    this.sendToEndpoint(enrichedEvent);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', enrichedEvent);
    }
  }

  /**
   * Track page view
   * @param pageView - Page view data
   */
  trackPageView(pageView: PageView): void {
    if (!this.isEnabled) return;

    this.track({
      category: 'Navigation',
      action: 'page_view',
      label: pageView.path,
      metadata: {
        title: pageView.title,
        referrer: pageView.referrer
      }
    });
  }

  /**
   * Track color interaction
   * @param action - Action type
   * @param colorName - Color name
   * @param metadata - Additional data
   */
  trackColorInteraction(action: string, colorName: string, metadata?: Record<string, any>): void {
    this.track({
      category: 'Color',
      action,
      label: colorName,
      metadata
    });
  }

  /**
   * Track search
   * @param query - Search query
   * @param resultsCount - Number of results
   */
  trackSearch(query: string, resultsCount: number): void {
    this.track({
      category: 'Search',
      action: 'search_performed',
      label: query,
      value: resultsCount
    });
  }

  /**
   * Track export
   * @param format - Export format
   * @param itemCount - Number of items exported
   */
  trackExport(format: string, itemCount: number): void {
    this.track({
      category: 'Export',
      action: 'export_completed',
      label: format,
      value: itemCount
    });
  }

  /**
   * Track error
   * @param error - Error object
   * @param context - Error context
   */
  trackError(error: Error, context?: string): void {
    this.track({
      category: 'Error',
      action: 'error_occurred',
      label: error.message,
      metadata: {
        stack: error.stack,
        context
      }
    });
  }

  /**
   * Track performance metric
   * @param metric - Metric name
   * @param value - Metric value in milliseconds
   */
  trackPerformance(metric: string, value: number): void {
    this.track({
      category: 'Performance',
      action: metric,
      value: Math.round(value)
    });
  }

  /**
   * Set user ID
   * @param userId - User identifier
   */
  setUserId(userId: string): void {
    this.userId = userId;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('analytics_user_id', userId);
    }
  }

  /**
   * Enable analytics
   */
  enable(): void {
    this.isEnabled = true;
  }

  /**
   * Disable analytics
   */
  disable(): void {
    this.isEnabled = false;
  }

  /**
   * Send event to analytics endpoint
   */
  private async sendToEndpoint(event: any): Promise<void> {
    try {
      // Send to custom analytics API
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }).catch(() => {
        // Queue for retry if offline
        this.queue.push(event);
      });
    } catch (error) {
      console.error('[Analytics] Failed to send event:', error);
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load user ID from storage
   */
  private loadUserId(): void {
    if (typeof localStorage !== 'undefined') {
      this.userId = localStorage.getItem('analytics_user_id');
    }
  }

  /**
   * Flush queued events
   */
  async flush(): Promise<void> {
    const events = [...this.queue];
    this.queue = [];

    for (const event of events) {
      await this.sendToEndpoint(event);
    }
  }
}

// Singleton instance
const analytics = new AnalyticsManager();

// Export convenience functions
export function trackEvent(event: AnalyticsEvent): void {
  analytics.track(event);
}

export function trackPageView(pageView: PageView): void {
  analytics.trackPageView(pageView);
}

export function trackColorInteraction(action: string, colorName: string, metadata?: Record<string, any>): void {
  analytics.trackColorInteraction(action, colorName, metadata);
}

export function trackSearch(query: string, resultsCount: number): void {
  analytics.trackSearch(query, resultsCount);
}

export function trackExport(format: string, itemCount: number): void {
  analytics.trackExport(format, itemCount);
}

export function trackError(error: Error, context?: string): void {
  analytics.trackError(error, context);
}

export function trackPerformance(metric: string, value: number): void {
  analytics.trackPerformance(metric, value);
}

export function setUserId(userId: string): void {
  analytics.setUserId(userId);
}

export function enableAnalytics(): void {
  analytics.enable();
}

export function disableAnalytics(): void {
  analytics.disable();
}

export default analytics;
