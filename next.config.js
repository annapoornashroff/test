/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com', // Replace with your image host
      },
      {
        protocol: 'https',
        hostname: 'another-image-cdn.com', // Add more as needed
      },
    ],
  },
};

module.exports = nextConfig;