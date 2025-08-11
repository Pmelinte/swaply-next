/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // typescript: { ignoreBuildErrors: true }, // enable temporarily only if needed
  images: {
    domains: ['res.cloudinary.com'],
  },
};

module.exports = nextConfig;
