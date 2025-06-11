/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com', // Replace with your image host
      },
      {
        protocol: 'http',
        hostname: 'localhost', // Add more as needed
      },
    ],
  },
};

module.exports = nextConfig;