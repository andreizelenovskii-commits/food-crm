import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const backendApiUrl = (
  process.env.BACKEND_API_URL?.trim() ||
  process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim() ||
  "http://127.0.0.1:4000"
).replace(/\/$/, "");

function resolveBuildVersion() {
  const configuredVersion =
    process.env.NEXT_PUBLIC_BUILD_VERSION?.trim() ||
    process.env.GITHUB_SHA?.trim() ||
    process.env.VERCEL_GIT_COMMIT_SHA?.trim();

  if (configuredVersion) {
    return configuredVersion;
  }

  const releaseDirName = path.basename(projectRoot);
  if (/^[a-f0-9]{40}$/i.test(releaseDirName)) {
    return releaseDirName;
  }

  try {
    return execSync("git rev-parse HEAD", {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "development";
  }
}

const buildVersion = resolveBuildVersion();
const noStoreHeaders = [
  {
    key: "Cache-Control",
    value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  },
  {
    key: "Pragma",
    value: "no-cache",
  },
  {
    key: "Expires",
    value: "0",
  },
  {
    key: "X-FoodLike-Build",
    value: buildVersion,
  },
];

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_VERSION: buildVersion,
  },
  generateBuildId: async () => buildVersion,
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
  async headers() {
    return [
      {
        source: "/",
        headers: noStoreHeaders,
      },
      {
        source: "/login",
        headers: noStoreHeaders,
      },
      {
        source: "/dashboard/:path*",
        headers: noStoreHeaders,
      },
      {
        source: "/menu/:path*",
        headers: noStoreHeaders,
      },
      {
        source: "/api/:path*",
        headers: noStoreHeaders,
      },
      {
        source: "/uploads/catalog/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=60, stale-while-revalidate=300",
          },
          {
            key: "X-FoodLike-Build",
            value: buildVersion,
          },
        ],
      },
    ];
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
