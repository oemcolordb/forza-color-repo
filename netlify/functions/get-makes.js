exports.handler = async (event, context) => {
  try {
    const { default: colorData } = await import('../../services/colorData.js')
    const colors = colorData
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