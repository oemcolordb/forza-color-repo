const fs = require('fs')
const path = require('path')

const ASSET_KEY = 'fz2024'

const validateAssetAccess = (token, assetPath) => {
  try {
    const [hash, timestamp] = token.split('-')
    const now = Date.now()

    if (now - parseInt(timestamp) > 3600000) return false

    const expectedHash = Buffer.from(`${assetPath}-${timestamp}-${ASSET_KEY}`)
      .toString('base64')
      .replace(/[+/=]/g, '')
      .slice(0, 8)
    return hash === expectedHash
  } catch {
    return false
  }
}

exports.handler = async event => {
  const { t: token, p: assetPath } = event.queryStringParameters || {}

  if (!token || !assetPath || !validateAssetAccess(token, assetPath)) {
    return {
      statusCode: 403,
      body: 'Access denied',
    }
  }

  try {
    const filePath = path.join(process.cwd(), 'public', assetPath)

    // Security check - prevent path traversal
    if (!filePath.startsWith(path.join(process.cwd(), 'public'))) {
      return { statusCode: 403, body: 'Invalid path' }
    }

    const fileBuffer = fs.readFileSync(filePath)
    const ext = path.extname(assetPath).toLowerCase()

    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.mp4': 'video/mp4',
      '.json': 'application/json',
      '.svg': 'image/svg+xml',
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'Cache-Control': 'private, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
      body: fileBuffer.toString('base64'),
      isBase64Encoded: true,
    }
  } catch {
    return { statusCode: 404, body: 'Asset not found' }
  }
}
