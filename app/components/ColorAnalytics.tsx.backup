import React, { useState, useEffect, useMemo } from 'react'
import type { CarColor } from '../types/color'
import { analyzeColors, getColorTrends, isPythonApiAvailable } from '../lib/pythonApi'

interface ColorAnalyticsProps {
  colors: CarColor[]
  isDarkMode: boolean
  selectedMake?: string
  selectedColorType?: string
}

interface AnalysisData {
  total_colors: number
  harmony_analysis: {
    harmony_score: number
    contrast_score: number
    average_distance: number
  }
  manufacturer_analysis: Record<string, {
    count: number
    diversity_score: number
  }>
  color_type_distribution: Record<string, {
    count: number
    percentage: number
  }>
  perceptual_stats: {
    lightness: { mean: number; std: number; range: [number, number] }
    green_red_axis: { mean: number; std: number; range: [number, number] }
    blue_yellow_axis: { mean: number; std: number; range: [number, number] }
  }
}

const ColorAnalytics: React.FC<ColorAnalyticsProps> = ({
  colors,
  isDarkMode,
  selectedMake,
  selectedColorType
}) => {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [trends, setTrends] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pythonApiAvailable, setPythonApiAvailable] = useState(false)

  // Filter colors based on selections
  const filteredColors = useMemo(() => {
    return colors.filter(color => {
      const makeMatch = !selectedMake || color.make === selectedMake
      const typeMatch = !selectedColorType || color.colorType === selectedColorType
      return makeMatch && typeMatch
    })
  }, [colors, selectedMake, selectedColorType])

  // Check Python API availability
  useEffect(() => {
    isPythonApiAvailable().then(setPythonApiAvailable)
  }, [])

  // Perform analysis when colors change
  useEffect(() => {
    if (!pythonApiAvailable || filteredColors.length === 0) return

    const performAnalysis = async () => {
      setLoading(true)
      setError(null)

      try {
        // Get color analysis
        const analysisResult = await analyzeColors(filteredColors, 'full')
        
        if (analysisResult.success) {
          setAnalysis(analysisResult.data?.analysis || null)
        } else {
          setError(analysisResult.error || 'Analysis failed')
        }

        // Get trends if we have year data
        const hasYearData = filteredColors.some(c => c.year)
        if (hasYearData) {
          const trendsResult = await getColorTrends('year')
          if (trendsResult.success) {
            setTrends(trendsResult.data)
          }
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed')
      } finally {
        setLoading(false)
      }
    }

    performAnalysis()
  }, [filteredColors, pythonApiAvailable])

  if (!pythonApiAvailable) {
    return (
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-700'}`}>
        <p className="text-sm">
          🐍 Python API not available. Advanced analytics disabled.
          <br />
          <span className="text-xs opacity-75">
            Start Python services for ML-powered color analysis.
          </span>
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-500"></div>
          <span className={`ml-3 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
            Analyzing colors with ML...
          </span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-50 text-red-800'}`}>
        <p className="text-sm">❌ {error}</p>
      </div>
    )
  }

  if (!analysis) return null

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
      <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>
        🧠 Advanced Color Analytics
      </h3>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Colors"
          value={analysis.total_colors.toLocaleString()}
          isDarkMode={isDarkMode}
        />
        <StatCard
          title="Harmony Score"
          value={analysis.harmony_analysis.harmony_score.toFixed(1)}
          subtitle="/100"
          isDarkMode={isDarkMode}
        />
        <StatCard
          title="Manufacturers"
          value={Object.keys(analysis.manufacturer_analysis).length}
          isDarkMode={isDarkMode}
        />
        <StatCard
          title="Color Types"
          value={Object.keys(analysis.color_type_distribution).length}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Color Type Distribution */}
      <div className="mb-6">
        <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
          Color Type Distribution
        </h4>
        <div className="space-y-2">
          {Object.entries(analysis.color_type_distribution)
            .sort(([,a], [,b]) => b.count - a.count)
            .slice(0, 8)
            .map(([type, data]) => (
              <div key={type} className="flex items-center justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  {type}
                </span>
                <div className="flex items-center space-x-2">
                  <div className={`w-24 h-2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                    <div 
                      className="h-full bg-fuchsia-500 rounded-full"
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    {data.count}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Top Manufacturers */}
      <div className="mb-6">
        <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
          Top Manufacturers
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(analysis.manufacturer_analysis)
            .sort(([,a], [,b]) => b.count - a.count)
            .slice(0, 10)
            .map(([make, data]) => (
              <div key={make} className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>
                    {make}
                  </span>
                  <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    {data.count} colors
                  </span>
                </div>
                <div className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                  Diversity: {data.diversity_score.toFixed(1)}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Perceptual Statistics */}
      <div className="mb-6">
        <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
          Perceptual Color Analysis
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PerceptualStat
            title="Lightness"
            stats={analysis.perceptual_stats.lightness}
            isDarkMode={isDarkMode}
          />
          <PerceptualStat
            title="Green-Red Axis"
            stats={analysis.perceptual_stats.green_red_axis}
            isDarkMode={isDarkMode}
          />
          <PerceptualStat
            title="Blue-Yellow Axis"
            stats={analysis.perceptual_stats.blue_yellow_axis}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>

      {/* Color Harmony Insights */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
        <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
          🎨 Color Harmony Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className={`block font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Harmony Score
            </span>
            <span className={`text-lg font-bold ${getHarmonyColor(analysis.harmony_analysis.harmony_score)}`}>
              {analysis.harmony_analysis.harmony_score.toFixed(1)}/100
            </span>
          </div>
          <div>
            <span className={`block font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Contrast Level
            </span>
            <span className={`text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>
              {analysis.harmony_analysis.contrast_score.toFixed(1)}
            </span>
          </div>
          <div>
            <span className={`block font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Color Diversity
            </span>
            <span className={`text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>
              {analysis.harmony_analysis.average_distance.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper components
const StatCard: React.FC<{
  title: string
  value: string | number
  subtitle?: string
  isDarkMode: boolean
}> = ({ title, value, subtitle, isDarkMode }) => (
  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
    <div className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
      {title}
    </div>
    <div className={`text-2xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>
      {value}
      {subtitle && <span className="text-sm font-normal opacity-75">{subtitle}</span>}
    </div>
  </div>
)

const PerceptualStat: React.FC<{
  title: string
  stats: { mean: number; std: number; range: [number, number] }
  isDarkMode: boolean
}> = ({ title, stats, isDarkMode }) => (
  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
    <div className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
      {title}
    </div>
    <div className="space-y-1 text-xs">
      <div className={`flex justify-between ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
        <span>Mean:</span>
        <span>{stats.mean.toFixed(1)}</span>
      </div>
      <div className={`flex justify-between ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
        <span>Std Dev:</span>
        <span>{stats.std.toFixed(1)}</span>
      </div>
      <div className={`flex justify-between ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
        <span>Range:</span>
        <span>{stats.range[0].toFixed(1)} - {stats.range[1].toFixed(1)}</span>
      </div>
    </div>
  </div>
)

// Helper function for harmony score color coding
function getHarmonyColor(score: number): string {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-yellow-500'
  if (score >= 40) return 'text-orange-500'
  return 'text-red-500'
}

export default ColorAnalytics