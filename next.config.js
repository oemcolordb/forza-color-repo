/** @type {import('next').NextConfig} */
const path = require('path')

// Polyfill 'self' for Node.js environments (replaces scripts/self-polyfill.js NODE_OPTIONS approach)
if (typeof self === 'undefined' && typeof window === 'undefined') {
  try {
    Object.defineProperty(globalThis, 'self', {
      value: globalThis,
      configurable: true,
      writable: true,
    })
  } catch {
    globalThis.self = globalThis
  }
}

const nextConfig = {
  trailingSlash: true,
  images: {
    // Enable Next.js Image Optimization for WebP/AVIF conversion
    // Uses the default built-in image loader
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 768, 1024, 1280, 1536],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  experimental: {
    // optimizeCss disabled - causes pages-manifest.json ENOENT on Windows with Next.js 15
    // optimizeCss: true,
    // Reduce bundle size for commonly used packages
    optimizePackageImports: ['react-icons', 'lucide-react', 'framer-motion'],
  },
  turbopack: {},

  // Selective caching strategy:
  // - Static assets and immutable content: long cache (1 year)
  // - Dynamic pages: short cache or no cache
  // - API responses: no cache
  headers: async () => {
    if (process.env.NODE_ENV === 'development') {
      return []
    }
    return [
      // Static assets in _next/static: immutable, long cache
      {
        source: '/_next/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Public static files (images, fonts, etc): cache with revalidation
      {
        source: '/:all*(svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      // Color data JSON: cache with 24h revalidation (rarely changes)
      {
        source: '/carColors.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      // Dynamic pages: short CDN cache with no browser cache
      {
        source: '/:path((?!api/|_next/|uploads/).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
      // API routes: no caching
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
        ],
      },
    ]
  },

  serverExternalPackages: ['@libsql/client'],

  env: {
    NEXT_TELEMETRY_DISABLED: '1',
    INLINE_RUNTIME_CHUNK: 'false',
  },

  devIndicators: false,

  webpack: (config, { dev, isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), '@libsql/client']
    }

    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
      /Module not found: Can't resolve 'fs'/,
      /Module not found: Can't resolve 'net'/,
      /Module not found: Can't resolve 'tls'/,
    ]

    if (!dev) {
      config.devtool = 'source-map'

      // Only apply splitChunks to client builds
      if (!isServer) {
        config.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            gaming: {
              name: 'gaming',
              test: /[\\/]components[\\/](Color|Gaming|Mobile)/,
              priority: 20,
              reuseExistingChunk: true,
            },
            vendor: {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        }
      }
    }

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    return config
  },
}

module.exports = nextConfig
