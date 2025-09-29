const colorData = require('./colorData.js')

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    const colors = colorData.default || colorData
    
    const stats = {
      totalColors: colors.length,
      totalMakes: [...new Set(colors.map(c => c.make))].length,
      colorTypes: [...new Set(colors.map(c => c.colorType))].length,
      topMakes: Object.entries(
        colors.reduce((acc, c) => {
          acc[c.make] = (acc[c.make] || 0) + 1
          return acc
        }, {})
      ).sort(([,a], [,b]) => b - a).slice(0, 10)
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(stats)
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}