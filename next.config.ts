import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Expose the spec'd endpoints (GET /feed, POST /swipe, GET /matches)
  // on top of the App Router handlers that live under /api/*.
  async rewrites() {
    return [
      { source: "/feed", destination: "/api/feed" },
      { source: "/swipe", destination: "/api/swipe" },
      { source: "/matches", destination: "/api/matches" },
      { source: "/matches/:id", destination: "/api/matches/:id" },
    ];
  },
};

export default nextConfig;
