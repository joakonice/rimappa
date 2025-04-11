/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.maptiler.com'],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
}

module.exports = nextConfig 