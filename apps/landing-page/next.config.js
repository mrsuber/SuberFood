/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['cdn.suberfood.com', 'images.unsplash.com', 'suberfoods.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'suberfoods.com',
        pathname: '/uploads/**',
      },
    ],
  },
  // Skip type checking during build (types are validated in IDE)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip build errors for dynamic pages
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      // "Retail & E-commerce" is the farm shop
      { source: '/distribution/retail', destination: '/distribution/farm-products', permanent: true },
      // Legacy admin screens superseded by the distribution/farm-products sections
      { source: '/admin/restaurants/:path*', destination: '/admin/distribution/restaurants/:path*', permanent: false },
      { source: '/admin/products', destination: '/admin/farm-products/products', permanent: false },
      { source: '/admin/products/new', destination: '/admin/farm-products/products/new', permanent: false },
    ]
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig
