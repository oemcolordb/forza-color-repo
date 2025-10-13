export default function Blog() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">🚗 Automotive Color Blog</h1>
        
        <div className="grid gap-6">
          <article className="rounded-xl p-6 bg-slate-800 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">Trends</span>
              <span className="text-sm text-gray-500">2024-01-15</span>
            </div>
            <h2 className="text-xl font-semibold mb-3">2024 Popular Car Colors: Trends and Analysis</h2>
            <p className="mb-4 text-gray-300">Discover the most popular automotive paint colors of 2024 based on Forza data analysis.</p>
          </article>
          
          <article className="rounded-xl p-6 bg-slate-800 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">Guide</span>
              <span className="text-sm text-gray-500">2024-01-10</span>
            </div>
            <h2 className="text-xl font-semibold mb-3">How to Choose the Perfect Car Paint Color</h2>
            <p className="mb-4 text-gray-300">Complete guide to selecting automotive colors that match your style and maintain resale value.</p>
          </article>
          
          <article className="rounded-xl p-6 bg-slate-800 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">History</span>
              <span className="text-sm text-gray-500">2024-01-05</span>
            </div>
            <h2 className="text-xl font-semibold mb-3">The History of Ferrari Red: Rosso Corsa</h2>
            <p className="mb-4 text-gray-300">Exploring the iconic Ferrari red color and its evolution through automotive history.</p>
          </article>
        </div>
      </div>
    </div>
  )
}