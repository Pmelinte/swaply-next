/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/loghin", destination: "/login", permanent: false },
    ];
  },
};

module.exports = nextConfig;
