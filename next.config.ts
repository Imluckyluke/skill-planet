import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: "/skill-planet",
  assetPrefix: "/skill-planet/",
};

export default nextConfig;