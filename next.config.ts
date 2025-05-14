import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Warning: This will ignore *all* lint errors during Vercel builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
