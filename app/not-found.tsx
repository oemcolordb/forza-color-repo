import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-red-500 to-yellow-500 text-transparent bg-clip-text">
        404
      </h1>
      <h2 className="text-2xl mb-2">🏁 Lost in the Garage!</h2>
      <p className="text-gray-300 mb-4">
        This page could not be found.
      </p>
      <Link
        href="/"
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
      >
        🏠 Back to Color Universe
      </Link>
    </div>
  )
}
