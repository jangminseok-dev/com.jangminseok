import { ImageResponse } from "next/og";
import { getProject, getProjects } from "@/lib/content";

// 프로젝트 파비콘 — 루트 icon.svg와 같은 별 모양에 프로젝트 accent 색만 바꾼다.
// /icons/{slug}.svg: SVG 파비콘을 쓰는 브라우저용
// /icons/{slug}.png: Safari와 홈 화면 아이콘용. 서브도메인의 /favicon.ico도 proxy.ts가 여기로 보낸다
export const dynamicParams = false;

const PNG_SIZE = 180;
const STAR = "M32 9C33.8 24 40 30.2 55 32C40 33.8 33.8 40 32 55C30.2 40 24 33.8 9 32C24 30.2 30.2 24 32 9Z";

export function generateStaticParams() {
  return getProjects().flatMap((p) => [{ file: `${p.slug}.svg` }, { file: `${p.slug}.png` }]);
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const match = file.match(/^(.+)\.(svg|png)$/);
  const project = match ? getProject(match[1]) : null;
  if (!match || !project) return new Response(null, { status: 404 });

  if (match[2] === "png") {
    return new ImageResponse(
      (
        <svg width={PNG_SIZE} height={PNG_SIZE} viewBox="0 0 64 64">
          <rect width="64" height="64" rx="14" fill="#0b0d18" />
          <path d={STAR} fill={project.accent} />
        </svg>
      ),
      { width: PNG_SIZE, height: PNG_SIZE },
    );
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0b0d18"/><path d="${STAR}" fill="${project.accent}"/></svg>`;
  return new Response(svg, { headers: { "Content-Type": "image/svg+xml" } });
}
