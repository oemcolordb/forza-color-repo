const colorData = require('../../services/colorData.js')

// Color distance calculation
const colorDistance = (c1, c2) => {
  const dH = Math.abs(c1.h - c2.h) * 360
  const dS = Math.abs(c1.s - c2.s) * 100
  const dB = Math.abs(c1.b - c2.b) * 100
  return Math.sqrt(dH*dH + dS*dS + dB*dB)
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
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
    const colors = colorData.default || colorData

    const matches = colors
      .map(color => ({
        ...color,
        distance: colorDistance(targetColor, color.color1)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, parseInt(limit))

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        target: { h, s, b },
        matches: matches.map(({ distance, ...color }) => ({ ...color, similarity: Math.max(0, 100 - distance) }))
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}