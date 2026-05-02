const PROTECTED_EXTENSIONS = ['.json', '.mp4', '.jpg', '.jpeg', '.png']
const ALLOWED_PATHS = ['/manifest.json', '/robots.txt', '/sitemap.xml', '/sw.js', '/icon.svg']

export default async (request, context) => {
  const url = new URL(request.url)
  const pathname = url.pathname

  // Allow specific public files
  if (ALLOWED_PATHS.includes(pathname)) {
    return context.next()
  }

  // Block direct access to protected assets
  const ext = pathname.substring(pathname.lastIndexOf('.')).toLowerCase()
  if (PROTECTED_EXTENSIONS.includes(ext)) {
    return new Response('Direct access forbidden', { status: 403 })
  }

  return context.next()
}

export const config = {
  path: ['/assets/*', '/*.jpg', '/*.jpeg', '/*.png', '/*.mp4', '/*.json'],
}
