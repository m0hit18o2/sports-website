import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/scores",
        destination: "/section-wars",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
