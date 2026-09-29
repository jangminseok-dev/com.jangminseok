import type { NextConfig } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.jangminseok.com";

const nextConfig: NextConfig = {
  // 서브도메인 로컬 확인용 (redoceanmap.localhost:3000)
  allowedDevOrigins: ["*.localhost"],
  // 챗봇 → 백엔드 (같은 출처로 보내 CORS 없이)
  async rewrites() {
    return [{ source: "/api/backend/:path*", destination: `${API_BASE}/:path*` }];
  },
};

export default nextConfig;
