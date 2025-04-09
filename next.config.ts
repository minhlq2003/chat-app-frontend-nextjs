import type { NextConfig } from "next";

const path = require('path');

const nextConfig: NextConfig = {
  images: {
    domains: [
      "shared.fastly.steamstatic.com",
      "lh3.googleusercontent.com",
      "platform-lookaside.fbsbx.com",
      "cnm-chatapp-bucket.s3.ap-southeast-1.amazonaws.com"
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgoConfig: {
               plugins: [
                  {
                      name: 'preset-default',
                      params: {
                        overrides: {
                           removeViewBox: false // keep viewBox
                         }
                      }
                   },
               ]
            },
            
          },
        },
      ],
    });

    return config;
  },
};

export default nextConfig;