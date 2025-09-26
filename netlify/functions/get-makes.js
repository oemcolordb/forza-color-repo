const colorData = require('../../services/colorData')

exports.handler = async (event, context) => {
  try {
    const colors = colorData.default || colorData
    const uniqueMakes = Array.from(new Set(colors.map(color => color.make)))
    const sortedMakes = uniqueMakes.sort()
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      },
      body: JSON.stringify({ makes: sortedMakes })
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get makes' })
    }
  }
}