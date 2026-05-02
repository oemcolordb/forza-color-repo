'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'

export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">500</h1>
        <p className="text-xl mb-8">Something went wrong</p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="bg-fuchsia-500 hover:bg-fuchsia-600 px-6 py-3 rounded-lg transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg transition-colors inline-block"
          >
            Back to Colors
          </Link>
        </div>
      </div>
    </div>
  )
}
