/**
 * /api/scrape
 *
 * Server-side proxy for Firecrawl scraping.
 * Client components must call this route instead of hitting api.firecrawl.dev
 * directly — browsers are blocked by CORS and the API key must stay server-side.
 *
 * GET /api/scrape?source=IGN
 * GET /api/scrape?source=G4G
 *
 * Returns: { markdown: string | null }
 */

import { NextRequest, NextResponse } from 'next/server'
import { safeScrape, FH5_SOURCES, SourceKey } from '../../../src/lib/firecrawl'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get('source') as SourceKey | null

  if (!source || !(source in FH5_SOURCES)) {
    return NextResponse.json(
      { error: 'Invalid source. Valid values: IGN, G4G' },
      { status: 400 }
    )
  }

  const markdown = await safeScrape(source)
  return NextResponse.json({ markdown })
}
