// Color conversion utilities
const hsbToRgb = (h: number, s: number, b: number) => {
  const c = b * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = b - c
  let r = 0,
    g = 0,
    bl = 0

  if (h >= 0 && h < 60) {
    r = c
    g = x
    bl = 0
  } else if (h >= 60 && h < 120) {
    r = x
    g = c
    bl = 0
  } else if (h >= 120 && h < 180) {
    r = 0
    g = c
    bl = x
  } else if (h >= 180 && h < 240) {
    r = 0
    g = x
    bl = c
  } else if (h >= 240 && h < 300) {
    r = x
    g = 0
    bl = c
  } else if (h >= 300 && h < 360) {
    r = c
    g = 0
    bl = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((bl + m) * 255),
  }
}

const rgbToHex = (r: number, g: number, b: number) => {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

exports.handler = async (event: { httpMethod: string; body: string }, _context: unknown) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const { h, s, b } = JSON.parse(event.body)

    if (h === undefined || s === undefined || b === undefined) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing h, s, b values' }) }
    }

    const rgb = hsbToRgb(h, s * 100, b * 100)
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        input: { h, s, b },
        output: {
          rgb,
          hex,
          css: `hsl(${h}, ${s * 100}%, ${b * 50}%)`,
        },
      }),
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
