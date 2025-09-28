import type { CarColor } from '../types/color'

const PYTHON_API_BASE = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000/api'

interface PythonApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface ColorAnalysisResult {
  total_colors: number
  dominant_clusters: Array<{
    cluster_id: number
    size: number
    percentage: number
    centroid_lab: number[]
    variance: number
  }>
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

interface ExtractedColor {
  r: number
  g: number
  b: number
  h: number
  s: number
  v: number
  percentage: number
  count: number
  method: string
  automotive_score?: number
}

interface ColorMatch extends CarColor {
  similarity_score: number
  distance: number
  match_type: string
}

interface ImageProcessingResult {
  extracted_colors: ExtractedColor[]
  matches: ColorMatch[]
  extraction_stats: {
    total_extracted: number
    total_matches: number
    processing_method: string
  }
}

class PythonApiClient {
  private baseUrl: string
  private isServerAvailable: boolean = false

  constructor(baseUrl: string = PYTHON_API_BASE) {
    this.baseUrl = baseUrl
    this.checkServerAvailability()
  }

  private async checkServerAvailability(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      this.isServerAvailable = response.ok
    } catch {
      this.isServerAvailable = false
    }
  }

  async loadColors(colors: CarColor[]): Promise<PythonApiResponse> {
    if (!this.isServerAvailable) {
      return { success: false, error: 'Python API server not available' }
    }

    try {
      const response = await fetch(`${this.baseUrl}/load-colors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(colors)
      })

      return await response.json()
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to load colors' 
      }
    }
  }

  async analyzeColors(
    colors: CarColor[], 
    analysisType: 'full' | 'trends' = 'full'
  ): Promise<PythonApiResponse<{ analysis: ColorAnalysisResult }>> {
    if (!this.isServerAvailable) {
      return { success: false, error: 'Python API server not available' }
    }

    try {
      const response = await fetch(`${this.baseUrl}/analyze-colors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colors, analysisType })
      })

      return await response.json()
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Color analysis failed' 
      }
    }
  }

  async processImageWithML(
    imageData: string, 
    colors: CarColor[]
  ): Promise<PythonApiResponse<ImageProcessingResult>> {
    if (!this.isServerAvailable) {
      return { success: false, error: 'Python API server not available' }
    }

    try {
      const response = await fetch(`${this.baseUrl}/process-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData, colors })
      })

      return await response.json()
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Image processing failed' 
      }
    }
  }

  async matchColors(
    extractedColors: ExtractedColor[], 
    colors: CarColor[], 
    maxMatches: number = 20
  ): Promise<PythonApiResponse<{ matches: ColorMatch[] }>> {
    if (!this.isServerAvailable) {
      return { success: false, error: 'Python API server not available' }
    }

    try {
      const response = await fetch(`${this.baseUrl}/match-colors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extractedColors, colors, maxMatches })
      })

      return await response.json()
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Color matching failed' 
      }
    }
  }

  async getRecommendations(
    userPreferences: CarColor[], 
    colors: CarColor[]
  ): Promise<PythonApiResponse<{ recommendations: CarColor[] }>> {
    if (!this.isServerAvailable) {
      return { success: false, error: 'Python API server not available' }
    }

    try {
      const response = await fetch(`${this.baseUrl}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPreferences, colors })
      })

      return await response.json()
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Recommendations failed' 
      }
    }
  }

  async getColorTrends(timeframe: string = 'year'): Promise<PythonApiResponse> {
    if (!this.isServerAvailable) {
      return { success: false, error: 'Python API server not available' }
    }

    try {
      const response = await fetch(`${this.baseUrl}/color-trends/${timeframe}`)
      return await response.json()
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Trends analysis failed' 
      }
    }
  }

  async getApiStats(): Promise<PythonApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`)
      const result = await response.json()
      this.isServerAvailable = response.ok
      return result
    } catch (error) {
      this.isServerAvailable = false
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'API not available' 
      }
    }
  }

  get serverAvailable(): boolean {
    return this.isServerAvailable
  }
}

// Singleton instance
export const pythonApi = new PythonApiClient()

// Utility functions for easy integration
export async function analyzeColors(colors: CarColor[], analysisType: 'full' | 'trends' = 'full') {
  return pythonApi.analyzeColors(colors, analysisType)
}

export async function processImageWithML(imageData: string, colors: CarColor[]) {
  return pythonApi.processImageWithML(imageData, colors)
}

export async function getColorRecommendations(userPreferences: CarColor[], colors: CarColor[]) {
  return pythonApi.getRecommendations(userPreferences, colors)
}

export async function getColorTrends(timeframe: string = 'year') {
  return pythonApi.getColorTrends(timeframe)
}

export async function matchColorsWithML(extractedColors: ExtractedColor[], colors: CarColor[]) {
  return pythonApi.matchColors(extractedColors, colors)
}

// Helper function to convert File to base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Helper function to check if Python API is available
export async function isPythonApiAvailable(): Promise<boolean> {
  const stats = await pythonApi.getApiStats()
  return stats.success
}

export default pythonApi