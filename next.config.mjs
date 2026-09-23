/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // DummyJSON CDN (where most product images are served from)
        protocol: 'https',
        hostname: 'cdn.dummyjson.com',
        pathname: '/**',
      },
      {
        // DummyJSON main domain (icons, user avatars)
        protocol: 'https',
        hostname: 'dummyjson.com',
        pathname: '/**',
      },
      {
        // Fallback placeholder images
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
