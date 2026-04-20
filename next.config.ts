import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-267d804e06ee48cdaece52f7478509cc.r2.dev",
      },
    ],
  },
};

export default nextConfig;
