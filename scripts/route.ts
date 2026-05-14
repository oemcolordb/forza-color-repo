import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const image = formData.get('image')

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Forward the image to your local Python FastAPI ML Service
    // (Ensure you have started it via python-services/start_api.bat)
    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:8000'

    const response = await fetch(`${pythonApiUrl}/analyze`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Python API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Image processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process image. Make sure your Python ML service is running on port 8000!' },
      { status: 500 }
    )
  }
}
