import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**", // This allows all paths under this hostname
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: '',
        pathname: "/dpuvd8vj9/**",
      },
    ],
  },
};

export default nextConfig;

