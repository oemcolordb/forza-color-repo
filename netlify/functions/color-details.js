exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }
  
  const { make, model, colorName, year } = JSON.parse(event.body)
  
  if (!process.env.GEMINI_API_KEY) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        details: 'AI details unavailable - API key not configured' 
      })
    }
  }
  
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    
    const carInfo = `${make}${model ? ` ${model}` : ''}${year && year > 0 ? ` (${year})` : ''}`
    const prompt = `Brief fact about "${colorName}" color on ${carInfo}. Max 40 words.`
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const details = response.text() || 'No details available'
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ details })
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to get color details',
        details: 'Could not fetch details from AI service'
      })
    }
  }
}