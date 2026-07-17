import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      { source: "/policy-advisor", destination: "/advisor" },
      { source: "/preventive-planner", destination: "/preventive-health" },
      { source: "/generic-finder", destination: "/medicines" },
      { source: "/term-explainer", destination: "/explainer" },
    ];
  },
};

export default nextConfig;
