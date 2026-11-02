import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Use App Router (default in Next.js 13+)
  // Strict mode for catching side-effect bugs early
  reactStrictMode: true,

  // Image domains — expand as needed when integrating Supabase Storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Enforce correct casing in imports on case-insensitive file systems
  // (prevents issues when deploying to Linux)
  experimental: {},
};

export default nextConfig;
