import type { NextConfig } from "next";

const path = require('path');

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    domains: [
      "shared.fastly.steamstatic.com",
      "lh3.googleusercontent.com",
      "platform-lookaside.fbsbx.com",
      "cnm-chatapp-bucket.s3.ap-southeast-1.amazonaws.com",
      "ui-avatars.com"
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;