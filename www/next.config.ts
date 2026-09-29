import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 서브도메인 로컬 확인용 (redoceanmap.localhost:3000)
  allowedDevOrigins: ["*.localhost"],
};

export default nextConfig;
