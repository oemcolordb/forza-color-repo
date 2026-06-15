'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service or browser console
    console.error('Error boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto p-6">
        <h1 className="text-6xl font-bold mb-4">500</h1>
        <p className="text-xl mb-4">Something went wrong</p>
        <div className="bg-red-900/50 text-red-200 p-4 rounded-lg mb-8 text-left text-sm overflow-auto break-words">
          <p className="font-bold">Error Details:</p>
          <p>{error.message || 'No error message available'}</p>
          {error.digest && <p className="mt-2 text-xs text-red-300">Digest: {error.digest}</p>}
        </div>
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
