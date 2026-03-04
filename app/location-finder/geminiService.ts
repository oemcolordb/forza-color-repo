import { Location, LocationType } from './types'

export const fetchLocations = async (): Promise<Location[]> => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  
  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_GEMINI_API_KEY environment variable not set.')
  }

  const prompt = `Generate a JSON array of 40 interesting locations from Forza Horizon 5 Mexico map. Return ONLY valid JSON array with this exact format:
[{"name":"Location Name","description":"Why it's cool","type":"Parking"}]
Types must be: Parking, Photo Op, Landmark, or Scenic View`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )

    if (!response.ok) {
      return getMockLocations()
    }

    const data = await response.json()
    const text = data.candidates[0].content.parts[0].text
    const jsonMatch = text.match(/\[.*\]/s)
    if (!jsonMatch) return getMockLocations()
    
    const locations: Location[] = JSON.parse(jsonMatch[0])
    return locations
  } catch (error) {
    return getMockLocations()
  }
}

function getMockLocations(): Location[] {
  return [
    { name: 'Guanajuato', description: 'Historic colonial city with colorful buildings', type: LocationType.Landmark },
    { name: 'Playa Azul', description: 'Beautiful beach on the Pacific coast', type: LocationType.PhotoOp },
    { name: 'La Gran Caldera', description: 'Massive volcanic crater', type: LocationType.ScenicView },
    { name: 'Tulum', description: 'Ancient Mayan coastal ruins', type: LocationType.Landmark },
    { name: 'Estadio', description: 'Large stadium complex', type: LocationType.Parking },
    { name: 'Horizon Festival', description: 'Main festival site', type: LocationType.Parking },
    { name: 'Ek Balam', description: 'Mayan pyramid ruins', type: LocationType.Landmark },
    { name: 'Copper Canyon', description: 'Dramatic canyon overlook', type: LocationType.ScenicView },
    { name: 'Cascadas de Agua Azul', description: 'Stunning blue waterfalls', type: LocationType.PhotoOp },
    { name: 'Dunas Blancas', description: 'White sand dunes', type: LocationType.PhotoOp },
    { name: 'Mulege', description: 'Coastal town', type: LocationType.PhotoOp },
    { name: 'Hotel Castillo', description: 'Luxury hilltop hotel', type: LocationType.Parking },
    { name: 'Teotihuacan', description: 'Ancient pyramid city', type: LocationType.Landmark },
    { name: 'Horizon Apex', description: 'Racing festival hub', type: LocationType.Parking },
    { name: 'Aeródromo en la Selva', description: 'Jungle airstrip', type: LocationType.Parking },
    { name: 'Puente de Piedra', description: 'Historic stone bridge', type: LocationType.Landmark },
    { name: 'Mirador Balderrama', description: 'Mountain viewpoint', type: LocationType.ScenicView },
    { name: 'Pantano de las Ranas', description: 'Swamp area', type: LocationType.PhotoOp },
    { name: 'Aeródromo Desértico', description: 'Desert airstrip', type: LocationType.Parking },
    { name: 'Cañón de Cobre', description: 'Copper canyon roads', type: LocationType.ScenicView },
    { name: 'Playa Soledad', description: 'Secluded beach', type: LocationType.PhotoOp },
    { name: 'Horizon Baja', description: 'Baja racing outpost', type: LocationType.Parking },
    { name: 'Horizon Wilds', description: 'Jungle racing outpost', type: LocationType.Parking },
    { name: 'Horizon Rush', description: 'Desert racing outpost', type: LocationType.Parking },
    { name: 'Horizon Street Scene', description: 'Urban racing hub', type: LocationType.Parking },
    { name: 'Cordillera', description: 'Mountain range roads', type: LocationType.ScenicView },
    { name: 'Selva Tropical', description: 'Dense jungle area', type: LocationType.PhotoOp },
    { name: 'Desierto', description: 'Desert plains', type: LocationType.PhotoOp },
    { name: 'Bahía de Plata', description: 'Silver bay coastline', type: LocationType.PhotoOp },
    { name: 'Mirador del Océano', description: 'Ocean overlook', type: LocationType.ScenicView },
    { name: 'Casa Bella', description: 'Beautiful mansion estate', type: LocationType.Landmark },
    { name: 'Puente Colgante', description: 'Suspension bridge', type: LocationType.PhotoOp },
    { name: 'Mirador de las Montañas', description: 'Mountain peak lookout', type: LocationType.ScenicView },
    { name: 'Playa Tranquila', description: 'Peaceful beach cove', type: LocationType.PhotoOp },
    { name: 'Aeródromo Central', description: 'Central airfield', type: LocationType.Parking },
    { name: 'Ruinas del Templo', description: 'Temple ruins in jungle', type: LocationType.Landmark },
    { name: 'Cañón Profundo', description: 'Deep canyon valley', type: LocationType.ScenicView },
    { name: 'Pueblo Fantasma', description: 'Abandoned ghost town', type: LocationType.Landmark },
    { name: 'Mirador del Valle', description: 'Valley overlook point', type: LocationType.ScenicView },
    { name: 'Playa del Sol', description: 'Sunny beach paradise', type: LocationType.PhotoOp }
  ]
}
