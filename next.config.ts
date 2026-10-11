import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1", "8328-ib14bgf7st4bguds1dekd-2fa84f40.sg2.manus.computer"],
  async rewrites() {
    // When deploying on Vercel or cloud production, do not proxy to local port 8000.
    // Native Next.js App Router API handlers (/app/api/[...path]) handle all cloud requests.
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      return [];
    }
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
