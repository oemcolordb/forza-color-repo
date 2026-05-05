import { CarColor } from '../types'

const PYTHON_API_BASE = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000/api'

export async function processImageWithML(imageData: string, colors: CarColor[]) {
  const response = await fetch(`${PYTHON_API_BASE}/process-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageData, colors }),
  })
  if (!response.ok) {
    throw new Error(`Image processing failed: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export async function analyzeColors(colors: CarColor[]) {
  const response = await fetch(`${PYTHON_API_BASE}/analyze-colors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ colors, analysisType: 'full' }),
  })
  if (!response.ok) {
    throw new Error(`Color analysis failed: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export async function getColorRecommendations(userPreferences: Record<string, unknown>[], colors: CarColor[]) {
  const response = await fetch(`${PYTHON_API_BASE}/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userPreferences, colors }),
  })
  if (!response.ok) {
    throw new Error(`Recommendations failed: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export async function fetchColorTrends(timeframe: string) {
  const response = await fetch(`${PYTHON_API_BASE}/color-trends/${timeframe}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch color trends: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export async function fetchTrendPrediction() {
  const response = await fetch(`${PYTHON_API_BASE}/color-trends/predict`)
  if (!response.ok) {
    throw new Error(`Failed to fetch trend prediction: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.onload = () => resolve(String(reader.result || ''))
    reader.readAsDataURL(file)
  })
}

export async function isPythonApiAvailable(): Promise<boolean> {
  // Skip health check if the API base points to localhost but we're running
  // on a non-localhost origin (e.g. production deployment). Attempting a
  // cross-origin fetch to localhost violates the Content-Security-Policy and
  // would always fail anyway.
  if (
    typeof window !== 'undefined' &&
    PYTHON_API_BASE.includes('localhost') &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return false
  }

  try {
    // The Python API is a local development service only.
    // Skip the health check when running in production to avoid CSP violations.
    if (
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      return false
    }
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1500)
    const response = await fetch(`${PYTHON_API_BASE}/health`, {
      method: 'GET',
      signal: controller.signal,
    })
    clearTimeout(timeout)
    return response.ok
  } catch (error) {
    // Expected when Python API is not running - no need to log
    return false
  }
}
