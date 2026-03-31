import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow dev HMR WebSocket from any machine on the Fujitsu network
  allowedDevOrigins: [
    "g02luxn00396.g02.fujitsu.local",
    "*.g02.fujitsu.local",
    "*.fujitsu.local",
  ],
};

export default nextConfig;
