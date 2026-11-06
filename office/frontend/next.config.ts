import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/office",

  // Allow LAN access and Hot Module Replacement from local network
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.68.106", "192.168.*"],

  // Emit standalone bundle for Docker deployments
  output: "standalone",

  // API proxy to office backend (avoids CORS when proxying through Next.js under /office/api/backend/*)
  async rewrites() {
    const backendBase = (
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8081/api/v1"
    ).replace(/\/+$/, "");

    return [
      {
        source: "/api/backend/:path*",
        destination: `${backendBase}/:path*`,
      },
    ];
  },
};

export default nextConfig;
