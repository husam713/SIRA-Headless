import type { NextConfig } from "next";

const prototypeConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: {
    root: process.cwd(),
  },
};

export default prototypeConfig;
