import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const backendApiUrl = (
  process.env.BACKEND_API_URL?.trim() ||
  process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim() ||
  "http://127.0.0.1:4000"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  turbopack: {
    root: projectRoot,
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendApiUrl}/api/v1/:path*`,
      },
      {
        source: "/uploads/catalog/:path*",
        destination: `${backendApiUrl}/uploads/catalog/:path*`,
      },
    ];
  },
};

export default nextConfig;
