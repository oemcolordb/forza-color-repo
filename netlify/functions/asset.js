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
    // Resolve and validate path against fixed public directory
    const basePublic = path.resolve(process.cwd(), 'public')

    let decodedPath
    try {
      decodedPath = decodeURIComponent(assetPath)
    } catch {
      return { statusCode: 400, body: 'Invalid asset path' }
    }

    // Reject obvious unsafe inputs
    if (!decodedPath || path.isAbsolute(decodedPath) || decodedPath.includes('\0')) {
      return { statusCode: 403, body: 'Invalid path' }
    }

    const resolved = path.resolve(basePublic, decodedPath)
    const baseWithSep = basePublic.endsWith(path.sep) ? basePublic : basePublic + path.sep
    if (resolved !== basePublic && !resolved.startsWith(baseWithSep)) {
      return { statusCode: 403, body: 'Invalid path' }
    }

    // Only allow known safe extensions
    const ext = path.extname(resolved).toLowerCase()
    const allowedExts = new Set(['.jpg', '.jpeg', '.png', '.mp4', '.json', '.svg'])
    if (!allowedExts.has(ext)) {
      return { statusCode: 403, body: 'Forbidden file type' }
    }

    const filePath = resolved

    // Ensure the target is a file before reading
    const stat = fs.statSync(filePath)
    if (!stat.isFile()) {
      return { statusCode: 404, body: 'Asset not found' }
    }

    const fileBuffer = fs.readFileSync(filePath)

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
