/** @type {import('next').NextConfig} */
const hosts = (process.env.NEXT_PUBLIC_IMAGE_HOSTS || '')
  .split(',')
  .map(h => h.trim())
  .filter(Boolean);

const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: hosts.map(h => ({ protocol: 'https', hostname: h })),
  },
};

module.exports = nextConfig;
