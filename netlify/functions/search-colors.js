exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300, s-maxage=600'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    const { q, make, type, limit = 50 } = event.queryStringParameters || {}
    
    // Import color data (you'll need to adjust the path)
    const colorData = require('../../services/colorData.js')
    
    let results = colorData.default || colorData
    
    // Filter by search query
    if (q) {
      const query = q.toLowerCase()
      results = results.filter(color => 
        color.colorName.toLowerCase().includes(query) ||
        color.make.toLowerCase().includes(query) ||
        (color.model && color.model.toLowerCase().includes(query))
      )
    }
    
    // Filter by make
    if (make && make !== 'all') {
      results = results.filter(color => color.make === make)
    }
    
    // Filter by color type
    if (type && type !== 'all') {
      results = results.filter(color => color.colorType === type)
    }
    
    // Limit results
    results = results.slice(0, parseInt(limit))
    
    // Add SEO-friendly metadata
    const response = {
      colors: results,
      total: results.length,
      query: q || '',
      filters: { make, type },
      meta: {
        title: `Forza Color Sheet Search Results${q ? ` for "${q}"` : ''}`,
        description: `Found ${results.length} Forza automotive paint colors${q ? ` matching "${q}"` : ''}. Complete color database with HSB values and paint codes.`,
        keywords: `forza color sheet, ${q || 'automotive colors'}, paint database, racing game colors`
      }
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    }
    
  } catch (error) {
    console.error('Search error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Search failed',
        colors: [],
        total: 0
      })
    }
  }
}