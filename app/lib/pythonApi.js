const PYTHON_API_BASE = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000/api'

class PythonApiClient {
  constructor(baseUrl = PYTHON_API_BASE) {
    this.baseUrl = baseUrl
    this.isServerAvailable = false
    this.checkServerAvailability()
  }

  async checkServerAvailability() {
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

  async loadColors(colors) {
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

  async analyzeColors(colors, analysisType = 'full') {
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

  async processImageWithML(imageData, colors) {
    if (!this.isServerAvailable) {
      return { success: false, error: 'Python API server not available' }
    }

    try {
      const response = await fetch(`${this.baseUrl}/process-image`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin',
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

  async matchColors(extractedColors, colors, maxMatches = 20) {
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

  async getRecommendations(userPreferences, colors) {
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

  async getColorTrends(timeframe = 'year') {
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

  async getApiStats() {
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

  get serverAvailable() {
    return this.isServerAvailable
  }
}

// Singleton instance
export const pythonApi = new PythonApiClient()

// Utility functions for easy integration
export async function analyzeColors(colors, analysisType = 'full') {
  return pythonApi.analyzeColors(colors, analysisType)
}

export async function processImageWithML(imageData, colors) {
  return pythonApi.processImageWithML(imageData, colors)
}

export async function getColorRecommendations(userPreferences, colors) {
  return pythonApi.getRecommendations(userPreferences, colors)
}

export async function getColorTrends(timeframe = 'year') {
  return pythonApi.getColorTrends(timeframe)
}

export async function matchColorsWithML(extractedColors, colors) {
  return pythonApi.matchColors(extractedColors, colors)
}

// Helper function to convert File to base64
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      resolve(result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Helper function to check if Python API is available
export async function isPythonApiAvailable() {
  const stats = await pythonApi.getApiStats()
  return stats.success
}

export default pythonApi