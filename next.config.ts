import type { NextConfig } from "next";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  // next-pwa adds a webpack config; declare turbopack: {} so Next.js 16
  // (Turbopack-default) doesn't treat the webpack config as a fatal error.
  // next-pwa is disabled in dev anyway, so Turbopack runs without it.
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default withPWA(nextConfig);
