/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    domains: [
      'ddragon.leagueoflegends.com',
      'raw.communitydragon.org'
    ],
    formats: ['image/webp', 'image/avif'],
    unoptimized: true,
  },

  // Environment variables validation
  env: {
    RIOT_API_KEY: process.env.RIOT_API_KEY,
    RIOT_API_KEY_2: process.env.RIOT_API_KEY_2,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
