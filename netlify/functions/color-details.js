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
    const { GoogleGenAI } = require('@google/genai')
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    
    const carInfo = `${make}${model ? ` ${model}` : ''}${year && year > 0 ? ` (${year})` : ''}`
    const prompt = `Brief fact about "${colorName}" color on ${carInfo}. Max 40 words.`
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: prompt }] }],
    })
    
    const details = response.text || 'No details available'
    
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