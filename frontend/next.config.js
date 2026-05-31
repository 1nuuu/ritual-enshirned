/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  experimental: {
    optimizePackageImports: ['framer-motion'],
    turbo: {
      resolveAlias: {
        'pino-pretty': './lib/turbopack-empty-module.js',
        '@react-native-async-storage/async-storage': './lib/turbopack-async-storage.js',
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aqua-persistent-llama-318.mypinata.cloud',
        pathname: '/ipfs/**',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'pino-pretty': false,
      '@react-native-async-storage/async-storage': false,
    };
    return config;
  },
};

module.exports = nextConfig;
