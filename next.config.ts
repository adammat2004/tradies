import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

