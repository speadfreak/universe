import type { NextConfig } from "next";

/**
 * BUILD_STANDALONE=1 produces a self-hostable bundle (.next/standalone).
 * Vercel and other platforms that run `next start` themselves must NOT
 * set this — they use their own output tracing.
 */
const nextConfig: NextConfig = {
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: false,
};

export default nextConfig;
