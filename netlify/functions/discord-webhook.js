exports.handler = async (event, context) => {
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
    const { color, serverUrl } = JSON.parse(event.body)

    if (!color || !serverUrl) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing color or serverUrl' }),
      }
    }

    const hsbToHex = (h, s, b) => {
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

      const rHex = Math.round((r + m) * 255)
        .toString(16)
        .padStart(2, '0')
      const gHex = Math.round((g + m) * 255)
        .toString(16)
        .padStart(2, '0')
      const bHex = Math.round((bl + m) * 255)
        .toString(16)
        .padStart(2, '0')

      return parseInt(`${rHex}${gHex}${bHex}`, 16)
    }

    const embed = {
      title: `🎨 ${color.colorName}`,
      description: `${color.make} ${color.model || ''} ${color.year || ''}`,
      color: hsbToHex(color.color1.h * 360, color.color1.s, color.color1.b),
      fields: [
        {
          name: '🎯 HSB Values',
          value: `H: ${Math.round(color.color1.h * 360)}°\nS: ${Math.round(color.color1.s * 100)}%\nB: ${Math.round(color.color1.b * 100)}%`,
          inline: true,
        },
        {
          name: '🏷️ Color Type',
          value: color.colorType || 'Standard',
          inline: true,
        },
      ],
      footer: {
        text: 'Forza Color Universe',
        icon_url: 'https://forza-colors.netlify.app/icon.svg',
      },
      timestamp: new Date().toISOString(),
      url: 'https://forza-colors.netlify.app',
    }

    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [embed],
        username: 'Forza Colors Bot',
        avatar_url: 'https://forza-colors.netlify.app/icon.svg',
      }),
    })

    if (!response.ok) {
      throw new Error('Discord webhook failed')
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to send to Discord' }),
    }
  }
}
