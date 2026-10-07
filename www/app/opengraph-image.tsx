import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getProfile } from "@/lib/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "장민석 포트폴리오";

// 메인 주소를 잡코리아, 메신저, 메일에 붙일 때 보이는 그림 — 프로젝트 OG(app/p/[slug]/opengraph-image.tsx)와 같은 틀
// ImageResponse 기본 폰트에는 한글이 없다 — Pretendard(otf)를 직접 넣는다(woff2 미지원)
const FONT_PATH = path.join(process.cwd(), "assets", "fonts", "Pretendard-Bold.otf");
// globals.css의 --color-brand, --color-brand-soft와 같은 값
const BRAND = "#3182f6";
const BRAND_SOFT = "#8ab4ff";
// 제목이 "서비스를" 뒤에서 두 줄로 나뉘는 너비(10/8 제목 기준, OCR로 확인)
const HEADLINE_MAX_WIDTH = 700;

export default function Image() {
  const profile = getProfile();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#0f1115",
          color: "#ffffff",
          fontFamily: "Pretendard",
        }}
      >
        <div style={{ width: 80, height: 10, borderRadius: 5, background: BRAND }} />
        <div style={{ marginTop: 40, display: "flex", alignItems: "baseline", gap: 24 }}>
          <div style={{ fontSize: 84 }}>{profile.name}</div>
          <div style={{ fontSize: 34, color: BRAND_SOFT }}>{profile.role}</div>
        </div>
        <div style={{ marginTop: 28, maxWidth: HEADLINE_MAX_WIDTH, fontSize: 44, lineHeight: 1.35, wordBreak: "keep-all", color: "rgba(255,255,255,0.85)" }}>
          {profile.headline}
        </div>
        <div style={{ marginTop: "auto", fontSize: 28, color: "rgba(255,255,255,0.5)" }}>jangminseok.com</div>
      </div>
    ),
    { ...size, fonts: [{ name: "Pretendard", data: fs.readFileSync(FONT_PATH), weight: 700 }] },
  );
}
