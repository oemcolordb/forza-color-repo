import type { NextConfig } from 'next'
import { withBotId } from 'botid/next/config'

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,

  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

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
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
      /Module not found: Can't resolve 'fs'/,
      /Module not found: Can't resolve 'net'/,
      /Module not found: Can't resolve 'tls'/,
    ]

    if (!dev) {
      config.devtool = 'source-map'

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

export default withBotId(nextConfig)
