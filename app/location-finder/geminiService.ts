import { Location } from './types'

export const fetchLocations = async (): Promise<Location[]> => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  
  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_GEMINI_API_KEY environment variable not set.')
  }

  const prompt = `You are a Forza Horizon 5 expert. Generate a JSON array of 15 interesting and cool locations from the Forza Horizon 5 Mexico map. These locations should be a mix of great parking spots for car meets, stunning photo opportunities, and recognizable landmarks. For each location, provide a 'name' that is easily identifiable on the game map, a brief 'description' of why it's a cool spot, and a 'type' from one of the following categories: 'Parking', 'Photo Op', 'Landmark', or 'Scenic View'. The name should be the primary identifier players would look for.`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            response_mime_type: 'application/json',
            response_schema: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  name: {
                    type: 'STRING',
                    description: 'The name of the location as it might appear on the map.'
                  },
                  description: {
                    type: 'STRING',
                    description: 'A short, exciting description of why this spot is worth visiting.'
                  },
                  type: {
                    type: 'STRING',
                    enum: ['Parking', 'Photo Op', 'Landmark', 'Scenic View'],
                    description: 'The category of the location.'
                  }
                },
                required: ['name', 'description', 'type']
              }
            }
          }
        })
      }
    )

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()
    const jsonString = data.candidates[0].content.parts[0].text
    const locations: Location[] = JSON.parse(jsonString)
    return locations
  } catch (error) {
    console.error('Error fetching data from Gemini API:', error)
    throw new Error('Failed to parse or fetch locations from Gemini API.')
  }
}
