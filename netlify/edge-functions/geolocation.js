export default async (request, context) => {
  const { country, city, region } = context.geo
  
  return new Response(JSON.stringify({
    country: country || 'Unknown',
    city: city || 'Unknown', 
    region: region || 'Unknown',
    timestamp: new Date().toISOString()
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300'
    }
  })
}

export const config = {
  path: '/api/geo'
}