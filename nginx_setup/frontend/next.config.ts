import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  // We'll be using Nginx for handling the CORS headers
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://api-service:3001/api/:path*'
      }
    ];
  }
};

export default nextConfig;
