import type { NextConfig } from "next";

const path = require('path');

const nextConfig: NextConfig = {
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