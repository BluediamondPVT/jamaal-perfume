import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'wmit-news-prod.s3.amazonaws.com',
      'qqitdrcxhgupnmrrajkd.supabase.co',
      'localhost',
      'res.cloudinary.com',
      'images.unsplash.com',
      'plus.unsplash.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'qqitdrcxhgupnmrrajkd.supabase.co',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;


