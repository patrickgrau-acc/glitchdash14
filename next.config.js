/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  experimental: {
    // Next 14.2 cached dynamic page segments for 30s and static segments for
    // 5 minutes. Next 15 defaults dynamic to 0, which refetches on every
    // client navigation. Keep the 14.2.5 windows.
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },
};

module.exports = nextConfig;
