/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Gaming SEO and mobile performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Reduce console warnings
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Suppress React DevTools warning in production
  env: {
    NEXT_TELEMETRY_DISABLED: '1',
    INLINE_RUNTIME_CHUNK: 'false'
  },
  
  // Mobile gaming performance
  experimental: {
    optimizeCss: true,
    gzipSize: true,
    isrMemoryCacheSize: 0
  },
  
  webpack: (config, { dev, isServer }) => {
    // Suppress specific warnings
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
      /Module not found: Can't resolve 'fs'/,
      /Module not found: Can't resolve 'net'/,
      /Module not found: Can't resolve 'tls'/
    ]
    
    if (!dev) {
      config.devtool = 'source-map'
      
      // Gaming performance optimizations
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          gaming: {
            name: 'gaming',
            test: /[\/\\]components[\/\\](Color|Gaming|Mobile)/,
            priority: 20,
            reuseExistingChunk: true
          },
          vendor: {
            name: 'vendor',
            test: /[\/\\]node_modules[\/\\]/,
            priority: 10,
            reuseExistingChunk: true
          }
        }
      }
    }
    
    // Mobile-first bundle optimization
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false
      }
    }
    
    return config
  }
}

module.exports = nextConfig