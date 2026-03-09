// Input validation and sanitization
export const sanitizeInput = input => {
  if (typeof input !== 'string') return ''
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, 1000)
}

// Validate color data
export const validateColorData = color => {
  if (!color || typeof color !== 'object') return false

  const required = ['make', 'colorName', 'colorType', 'color1', 'color2']
  if (!required.every(field => color[field])) return false

  const { color1, color2 } = color
  if (!isValidHSB(color1) || !isValidHSB(color2)) return false

  return true
}

const isValidHSB = hsb => {
  if (!hsb || typeof hsb !== 'object') return false
  const { h, s, b } = hsb
  return (
    typeof h === 'number' &&
    h >= 0 &&
    h <= 1 &&
    typeof s === 'number' &&
    s >= 0 &&
    s <= 1 &&
    typeof b === 'number' &&
    b >= 0 &&
    b <= 1
  )
}

// Secure API request wrapper
export const secureApiCall = async (url, options = {}) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...options.headers,
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}
