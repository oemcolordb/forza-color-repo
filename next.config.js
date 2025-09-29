/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      config.devtool = 'source-map'
    }
    return config
  }
}

module.exports = nextConfig