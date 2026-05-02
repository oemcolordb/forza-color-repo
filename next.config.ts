import type { NextConfig } from 'next'
import path from 'path'

// Polyfill 'self' for Node.js environments (replaces scripts/self-polyfill.js NODE_OPTIONS approach)
if (typeof self === 'undefined' && typeof window === 'undefined') {
  try {
    Object.defineProperty(globalThis, 'self', { value: globalThis, configurable: true, writable: true })
  } catch {
    (globalThis as any).self = globalThis
  }
}

const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,

  serverExternalPackages: ['@libsql/client'],

  env: {
    NEXT_TELEMETRY_DISABLED: '1',
    INLINE_RUNTIME_CHUNK: 'false',
  },

  experimental: {
    optimizeCss: true,
    gzipSize: true,
  },

  turbopack: {},

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

    // Force single React instance to prevent duplicate React issues in CI workers
    config.resolve.alias = {
      ...config.resolve.alias,
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
    }

    return config
  },
}

export default nextConfig
