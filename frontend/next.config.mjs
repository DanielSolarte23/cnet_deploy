/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server Actions están habilitadas por defecto en Next.js 14+
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
};

export default nextConfig;