exports.handler = async (event, context) => {
  const { query, make, page = 1, limit = 50 } = event.queryStringParameters || {}
  
  try {
    const { default: colorData } = await import('../../services/colorData.js')
    let filtered = colorData
    
    if (query || make) {
      const searchLower = query?.toLowerCase() || ''
      filtered = filtered.filter(color => {
        const matchesSearch = !query || 
          color.colorName.toLowerCase().includes(searchLower) ||
          color.make.toLowerCase().includes(searchLower) ||
          color.model.toLowerCase().includes(searchLower) ||
          (color.colorType && color.colorType.toLowerCase().includes(searchLower))
        
        const matchesMake = !make || color.make === make
        return matchesSearch && matchesMake
      })
    }
    
    const totalCount = filtered.length
    const totalPages = Math.ceil(totalCount / limit)
    const startIndex = (page - 1) * limit
    const colors = filtered.slice(startIndex, startIndex + parseInt(limit))
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        colors,
        totalCount,
        totalPages,
        currentPage: parseInt(page)
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to search colors' })
    }
  }
}