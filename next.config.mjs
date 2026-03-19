/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lesamisducbd.fr',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'my.lesamisducbd.fr',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
