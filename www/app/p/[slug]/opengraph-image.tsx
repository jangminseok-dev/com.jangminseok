import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getProject, getProjects } from "@/lib/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 빌드 시 slug별 PNG로 미리 생성 — 런타임에 ../content·폰트 파일을 읽지 않게 한다
export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

// ImageResponse 기본 폰트에는 한글이 없다 — Pretendard(otf)를 직접 넣는다(woff2 미지원)
const FONT_PATH = path.join(process.cwd(), "assets", "fonts", "Pretendard-Bold.otf");

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) throw new Error(`OG: 알 수 없는 slug ${slug}`);

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
        <div style={{ width: 80, height: 10, borderRadius: 5, background: project.accent }} />
        <div style={{ marginTop: 40, fontSize: 84 }}>{project.title}</div>
        {/* 한글 낱말이 줄 끝에서 쪼개지지 않게 띄어쓰기 단위로 줄을 바꾼다 — keep-all은 마침표만 다음 줄로 넘기거나 'JB금융그룹'을 가른다 */}
        <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", fontSize: 36, color: "rgba(255,255,255,0.8)" }}>
          {project.tagline.split(" ").map((word, i) => (
            <span key={i} style={{ marginRight: 10 }}>
              {word}
            </span>
          ))}
        </div>
        <div style={{ marginTop: "auto", fontSize: 28, color: "rgba(255,255,255,0.5)" }}>장민석 | jangminseok.com</div>
      </div>
    ),
    { ...size, fonts: [{ name: "Pretendard", data: fs.readFileSync(FONT_PATH), weight: 700 }] },
  );
}
