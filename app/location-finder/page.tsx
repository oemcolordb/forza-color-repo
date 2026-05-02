"use client";

export default function LocationFinderPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center justify-center">
      <div className="max-w-xl mx-auto p-8 mt-24 bg-gray-800/80 rounded-2xl shadow-2xl border border-blue-700/40 flex flex-col items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10l6 3M12 10L6 7M12 10v6" />
        </svg>
        <h1 className="text-3xl font-bold mb-2 text-white text-center">Forza Horizon 5 Location Finder</h1>
        <p className="text-lg text-blue-200 mb-4 text-center">Coming Soon</p>
        <p className="text-gray-300 text-center mb-2">The interactive map and location database are being rebuilt with 100% verified in-game data. This feature will return when the data is complete and accurate.</p>
        <p className="text-gray-400 text-center text-sm">
          If you have a MapGenie or community export of all locations,{' '}
          <a href="mailto:admin@oemcolordb.com" className="text-blue-400 underline">contact us</a>{' '}
          to help accelerate the launch.
        </p>
        <a href="/" className="mt-8 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow">← Back to Home</a>
      </div>
    </div>
  )
}
