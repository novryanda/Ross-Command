import type { NextConfig } from "next";

const allowedDevOrigins = (
  process.env.NEXT_ALLOWED_DEV_ORIGINS ?? "dev.netkrida.cloud,localhost"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins,
  async rewrites() {
    const apiBaseUrl = process.env.API_INTERNAL_BASE_URL ?? "http://localhost:3001";

    return [
      {
        source: "/api/auth/:path*",
        destination: `${apiBaseUrl}/api/auth/:path*`,
      },
      {
        source: "/api/v1/:path*",
        destination: `${apiBaseUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
