const colorData = require('../../services/colorData.js')

const PALETTES = {
  ferrari: { makes: ['Ferrari'], colors: ['rosso', 'red'] },
  racing: { makes: ['BMW', 'Ford', 'McLaren'], colors: ['blue', 'racing'] },
  luxury: { makes: ['Mercedes-Benz', 'Audi', 'BMW'], colors: ['black', 'silver'] },
  supercar: { makes: ['Lamborghini', 'Ferrari', 'Porsche'], colors: ['yellow', 'orange'] },
  jdm: { makes: ['Honda', 'Toyota', 'Nissan', 'Mazda'], colors: [] },
  british: { makes: ['McLaren', 'Aston Martin', 'Jaguar'], colors: ['green'] },
  american: { makes: ['Ford', 'Chevrolet', 'Dodge'], colors: ['red', 'blue'] }
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

  try {
    const { queryStringParameters } = event
    const theme = queryStringParameters?.theme || 'ferrari'
    const size = parseInt(queryStringParameters?.size) || 6

    if (!PALETTES[theme]) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid theme' }) }
    }

    const colors = colorData.default || colorData
    const config = PALETTES[theme]
    
    let filtered = colors.filter(color => {
      const makeMatch = config.makes.includes(color.make)
      const colorMatch = config.colors.length === 0 || 
        config.colors.some(c => color.colorName.toLowerCase().includes(c))
      return makeMatch && (config.colors.length === 0 || colorMatch)
    })

    // Shuffle and take requested size
    const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, size)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        theme,
        size: shuffled.length,
        palette: shuffled,
        availableThemes: Object.keys(PALETTES)
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