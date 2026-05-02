'use client'

export const dynamic = 'force-dynamic'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif', background: '#111', color: '#fff', minHeight: '100vh' }}>
          <h2>Something went wrong</h2>
          <button onClick={reset} style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
