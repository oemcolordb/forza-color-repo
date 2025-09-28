// Simple API key validation for premium features
const VALID_KEYS = ['demo-key-123', 'premium-key-456']

const validateApiKey = (key) => {
  return VALID_KEYS.includes(key)
}

const getRateLimit = (key) => {
  if (key === 'premium-key-456') return 10000 // Premium: 10k requests
  if (key === 'demo-key-123') return 1000     // Demo: 1k requests
  return 100 // Free: 100 requests
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    const apiKey = event.headers['x-api-key']
    
    if (!apiKey) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          error: 'API key required',
          message: 'Include X-API-Key header'
        })
      }
    }

    const isValid = validateApiKey(apiKey)
    const rateLimit = getRateLimit(apiKey)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        valid: isValid,
        rateLimit: isValid ? rateLimit : 0,
        tier: isValid ? (rateLimit > 5000 ? 'premium' : 'demo') : 'invalid'
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