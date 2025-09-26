import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl mb-8">Page not found</p>
        <Link href="/" className="bg-fuchsia-500 hover:bg-fuchsia-600 px-6 py-3 rounded-lg transition-colors">
          Back to Colors
        </Link>
      </div>
    </div>
  )
}