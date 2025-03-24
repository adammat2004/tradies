import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      // Ignore these modules during client-side bundle
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
        // Add any other Node.js-specific modules that shouldn't be bundled for the client here
      };
    }
    return config;
  },
  reactStrictMode: false,
  redirects: async () => {
    return [
      {
        source: '/404', // The URL for the page
        destination: '/', // Where to redirect
        permanent: true, // Indicates a permanent redirect
      },
    ];
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

