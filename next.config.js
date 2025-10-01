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
  
  // Mobile gaming performance
  experimental: {
    optimizeCss: true,
    gzipSize: true
  },
  
  webpack: (config, { dev, isServer }) => {
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
  },
  
  // Gaming SEO headers with optimized caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/(.*)\\.(ico|png|jpg|jpeg|gif|webp|svg|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, must-revalidate'
          }
        ]
      },
      {
        source: '/((?!_next/static|.*\\.(ico|png|jpg|jpeg|gif|webp|svg|woff|woff2)).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig