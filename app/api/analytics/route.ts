import { NextResponse } from 'next/server';
import { rateLimiter, getClientIp, createRateLimitHeaders } from '@/app/lib/rateLimit';

/**
 * POST /api/analytics
 * Receive and log analytics events
 */
export async function POST(request: Request) {
  // Rate limiting - allow more requests for analytics
  const clientIp = getClientIp(request);
  const rateLimit = rateLimiter.check(clientIp, 100, 60000); // 100 requests per minute
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { 
        status: 429,
        headers: createRateLimitHeaders(rateLimit)
      }
    );
  }

  try {
    const event = await request.json();

    // Validate event structure
    if (!event.category || !event.action) {
      return NextResponse.json(
        { error: 'Invalid event structure' },
        { status: 400 }
      );
    }

    // Log event (in production, send to analytics service)
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to analytics service (Google Analytics, Mixpanel, etc.)
      console.log('[Analytics]', {
        category: event.category,
        action: event.action,
        label: event.label,
        timestamp: event.timestamp
      });
    }

    return NextResponse.json(
      { success: true },
      { headers: createRateLimitHeaders(rateLimit) }
    );
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to process event' },
      { status: 500 }
    );
  }
}
