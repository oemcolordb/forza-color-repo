// Inline minimal color data for function
const colorData = require('@/lib/services/colorData')

// Color distance calculation for normalized HSB values (0-1)
const colorDistance = (c1, c2) => {
  const dH = Math.abs(c1.h - c2.h)
  const dS = Math.abs(c1.s - c2.s)
  const dB = Math.abs(c1.b - c2.b)
  return Math.sqrt(dH * dH + dS * dS + dB * dB)
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const { h, s, b, limit = 10 } = JSON.parse(event.body)

    if (h === undefined || s === undefined || b === undefined) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing h, s, b values' }) }
    }

    const targetColor = { h: h / 360, s: s / 100, b: b / 100 }
    const colors = colorData

    const matches = colors
      .map(color => ({
        ...color,
        distance: colorDistance(targetColor, color.color1),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, parseInt(limit))

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        target: { h, s, b },
        matches: matches.map(({ distance, ...color }) => ({
          ...color,
          similarity: Math.max(0, 100 - distance),
        })),
      }),
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
