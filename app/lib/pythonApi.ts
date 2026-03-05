const PYTHON_API_BASE = 'http://localhost:8000/api'

export async function processImageWithML(imageData: string, colors: any[]) {
  const response = await fetch(`${PYTHON_API_BASE}/process-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageData, colors })
  })
  return response.json()
}

export async function analyzeColors(colors: any[]) {
  const response = await fetch(`${PYTHON_API_BASE}/analyze-colors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ colors, analysisType: 'full' })
  })
  return response.json()
}

export async function getColorRecommendations(userPreferences: any[], colors: any[]) {
  const response = await fetch(`${PYTHON_API_BASE}/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userPreferences, colors })
  })
  return response.json()
}

export async function fetchColorTrends(timeframe: string) {
  const response = await fetch(`${PYTHON_API_BASE}/color-trends/${timeframe}`)
  return response.json()
}

export async function fetchTrendPrediction() {
  const response = await fetch(`${PYTHON_API_BASE}/color-trends/predict`)
  return response.json()
}
