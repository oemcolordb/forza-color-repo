exports.handler = async (event, context) => {
  const { format = 'json', favorites } = event.queryStringParameters || {}
  
  try {
    const { default: colorData } = await import('../../services/colorData.js')
    let colors = colorData
    
    // Filter to favorites if provided
    if (favorites) {
      const favoriteIds = favorites.split(',')
      colors = colors.filter(color => {
        const colorId = `${color.make}-${color.model}-${color.colorName}-${color.year}`
        return favoriteIds.includes(colorId)
      })
    }
    
    if (format === 'csv') {
      const csvHeader = 'Make,Model,Year,Color Name,Color Type,H1,S1,B1,H2,S2,B2\n'
      const csvRows = colors.map(color => 
        `"${color.make}","${color.model}","${color.year || ''}","${color.colorName}","${color.colorType || ''}",${color.color1.h},${color.color1.s},${color.color1.b},${color.color2.h},${color.color2.s},${color.color2.b}`
      ).join('\n')
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="forza-colors.csv"',
          'Access-Control-Allow-Origin': '*',
        },
        body: csvHeader + csvRows
      }
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="forza-colors.json"',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(colors, null, 2)
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to export colors' })
    }
  }
}