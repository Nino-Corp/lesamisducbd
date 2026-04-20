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
  async redirects() {
    return [
      {
        source: '/2-accueil',
        destination: '/',
        permanent: true,
      },
      {
        source: '/:category/:slug.html',
        destination: '/produit/:slug',
        permanent: true,
      },
      {
        source: '/:slug.html',
        destination: '/',
        permanent: true,
      }
    ];
  },
};

export default nextConfig;
