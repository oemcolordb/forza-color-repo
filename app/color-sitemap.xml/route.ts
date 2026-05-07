import { NextResponse } from 'next/server'
import { logger } from '../../lib/logger'

export async function GET() {
  try {
    // Import color data
    const { getColorData } = await import('../../services/colorDataLazy')
    const colors = await getColorData()

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://forza-color-repo.vercel.app'

    // Generate XML sitemap for color-specific URLs
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/forza-color-sheet</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>${baseUrl}/?search=forza+colors</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/?search=automotive+paint</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/?search=racing+colors</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  ${Array.from(new Set(colors.map((c: any) => c.make)))
    .slice(0, 50)
    .map(
      (make: unknown) => `
  <url>
    <loc>${baseUrl}/?make=${encodeURIComponent(String(make))}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join('')}
</urlset>`

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=7200',
      },
    })
  } catch (error) {
    logger.error('Color sitemap generation error:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
