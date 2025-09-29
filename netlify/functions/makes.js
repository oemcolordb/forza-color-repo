const colorData = []

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
    const makes = [...new Set(colors.map(c => c.make))].sort()

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        count: makes.length,
        makes: makes
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