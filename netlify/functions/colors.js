const colorData = require('@/lib/services/colorData')

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    const { queryStringParameters } = event
    let colors = colorData.default || colorData

    // Filter by make
    if (queryStringParameters?.make) {
      colors = colors.filter(c => c.make.toLowerCase() === queryStringParameters.make.toLowerCase())
    }

    // Filter by color type
    if (queryStringParameters?.type) {
      colors = colors.filter(
        c => c.colorType?.toLowerCase() === queryStringParameters.type.toLowerCase()
      )
    }

    // Search by name
    if (queryStringParameters?.search) {
      const search = queryStringParameters.search.toLowerCase()
      colors = colors.filter(c => c.colorName.toLowerCase().includes(search))
    }

    // Limit results
    const limit = parseInt(queryStringParameters?.limit) || 100
    colors = colors.slice(0, limit)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        count: colors.length,
        colors: colors,
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
