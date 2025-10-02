// Asset encryption/decryption utilities
const ASSET_KEY = 'fz2024'

export const encryptAssetPath = (path) => {
  const timestamp = Date.now()
  const hash = btoa(`${path}-${timestamp}-${ASSET_KEY}`).replace(/[+/=]/g, '')
  return `${hash.slice(0, 8)}-${timestamp}`
}

export const validateAssetAccess = (token, path) => {
  try {
    const [hash, timestamp] = token.split('-')
    const now = Date.now()
    
    // Token expires after 1 hour
    if (now - parseInt(timestamp) > 3600000) return false
    
    const expectedHash = btoa(`${path}-${timestamp}-${ASSET_KEY}`).replace(/[+/=]/g, '').slice(0, 8)
    return hash === expectedHash
  } catch {
    return false
  }
}

export const getSecureAssetUrl = (path) => {
  const token = encryptAssetPath(path)
  return `/api/asset?t=${token}&p=${encodeURIComponent(path)}`
}