import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits .next/standalone with a self-contained server.js and only the
  // node_modules actually reached at run time. This is what the container
  // image ships; without it the runtime stage has nothing to copy.
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  trailingSlash: true,
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
