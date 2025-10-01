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
  

}

module.exports = nextConfig