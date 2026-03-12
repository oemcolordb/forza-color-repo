'use client'

import React, { useState, useEffect } from 'react'

interface ColorRanking {
  colorId: string
  colorName: string
  make: string
  model: string | null
  colorType: string | null
  totalFavorites: number
  currentFavorites: number
  lastUpdated: string
}

interface TrendData {
  date: string
  total: number
  adds: number
  removes: number
}

interface MakeStats {
  make: string
  totalFavorites: number
  colorCount: number
}

interface AnalyticsData {
  topColors: ColorRanking[]
  trendData: TrendData[]
  topMakes: MakeStats[]
  topColorTypes: { colorType: string; totalFavorites: number; colorCount: number }[]
  stats: {
    uniqueSessions: number
    uniqueUsers: number
    totalActions: number
    totalAdds: number
    totalRemoves: number
  }
  generatedAt: string
}

export default function DevAnalyticsPage() {
  const [devKey, setDevKey] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('7d')

  const fetchAnalytics = async () => {
    if (!devKey) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/dev/analytics?key=${devKey}&range=${timeRange}&limit=50`)
      
      if (response.status === 401) {
        setError('Invalid dev key')
        setIsAuthenticated(false)
        return
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      
      const result = await response.json()
      setData(result.data)
      setIsAuthenticated(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalytics()
    }
  }, [timeRange, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">🔐 Dev Analytics</h1>
          <p className="text-gray-400 text-sm mb-4 text-center">
            Enter your dev analytics key to access the dashboard
          </p>
          <input
            type="password"
            value={devKey}
            onChange={(e) => setDevKey(e.target.value)}
            placeholder="Enter dev key..."
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg mb-4 text-white"
            onKeyDown={(e) => e.key === 'Enter' && fetchAnalytics()}
          />
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button
            onClick={fetchAnalytics}
            disabled={loading || !devKey}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">📊 Favorites Analytics</h1>
            <p className="text-gray-400 text-sm">
              Secret dev dashboard • Last updated: {data?.generatedAt ? new Date(data.generatedAt).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
              aria-label="Time range filter"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </select>
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '⟳' : '↻'} Refresh
            </button>
            <button
              onClick={() => {
                setIsAuthenticated(false)
                setDevKey('')
                setData(null)
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {data && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <StatCard title="Unique Sessions" value={data.stats.uniqueSessions || 0} />
              <StatCard title="Unique Users" value={data.stats.uniqueUsers || 0} />
              <StatCard title="Total Actions" value={data.stats.totalActions || 0} />
              <StatCard title="Total Adds" value={data.stats.totalAdds || 0} color="green" />
              <StatCard title="Total Removes" value={data.stats.totalRemoves || 0} color="red" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Top Colors Chart */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h2 className="text-xl font-bold mb-4">🏆 Top Favorited Colors</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {data.topColors.slice(0, 20).map((color, index) => (
                    <div key={color.colorId} className="flex items-center gap-3">
                      <span className="text-gray-500 w-6 text-right">{index + 1}.</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{color.colorName}</span>
                          <span className="text-blue-400 font-bold">{color.currentFavorites}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {color.make} {color.model && `• ${color.model}`} {color.colorType && `• ${color.colorType}`}
                        </div>
                        <div className="mt-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            style={{
                              width: `${Math.min(100, (color.currentFavorites / (data.topColors[0]?.currentFavorites || 1)) * 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {data.topColors.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No favorites data yet</p>
                  )}
                </div>
              </div>

              {/* Trend Chart */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h2 className="text-xl font-bold mb-4">📈 Daily Trend (Last 30 Days)</h2>
                <div className="h-64 flex items-end gap-1">
                  {data.trendData.length > 0 ? (
                    data.trendData.slice(0, 30).reverse().map((day) => {
                      const maxTotal = Math.max(...data.trendData.map(d => d.total), 1)
                      const height = (day.total / maxTotal) * 100
                      return (
                        <div
                          key={day.date}
                          className="flex-1 flex flex-col items-center group relative"
                        >
                          <div
                            className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:from-blue-500 hover:to-blue-300"
                            style={{ height: `${Math.max(height, 2)}%` }}
                          />
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-xs p-2 rounded shadow-lg whitespace-nowrap z-10">
                            <div className="font-bold">{day.date}</div>
                            <div className="text-green-400">+{day.adds} adds</div>
                            <div className="text-red-400">-{day.removes} removes</div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-gray-500 text-center w-full py-8">No trend data yet</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Makes */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h2 className="text-xl font-bold mb-4">🚗 Top Makes</h2>
                <div className="space-y-2">
                  {data.topMakes.map((make, index) => (
                    <div key={make.make} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{index + 1}.</span>
                        <span className="font-medium">{make.make}</span>
                        <span className="text-xs text-gray-500">({make.colorCount} colors)</span>
                      </div>
                      <span className="text-blue-400 font-bold">{make.totalFavorites}</span>
                    </div>
                  ))}
                  {data.topMakes.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No data yet</p>
                  )}
                </div>
              </div>

              {/* Top Color Types */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h2 className="text-xl font-bold mb-4">🎨 Top Color Types</h2>
                <div className="space-y-2">
                  {data.topColorTypes.map((type, index) => (
                    <div key={type.colorType} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{index + 1}.</span>
                        <span className="font-medium">{type.colorType || 'Unknown'}</span>
                        <span className="text-xs text-gray-500">({type.colorCount} colors)</span>
                      </div>
                      <span className="text-purple-400 font-bold">{type.totalFavorites}</span>
                    </div>
                  ))}
                  {data.topColorTypes.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No data yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Full Rankings Table */}
            <div className="mt-8 bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-xl font-bold mb-4">📋 Full Rankings</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left p-2">#</th>
                      <th className="text-left p-2">Color</th>
                      <th className="text-left p-2">Make</th>
                      <th className="text-left p-2">Model</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-right p-2">Current ❤</th>
                      <th className="text-right p-2">Total</th>
                      <th className="text-right p-2">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topColors.map((color, index) => (
                      <tr key={color.colorId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-2 text-gray-500">{index + 1}</td>
                        <td className="p-2 font-medium">{color.colorName}</td>
                        <td className="p-2">{color.make}</td>
                        <td className="p-2 text-gray-400">{color.model || '-'}</td>
                        <td className="p-2 text-gray-400">{color.colorType || '-'}</td>
                        <td className="p-2 text-right text-blue-400 font-bold">{color.currentFavorites}</td>
                        <td className="p-2 text-right text-gray-400">{color.totalFavorites}</td>
                        <td className="p-2 text-right text-gray-500 text-xs">
                          {new Date(color.lastUpdated).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.topColors.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No favorites data yet</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, color = 'blue' }: { title: string; value: number; color?: string }) {
  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    red: 'text-red-400',
  }
  
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <p className="text-gray-400 text-sm">{title}</p>
      <p className={`text-2xl font-bold ${colorClasses[color as keyof typeof colorClasses]}`}>
        {value.toLocaleString()}
      </p>
    </div>
  )
}
