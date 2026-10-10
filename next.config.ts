import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1", "8328-ib14bgf7st4bguds1dekd-2fa84f40.sg2.manus.computer"],
};

export default nextConfig;
