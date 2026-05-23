/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['cdn.suberfood.com', 'images.unsplash.com'],
  },
  // Enable static exports for better SEO
  output: 'standalone',
}

module.exports = nextConfig
