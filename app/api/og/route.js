export const runtime = 'nodejs'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const title = (searchParams.get('title') || 'Forza Color Universe').replace(/</g, '&lt;')
    const subtitle = (searchParams.get('subtitle') || 'Official Paint Colors Database').replace(/</g, '&lt;')
    const stats = (searchParams.get('stats') || '10,000+ Colors').replace(/</g, '&lt;')

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <filter id="f" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="80" result="b" />
      <feBlend in="SourceGraphic" in2="b" />
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)" />
  <g opacity="0.25">
    <circle cx="-100" cy="-100" r="300" fill="#3b82f6" filter="url(#f)" />
    <circle cx="1300" cy="730" r="260" fill="#a855f7" filter="url(#f)" />
  </g>
  <g transform="translate(0,40)">
    <rect x="50" y="40" rx="20" ry="20" width="100" height="100" fill="#3b82f6" />
    <text x="180" y="110" font-family="Inter, Arial, sans-serif" font-size="56" font-weight="800" fill="#ffffff">${title}</text>
    <text x="180" y="160" font-family="Inter, Arial, sans-serif" font-size="28" fill="#94a3b8">${subtitle}</text>
    <rect x="180" y="180" rx="28" ry="28" height="56" fill="rgba(59,130,246,0.12)" />
    <text x="200" y="220" font-family="Inter, Arial, sans-serif" font-size="24" fill="#ffffff">${stats}</text>
  </g>
  <text x="600" y="600" font-family="Inter, Arial, sans-serif" font-size="18" fill="#94a3b8" text-anchor="middle">${req.headers.get('host') || ''}</text>
</svg>`

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=600',
      },
    })
  } catch (err) {
    console.error('OG generation failed:', err)
    return new Response('Failed to generate image', { status: 500 })
  }
}
