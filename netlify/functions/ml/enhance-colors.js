const { spawn } = require('child_process')
const path = require('path')

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { colors } = JSON.parse(event.body)
    
    if (!colors || !Array.isArray(colors)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid colors data' })
      }
    }

    // Call Python ML service
    const enhancedColors = await enhanceColorsWithML(colors)
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ colors: enhancedColors })
    }
  } catch (error) {
    console.error('ML enhancement error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'ML processing failed' })
    }
  }
}

async function enhanceColorsWithML(colors) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, 'color_enhancer.py')
    const python = spawn('python3', [pythonScript])
    
    let output = ''
    let error = ''

    python.stdout.on('data', (data) => {
      output += data.toString()
    })

    python.stderr.on('data', (data) => {
      error += data.toString()
    })

    python.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script error:', error)
        resolve(colors) // Fallback to original colors
        return
      }

      try {
        const result = JSON.parse(output)
        resolve(result.colors || colors)
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        resolve(colors)
      }
    })

    python.stdin.write(JSON.stringify({ colors }))
    python.stdin.end()
  })
}