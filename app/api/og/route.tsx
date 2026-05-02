import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const title = searchParams.get('title') || 'Forza Color Universe'
    const subtitle = searchParams.get('subtitle') || 'Official Paint Colors Database'
    const stats = searchParams.get('stats') || '10,000+ Colors'
    
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background glow effects */}
          <div
            style={{
              position: 'absolute',
              width: '600px',
              height: '600px',
              background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)',
              borderRadius: '50%',
              top: '-200px',
              left: '-200px',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: '500px',
              height: '500px',
              background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)',
              borderRadius: '50%',
              bottom: '-150px',
              right: '-150px',
            }}
          />
          
          {/* Grid pattern */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />
          
          {/* Main content container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              padding: '40px',
            }}
          >
            {/* Logo/Icon area */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '30px',
              }}
            >
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #3b82f6, #a855f7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 20px 60px rgba(59,130,246,0.5)',
                }}
              >
                <svg
                  width="60"
                  height="60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
              </div>
            </div>
            
            {/* Title */}
            <h1
              style={{
                fontSize: '60px',
                fontWeight: 800,
                color: 'white',
                textAlign: 'center',
                margin: 0,
                marginBottom: '16px',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </h1>
            
            {/* Subtitle */}
            <p
              style={{
                fontSize: '32px',
                color: '#94a3b8',
                textAlign: 'center',
                margin: 0,
                marginBottom: '40px',
              }}
            >
              {subtitle}
            </p>
            
            {/* Stats badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(59,130,246,0.2)',
                border: '1px solid rgba(59,130,246,0.4)',
                borderRadius: '50px',
                padding: '16px 32px',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 20px #22c55e',
                }}
              />
              <span
                style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  color: 'white',
                }}
              >
                {stats}
              </span>
            </div>
            
            {/* Bottom feature tags */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
                marginTop: '40px',
              }}
            >
              {['FH5 Colors', 'TuneForge', 'Location Finder', 'Image Match'].map((tag, i) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '16px',
                    color: '#64748b',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          {/* Bottom URL */}
          <div
            style={{
              position: 'absolute',
              bottom: '30px',
              left: 0,
              right: 0,
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: '18px',
                color: '#64748b',
                margin: 0,
              }}
            >
              {new URL(request.url).hostname}
            </p>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}
