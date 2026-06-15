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
    const count = Math.min(parseInt(queryStringParameters?.count) || 1, 50)

    const colors = colorData.default || colorData
    const randomColors = []

    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * colors.length)
      randomColors.push(colors[randomIndex])
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        count: randomColors.length,
        colors: randomColors,
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
