import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nnyztgrtkgwxwxburrmb.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Supabase-stored images (gallery photos, team icons) rarely change and
    // get a new filename on every re-upload, so a long TTL carries no
    // staleness risk. This is what keeps repeat cross-visitor traffic on
    // Vercel's image cache instead of re-hitting Supabase's CDN — the
    // default 60s TTL would otherwise send a fresh request to Supabase
    // (counting against its egress quota) every minute under sustained
    // traffic.
    minimumCacheTTL: 31536000,
  },
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
